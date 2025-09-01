/**
 * Damage Assessment Service
 * Mock API'nin damage scoring endpoint'i ile entegrasyon
 */

import apiClient from '@/lib/api';
import type {
  DamageScoreRequest,
  DamageScoreResponse,
} from '@/types/api';

export class DamageService {
  /**
   * Konum bazlı hasar skoru hesaplar
   */
  static async calculateDamageScore(request: DamageScoreRequest): Promise<DamageScoreResponse> {
    try {
      const response = await apiClient.post<DamageScoreResponse>(
        '/api/v1/score/damage',
        request
      );
      return response;
    } catch (error) {
      console.error('Damage score calculation failed:', error);
      throw error;
    }
  }

  /**
   * Afet sonrası hasar değerlendirmesi
   */
  static async assessDisasterDamage(
    locationId: string,
    coordinates: { lat: number; lon: number },
    disasterSignals: {
      earthquakeMagnitude?: number;
      floodDepth?: number;
      fireIntensity?: number;
      windSpeed?: number;
      [key: string]: any;
    } = {}
  ): Promise<DamageScoreResponse> {
    const request: DamageScoreRequest = {
      location_id: locationId,
      geo: {
        lat: coordinates.lat,
        lon: coordinates.lon,
      },
      signals: disasterSignals,
      timestamp: new Date().toISOString(),
    };

    return this.calculateDamageScore(request);
  }

  /**
   * Çoklu konum hasar değerlendirmesi
   */
  static async assessMultipleLocations(
    locations: Array<{
      id: string;
      coordinates: { lat: number; lon: number };
      signals?: Record<string, any>;
    }>
  ): Promise<DamageScoreResponse[]> {
    const promises = locations.map(location =>
      this.assessDisasterDamage(
        location.id,
        location.coordinates,
        location.signals
      )
    );

    return Promise.all(promises);
  }

  /**
   * Hasar seviyesine göre renk kodu
   */
  static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-50';
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  /**
   * Hasar seviyesine göre Türkçe etiket
   */
  static getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Bilinmiyor';
    }
  }
}

export default DamageService;
