/**
 * Sentiment Analysis Service
 * Mock API'nin sentiment endpoint'leri ile entegrasyon
 */

import apiClient from '@/lib/api';
import type {
  SentimentRequest,
  SentimentResponse,
  TopicsRequest,
  TopicsResponse,
} from '@/types/api';

export class SentimentService {
  /**
   * Metin duygu analizi yapar
   */
  static async analyzeSentiment(request: SentimentRequest): Promise<SentimentResponse> {
    try {
      // backend/main.py tekil yerine batch endpoint sunuyor: /predict/sentiment
      // Tek öğeyi batch'e sar ve ilk sonucu döndür
      const batch = { items: [request] } as any;
      const batchResponse = await apiClient.post<{ items: SentimentResponse[] }>(
        '/predict/sentiment',
        batch
      );
      return batchResponse.items[0];
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      throw error;
    }
  }

  /**
   * Metinden topic çıkarımı yapar
   */
  static async extractTopics(request: TopicsRequest): Promise<TopicsResponse> {
    try {
      // backend/main.py tekil yerine batch endpoint sunuyor: /predict/topics
      const batch = { items: [request] } as any;
      const batchResponse = await apiClient.post<{ items: TopicsResponse[] }>(
        '/predict/topics',
        batch
      );
      return batchResponse.items[0];
    } catch (error) {
      console.error('Topic extraction failed:', error);
      throw error;
    }
  }

  /**
   * Basit metin analizi - hem sentiment hem topic
   */
  static async analyzeText(
    text: string,
    options: {
      id?: string;
      lang?: 'tr' | 'en' | 'auto';
      geo?: { lat: number; lon: number };
      maxTopics?: number;
    } = {}
  ): Promise<{
    sentiment: SentimentResponse;
    topics: TopicsResponse;
  }> {
    const requestId = options.id || `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [sentimentResponse, topicsResponse] = await Promise.all([
      this.analyzeSentiment({
        id: `${requestId}_sentiment`,
        text,
        lang: options.lang || 'auto',
        geo: options.geo,
      }),
      this.extractTopics({
        id: `${requestId}_topics`,
        text,
        lang: options.lang || 'auto',
        max_topics: options.maxTopics || 5,
      }),
    ]);

    return {
      sentiment: sentimentResponse,
      topics: topicsResponse,
    };
  }
}

export default SentimentService;
