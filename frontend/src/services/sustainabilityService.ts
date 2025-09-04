import { sustainabilityApi } from '@/lib/api';
import type { 
  SustainabilityLog, 
  SustainabilityDataResponse, 
  SustainabilityAggregatedItem, 
  SustainabilityAggregatedResponse 
} from '@/types/api';
import { DataItem } from '../data/mockData';

class SustainabilityService {
  async getSustainabilityData(window: string = '15m'): Promise<SustainabilityDataResponse> {
    return sustainabilityApi.getSustainabilityData(window);
  }

  async getSustainabilityAggregates(window: string = '15m'): Promise<SustainabilityAggregatedResponse> {
    return sustainabilityApi.getSustainabilityAggregates(window);
  }

  transformLogsToDataItems(logs: SustainabilityLog[]): DataItem[] {
    return logs.map((log, index) => ({
      id: `sustainability-${log.id}-${index}`,
      d: `${log.location} - ${this.getSustainabilityTypeLabel(log.type)}`,
      text: `${log.description} | Durum: ${this.getStatusLabel(log.status)} | Etki Skoru: ${log.impact_score}/100`,
      timestamp: log.timestamp,
      sentiment: this.getSentimentFromStatus(log.status),
      tags: [log.type, log.location, log.status],
      location: log.location,
      geo: { lat: log.latitude, lon: log.longitude }
    }));
  }

  transformAggregatedToDataItems(aggregatedItems: SustainabilityAggregatedItem[]): DataItem[] {
    return aggregatedItems.map(item => ({
      id: `sustainability-agg-${item.city}-${item.topic}-${Date.now()}`,
      d: `${item.city} - ${this.getSustainabilityTypeLabel(item.topic)}`,
      text: `${item.city} şehrinde ${item.topic} konusunda ${item.count} sürdürülebilirlik kaydı. Sentiment: ${this.calculateOverallSentiment(item.sentiment_summary)}`,
      timestamp: new Date().toISOString(),
      sentiment: this.calculateSentimentFromSummary(item.sentiment_summary),
      tags: [item.topic, item.city, 'sürdürülebilirlik'],
      location: item.city,
    }));
  }

  groupByCity(aggregatedItems: SustainabilityAggregatedItem[]): Record<string, SustainabilityAggregatedItem[]> {
    return aggregatedItems.reduce((acc, item) => {
      if (!acc[item.city]) {
        acc[item.city] = [];
      }
      acc[item.city].push(item);
      return acc;
    }, {} as Record<string, SustainabilityAggregatedItem[]>);
  }

  private getSustainabilityTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'renewable': 'Yenilenebilir Enerji',
      'waste': 'Atık Yönetimi',
      'water': 'Su Yönetimi',
      'air': 'Hava Kalitesi',
      'biodiversity': 'Biyolojik Çeşitlilik',
      'transport': 'Ulaşım'
    };
    return labels[type] || type;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'excellent': 'Mükemmel',
      'good': 'İyi',
      'fair': 'Orta',
      'poor': 'Zayıf'
    };
    return labels[status] || status;
  }

  private getSentimentFromStatus(status: string): { label: 'positive' | 'neutral' | 'negative'; score: number } {
    switch (status) {
      case 'excellent':
        return { label: 'positive', score: 0.95 };
      case 'good':
        return { label: 'positive', score: 0.8 };
      case 'fair':
        return { label: 'neutral', score: 0.5 };
      case 'poor':
        return { label: 'negative', score: 0.3 };
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

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'excellent': '#10b981',
      'good': '#22c55e',
      'fair': '#f59e0b',
      'poor': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getSustainabilityTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'renewable': '🌱',
      'waste': '♻️',
      'water': '💧',
      'air': '🌬️',
      'biodiversity': '🦋',
      'transport': '🚌'
    };
    return icons[type] || '🌍';
  }

  getImpactLevel(impactScore: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (impactScore >= 90) return 'excellent';
    if (impactScore >= 70) return 'high';
    if (impactScore >= 50) return 'medium';
    return 'low';
  }

  getImpactColor(level: 'low' | 'medium' | 'high' | 'excellent'): string {
    const colors = {
      low: '#ef4444',
      medium: '#f59e0b',
      high: '#22c55e',
      excellent: '#10b981'
    };
    return colors[level];
  }

  getSustainabilityTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'renewable': 'Yenilenebilir Enerji',
      'waste': 'Atık Yönetimi',
      'water': 'Su Yönetimi',
      'air': 'Hava Kalitesi',
      'biodiversity': 'Biyolojik Çeşitlilik',
      'transport': 'Ulaşım'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'excellent': 'Mükemmel',
      'good': 'İyi',
      'fair': 'Orta',
      'poor': 'Zayıf'
    };
    return labels[status] || status;
  }
}

export default new SustainabilityService();
