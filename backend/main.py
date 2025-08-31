# hasharita/backend/main.py

from __future__ import annotations

from typing import List, Optional
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

from backend.models.nlp.sentiment.service import SentimentService

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
    allow_methods=["POST", "OPTIONS"],
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

# --------- servis (lazy yükleme) ----------
svc = SentimentService(
    lazy=True,
    max_length=256,
    max_batch=64,
    neutral_threshold=0.65,
    tie_margin=0.08,
)

# --------- healthcheckkkkkkk ----------
@app.get("/healthz")
def healthz():
    return {"ready": True}

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
