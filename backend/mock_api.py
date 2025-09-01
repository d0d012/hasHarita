"""
HasHarita Mock API

bunu okuyan tosun okuyana kosun

lan
==================
HasHarita karar destek sistemi için bir Mock API serveridir. aksini iddia edenin
Provides schema-compliant dummy responses for all endpoints during development.  ( aynen aynen)

Run with: uvicorn mock_api:app --reload
"""

import asyncio
import random
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import uvicorn


# ==============================================================================
# Pydantic Models (aligned with Data Contracts)
# ==============================================================================

class GeoPoint(BaseModel):
    """WGS84'e uygun coğrafi koordinatlar """
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class Sentiment(BaseModel):
    """Duygu  sınıflandırma  sonucu."""
    label: str = Field(..., pattern="^(positive|neutral|negative)$")
    score: float = Field(..., ge=0, le=1)


class TopicScore(BaseModel):
    """Topic detection sonucu ve confidence score'u          turkce konus lan srfsz"""
    label: str = Field(..., min_length=1)
    score: float = Field(..., ge=0, le=1)


class SentimentRequest(BaseModel):
    """duygu analizi icin Request payloadu """
    id: str
    text: str = Field(..., min_length=1)
    lang: str = Field(default="auto", pattern="^(tr|en|auto)$")
    timestamp: Optional[datetime] = None
    geo: Optional[GeoPoint] = None
    tags: Optional[List[str]] = Field(default=None, max_length=10)


class SentimentResponse(BaseModel):
    """duygu analizi responseu """
    id: str
    sentiment: Sentiment
    topics: Optional[List[TopicScore]] = Field(default=[], max_length=10)


class VisionSegmentRequest(BaseModel):
    """request payload for vision segmentation           suanlık baglasak mı bilemedim"""
    tile_id: str
    image_uri: str = Field(..., min_length=1)
    bounds: List[float] = Field(..., min_length=4, max_length=4)
    epsg: int = Field(..., description="EPSG code (only 4326 supported)")

    @field_validator('bounds')
    @classmethod
    def validate_bounds(cls, v: List[float]) -> List[float]:
        """Sınır formatı icin dogrulama : [minLon, minLat, maxLon, maxLat]."""
        if len(v) != 4:
            raise ValueError("Sınır değerleri ancak ve ancak 4 değer içermelidir")
        minLon, minLat, maxLon, maxLat = v
        if not (-180 <= minLon <= 180 and -180 <= maxLon <= 180):
            raise ValueError("Boylam -180 ve 180 arasında olmalı")
        if not (-90 <= minLat <= 90 and -90 <= maxLat <= 90):
            raise ValueError("Enlem -90 ve 90 arasında olmalı ")
        if minLon >= maxLon or minLat >= maxLat:
            raise ValueError("Hatalı sınır değerleri: minimum değerler maksimum değerlerden daha az olmalı ")
        return v

    @field_validator('epsg')
    @classmethod
    def validate_epsg(cls, v: int) -> int:
        """Şuan sadece EPSG:4326 destekleniyor."""
        if v != 4326:
            raise ValueError("sadece EPSG:4326 destekleniyor.")
        return v


class SegClass(BaseModel):
    """segmentation class detection sonucu."""
    name: str = Field(..., pattern="^(collapsed_building|flooded_area|burned_area)$")
    area_px: int = Field(..., ge=0)
    confidence: float = Field(..., ge=0, le=1)


class VisionSegmentResponse(BaseModel):
    """response from vision segmentation"""
    tile_id: str
    mask_uri: str = Field(..., min_length=1)
    classes: List[SegClass] = Field(..., max_length=10)


class TopicsRequest(BaseModel):
    """request payload for topic extraction"""
    id: str
    text: str = Field(..., min_length=1)
    lang: str = Field(default="auto", pattern="^(tr|en|auto)$")
    max_topics: int = Field(default=5, ge=1, le=10)


class TopicsResponse(BaseModel):
    """response from topic extraction      kafamda turkceye cevirmeye usendim """
    id: str
    topics: List[TopicScore] = Field(..., max_length=10)
    keywords: Optional[List[str]] = Field(default=[], max_length=20)


class DamageScoreRequest(BaseModel):
    """request payload for damage scoring"""
    location_id: str
    geo: GeoPoint
    signals: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime


class DamageScoreResponse(BaseModel):
    """response from damage scoring  """
    location_id: str
    damage_score: float = Field(..., ge=0, le=1)
    severity: str = Field(..., pattern="^(low|medium|high|critical)$")
    factors: Dict[str, float] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    """health check response"""
    status: str
    timestamp: datetime
    version: str = "1.0.0-mock"


# ==============================================================================
# Mock Data Generatorları
# ==============================================================================

class MockDataGenerator:
    """tüm endpointler için gerçekçi mock data üretmek mi son defa sevmek mi"""

    # kural tabanlı mocking için afet ile alakadar kelimeler silsilesi
    NEGATIVE_KEYWORDS = [
        "yardım", "acil", "deprem", "sel", "yangın", "yıkım", "enkaz",
        "kayıp", "yaralı", "hasar", "tehlike", "risk", "felaket"
    ]

    POSITIVE_KEYWORDS = [
        "güvenli", "kurtarıldı", "başarılı", "teşekkür", "destek",
        "dayanışma", "yardımlaşma", "toparlanma"
    ]

    DISASTER_TOPICS = [
        "deprem", "sel", "yangın", "altyapı", "yardım", "kurtarma",
        "barınma", "gıda", "sağlık", "ulaşım", "hasar_tespiti",
        "güvenlik", "koordinasyon", "lojistik", "iletişim"
    ]

    @staticmethod
    def analyze_sentiment(text: str, lang: str = "auto") -> Sentiment:
        """
        mock sentiment analysis based on keyword detection
        TODO: replace with real sentiment model. allah rizasi icin (taam yapcam)
        """
        text_lower = text.lower()

        # count positive and negative signals
        neg_count = sum(1 for kw in MockDataGenerator.NEGATIVE_KEYWORDS if kw in text_lower)
        pos_count = sum(1 for kw in MockDataGenerator.POSITIVE_KEYWORDS if kw in text_lower)

        # determine sentiment
        if neg_count > pos_count:
            label = "negative"
            base_score = 0.7 + random.uniform(0, 0.29)
        elif pos_count > neg_count:
            label = "positive"
            base_score = 0.6 + random.uniform(0, 0.39)
        else:
            label = "neutral"
            base_score = 0.4 + random.uniform(0, 0.2)

        return Sentiment(label=label, score=round(base_score, 3))

    @staticmethod
    def extract_topics(text: str, max_topics: int = 5) -> List[TopicScore]:
        """
        mock topic extraction based on keyword matching
        TODO: replace with real topic model.      tm knk
        """
        text_lower = text.lower()
        topics = []

        # afetle alakalı topicleri kontrol et
        for topic in MockDataGenerator.DISASTER_TOPICS:
            if topic in text_lower or any(word in topic for word in text_lower.split()):
                score = random.uniform(0.4, 0.95)
                topics.append(TopicScore(label=topic, score=round(score, 3)))

        # bulamadıysan rastgele üret, salla
        if not topics:
            num_topics = random.randint(1, min(3, max_topics))
            selected = random.sample(MockDataGenerator.DISASTER_TOPICS, num_topics)
            topics = [
                TopicScore(label=t, score=round(random.uniform(0.3, 0.7), 3))
                for t in selected
            ]

        # sort by score and limit
        topics.sort(key=lambda x: x.score, reverse=True)
        return topics[:max_topics]

    @staticmethod
    def segment_image(tile_id: str, bounds: List[float]) -> VisionSegmentResponse:
        """
        mock image segmentation results
        TODO: replace with real vision model.        vakit kalırsa
        """
        # hangi tür afetlerin tespit edildiğine tamamen rastgele karar ver
        classes = []

        # 60% chance of detecting something
        if random.random() < 0.6:
            disaster_types = ["collapsed_building", "flooded_area", "burned_area"]
            num_detections = random.randint(1, 2)

            for disaster_type in random.sample(disaster_types, num_detections):
                classes.append(SegClass(
                    name=disaster_type,
                    area_px=random.randint(100, 50000),
                    confidence=round(random.uniform(0.5, 0.95), 3)
                ))

        return VisionSegmentResponse(
            tile_id=tile_id,
            mask_uri=f"/artifacts/masks/{tile_id}_mask.png",
            classes=classes
        )

    @staticmethod
    def calculate_damage_score(geo: GeoPoint, signals: Dict[str, Any]) -> DamageScoreResponse:
        """
        mock damage score calculation
        TODO: replace with real scoring algorithm
        """
        # base score from random factors
        base_score = random.uniform(0.1, 0.9)

        # adjust based on signals if provided
        if "earthquake_magnitude" in signals:
            base_score = min(1.0, base_score + signals["earthquake_magnitude"] * 0.1)
        if "flood_depth" in signals:
            base_score = min(1.0, base_score + signals["flood_depth"] * 0.05)

        # determine severity
        if base_score < 0.25:
            severity = "low"
        elif base_score < 0.5:
            severity = "medium"
        elif base_score < 0.75:
            severity = "high"
        else:
            severity = "critical"

        # mock contributing factors
        factors = {
            "structural": round(random.uniform(0, 1), 3),
            "environmental": round(random.uniform(0, 1), 3),
            "social": round(random.uniform(0, 1), 3)
        }

        return DamageScoreResponse(
            location_id="",  # will be set by endpoint
            damage_score=round(base_score, 3),
            severity=severity,
            factors=factors
        )


# ==============================================================================
# FastAPI Application Setup                   OOOOOOOOOOOOOOOOF
# ==============================================================================

app = FastAPI(
    title="HasHarita Mock API",
    description="HasHarita sürdürelibilir şehirler karar destek sistemi için Mock API",
    version="1.0.0-mock",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative port
        "http://localhost:8080",  # Vite dev server
        "http://localhost:8081",  # Vite dev server (alternative)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# initialize mock data generator     taabi efendim
mock_gen = MockDataGenerator()


# ==============================================================================
# Utility Fonksiyonları              babba
# ==============================================================================

async def simulate_processing_delay(min_ms: int = 50, max_ms: int = 200):
    """simulate realistic API response time. dümenden """
    delay = random.uniform(min_ms, max_ms) / 1000
    await asyncio.sleep(delay)


def load_sample_if_exists(filename: str) -> Optional[Dict[str, Any]]:
    """
   sample/ klasöründen sample data loadlamak için               bugün fal bakmayı öğrendim
    dosya yoksa None döndürecektir                                        elini tutabilmek için
    """
    sample_path = Path(f"samples/{filename}")
    if sample_path.exists():
        try:
            with open(sample_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return None


# ==============================================================================
# API Endpointleri
# ==============================================================================

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """health checkkkkkkk endpoint for monitoring """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow()
    )


@app.post("/api/v1/predict/sentiment", response_model=SentimentResponse, tags=["NLP"])
async def predict_sentiment(request: SentimentRequest):
    """
    analyze sentiment and extract topics from text

    TODO: replace mock with real transformer model (e.g., BERTurk for Turkish).    neye niyet neye kısmet
    """
    await simulate_processing_delay(100, 300)

    # try to load sample response first
    sample = load_sample_if_exists("sentiment_res.json")
    if sample and random.random() < 0.3:  # 30% chance to use sample
        return SentimentResponse(**sample)

    # generate mock response
    sentiment = mock_gen.analyze_sentiment(request.text, request.lang)
    topics = mock_gen.extract_topics(request.text, max_topics=5)

    return SentimentResponse(
        id=request.id,
        sentiment=sentiment,
        topics=topics
    )


@app.post("/api/v1/predict/topics", response_model=TopicsResponse, tags=["NLP"])
async def predict_topics(request: TopicsRequest):
    """
    extract topics and keywords from text

    TODO: replace with real topic modeling (LDA/BERT-based)
    """
    await simulate_processing_delay(80, 250)

    topics = mock_gen.extract_topics(request.text, request.max_topics)

    # extract mock keywords
    keywords = []
    if request.text:
        words = request.text.lower().split()
        keywords = [w for w in words if len(w) > 4][:10]

    return TopicsResponse(
        id=request.id,
        topics=topics,
        keywords=keywords
    )


@app.post("/api/v1/vision/segment", response_model=VisionSegmentResponse, tags=["Vision"])
async def segment_image(request: VisionSegmentRequest):
    """
    perform semantic segmentation on satellite/aerial imagery.  işte belki bize verdikleri verisetinden falan filan

    TODO: replace with real vision model (e.g., U-Net, DeepLab).
    """
    await simulate_processing_delay(200, 500)  # Vision tasks take longer

    # try to load sample response
    sample = load_sample_if_exists("vision_res.json")
    if sample and random.random() < 0.3:  # 30% chance to use sample
        sample["tile_id"] = request.tile_id  # Use requested tile_id
        return VisionSegmentResponse(**sample)

    # generate mock segmentation
    return mock_gen.segment_image(request.tile_id, request.bounds)


@app.post("/api/v1/score/damage", response_model=DamageScoreResponse, tags=["Analysis"])
async def score_damage(request: DamageScoreRequest):
    """
    calculate damage score for a location based on multiple signals.

    TODO: replace with real multi-signal fusion algorithm. ebesinin
    """
    await simulate_processing_delay(150, 400)

    response = mock_gen.calculate_damage_score(request.geo, request.signals)
    response.location_id = request.location_id

    return response


# ==============================================================================
# Error Handlers
# ==============================================================================

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """handle validation errors with proper status codes"""
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=str(exc)
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """catch-all for unexpected errors"""
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Beklenmedik bir hata oluştu, lütfen daha sonra tekrar deneyiniz"
    )


# ==============================================================================
# Startup Events
# ==============================================================================

@app.on_event("startup")
async def startup_event():
    """initialize resources on startup"""
    print("=" * 60)
    print("HasHarita Mock API Başlatıldı")
    print("=" * 60)
    print("Müsait endpointler:")
    print("  - GET  /health")
    print("  - POST /api/v1/predict/sentiment")
    print("  - POST /api/v1/predict/topics")
    print("  - POST /api/v1/vision/segment")
    print("  - POST /api/v1/score/damage")
    print("=" * 60)
    print("Documentation: http://localhost:8000/docs")
    print("=" * 60)


# ==============================================================================
# Main Entry Point
# ==============================================================================

if __name__ == "__main__":
    # Run with: python mock_api.py
    # Or: uvicorn mock_api:app --reload --host 0.0.0.0 --port 8000
    uvicorn.run(
        "mock_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )