/**
 * HasHarita API Types
 * Mock API ile uyumlu TypeScript tipleri
 */

// Coğrafi koordinatlar
export interface GeoPoint {
  lat: number;
  lon: number;
}

// Duygu analizi sonucu
export interface Sentiment {
  label: 'positive' | 'neutral' | 'negative';
  score: number; // 0-1 arası
}

// Topic detection sonucu
export interface TopicScore {
  label: string;
  score: number; // 0-1 arası
}

// Duygu analizi request
export interface SentimentRequest {
  id: string;
  text: string;
  lang?: 'tr' | 'en' | 'auto';
  timestamp?: string; // ISO string
  geo?: GeoPoint;
  tags?: string[];
}

// Duygu analizi response
export interface SentimentResponse {
  id: string;
  sentiment: Sentiment;
  topics?: TopicScore[];
}

// Topic extraction request
export interface TopicsRequest {
  id: string;
  text: string;
  lang?: 'tr' | 'en' | 'auto';
  max_topics?: number; // 1-10 arası
}

// Topic extraction response
export interface TopicsResponse {
  id: string;
  topics: TopicScore[];
  keywords?: string[];
}

// Vision segmentation request
export interface VisionSegmentRequest {
  tile_id: string;
  image_uri: string;
  bounds: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  epsg: number; // Şu an sadece 4326
}

// Segmentation class
export interface SegClass {
  name: 'collapsed_building' | 'flooded_area' | 'burned_area';
  area_px: number;
  confidence: number; // 0-1 arası
}

// Vision segmentation response
export interface VisionSegmentResponse {
  tile_id: string;
  mask_uri: string;
  classes: SegClass[];
}

// Damage scoring request
export interface DamageScoreRequest {
  location_id: string;
  geo: GeoPoint;
  signals?: Record<string, any>;
  timestamp: string; // ISO string
}

// Damage scoring response
export interface DamageScoreResponse {
  location_id: string;
  damage_score: number; // 0-1 arası
  severity: 'low' | 'medium' | 'high' | 'critical';
  factors: Record<string, number>;
}

// Health check response
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

// API Error response
export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
}
