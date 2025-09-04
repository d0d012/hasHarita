import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataItem } from '../data/mockData';
import type { AggregatedDataItem } from '../types/api';
import AggregatedDataService from '../services/aggregatedDataService';
import LinkPreview from './LinkPreview';

interface LightningData {
  location: string;
  intensity: number;
  strikes: number;
  lastUpdate: string;
  risk: 'low' | 'medium' | 'high';
}

interface ListProps {
  disasters: DataItem[];
  sustainabilityData: DataItem[];
  aggregatedData?: AggregatedDataItem[];
  lightningData: LightningData[];
  lightningAggregatedData?: any[];
  monitoringMode: 'disaster' | 'sustainability' | 'lightning';
  onTextAnalysis?: (text: string, coordinates?: { lat: number; lng: number }) => Promise<any>;
  onShowMoreLightning?: () => void;
  onShowMoreDisasters?: () => void;
  onShowMoreSustainability?: () => void;
}

const List: React.FC<ListProps> = ({ disasters, sustainabilityData, aggregatedData, lightningData, lightningAggregatedData, monitoringMode, onTextAnalysis, onShowMoreLightning, onShowMoreDisasters, onShowMoreSustainability }) => {
  const getSentimentColor = (score: number, isDisaster: boolean = true) => {
    if (isDisaster) {
      // Afet verileri için: yüksek skor = daha kritik (kırmızı)
      if (score >= 0.8) return 'bg-red-900 text-red-50';
      if (score >= 0.6) return 'bg-red-600 text-white';
      if (score >= 0.4) return 'bg-orange-500 text-white';
      return 'bg-yellow-500 text-white';
    } else {
      // Sürdürülebilirlik verileri için: yüksek skor = daha iyi (yeşil)
      if (score >= 0.8) return 'bg-green-600 text-white';
      if (score >= 0.6) return 'bg-green-500 text-white';
      if (score >= 0.4) return 'bg-yellow-500 text-white';
      return 'bg-red-500 text-white';
    }
  };

  const getSentimentLabel = (score: number, isDisaster: boolean = true) => {
    if (isDisaster) {
      if (score >= 0.8) return 'Kritik';
      if (score >= 0.6) return 'Yüksek';
      if (score >= 0.4) return 'Orta';
      return 'Düşük';
    } else {
      if (score >= 0.8) return 'Mükemmel';
      if (score >= 0.6) return 'İyi';
      if (score >= 0.4) return 'Orta';
      return 'Zayıf';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-blue-900 text-blue-50';
      case 'medium': return 'bg-blue-600 text-white';
      case 'low': return 'bg-blue-400 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'Yüksek Risk';
      case 'medium': return 'Orta Risk';
      case 'low': return 'Düşük Risk';
      default: return 'Bilinmeyen Risk';
    }
  };



  const getTypeFromDescription = (description: string, isDisaster: boolean) => {
    const lowerDesc = description.toLowerCase();
    
    if (isDisaster) {
      if (lowerDesc.includes('deprem')) return 'Deprem';
      if (lowerDesc.includes('sel')) return 'Sel';
      if (lowerDesc.includes('yangın')) return 'Yangın';
      if (lowerDesc.includes('heyelan')) return 'Heyelan';
      if (lowerDesc.includes('fırtına')) return 'Fırtına';
      if (lowerDesc.includes('kuraklık')) return 'Kuraklık';
      if (lowerDesc.includes('çığ')) return 'Çığ';
      if (lowerDesc.includes('kar')) return 'Kar Fırtınası';
      return 'Afet';
    } else {
      if (lowerDesc.includes('enerji') || lowerDesc.includes('güneş') || lowerDesc.includes('rüzgar')) return 'Yenilenebilir Enerji';
      if (lowerDesc.includes('atık') || lowerDesc.includes('geri dönüşüm')) return 'Atık Yönetimi';
      if (lowerDesc.includes('su')) return 'Su Yönetimi';
      if (lowerDesc.includes('hava')) return 'Hava Kalitesi';
      if (lowerDesc.includes('biyolojik') || lowerDesc.includes('ekosistem')) return 'Biyoçeşitlilik';
      if (lowerDesc.includes('ulaşım') || lowerDesc.includes('otobüs')) return 'Sürdürülebilir Ulaşım';
      return 'Sürdürülebilirlik';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Bilinmeyen zaman';
    
    try {
      const now = new Date();
      const diff = now.getTime() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 60) return `${minutes} dakika önce`;
      if (hours < 24) return `${hours} saat önce`;
      return `${days} gün önce`;
    } catch (error) {
      return 'Geçersiz zaman';
    }
  };

  if (monitoringMode === 'disaster') {
    // Aggregated data varsa onu kullan, yoksa disasters'ı kullan
    const displayData = aggregatedData && aggregatedData.length > 0 
      ? AggregatedDataService.transformToDataItems(aggregatedData)
      : disasters;

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            Afet Uyarıları
            <Badge variant="secondary" className="ml-auto">
              {displayData.length} uyarı
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aktif afet uyarısı bulunmuyor</p>
            </div>
          ) : (
            displayData.map((disaster, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSentimentColor(disaster.sentiment?.score || 0, true)}>
                      {getSentimentLabel(disaster.sentiment?.score || 0, true)}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeFromDescription(disaster.d, true)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {disaster.timestamp ? formatTimestamp(disaster.timestamp) : 'Bilinmeyen zaman'}
                  </span>
                </div>
                <h4 className="font-semibold text-lg mb-1">{disaster.d}</h4>
                <p className="text-sm text-muted-foreground">{disaster.text || 'Açıklama bulunmuyor'}</p>
                {disaster.tags && disaster.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {disaster.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {disaster.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{disaster.tags.length - 3} daha
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Daha Fazla Göster Butonu */}
          {displayData.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={onShowMoreDisasters}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>Tüm Afet Kayıtlarını Görüntüle</span>
                <span className="text-sm opacity-75">({displayData.length} toplam)</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (monitoringMode === 'lightning') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            Yıldırım Kayıtları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lightningData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aktif yıldırım aktivitesi bulunmuyor</p>
            </div>
          ) : (
            lightningData
              .filter(lightning => lightning && lightning.location)
              .slice(0, 15)
              .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
              .map((lightning, index) => (
                <div key={`${lightning.location}-${index}`} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-muted-foreground">
                      {getRiskLabel(lightning.risk)} - Yoğunluk: {lightning.intensity}%
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(lightning.lastUpdate)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg mb-1">
                    {lightning.location}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Yıldırım Sayısı:</span>
                      <span className="font-medium">{lightning.strikes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Son Aktivite:</span>
                      <span className="font-medium">{formatTimestamp(new Date(lightning.lastUpdate))}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Yoğunluk:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${lightning.intensity}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{lightning.intensity}%</span>
                    </div>
                  </div>
                </div>
              ))
          )}
          
          {/* Daha Fazla Göster Butonu */}
          {lightningData.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={onShowMoreLightning}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>Tüm Yıldırım Kayıtlarını Görüntüle</span>
                <span className="text-sm opacity-75">({lightningData.length} toplam)</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Aggregated data varsa onu kullan, yoksa sustainabilityData'yı kullan
  const displayData = aggregatedData && aggregatedData.length > 0 
    ? AggregatedDataService.transformToDataItems(aggregatedData)
    : sustainabilityData;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          Sürdürülebilirlik Verileri
          <Badge variant="secondary" className="ml-auto">
            {displayData.length} veri
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Sürdürülebilirlik verisi bulunamadı</p>
          </div>
        ) : (
          displayData.map((data, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getSentimentColor(data.sentiment?.score || 0, false)}>
                    {getSentimentLabel(data.sentiment?.score || 0, false)}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeFromDescription(data.d, false)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {data.timestamp ? formatTimestamp(data.timestamp) : 'Bilinmeyen zaman'}
                </span>
              </div>
              <h4 className="font-semibold text-lg mb-1">{data.d}</h4>
              <p className="text-sm text-muted-foreground mb-2">{data.text || 'Açıklama bulunmuyor'}</p>
              {data.tags && data.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {data.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {data.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{data.tags.length - 3} daha
                    </Badge>
                  )}
                </div>
              )}
              {data.topics && data.topics.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground mb-1">Konular:</div>
                  <div className="flex flex-wrap gap-1">
                    {data.topics.slice(0, 2).map((topic, topicIndex) => (
                      <Badge key={topicIndex} variant="outline" className="text-xs">
                        {topic.label} ({Math.round(topic.score * 100)}%)
                      </Badge>
                    ))}
                    {data.topics.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{data.topics.length - 2} daha
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Daha Fazla Göster Butonu */}
        {displayData.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={onShowMoreSustainability}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Tüm Sürdürülebilirlik Kayıtlarını Görüntüle</span>
              <span className="text-sm opacity-75">({displayData.length} toplam)</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default List;