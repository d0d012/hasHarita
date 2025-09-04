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

# Lightning data models
class LightningStrike(BaseModel):
    model_config = ConfigDict(extra="ignore")
    timestamp: str
    strike_time: int
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    delay: float
    mds: int
    status: int
    detectors: List[dict]

class LightningDataResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    window: str
    updated_at: str
    total_strikes: int
    strikes: List[LightningStrike]

class LightningAggregatedItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    city: str = Field(min_length=1)
    district: Optional[str] = None
    strike_count: int = Field(ge=0)
    avg_intensity: float = Field(ge=0)
    last_strike: str
    coordinates: List[GeoPoint]

class LightningAggregatedResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    window: str
    updated_at: str
    total_strikes: int
    items: List[LightningAggregatedItem]



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

# --------- Lightning data functions ----------

def _load_lightning_data() -> List[LightningStrike]:
    """Lightning verilerini yükler - tüm verileri yükler (zaman filtresi yok)"""
    lightning_file = Path("backend/data/lightnigData/turkey_lightning_strikes.jsonl")
    strikes = []
    
    if not lightning_file.exists():
        return strikes
    
    logger.info(f"Loading all lightning data from file: {lightning_file}")
    
    try:
        with open(lightning_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    strikes.append(LightningStrike(**data))
    except Exception as e:
        logger.exception("Lightning data load error: %s", e)
    
    logger.info(f"Loaded {len(strikes)} lightning strikes")
    return strikes

def _get_city_from_coordinates(lat: float, lon: float) -> str:
    """Koordinatlardan şehir adını döndürür (TurkeyMap.tsx ile uyumlu mapping)"""
    # Türkiye şehir koordinatları (TurkeyMap.tsx ile uyumlu)
    city_coords = {
        # Marmara Bölgesi
        "İstanbul": (41.0082, 28.9784),
        "Edirne": (41.6771, 26.5557),
        "Kırklareli": (41.7350, 27.2256),
        "Tekirdağ": (40.9833, 27.5167),
        "Çanakkale": (40.1553, 26.4142),
        "Kocaeli": (40.8533, 29.8815),
        "Bursa": (40.1826, 29.0665),
        "Yalova": (40.6550, 29.2769),
        "Sakarya": (40.7889, 30.4053),
        "Bilecik": (40.1501, 29.9831),
        "Balıkesir": (39.6484, 27.8826),
        
        # Ege Bölgesi
        "İzmir": (38.4192, 27.1287),
        "Manisa": (38.6191, 27.4289),
        "Aydın": (37.8560, 27.8416),
        "Denizli": (37.7765, 29.0864),
        "Muğla": (37.2153, 28.3636),
        "Afyonkarahisar": (38.7507, 30.5567),
        "Kütahya": (39.4200, 29.9833),
        "Uşak": (38.6823, 29.4082),
        
        # İç Anadolu Bölgesi
        "Ankara": (39.9334, 32.8597),
        "Konya": (37.8746, 32.4932),
        "Kayseri": (38.7205, 35.4826),
        "Sivas": (39.7477, 37.0179),
        "Yozgat": (39.8181, 34.8147),
        "Nevşehir": (38.6244, 34.7236),
        "Kırşehir": (39.1425, 34.1709),
        "Aksaray": (38.3687, 34.0370),
        "Niğde": (37.9667, 34.6833),
        "Karaman": (37.1759, 33.2287),
        "Çankırı": (40.6013, 33.6134),
        "Kırıkkale": (39.8468, 33.4988),
        "Eskişehir": (39.7767, 30.5206),
        
        # Karadeniz Bölgesi
        "Amasya": (40.6499, 35.8353),
        "Artvin": (41.1828, 41.8183),
        "Bartın": (41.6344, 32.3389),
        "Bayburt": (40.2552, 40.2249),
        "Bolu": (40.7314, 31.6081),
        "Çorum": (40.5506, 34.9556),
        "Düzce": (40.8438, 31.1565),
        "Gümüşhane": (40.4603, 39.5086),
        "Giresun": (40.9128, 38.3895),
        "Karabük": (41.2061, 32.6204),
        "Kastamonu": (41.3887, 33.7827),
        "Ordu": (40.9839, 37.8764),
        "Rize": (41.0201, 40.5234),
        "Samsun": (41.2928, 36.3313),
        "Sinop": (42.0231, 35.1531),
        "Tokat": (40.3167, 36.5500),
        "Trabzon": (41.0015, 39.7178),
        "Zonguldak": (41.4564, 31.7987),
        
        # Doğu Anadolu Bölgesi
        "Erzurum": (39.9334, 41.2767),
        "Erzincan": (39.7500, 39.5000),
        "Bingöl": (38.8847, 40.4982),
        "Tunceli": (39.1079, 39.5401),
        "Elazığ": (38.6810, 39.2264),
        "Malatya": (38.3552, 38.3095),
        "Bitlis": (38.3938, 42.1232),
        "Muş": (38.9462, 41.7539),
        "Van": (38.4891, 43.4089),
        "Hakkari": (37.5833, 43.7333),
        "Kars": (40.6013, 43.0975),
        "Ardahan": (41.1105, 42.7022),
        "Iğdır": (39.9208, 44.0048),
        "Ağrı": (39.7191, 43.0503),
        
        # Güneydoğu Anadolu Bölgesi
        "Şırnak": (37.5164, 42.4611),
        "Mardin": (37.3212, 40.7245),
        "Siirt": (37.9274, 41.9403),
        "Batman": (37.8812, 41.1351),
        "Gaziantep": (37.0662, 37.3833),
        "Şanlıurfa": (37.1591, 38.7969),
        "Diyarbakır": (37.9144, 40.2306),
        "Kilis": (36.7184, 37.1212),
        "Adıyaman": (37.7636, 38.2786),
        "Kahramanmaraş": (37.5858, 36.9371),
        
        # Akdeniz Bölgesi
        "Antalya": (36.8969, 30.7133),
        "Adana": (37.0000, 35.3213),
        "Mersin": (36.8000, 34.6333),
        "Hatay": (36.4018, 36.3498),
        "Osmaniye": (37.0682, 36.2616),
        "Isparta": (37.7648, 30.5566),
        "Burdur": (37.7206, 30.2906),
    }
    
    min_distance = float('inf')
    closest_city = "Bilinmeyen"
    
    for city, (city_lat, city_lon) in city_coords.items():
        distance = ((lat - city_lat) ** 2 + (lon - city_lon) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            closest_city = city
    
    return closest_city

def _aggregate_lightning_data(strikes: List[LightningStrike]) -> List[LightningAggregatedItem]:
    """Lightning verilerini şehir bazında toplar"""
    city_data = {}
    
    for strike in strikes:
        city = _get_city_from_coordinates(strike.latitude, strike.longitude)
        
        if city not in city_data:
            city_data[city] = {
                "strikes": [],
                "total_intensity": 0,
                "last_strike": strike.timestamp
            }
        
        city_data[city]["strikes"].append(strike)
        city_data[city]["total_intensity"] += strike.mds
        if strike.timestamp > city_data[city]["last_strike"]:
            city_data[city]["last_strike"] = strike.timestamp
    
    items = []
    for city, data in city_data.items():
        strike_count = len(data["strikes"])
        # Yıldırım sayısına göre yoğunluk hesapla (500 yıldırım = %100) - tam sayıya yuvarla
        intensity_percentage = round(min(100, (strike_count / 500) * 100))
        coordinates = [GeoPoint(lat=s.latitude, lon=s.longitude) for s in data["strikes"]]
        
        items.append(LightningAggregatedItem(
            city=city,
            district=None,
            strike_count=strike_count,
            avg_intensity=intensity_percentage,
            last_strike=data["last_strike"],
            coordinates=coordinates
        ))
    
    return sorted(items, key=lambda x: x.strike_count, reverse=True)

# --------- Disaster data models ----------
class DisasterLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    timestamp: str
    type: str
    severity: str
    location: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    description: str
    damage_score: int = Field(ge=0, le=100)
    affected_area: int = Field(ge=0)
    casualties: int = Field(ge=0)
    injuries: int = Field(ge=0)

class DisasterDataResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    window: str
    updated_at: str
    total_disasters: int
    disasters: List[DisasterLog]

class DisasterAggregatedItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    city: str = Field(min_length=1)
    district: Optional[str] = None
    topic: str = Field(min_length=1)
    count: int = Field(ge=0)
    sentiment_summary: Dict[str, int]

class DisasterAggregatedResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    window: str
    updated_at: str
    purged: int
    items: List[DisasterAggregatedItem]

# --------- Sustainability data models ----------
class SustainabilityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    timestamp: str
    type: str
    category: str
    location: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    value: float
    unit: str
    description: str
    status: str
    impact_score: int = Field(ge=0, le=100)

class SustainabilityDataResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    window: str
    updated_at: str
    total_logs: int
    logs: List[SustainabilityLog]

class SustainabilityAggregatedItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    city: str = Field(min_length=1)
    district: Optional[str] = None
    topic: str = Field(min_length=1)
    count: int = Field(ge=0)
    sentiment_summary: Dict[str, int]

class SustainabilityAggregatedResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    window: str
    updated_at: str
    purged: int
    items: List[SustainabilityAggregatedItem]

# --------- Lightning endpoints ----------

@app.get("/lightning/data", response_model=LightningDataResponse)
def get_lightning_data(window: str = "15m"):
    """Canlı lightning verilerini döndürür"""
    try:
        strikes = _load_lightning_data()
        
        return LightningDataResponse(
            window=window,
            updated_at=datetime.now(timezone.utc).isoformat(),
            total_strikes=len(strikes),
            strikes=strikes
        )
    except Exception as e:
        logger.exception("Lightning data error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lightning/aggregates", response_model=LightningAggregatedResponse)
def get_lightning_aggregates(window: str = "15m"):
    """Lightning verilerini şehir bazında toplar"""
    try:
        strikes = _load_lightning_data()
        aggregated = _aggregate_lightning_data(strikes)
        
        return LightningAggregatedResponse(
            window=window,
            updated_at=datetime.now(timezone.utc).isoformat(),
            total_strikes=len(strikes),
            items=aggregated
        )
    except Exception as e:
        logger.exception("Lightning aggregates error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

# --------- Disaster endpoints ----------

def _load_disaster_data() -> List[DisasterLog]:
    """Disaster verilerini yükler"""
    disaster_file = Path("backend/data/disasterData/turkey_disaster_logs.jsonl")
    disasters = []
    
    if not disaster_file.exists():
        return disasters
    
    logger.info(f"Loading disaster data from file: {disaster_file}")
    
    try:
        with open(disaster_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    disasters.append(DisasterLog(**data))
    except Exception as e:
        logger.exception("Disaster data load error: %s", e)
    
    logger.info(f"Loaded {len(disasters)} disaster logs")
    return disasters

def _aggregate_disaster_data(disasters: List[DisasterLog]) -> List[DisasterAggregatedItem]:
    """Disaster verilerini şehir ve tip bazında toplar"""
    city_data = {}
    
    for disaster in disasters:
        city = disaster.location
        
        if city not in city_data:
            city_data[city] = {}
        
        disaster_type = disaster.type
        if disaster_type not in city_data[city]:
            city_data[city][disaster_type] = {
                "count": 0,
                "sentiment_summary": {"positive": 0, "neutral": 0, "negative": 0}
            }
        
        city_data[city][disaster_type]["count"] += 1
        
        # Severity'ye göre sentiment hesapla
        if disaster.severity in ["critical", "high"]:
            city_data[city][disaster_type]["sentiment_summary"]["negative"] += 1
        elif disaster.severity == "medium":
            city_data[city][disaster_type]["sentiment_summary"]["neutral"] += 1
        else:  # low
            city_data[city][disaster_type]["sentiment_summary"]["positive"] += 1
    
    items = []
    for city, types in city_data.items():
        for disaster_type, data in types.items():
            items.append(DisasterAggregatedItem(
                city=city,
                district=None,
                topic=disaster_type,
                count=data["count"],
                sentiment_summary=data["sentiment_summary"]
            ))
    
    return sorted(items, key=lambda x: x.count, reverse=True)

@app.get("/disaster/data", response_model=DisasterDataResponse)
def get_disaster_data(window: str = "15m"):
    """Disaster verilerini döndürür"""
    try:
        disasters = _load_disaster_data()
        
        return DisasterDataResponse(
            window=window,
            updated_at=datetime.now(timezone.utc).isoformat(),
            total_disasters=len(disasters),
            disasters=disasters
        )
    except Exception as e:
        logger.exception("Disaster data error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/disaster/aggregates", response_model=DisasterAggregatedResponse)
def get_disaster_aggregates(window: str = "15m"):
    """Disaster verilerini şehir ve tip bazında toplar"""
    try:
        disasters = _load_disaster_data()
        aggregated = _aggregate_disaster_data(disasters)
        
        return DisasterAggregatedResponse(
            window=window,
            updated_at=datetime.now(timezone.utc).isoformat(),
            purged=0,
            items=aggregated
        )
    except Exception as e:
        logger.exception("Disaster aggregates error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

# --------- Sustainability endpoints ----------

def _load_sustainability_data() -> List[SustainabilityLog]:
    """Sustainability verilerini yükler"""
    sustainability_file = Path("backend/data/sustainabilityData/turkey_sustainability_logs.jsonl")
    logs = []
    
    if not sustainability_file.exists():
        return logs
    
    logger.info(f"Loading sustainability data from file: {sustainability_file}")
    
    try:
        with open(sustainability_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    logs.append(SustainabilityLog(**data))
    except Exception as e:
        logger.exception("Sustainability data load error: %s", e)
    
    logger.info(f"Loaded {len(logs)} sustainability logs")
    return logs

def _aggregate_sustainability_data(logs: List[SustainabilityLog]) -> List[SustainabilityAggregatedItem]:
    """Sustainability verilerini şehir ve tip bazında toplar"""
    city_data = {}
    
    for log in logs:
        city = log.location
        
        if city not in city_data:
            city_data[city] = {}
        
        log_type = log.type
        if log_type not in city_data[city]:
            city_data[city][log_type] = {
                "count": 0,
                "sentiment_summary": {"positive": 0, "neutral": 0, "negative": 0}
            }
        
        city_data[city][log_type]["count"] += 1
        
        # Status'a göre sentiment hesapla
        if log.status in ["excellent", "good"]:
            city_data[city][log_type]["sentiment_summary"]["positive"] += 1
        elif log.status == "fair":
            city_data[city][log_type]["sentiment_summary"]["neutral"] += 1
        else:  # poor
            city_data[city][log_type]["sentiment_summary"]["negative"] += 1
    
    items = []
    for city, types in city_data.items():
        for log_type, data in types.items():
            items.append(SustainabilityAggregatedItem(
                city=city,
                district=None,
                topic=log_type,
                count=data["count"],
                sentiment_summary=data["sentiment_summary"]
            ))
    
    return sorted(items, key=lambda x: x.count, reverse=True)

@app.get("/sustainability/data", response_model=SustainabilityDataResponse)
def get_sustainability_data(window: str = "15m"):
    """Sustainability verilerini döndürür"""
    try:
        logs = _load_sustainability_data()
        
        return SustainabilityDataResponse(
            window=window,
            updated_at=datetime.now(timezone.utc).isoformat(),
            total_logs=len(logs),
            logs=logs
        )
    except Exception as e:
        logger.exception("Sustainability data error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sustainability/aggregates", response_model=SustainabilityAggregatedResponse)
def get_sustainability_aggregates(window: str = "15m"):
    """Sustainability verilerini şehir ve tip bazında toplar"""
    try:
        logs = _load_sustainability_data()
        aggregated = _aggregate_sustainability_data(logs)
        
        return SustainabilityAggregatedResponse(
            window=window,
            updated_at=datetime.now(timezone.utc).isoformat(),
            purged=0,
            items=aggregated
        )
    except Exception as e:
        logger.exception("Sustainability aggregates error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))