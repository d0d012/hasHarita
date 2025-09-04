/**
 * Aggregated Data Service
 * Backend'den aggregated veri çekme ve işleme servisi
 */

import { aggregatedDataApi } from '@/lib/api';
import type { AggregatedDataResponse, AggregatedDataItem } from '@/types/api';

export class AggregatedDataService {
  /**
   * Backend'den aggregated veri çeker
   */
  static async getAggregatedData(
    level: 'city' | 'district' = 'city',
    window: string = '15m'
  ): Promise<AggregatedDataResponse> {
    try {
      const response = await aggregatedDataApi.getAggregatedData(level, window);
      return response as AggregatedDataResponse;
    } catch (error) {
      console.error('Aggregated data fetch failed:', error);
      throw error;
    }
  }

  /**
   * Veriyi şehir bazında gruplar
   */
  static groupByCity(data: AggregatedDataItem[]): Record<string, AggregatedDataItem[]> {
    return data.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = [];
      }
      acc[item.city].push(item);
      return acc;
    }, {} as Record<string, AggregatedDataItem[]>);
  }

  /**
   * Şehir için toplam sentiment skorunu hesaplar
   */
  static calculateCitySentimentScore(cityData: AggregatedDataItem[]): number {
    if (cityData.length === 0) return 0;

    let totalPositive = 0;
    let totalNegative = 0;
    let totalCount = 0;

    cityData.forEach(item => {
      totalPositive += item.sentiment_summary.positive;
      totalNegative += item.sentiment_summary.negative;
      totalCount += item.count;
    });

    if (totalCount === 0) return 0;

    // Negatif sentiment oranını döndür (0-1 arası)
    return totalNegative / totalCount;
  }

  /**
   * Şehir için toplam veri sayısını hesaplar
   */
  static calculateCityTotalCount(cityData: AggregatedDataItem[]): number {
    return cityData.reduce((sum, item) => sum + item.count, 0);
  }

  /**
   * Şehir için en popüler topic'i bulur
   */
  static getTopTopic(cityData: AggregatedDataItem[]): string | null {
    if (cityData.length === 0) return null;

    const topicCounts = cityData.reduce((acc, item) => {
      acc[item.topic] = (acc[item.topic] || 0) + item.count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
  }

  /**
   * Veriyi frontend formatına dönüştürür (DataItem formatı)
   */
  static transformToDataItems(data: AggregatedDataItem[]): Array<{
    d: string;
    text: string;
    timestamp: string;
    sentiment: {
      label: 'positive' | 'neutral' | 'negative';
      score: number;
    };
    tags: string[];
    topics?: Array<{
      label: string;
      score: number;
    }>;
  }> {
    return data.map(item => {
      // Sentiment skorunu hesapla
      const totalSentiment = item.sentiment_summary.positive + 
                           item.sentiment_summary.neutral + 
                           item.sentiment_summary.negative;
      
      let sentimentLabel: 'positive' | 'neutral' | 'negative' = 'neutral';
      let sentimentScore = 0.5;

      if (totalSentiment > 0) {
        const positiveRatio = item.sentiment_summary.positive / totalSentiment;
        const negativeRatio = item.sentiment_summary.negative / totalSentiment;
        
        if (positiveRatio > negativeRatio) {
          sentimentLabel = 'positive';
          sentimentScore = 0.8 + (positiveRatio * 0.2);
        } else if (negativeRatio > positiveRatio) {
          sentimentLabel = 'negative';
          sentimentScore = 0.8 + (negativeRatio * 0.2);
        } else {
          sentimentLabel = 'neutral';
          sentimentScore = 0.5;
        }
      }

      return {
        d: `${item.city} - ${item.topic}`,
        text: `${item.city} şehrinde ${item.topic} konusunda ${item.count} veri bulundu. Sentiment: ${sentimentLabel}`,
        timestamp: new Date().toISOString(),
        sentiment: {
          label: sentimentLabel,
          score: sentimentScore
        },
        tags: [item.topic, item.city],
        topics: [{
          label: item.topic,
          score: 1.0
        }]
      };
    });
  }
}

export default AggregatedDataService;
