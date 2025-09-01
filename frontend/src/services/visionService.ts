/**
 * Vision Analysis Service
 * Mock API'nin vision endpoint'leri ile entegrasyon
 */

import apiClient from '@/lib/api';
import type {
  VisionSegmentRequest,
  VisionSegmentResponse,
} from '@/types/api';

export class VisionService {
  /**
   * Görüntü segmentasyonu yapar
   */
  static async segmentImage(request: VisionSegmentRequest): Promise<VisionSegmentResponse> {
    try {
      const response = await apiClient.post<VisionSegmentResponse>(
        '/api/v1/vision/segment',
        request
      );
      return response;
    } catch (error) {
      console.error('Image segmentation failed:', error);
      throw error;
    }
  }

  /**
   * Uydu görüntüsü analizi için yardımcı fonksiyon
   */
  static async analyzeSatelliteImage(
    imageUri: string,
    bounds: [number, number, number, number],
    tileId?: string
  ): Promise<VisionSegmentResponse> {
    const request: VisionSegmentRequest = {
      tile_id: tileId || `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      image_uri: imageUri,
      bounds,
      epsg: 4326, // WGS84
    };

    return this.segmentImage(request);
  }

  /**
   * Afet türüne göre hasar tespiti
   */
  static async detectDisasterDamage(
    imageUri: string,
    location: { lat: number; lon: number },
    disasterType?: 'earthquake' | 'flood' | 'fire'
  ): Promise<VisionSegmentResponse> {
    // Konum etrafında 1km x 1km alan
    const buffer = 0.01; // Yaklaşık 1km
    const bounds: [number, number, number, number] = [
      location.lon - buffer, // minLon
      location.lat - buffer, // minLat
      location.lon + buffer, // maxLon
      location.lat + buffer, // maxLat
    ];

    return this.analyzeSatelliteImage(
      imageUri,
      bounds,
      `disaster_${disasterType || 'unknown'}_${Date.now()}`
    );
  }
}

export default VisionService;
