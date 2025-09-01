export interface DisasterAlert {
  id: string;
  location: string;
  type: 'earthquake' | 'flood' | 'fire' | 'storm' | 'landslide' | 'drought' | 'avalanche' | 'snowstorm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  coordinates?: {
    lat: number;
    lng: number;
  };
  // API entegrasyonu için ek alanlar
  damageScore?: number;
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  topics?: Array<{
    label: string;
    score: number;
  }>;
  visionAnalysis?: {
    detectedClasses: Array<{
      name: 'collapsed_building' | 'flooded_area' | 'burned_area';
      area_px: number;
      confidence: number;
    }>;
    maskUri?: string;
  };
}

export interface SustainabilityData {
  id: string;
  location: string;
  type: 'renewable' | 'waste' | 'water' | 'air' | 'biodiversity' | 'transport';
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  timestamp: Date;
  value?: number;
  unit?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  // API entegrasyonu için ek alanlar
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  topics?: Array<{
    label: string;
    score: number;
  }>;
  keywords?: string[];
}

export interface City {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  alerts: DisasterAlert[];
}