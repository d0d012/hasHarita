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

// Aggregated data from backend
export interface AggregatedDataItem {
  city: string;
  district: string | null;
  topic: string;
  count: number;
  sentiment_summary: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Aggregated data response
export interface AggregatedDataResponse {
  window: string;
  updated_at: string;
  purged: number;
  items: AggregatedDataItem[];
}

// Lightning data types
export interface LightningStrike {
  timestamp: string;
  strike_time: number;
  latitude: number;
  longitude: number;
  delay: number;
  mds: number;
  status: number;
  detectors: Array<{
    lat: number;
    lon: number;
    status: number;
  }>;
}

export interface LightningDataResponse {
  window: string;
  updated_at: string;
  total_strikes: number;
  strikes: LightningStrike[];
}

export interface LightningAggregatedItem {
  city: string;
  district: string | null;
  strike_count: number;
  avg_intensity: number;
  last_strike: string;
  coordinates: Array<{
    lat: number;
    lon: number;
  }>;
}

export interface LightningAggregatedResponse {
  window: string;
  updated_at: string;
  total_strikes: number;
  items: LightningAggregatedItem[];
}

// Disaster data types
export interface DisasterLog {
  id: string;
  timestamp: string;
  type: string;
  severity: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  damage_score: number;
  affected_area: number;
  casualties: number;
  injuries: number;
}

export interface DisasterDataResponse {
  window: string;
  updated_at: string;
  total_disasters: number;
  disasters: DisasterLog[];
}

export interface DisasterAggregatedItem {
  city: string;
  district: string | null;
  topic: string;
  count: number;
  sentiment_summary: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface DisasterAggregatedResponse {
  window: string;
  updated_at: string;
  purged: number;
  items: DisasterAggregatedItem[];
}

// Sustainability data types
export interface SustainabilityLog {
  id: string;
  timestamp: string;
  type: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  value: number;
  unit: string;
  description: string;
  status: string;
  impact_score: number;
}

export interface SustainabilityDataResponse {
  window: string;
  updated_at: string;
  total_logs: number;
  logs: SustainabilityLog[];
}

export interface SustainabilityAggregatedItem {
  city: string;
  district: string | null;
  topic: string;
  count: number;
  sentiment_summary: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface SustainabilityAggregatedResponse {
  window: string;
  updated_at: string;
  purged: number;
  items: SustainabilityAggregatedItem[];
}
