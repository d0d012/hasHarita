import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Filter, AlertTriangle } from 'lucide-react';
import type { DisasterLog } from '../types/api';
import { useNavigate } from 'react-router-dom';
import DisasterService from '../services/disasterService';

const DisasterLogs: React.FC = () => {
  const [disasterData, setDisasterData] = useState<DisasterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'time' | 'severity' | 'damage' | 'type'>('time');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await DisasterService.getDisasterData('15m');
        setDisasterData(response.disasters);
        setLastUpdateTime(new Date());
        console.log('Disaster data refreshed:', response.disasters.length, 'records');
      } catch (error) {
        console.error('Afet verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    // İlk yükleme
    loadData();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getLocationName = (lat: number, lng: number) => {
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      return 'Bilinmeyen Konum';
    }
    
    // Türkiye şehir koordinatları
    const cityCoordinates = {
      'İstanbul': { lat: 41.0082, lng: 28.9784 },
      'Ankara': { lat: 39.9334, lng: 32.8597 },
      'İzmir': { lat: 38.4192, lng: 27.1287 },
      'Bursa': { lat: 40.1826, lng: 29.0665 },
      'Antalya': { lat: 36.8969, lng: 30.7133 },
      'Adana': { lat: 37.0000, lng: 35.3213 },
      'Konya': { lat: 37.8667, lng: 32.4833 },
      'Gaziantep': { lat: 37.0662, lng: 37.3833 },
      'Trabzon': { lat: 41.0015, lng: 39.7178 },
      'Van': { lat: 38.4891, lng: 43.4089 },
      'Erzurum': { lat: 39.9000, lng: 41.2700 },
      'Diyarbakır': { lat: 37.9144, lng: 40.2306 },
      'Samsun': { lat: 41.2867, lng: 36.3300 },
      'Kayseri': { lat: 38.7205, lng: 35.4826 },
      'Mersin': { lat: 36.8000, lng: 34.6333 },
    };

    // Mesafe hesaplama fonksiyonu
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Dünya'nın yarıçapı (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // En yakın şehri bul
    let nearestCity = '';
    let minDistance = Infinity;

    for (const [cityName, coords] of Object.entries(cityCoordinates)) {
      const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityName;
      }
    }

    // Eğer en yakın şehir 50km'den uzaksa koordinatları göster
    if (minDistance > 50) {
      return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    }

    return nearestCity;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const sortedData = [...disasterData].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'severity':
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
               (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      case 'damage':
        return b.damage_score - a.damage_score;
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const exportToCSV = () => {
    const headers = ['Tarih', 'Şehir', 'Tip', 'Şiddet', 'Hasar Skoru', 'Etkilenen Alan', 'Yaralı', 'Ölü', 'Koordinatlar'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(item => [
        formatTimestamp(item.timestamp),
        getLocationName(item.latitude, item.longitude),
        DisasterService.getDisasterTypeIcon(item.type) + ' ' + DisasterService.getDisasterTypeLabel(item.type),
        DisasterService.getSeverityLabel(item.severity),
        item.damage_score,
        item.affected_area,
        item.injuries,
        item.casualties,
        `${item.latitude}, ${item.longitude}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `afet_loglari_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Afet verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                Afet Kayıtları
              </h1>
              <p className="text-muted-foreground">
                Toplam {disasterData.length} afet kaydı
              </p>
              <p className="text-xs text-muted-foreground">
                Son güncelleme: {lastUpdateTime.toLocaleTimeString('tr-TR')} (Her 30s güncellenir)
              </p>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV İndir
          </Button>
        </div>

        {/* Sorting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Sıralama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sıralama:</label>
                <div className="flex gap-2">
                  {([
                    { key: 'time', label: 'Zaman' },
                    { key: 'severity', label: 'Şiddet' },
                    { key: 'damage', label: 'Hasar Skoru' },
                    { key: 'type', label: 'Tip' }
                  ] as const).map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={sortBy === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{disasterData.length}</div>
              <div className="text-sm text-muted-foreground">Toplam Afet</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(disasterData.reduce((sum, item) => sum + item.damage_score, 0) / disasterData.length)}
              </div>
              <div className="text-sm text-muted-foreground">Ortalama Hasar Skoru</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {disasterData.reduce((sum, item) => sum + item.injuries, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Toplam Yaralı</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {disasterData.reduce((sum, item) => sum + item.casualties, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Toplam Ölü</div>
            </CardContent>
          </Card>
        </div>

        {/* Disaster Logs */}
        <Card>
          <CardHeader>
            <CardTitle>
              Afet Detayları
              <Badge variant="secondary" className="ml-2">
                {sortedData.length} kayıt
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sortedData.map((disaster, index) => (
                <div key={`${disaster.id}-${index}`} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        style={{ backgroundColor: DisasterService.getSeverityColor(disaster.severity) + '20', color: DisasterService.getSeverityColor(disaster.severity) }}
                      >
                        {DisasterService.getSeverityLabel(disaster.severity)}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        Hasar: {disaster.damage_score}/100
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {DisasterService.getDisasterTypeIcon(disaster.type)} {DisasterService.getDisasterTypeLabel(disaster.type)}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{getTimeAgo(disaster.timestamp)}</div>
                      <div>{formatTimestamp(disaster.timestamp)}</div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-xl mb-2">{getLocationName(disaster.latitude, disaster.longitude)}</h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{disaster.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Koordinatlar:</span>
                      <div className="font-mono text-xs">
                        {disaster.latitude.toFixed(4)}, {disaster.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Etkilenen Alan:</span>
                      <div className="font-medium">{disaster.affected_area} km²</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Yaralı/Ölü:</span>
                      <div className="font-medium">{disaster.injuries} / {disaster.casualties}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hasar Skoru:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${disaster.damage_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{disaster.damage_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisasterLogs;
