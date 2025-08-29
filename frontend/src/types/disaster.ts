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
}

export interface City {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  alerts: DisasterAlert[];
}