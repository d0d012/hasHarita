from __future__ import annotations

from typing import List, Optional
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

from backend.models.nlp.sentiment.service import SentimentService
from backend.models.nlp.topics.service import TopicClassificationService

import logging, traceback
import os, json, time, threading
from pathlib import Path
from datetime import datetime, timezone, timedelta
from collections import defaultdict, deque
from typing import Dict, Tuple, Optional

logger = logging.getLogger("api")


# --------- frontend urlleri merhaba efe ----------
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://192.168.1.7:8080",
]

app = FastAPI(title="HasHarita API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --------- şemaya uygun modeller (Pydantic v2) ----------

class GeoPoint(BaseModel):
    model_config = ConfigDict(extra="ignore")  # dev'de fazla alanları yok say
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)

class TopicScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    label: str = Field(min_length=1)
    score: float = Field(ge=0, le=1)

class SentimentLabel(str, Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"

class Sentiment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    label: SentimentLabel
    score: float = Field(ge=0, le=1)

class SentimentRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    text: str = Field(min_length=1)
    lang: Optional[str] = Field(default="auto")  
    timestamp: Optional[str] = None             # ISO 8601 string
    geo: Optional[GeoPoint] = None
    tags: Optional[List[str]] = None

class SentimentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    sentiment: Sentiment
    topics: List[TopicScore] = Field(default_factory=list)

class SentimentBatchRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[SentimentRequest]

class SentimentBatchResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[SentimentResponse]

class TopicClassificationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    text: str = Field(min_length=1)
    lang: Optional[str] = Field(default="auto")  
    timestamp: Optional[str] = None             
    geo: Optional[GeoPoint] = None
    tags: Optional[List[str]] = None

class TopicClassificationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    topics: List[TopicScore] = Field(default_factory=list)

class TopicClassificationBatchRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[TopicClassificationRequest]

class TopicClassificationBatchResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    items: List[TopicClassificationResponse]



# --------- servis (lazy yükleme) ----------
svc = SentimentService(
    lazy=True,
    max_length=256,
    max_batch=64,
    neutral_threshold=0.65,
    tie_margin=0.08,
)
topic_svc = TopicClassificationService()

# --------- healthcheckkkkkkk ----------
@app.get("/healthz")
def healthz():
    return {"ready": True}


# --------- Topics: desteklenen etiketler ----------
@app.get("/topics/labels", response_model=List[str])
def get_topic_labels() -> List[str]:
    # Service'te get_labels() varsa onu kullan
    try:
        return topic_svc.get_labels()
    except AttributeError:
        # Yoksa TOPIC_LABELS alanını dön
        try:
            return list(topic_svc.TOPIC_LABELS)  # type: ignore[attr-defined]
        except Exception:
            raise HTTPException(status_code=500, detail="labels unavailable")
#-------------------------------------------------- aggregates (in-memory) ----------
@app.get("/map/aggregates")
def get_map_aggregates(level: str = "city", window: str = "15m"):
    """
    level: 'city' (il bazlı) veya 'district' (ilçe bazlı)
    window: '15m', '60m', '30s', '2h' gibi
    """
    level = (level or "city").lower()
    if level not in ("city", "district"):
        raise HTTPException(status_code=400, detail="level must be 'city' or 'district'")
    try:
        snap = _agg_snapshot(level, window)
        return snap
    except Exception as e:
        logger.exception("/map/aggregates failed: %s", e)
        raise HTTPException(status_code=500, detail="internal error")

        
# --------- Topics Batch endpoint ----------

@app.post("/predict/topics", response_model=TopicClassificationBatchResponse)
def predict_topics(payload: TopicClassificationBatchRequest) -> TopicClassificationBatchResponse:
    bad_ids = [it.id for it in payload.items if it.text.strip() == ""]
    if bad_ids:
        raise HTTPException(status_code=400, detail=f"Empty text for id(s): {', '.join(bad_ids)}")

    texts = [it.text for it in payload.items]

    try:
        classified = topic_svc.classify_batch(texts)
        items = [TopicClassificationResponse(id=req.id, topics=topics)
                 for req, topics in zip(payload.items, classified)]
        return TopicClassificationBatchResponse(items=items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # GEÇİCİ: logla ve hata tipini göster
        logger.exception("topics failed")
        raise HTTPException(status_code=500, detail=f"internal error: {type(e).__name__}: {e}")




# --------- Batch endpoint ----------
@app.post("/predict/sentiment", response_model=SentimentBatchResponse)
def predict_sentiment(payload: SentimentBatchRequest) -> SentimentBatchResponse:
    # whitespace-only metinleri reddet (servis zaten kontrol ediyor, ama burada da erken yakalayalım)
    bad_ids = [it.id for it in payload.items if it.text.strip() == ""]
    if bad_ids:
        raise HTTPException(status_code=400, detail=f"Empty text for id(s): {', '.join(bad_ids)}")

   
    req_items = [{"id": it.id, "text": it.text} for it in payload.items]

    try:
        svc_out = svc.predict_batch(req_items)
    except ValueError as e:
        
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        
        raise HTTPException(status_code=500, detail="internal error")

    # svc_out zaten şemaya uygun objeler döndürüyor:
    # {id, sentiment{label,score}, topics: []}
    return SentimentBatchResponse(items=[SentimentResponse(**item) for item in svc_out])
# ================= File Watcher / Poller (JSONL + NLP enrich) =================
# Gerekli importlar (dosyanın başında yoksa bırak)

# Klasörler (repo köküne göre ayarla)
BASE_DIR = Path(__file__).resolve().parent
DATA_BASE = (BASE_DIR / "twitter_data")
INBOX_DIR = DATA_BASE / "inbox"
PROCESSING_DIR = DATA_BASE / "processing"
ARCHIVE_DIR = DATA_BASE / "archive"
FAILED_DIR = DATA_BASE / "failed"

# Ayarlar
POLL_INTERVAL_SEC = 1.0          # her 1 sn bak
BATCH_SIZE = 10                   # küçük batch (CPU-only hedef)
MAX_LINE_CHARS = 10000            # "çok uzun metin" için kaba sınır

# Eşik varsayımları (NLP sonrası)
TOP_K = 3
MIN_SCORE = 0.35
RELATIVE_MARGIN = 0.02

# Grup de-dup kümeleri
GROUPS = [
    {"trafik", "ulaşım"},
    {"yağış", "sel"},
    {"enerji", "elektrik kesintisi"},
]

def _ensure_dirs():
    for d in [INBOX_DIR, PROCESSING_DIR, ARCHIVE_DIR, FAILED_DIR]:
        d.mkdir(parents=True, exist_ok=True)

def _is_jsonl_file(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() == ".jsonl"

def _safe_move(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    os.replace(str(src), str(dst))  # atomik (aynı disk)

def _validate_line(rec: dict) -> tuple[bool, str]:
    """
    Basit şema kontrolü: id, text, ts zorunlu; text boş/çok uzun olmasın.
    'city' boşsa sorun değil (üst katmanda fallback).
    """
    if not isinstance(rec, dict):
        return False, "not_a_dict"
    if not rec.get("id"):
        return False, "missing_id"
    text = (rec.get("text") or "").strip()
    if text == "":
        return False, "empty_text"          # 400 benzeri skip
    if len(text) > MAX_LINE_CHARS:
        return False, "text_too_long"       # 413 benzeri skip
    if not rec.get("ts"):
        return False, "missing_ts"
    return True, "ok"

def _apply_thresholds_and_dedup(topic_scores, top_k=TOP_K, min_score=MIN_SCORE, rel_margin=RELATIVE_MARGIN):
    """
    topic_scores: List[{"label": str, "score": float}]
    - mutlak eşik (min_score)
    - relative margin (en yükseğe yakın olanlar)
    - top-k
    - grup de-dup (aynı kümelerden birini bırak)
    """
    if not topic_scores:
        return []

    # skorla sırala
    sorted_items = sorted(topic_scores, key=lambda x: x["score"], reverse=True)
    if not sorted_items:
        return []

    # mutlak eşik
    sorted_items = [t for t in sorted_items if t["score"] >= min_score]
    if not sorted_items:
        return []

    # relative margin
    top_score = sorted_items[0]["score"]
    kept = [t for t in sorted_items if t["score"] >= top_score - rel_margin]

    # top-k
    kept = kept[:top_k]

    # grup de-dup
    labels = [t["label"] for t in kept]

    def same_group(a, b):
        s = {a, b}
        return any(s <= g for g in GROUPS)  # herhangi bir grup kümesine altküme mi

    deduped = []
    for lb in labels:
        if not any(same_group(lb, x) for x in deduped):
            deduped.append(lb)

    return deduped

def _process_and_write_batch(batch_recs, batch_texts, batch_ids, fout):
    # ---- Topics ----
    try:
        topics_raw = topic_svc.classify_batch(batch_texts)  # List[List[TopicScore veya dict]]
        topics_clean = []
        for lst in topics_raw:
            items = [
                {
                    "label": (it.label if hasattr(it, "label") else it["label"]),
                    "score": (it.score if hasattr(it, "score") else it["score"]),
                }
                for it in lst
            ]
            topics_clean.append(_apply_thresholds_and_dedup(items))
    except Exception as e:
        logger.exception("topics classify failed: %s", e)
        topics_clean = [[] for _ in batch_texts]

    # ---- Sentiment ----
    try:
        req_items = [{"id": i, "text": t} for i, t in zip(batch_ids, batch_texts)]
        sent_out = svc.predict_batch(req_items)  # [{id, sentiment{label,score}, topics:[]}]
        sent_map = {x["id"]: x["sentiment"] for x in sent_out}
    except Exception as e:
        logger.exception("sentiment failed: %s", e)
        sent_map = {}

    # ---- Enriched kayıtları yaz ----
    for rec, topics_labels in zip(batch_recs, topics_clean):
        sid = rec["id"]
        sentiment = sent_map.get(sid)
        enriched = dict(rec)  # kopya
        if sentiment:
            enriched["sentiment"] = sentiment
        enriched["topics"] = topics_labels or []

        # >>>>> : agregata yaz
        now_ts = time.time()
        city = (enriched.get("city") or "İstanbul")
        district = enriched.get("district")
        sent_label = None
        if sentiment:
            sent_label = sentiment.get("label")

        for tp in enriched["topics"]:
            # Her topic için sentiment bilgisini de ekle
            _agg_add(city, district, tp, now_ts, sent_label)

        # <<<<< EKLEME BİTTİ

        fout.write(json.dumps(enriched, ensure_ascii=False) + "\n")


def _process_jsonl_file(file_path: Path):
    """
    JSONL dosyasını işler:
      - processing/'e taşır
      - satırları doğrular (400/413/other sayımı)
      - NLP (sentiment + topics) uygular
      - Eşik / relative margin / grup de-dup uygular
      - Sonucu archive/<name>.enriched.jsonl olarak yazar
      - Ham dosyayı archive/'a taşır
    """
    ok_count = 0
    skipped_400 = 0
    skipped_413 = 0
    other_err = 0

    processing_path = PROCESSING_DIR / file_path.name
    try:
        _safe_move(file_path, processing_path)
    except Exception as e:
        logger.exception("move to processing failed: %s", e)
        return

    enriched_out = ARCHIVE_DIR / (processing_path.stem + ".enriched.jsonl")

    try:
        batch_recs = []
        batch_texts = []
        batch_ids = []

        with processing_path.open("r", encoding="utf-8") as fin, enriched_out.open("w", encoding="utf-8") as fout:
            for line_no, line in enumerate(fin, start=1):
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except Exception:
                    other_err += 1
                    continue

                valid, reason = _validate_line(rec)
                if not valid:
                    if reason == "empty_text":
                        skipped_400 += 1
                    elif reason == "text_too_long":
                        skipped_413 += 1
                    else:
                        other_err += 1
                    continue

                # batch'e ekle
                batch_recs.append(rec)
                batch_texts.append(rec["text"])
                batch_ids.append(rec["id"])

                # batch doldu mu?
                if len(batch_recs) >= BATCH_SIZE:
                    _process_and_write_batch(batch_recs, batch_texts, batch_ids, fout)
                    ok_count += len(batch_recs)
                    batch_recs, batch_texts, batch_ids = [], [], []

            # kalanlar
            if batch_recs:
                _process_and_write_batch(batch_recs, batch_texts, batch_ids, fout)
                ok_count += len(batch_recs)

        # ham dosyayı da archive'a taşı
        _safe_move(processing_path, ARCHIVE_DIR / processing_path.name)

        logger.info(
            "[watcher] processed %s | ok=%d, 400-skip=%d, 413-skip=%d, other=%d | enriched=%s",
            processing_path.name, ok_count, skipped_400, skipped_413, other_err, enriched_out.name
        )
    except Exception as e:
        logger.exception("process failed for %s: %s", processing_path.name, e)
        try:
            _safe_move(processing_path, FAILED_DIR / processing_path.name)
        except Exception:
            pass

def _poll_inbox_loop():
    _ensure_dirs()
    logger.info("[watcher] started; watching: %s", INBOX_DIR)
    while True:
        try:
            # sadece .jsonl al; .part'ı görmezden gel
            for p in sorted(INBOX_DIR.iterdir()):
                if _is_jsonl_file(p):
                    _process_jsonl_file(p)
        except Exception as e:
            logger.exception("[watcher] loop error: %s", e)
        time.sleep(POLL_INTERVAL_SEC)

# FastAPI startup'ta watcher başlat
@app.on_event("startup")
def _start_watcher():
    _ensure_dirs()
    t = threading.Thread(target=_poll_inbox_loop, daemon=True)
    t.start()
    logger.info("[watcher] background poller thread started.")
# ============================ /watcher section ================================
# ================= In-memory Aggregates =================
# Anahtar: (city, district, topic)
# Değer: deque[(timestamp, sentiment_label)]
AGG: Dict[Tuple[str, Optional[str], str], deque] = defaultdict(deque)
AGG_LOCK = threading.Lock()

def _parse_window_to_seconds(window_str: str) -> int:
    """
    '15m', '60m', '2h', '30s' gibi stringleri saniyeye çevirir.
    """
    if not window_str:
        return 900  # default 15m

    unit = window_str[-1]
    try:
        value = int(window_str[:-1])
    except Exception:
        return 900

    if unit == "s":
        return value
    elif unit == "m":
        return value * 60
    elif unit == "h":
        return value * 3600
    elif unit == "d":
        return value * 86400
    else:
        # bilinmeyen birim → default 15m
        return 900


def _agg_add(city: str, district: Optional[str], topic: str, now_ts: float, sentiment_label: Optional[str]):
    """
    Hem city hem district seviyesinde aggregation'a ekler.
    """
    # City seviyesi (district=None olarak sakla)
    city_key = (city, None, topic)
    with AGG_LOCK:
        AGG[city_key].append((now_ts, sentiment_label))
        
        # District seviyesi (eğer district varsa)
        if district:
            district_key = (city, district, topic)
            AGG[district_key].append((now_ts, sentiment_label))

def _agg_snapshot(level: str, window_str: str) -> dict:
    window_sec = _parse_window_to_seconds(window_str or "15m")
    cutoff = time.time() - window_sec

    items = []
    purge_total = 0

    with AGG_LOCK:
        # purge & aggregate
        for (city, district, topic), q in list(AGG.items()):
            # eski kayıtları at
            while q and q[0][0] < cutoff:
                q.popleft()
                purge_total += 1

        if level == "city":
            grouped: Dict[Tuple[str, str], dict] = defaultdict(lambda: {
                "count": 0,
                "sentiment_summary": {"positive": 0, "neutral": 0, "negative": 0}
            })
            for (city, district, topic), q in AGG.items():
                if district is None and len(q) > 0:
                    for _, s in q:
                        grouped[(city, topic)]["count"] += 1
                        if s in ("positive", "neutral", "negative"):
                            grouped[(city, topic)]["sentiment_summary"][s] += 1

            for (city, topic), agg in grouped.items():
                items.append({
                    "city": city,
                    "district": None,
                    "topic": topic,
                    "count": agg["count"],
                    "sentiment_summary": agg["sentiment_summary"]
                })
        else:
            grouped: Dict[Tuple[str, str, str], dict] = defaultdict(lambda: {
                "count": 0,
                "sentiment_summary": {"positive": 0, "neutral": 0, "negative": 0}
            })
            for (city, district, topic), q in AGG.items():
                if district is not None and len(q) > 0:
                    for _, s in q:
                        grouped[(city, district, topic)]["count"] += 1
                        if s in ("positive", "neutral", "negative"):
                            grouped[(city, district, topic)]["sentiment_summary"][s] += 1

            for (city, district, topic), agg in grouped.items():
                items.append({
                    "city": city,
                    "district": district,
                    "topic": topic,
                    "count": agg["count"],
                    "sentiment_summary": agg["sentiment_summary"]
                })

    return {
        "window": window_str,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "purged": purge_total,
        "items": items,
    }