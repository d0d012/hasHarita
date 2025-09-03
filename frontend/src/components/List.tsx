import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DisasterAlert, SustainabilityData } from '../types/disaster';
import LinkPreview from './LinkPreview';

interface LightningData {
  location: string;
  intensity: number;
  strikes: number;
  lastStrike: Date;
  risk: 'low' | 'medium' | 'high';
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ListProps {
  disasters: DisasterAlert[];
  sustainabilityData: SustainabilityData[];
  lightningData: LightningData[];
  monitoringMode: 'disaster' | 'sustainability' | 'lightning';
  onTextAnalysis?: (text: string, coordinates?: { lat: number; lng: number }) => Promise<any>;
  onShowMoreLightning?: () => void;
}

const List: React.FC<ListProps> = ({ disasters, sustainabilityData, lightningData, monitoringMode, onTextAnalysis, onShowMoreLightning }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-50';
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-600 text-white';
      case 'good': return 'bg-green-500 text-white';
      case 'fair': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
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



  const getTypeLabel = (type: string, isDisaster: boolean) => {
    if (isDisaster) {
      const typeLabels: Record<string, string> = {
        earthquake: 'Deprem',
        flood: 'Sel',
        fire: 'Yangın',
        landslide: 'Heyelan',
        storm: 'Fırtına',
        drought: 'Kuraklık',
        avalanche: 'Çığ',
        snowstorm: 'Kar Fırtınası'
      };
      return typeLabels[type] || type;
    } else {
      const typeLabels: Record<string, string> = {
        renewable: 'Yenilenebilir Enerji',
        waste: 'Atık Yönetimi',
        water: 'Su Yönetimi',
        air: 'Hava Kalitesi',
        biodiversity: 'Biyoçeşitlilik',
        transport: 'Sürdürülebilir Ulaşım'
      };
      return typeLabels[type] || type;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
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
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <span className="text-red-600">🚨</span>
            Afet Uyarıları
            <Badge variant="secondary" className="ml-auto">
              {disasters.length} uyarı
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {disasters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">✅</div>
              <p>Aktif afet uyarısı bulunmuyor</p>
            </div>
          ) : (
            disasters.map((disaster) => (
              <div key={disaster.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(disaster.severity)}>
                      {disaster.severity === 'critical' ? 'Kritik' :
                       disaster.severity === 'high' ? 'Yüksek' :
                       disaster.severity === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                    <Badge variant="outline">
                      {getTypeLabel(disaster.type, true)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(disaster.timestamp)}
                  </span>
                </div>
                <h4 className="font-semibold text-lg mb-1">{disaster.location}</h4>
                <p className="text-sm text-muted-foreground">{disaster.description}</p>
              </div>
            ))
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
              <div className="text-4xl mb-2">☀️</div>
              <p>Aktif yıldırım aktivitesi bulunmuyor</p>
            </div>
          ) : (
            lightningData
              .filter(lightning => lightning && lightning.location)
              .slice(0, 15)
              .sort((a, b) => new Date(b.lastStrike).getTime() - new Date(a.lastStrike).getTime())
              .map((lightning, index) => (
                <div key={`${lightning.location}-${index}`} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-muted-foreground">
                      {getRiskLabel(lightning.risk)} - Yoğunluk: {lightning.intensity}%
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(lightning.lastStrike.toISOString())}
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
                      <span className="font-medium">{formatTimestamp(lightning.lastStrike)}</span>
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
                <span>→</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <span className="text-green-600">🌱</span>
          Sürdürülebilirlik Verileri
          <Badge variant="secondary" className="ml-auto">
            {sustainabilityData.length} veri
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sustainabilityData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p>Sürdürülebilirlik verisi bulunamadı</p>
          </div>
        ) : (
          sustainabilityData.map((data) => (
            <div key={data.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(data.status)}>
                    {data.status === 'excellent' ? 'Mükemmel' :
                     data.status === 'good' ? 'İyi' :
                     data.status === 'fair' ? 'Orta' : 'Zayıf'}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(data.type, false)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(data.timestamp)}
                </span>
              </div>
              <h4 className="font-semibold text-lg mb-1">{data.location}</h4>
              <p className="text-sm text-muted-foreground mb-2">{data.description}</p>
              {data.value && data.unit && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Değer:</span>
                  <Badge variant="secondary">
                    {data.value} {data.unit}
                  </Badge>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Faydalı Linkler */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Faydalı Linkler:</h4>
          <div className="space-y-2 text-xs">
            <LinkPreview url="https://www.afad.gov.tr/afet-bilgi-sistemi">
              AFAD Afet Bilgi Sistemi
            </LinkPreview>
            <LinkPreview url="https://www.mgm.gov.tr/afetler/">
              MGM Afet Meteorolojisi
            </LinkPreview>
            <LinkPreview url="https://www.csb.gov.tr/cevresel-gostergeler">
              Çevresel Göstergeler
            </LinkPreview>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default List;