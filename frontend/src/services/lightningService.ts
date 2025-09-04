import { lightningApi } from '@/lib/api';
import type { LightningStrike, LightningDataResponse, LightningAggregatedItem, LightningAggregatedResponse } from '@/types/api';
import { DataItem } from '../data/mockData';

class LightningService {
  async getLightningData(window: string = '15m'): Promise<LightningDataResponse> {
    return lightningApi.getLightningData(window);
  }

  async getLightningAggregates(window: string = '15m'): Promise<LightningAggregatedResponse> {
    return lightningApi.getLightningAggregates(window);
  }

  transformStrikesToDataItems(strikes: LightningStrike[]): DataItem[] {
    return strikes.map((strike, index) => ({
      id: `lightning-${strike.strike_time}-${index}`,
      d: `Şimşek Çarpması - ${new Date(strike.timestamp).toLocaleString('tr-TR')}`,
      text: `Koordinat: ${strike.latitude.toFixed(4)}, ${strike.longitude.toFixed(4)} | Yoğunluk: ${strike.mds} | Gecikme: ${strike.delay}s`,
      timestamp: strike.timestamp,
      sentiment: {
        label: 'neutral' as const,
        score: 0.5,
      },
      tags: ['şimşek', 'doğal-afet'],
      location: this.getCityFromCoordinates(strike.latitude, strike.longitude),
    }));
  }

  transformAggregatedToDataItems(aggregatedItems: LightningAggregatedItem[]): DataItem[] {
    return aggregatedItems.map(item => ({
      id: `lightning-agg-${item.city}-${Date.now()}`,
      d: `${item.city} - ${item.strike_count} Şimşek Çarpması`,
      text: `Toplam ${item.strike_count} şimşek çarpması. Ortalama yoğunluk: ${item.avg_intensity.toFixed(1)}. Son çarpma: ${new Date(item.last_strike).toLocaleString('tr-TR')}`,
      timestamp: item.last_strike,
      sentiment: {
        label: 'negative' as const,
        score: Math.min(0.9, item.strike_count / 10),
      },
      tags: ['şimşek', 'doğal-afet', 'toplu'],
      location: item.city,
    }));
  }

  groupByCity(aggregatedItems: LightningAggregatedItem[]): Record<string, LightningAggregatedItem[]> {
    return aggregatedItems.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = [];
      }
      acc[item.city].push(item);
      return acc;
    }, {} as Record<string, LightningAggregatedItem[]>);
  }

  private getCityFromCoordinates(lat: number, lon: number): string {
    const cityCoords = {
      "İstanbul": [41.0082, 28.9784],
      "Ankara": [39.9334, 32.8597],
      "İzmir": [38.4192, 27.1287],
      "Bursa": [40.1826, 29.0665],
      "Antalya": [36.8969, 30.7133],
      "Adana": [37.0000, 35.3213],
      "Konya": [37.8746, 32.4932],
      "Gaziantep": [37.0662, 37.3833],
      "Mersin": [36.8000, 34.6333],
      "Diyarbakır": [37.9144, 40.2306],
      "Samsun": [41.2928, 36.3313],
      "Denizli": [37.7765, 29.0864],
      "Kahramanmaraş": [37.5858, 36.9371],
      "Eskişehir": [39.7767, 30.5206],
      "Urfa": [37.1591, 38.7969],
      "Malatya": [38.3552, 38.3095],
      "Erzurum": [39.9334, 41.2767],
      "Van": [38.4891, 43.4089],
      "Batman": [37.8812, 41.1351],
      "Elazığ": [38.6810, 39.2264],
    };

    let minDistance = Infinity;
    let closestCity = "Bilinmeyen";

    for (const [city, [cityLat, cityLon]] of Object.entries(cityCoords)) {
      const distance = Math.sqrt((lat - cityLat) ** 2 + (lon - cityLon) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return closestCity;
  }

  getIntensityLevel(avgIntensity: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (avgIntensity < 5000) return 'low';
    if (avgIntensity < 10000) return 'medium';
    if (avgIntensity < 15000) return 'high';
    return 'extreme';
  }

  getIntensityColor(intensity: 'low' | 'medium' | 'high' | 'extreme'): string {
    const colors = {
      low: '#4ade80',
      medium: '#fbbf24',
      high: '#f97316',
      extreme: '#ef4444'
    };
    return colors[intensity];
  }
}

export default new LightningService();
