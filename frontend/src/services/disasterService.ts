import { disasterApi } from '@/lib/api';
import type { 
  DisasterLog, 
  DisasterDataResponse, 
  DisasterAggregatedItem, 
  DisasterAggregatedResponse 
} from '@/types/api';
import { DataItem } from '../data/mockData';

class DisasterService {
  async getDisasterData(window: string = '15m'): Promise<DisasterDataResponse> {
    return disasterApi.getDisasterData(window);
  }

  async getDisasterAggregates(window: string = '15m'): Promise<DisasterAggregatedResponse> {
    return disasterApi.getDisasterAggregates(window);
  }

  transformLogsToDataItems(logs: DisasterLog[]): DataItem[] {
    return logs.map((log, index) => ({
      id: `disaster-${log.id}-${index}`,
      d: `${log.location} - ${this.getDisasterTypeLabel(log.type)}`,
      text: `${log.description} | Şiddet: ${this.getSeverityLabel(log.severity)} | Hasar Skoru: ${log.damage_score}/100`,
      timestamp: log.timestamp,
      sentiment: this.getSentimentFromSeverity(log.severity),
      tags: [log.type, log.location, log.severity],
      location: log.location,
      geo: { lat: log.latitude, lon: log.longitude }
    }));
  }

  transformAggregatedToDataItems(aggregatedItems: DisasterAggregatedItem[]): DataItem[] {
    return aggregatedItems.map(item => ({
      id: `disaster-agg-${item.city}-${item.topic}-${Date.now()}`,
      d: `${item.city} - ${this.getDisasterTypeLabel(item.topic)}`,
      text: `${item.city} şehrinde ${item.topic} türünde ${item.count} afet kaydı. Sentiment: ${this.calculateOverallSentiment(item.sentiment_summary)}`,
      timestamp: new Date().toISOString(),
      sentiment: this.calculateSentimentFromSummary(item.sentiment_summary),
      tags: [item.topic, item.city, 'afet'],
      location: item.city,
    }));
  }

  groupByCity(aggregatedItems: DisasterAggregatedItem[]): Record<string, DisasterAggregatedItem[]> {
    return aggregatedItems.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = [];
      }
      acc[item.city].push(item);
      return acc;
    }, {} as Record<string, DisasterAggregatedItem[]>);
  }

  private getDisasterTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'earthquake': 'Deprem',
      'storm': 'Fırtına',
      'flood': 'Sel',
      'fire': 'Yangın',
      'landslide': 'Heyelan',
      'drought': 'Kuraklık',
      'avalanche': 'Çığ',
      'snowstorm': 'Kar Fırtınası'
    };
    return labels[type] || type;
  }

  private getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'critical': 'Kritik'
    };
    return labels[severity] || severity;
  }

  private getSentimentFromSeverity(severity: string): { label: 'positive' | 'neutral' | 'negative'; score: number } {
    switch (severity) {
      case 'critical':
      case 'high':
        return { label: 'negative', score: 0.9 };
      case 'medium':
        return { label: 'neutral', score: 0.5 };
      case 'low':
        return { label: 'positive', score: 0.7 };
      default:
        return { label: 'neutral', score: 0.5 };
    }
  }

  private calculateOverallSentiment(summary: { positive: number; neutral: number; negative: number }): string {
    const total = summary.positive + summary.neutral + summary.negative;
    if (total === 0) return 'Nötr';
    
    const positiveRatio = summary.positive / total;
    const negativeRatio = summary.negative / total;
    
    if (positiveRatio > negativeRatio) return 'Pozitif';
    if (negativeRatio > positiveRatio) return 'Negatif';
    return 'Nötr';
  }

  private calculateSentimentFromSummary(summary: { positive: number; neutral: number; negative: number }): { label: 'positive' | 'neutral' | 'negative'; score: number } {
    const total = summary.positive + summary.neutral + summary.negative;
    if (total === 0) return { label: 'neutral', score: 0.5 };
    
    const positiveRatio = summary.positive / total;
    const negativeRatio = summary.negative / total;
    
    if (positiveRatio > negativeRatio) {
      return { label: 'positive', score: 0.5 + (positiveRatio * 0.4) };
    } else if (negativeRatio > positiveRatio) {
      return { label: 'negative', score: 0.5 + (negativeRatio * 0.4) };
    } else {
      return { label: 'neutral', score: 0.5 };
    }
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      'low': '#4ade80',
      'medium': '#fbbf24',
      'high': '#f97316',
      'critical': '#ef4444'
    };
    return colors[severity] || '#6b7280';
  }

  getDisasterTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'earthquake': '🌍',
      'storm': '⛈️',
      'flood': '🌊',
      'fire': '🔥',
      'landslide': '🏔️',
      'drought': '☀️',
      'avalanche': '❄️',
      'snowstorm': '🌨️'
    };
    return icons[type] || '⚠️';
  }

  getDisasterTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'earthquake': 'Deprem',
      'storm': 'Fırtına',
      'flood': 'Sel',
      'fire': 'Yangın',
      'landslide': 'Heyelan',
      'drought': 'Kuraklık',
      'avalanche': 'Çığ',
      'snowstorm': 'Kar Fırtınası'
    };
    return labels[type] || type;
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      'low': 'Düşük',
      'medium': 'Orta',
      'high': 'Yüksek',
      'critical': 'Kritik'
    };
    return labels[severity] || severity;
  }
}

export default new DisasterService();
