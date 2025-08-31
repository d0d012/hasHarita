"""
Sentiment Service (schema-ready)
Model: savasy/bert-base-turkish-sentiment-cased
Policy (neutral):
  - if max(p) < t          -> neutral (reason=low_confidence)
  - elif |p_pos - p_neg|<m -> neutral (reason=tie_margin)
Label space -> {"positive","neutral","negative"} (schema)
Neutral score (S1): 1 - max(p_pos, p_neg)
"""

from __future__ import annotations

from typing import List, Dict, Any, Optional, Tuple
import logging

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TextClassificationPipeline,
    pipeline,
)


class SentimentService:
    """
    Lazy-loaded Transformers pipeline wrapper for Turkish sentiment (2-class).
    - device: CPU
    - batch inference with truncation
    - returns schema-shaped items:
      {
        "id": "...",
        "sentiment": {"label": "positive|neutral|negative", "score": float},
        "topics": []  # placeholder until topic model arrives
      }
    """

    def __init__(
        self,
        model_name: str = "savasy/bert-base-turkish-sentiment-cased",
        max_length: int = 256,
        neutral_threshold: float = 0.65,   # t
        tie_margin: float = 0.08,          # m
        max_batch: int = 64,
        lazy: bool = True,                 # your choice: lazy
    ) -> None:
        self.model_name = model_name
        self.max_length = int(max_length)
        self.neutral_threshold = float(neutral_threshold)
        self.tie_margin = float(tie_margin)
        self.max_batch = int(max_batch)
        self.lazy = bool(lazy)

        self._pipe: Optional[TextClassificationPipeline] = None

        # basic logger
        self._log = logging.getLogger("SentimentService")
        if not self._log.handlers:
            logging.basicConfig(level=logging.INFO)

        if not self.lazy:
            self._ensure_pipeline()

    # ---------- public API (schema-shaped) ----------

    def predict_batch(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Input (schema request units): items = [{ "id": "...", "text": "...", ... }, ...]
        Output (schema response units):
        [
          {
            "id": "...",
            "sentiment": {"label": "positive|neutral|negative", "score": 0.xx},
            "topics": []
          },
          ...
        ]
        Notes:
        - only 'id' and 'text' are used here; other fields (lang/geo/timestamp/tags) are ignored by the service.
        - validation (e.g. additionalProperties) should be handled at FastAPI layer.
        """
        if not isinstance(items, list):
            raise TypeError("items must be list of {'id','text',...} objects")

        if len(items) == 0:
            return []

        if len(items) > self.max_batch:
            raise ValueError(f"Batch too large: {len(items)} > MAX_BATCH={self.max_batch}")

        texts: List[str] = []
        ids: List[str] = []

        for it in items:
            _id = it.get("id")
            _tx = it.get("text")
            if _id is None or _tx is None:
                raise ValueError("Each item must contain 'id' and 'text'")
            if not isinstance(_tx, str) or len(_tx.strip()) == 0:
                raise ValueError(f"Empty text for id={_id}")
            ids.append(str(_id))
            texts.append(_tx)

        pipe = self._ensure_pipeline()

        # HF pipeline: return_all_scores=True -> list[ list[ {label, score}, ... ] ]
        raw: List[List[Dict[str, Any]]] = pipe(
            texts,
            return_all_scores=True,
            truncation=True,
            max_length=self.max_length,
        )

        out: List[Dict[str, Any]] = []
        for idx, scores_list in enumerate(raw):
            score_map = self._normalize_score_map(scores_list)  # prefers {"positive","negative"}
            label, reason = self._apply_policy(score_map)       # "positive"/"negative"/"neutral"

            # schema sentiment.score:
            # - if pos: score = p_pos
            # - if neg: score = p_neg
            # - if neutral: score = 1 - max(p_pos, p_neg)   (S1)
            sent_score = self._schema_sentiment_score(label, score_map)

            out.append({
                "id": ids[idx],
                "sentiment": {"label": label, "score": sent_score},
                "topics": [],  # reserved for future topic model
            })

            # optional: debug log (not exposed to API)
            self._log.debug("id=%s label=%s score_map=%s reason=%s", ids[idx], label, score_map, reason)

        return out

    # ---------- internals ----------

    def _ensure_pipeline(self) -> TextClassificationPipeline:
        if self._pipe is not None:
            return self._pipe

        tok = AutoTokenizer.from_pretrained(self.model_name)
        mdl = AutoModelForSequenceClassification.from_pretrained(self.model_name)
        self._pipe = pipeline(
            task="text-classification",
            model=mdl,
            tokenizer=tok,
            device=-1,  # CPU
        )
        self._log.info("Sentiment pipeline loaded (lazy=%s)", self.lazy)
        self._log.info("Model labels: %s", getattr(self._pipe.model.config, "id2label", None))
        return self._pipe

    def _normalize_score_map(self, scores_list: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Convert pipeline list-of-scores into a dict with canonical keys when possible.
        Example item: {'label': 'NEGATIVE', 'score': 0.73}
        Returns preferably {"positive": p_pos, "negative": p_neg};
        otherwise returns top-2 labels as a generic map.
        """
        tmp: Dict[str, float] = {}
        for s in scores_list:
            lab = str(s.get("label")).strip().lower()
            val = float(s.get("score"))
            tmp[lab] = val

        # direct canonical presence
        if "positive" in tmp and "negative" in tmp:
            return {"positive": float(tmp["positive"]), "negative": float(tmp["negative"])}

        # try to infer from common variants in model labels
        pos_key = None
        neg_key = None
        for k in list(tmp.keys()):
            if ("pos" in k) or ("poz" in k) or ("pozitif" in k):
                pos_key = k
            if ("neg" in k) or ("negatif" in k):
                neg_key = k
        if pos_key in tmp and neg_key in tmp:
            return {"positive": float(tmp[pos_key]), "negative": float(tmp[neg_key])}

        # fallback: keep top-2 whatever they are (rare for this model)
        top2 = sorted(tmp.items(), key=lambda kv: kv[1], reverse=True)[:2]
        return {k: float(v) for k, v in top2}

    def _apply_policy(self, score_map: Dict[str, float]) -> Tuple[str, str]:
        """
        Hybrid neutral:
          - if max(p) < t          -> neutral (reason=low_confidence)
          - elif |p_pos - p_neg|<m -> neutral (reason=tie_margin)
          - else                   -> argmax (reason=argmax)
        Falls back to generic argmax if canonical keys are absent.
        """
        if "positive" in score_map and "negative" in score_map:
            p_pos = float(score_map["positive"])
            p_neg = float(score_map["negative"])
            p_max = p_pos if p_pos >= p_neg else p_neg

            if p_max < self.neutral_threshold:
                return "neutral", "low_confidence"

            if abs(p_pos - p_neg) < self.tie_margin:
                return "neutral", "tie_margin"

            return ("positive", "argmax") if p_pos >= p_neg else ("negative", "argmax")

        # generic fallback
        if not score_map:
            return "neutral", "low_confidence"

        best_label, best_val = max(score_map.items(), key=lambda kv: kv[1])
        if best_val < self.neutral_threshold:
            return "neutral", "low_confidence"
        # If labels are unknown, keep best as-is; endpoint will still accept only our triad.
        return best_label, "argmax"

    def _schema_sentiment_score(self, final_label: str, score_map: Dict[str, float]) -> float:
        """
        Convert score_map to a single scalar score as per schema.
        final_label in {"positive","negative","neutral"} ideally.
        Neutral score rule (S1): 1 - max(p_pos, p_neg).
        """
        # Extract p_pos/p_neg if available; else estimate from top1
        if "positive" in score_map and "negative" in score_map:
            p_pos = float(score_map["positive"])
            p_neg = float(score_map["negative"])
        else:
            if len(score_map) == 0:
                p_pos = 0.0
                p_neg = 0.0
            else:
                # fallback: treat best as confidence, other as 1-best (very rare for this model)
                best_val = max(score_map.values())
                p_pos = best_val if "positive" in score_map and score_map.get("positive") == best_val else 0.0
                p_neg = best_val if "negative" in score_map and score_map.get("negative") == best_val else 0.0

        if final_label == "positive":
            return max(0.0, min(1.0, p_pos))
        if final_label == "negative":
            return max(0.0, min(1.0, p_neg))

        # neutral
        neutral_score = 1.0 - max(p_pos, p_neg)
        return max(0.0, min(1.0, neutral_score))
