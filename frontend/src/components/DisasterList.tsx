import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DisasterAlert, SustainabilityData } from '../types/disaster';
import LinkPreview from './LinkPreview';

interface DisasterListProps {
  disasters: DisasterAlert[];
  sustainabilityData: SustainabilityData[];
  monitoringMode: 'disaster' | 'sustainability';
}

const DisasterList: React.FC<DisasterListProps> = ({ disasters, sustainabilityData, monitoringMode }) => {
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

export default DisasterList;