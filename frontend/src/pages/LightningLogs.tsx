import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { LightningStrike } from '../services/lightningService';
import { useNavigate } from 'react-router-dom';

const LightningLogs: React.FC = () => {
  const [lightningData, setLightningData] = useState<LightningStrike[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'time' | 'mds' | 'delay' | 'detectors'>('time');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cache busting için timestamp ekle
        const response = await fetch(`/turkey_lightning_strikes.jsonl?t=${Date.now()}`);
        const text = await response.text();
        const lines = text.trim().split('\n');
        const data = lines.map(line => JSON.parse(line));
        setLightningData(data);
        setLastUpdateTime(new Date());
        console.log('Lightning data refreshed:', data.length, 'records');
      } catch (error) {
        console.error('Yıldırım verileri yüklenirken hata:', error);
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
      'Kocaeli': { lat: 40.8533, lng: 29.8815 },
      'Hatay': { lat: 36.4018, lng: 36.3498 },
      'Manisa': { lat: 38.6191, lng: 27.4289 },
      'Balıkesir': { lat: 39.6484, lng: 27.8826 },
      'Kahramanmaraş': { lat: 37.5858, lng: 36.9371 },
      'Aydın': { lat: 37.8560, lng: 27.8416 },
      'Denizli': { lat: 37.7765, lng: 29.0864 },
      'Muğla': { lat: 37.2153, lng: 28.3636 },
      'Tekirdağ': { lat: 40.9833, lng: 27.5167 },
      'Sakarya': { lat: 40.7889, lng: 30.4053 },
      'Elazığ': { lat: 38.6810, lng: 39.2264 },
      'Malatya': { lat: 38.3552, lng: 38.3095 },
      'Ordu': { lat: 40.9839, lng: 37.8764 },
      'Tokat': { lat: 40.3167, lng: 36.5500 },
      'Afyonkarahisar': { lat: 38.7507, lng: 30.5567 },
      'Zonguldak': { lat: 41.4564, lng: 31.7987 },
      'Çorum': { lat: 40.5506, lng: 34.9556 },
      'Uşak': { lat: 38.6823, lng: 29.4082 },
      'Düzce': { lat: 40.8438, lng: 31.1565 },
      'Yozgat': { lat: 39.8181, lng: 34.8147 },
      'Kütahya': { lat: 39.4200, lng: 29.9833 },
      'Amasya': { lat: 40.6499, lng: 35.8353 },
      'Isparta': { lat: 37.7648, lng: 30.5566 },
      'Çanakkale': { lat: 40.1553, lng: 26.4142 },
      'Bolu': { lat: 40.7314, lng: 31.6081 },
      'Edirne': { lat: 41.6771, lng: 26.5557 },
      'Kırklareli': { lat: 41.7350, lng: 27.2256 },
      'Sivas': { lat: 39.7477, lng: 37.0179 },
      'Kastamonu': { lat: 41.3887, lng: 33.7827 },
      'Nevşehir': { lat: 38.6244, lng: 34.7236 },
      'Karaman': { lat: 37.1759, lng: 33.2287 },
      'Aksaray': { lat: 38.3687, lng: 34.0370 },
      'Niğde': { lat: 37.9667, lng: 34.6833 },
      'Kırşehir': { lat: 39.1425, lng: 34.1709 },
      'Çankırı': { lat: 40.6013, lng: 33.6134 },
      'Sinop': { lat: 42.0231, lng: 35.1531 },
      'Bartın': { lat: 41.6344, lng: 32.3389 },
      'Karabük': { lat: 41.2061, lng: 32.6204 },
      'Yalova': { lat: 40.6550, lng: 29.2769 },
      'Bilecik': { lat: 40.1501, lng: 29.9831 },
      'Kırıkkale': { lat: 39.8468, lng: 33.4988 },
      'Osmaniye': { lat: 37.0682, lng: 36.2616 },
      'Giresun': { lat: 40.9128, lng: 38.3895 },
      'Rize': { lat: 41.0201, lng: 40.5234 },
      'Artvin': { lat: 41.1828, lng: 41.8183 },
      'Gümüşhane': { lat: 40.4603, lng: 39.5086 },
      'Bayburt': { lat: 40.2552, lng: 40.2249 },
      'Erzincan': { lat: 39.7500, lng: 39.5000 },
      'Bingöl': { lat: 38.8847, lng: 40.4982 },
      'Tunceli': { lat: 39.1079, lng: 39.5401 },
      'Bitlis': { lat: 38.3938, lng: 42.1232 },
      'Muş': { lat: 38.9462, lng: 41.7539 },
      'Hakkari': { lat: 37.5833, lng: 43.7333 },
      'Şırnak': { lat: 37.5164, lng: 42.4611 },
      'Batman': { lat: 37.8812, lng: 41.1351 },
      'Siirt': { lat: 37.9274, lng: 41.9403 },
      'Mardin': { lat: 37.3212, lng: 40.7245 },
      'Kilis': { lat: 36.7184, lng: 37.1212 },
      'Adıyaman': { lat: 37.7636, lng: 38.2786 },
      'Iğdır': { lat: 39.9208, lng: 44.0048 },
      'Kars': { lat: 40.6013, lng: 43.0975 },
      'Ardahan': { lat: 41.1105, lng: 42.7022 },
      'Ağrı': { lat: 39.7191, lng: 43.0503 }
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

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const sortedData = [...lightningData].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'mds':
        return b.mds - a.mds;
      case 'delay':
        return b.delay - a.delay;
      case 'detectors':
        return b.detectors.length - a.detectors.length;
      default:
        return 0;
    }
  });

  const exportToCSV = () => {
    const headers = ['Tarih', 'Şehir', 'MDS', 'Gecikme (ms)', 'Algılayıcı Sayısı', 'Koordinatlar'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(item => [
        formatTimestamp(new Date(item.timestamp)),
        getLocationName(item.latitude, item.longitude),
        item.mds,
        item.delay,
        item.detectors.length,
        `${item.latitude}, ${item.longitude}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `yildirim_loglari_${new Date().toISOString().split('T')[0]}.csv`);
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
          <p className="text-muted-foreground">Yıldırım verileri yükleniyor...</p>
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
              <h1 className="text-3xl font-bold">Yıldırım Kayıtları</h1>
              <p className="text-muted-foreground">
                Toplam {lightningData.length} yıldırım kaydı
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
                    { key: 'mds', label: 'MDS Değeri' },
                    { key: 'delay', label: 'Gecikme' },
                    { key: 'detectors', label: 'Algılayıcı' }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{lightningData.length}</div>
              <div className="text-sm text-muted-foreground">Toplam Kayıt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(lightningData.reduce((sum, item) => sum + item.mds, 0) / lightningData.length)}
              </div>
              <div className="text-sm text-muted-foreground">Ortalama MDS</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(lightningData.reduce((sum, item) => sum + item.delay, 0) / lightningData.length)}ms
              </div>
              <div className="text-sm text-muted-foreground">Ortalama Gecikme</div>
            </CardContent>
          </Card>
        </div>

        {/* Lightning Logs */}
        <Card>
          <CardHeader>
            <CardTitle>
              Yıldırım Aktivite Detayları
              <Badge variant="secondary" className="ml-2">
                {sortedData.length} kayıt
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sortedData.map((lightning, index) => (
                <div key={`${lightning.latitude}-${lightning.longitude}-${index}`} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        MDS: {lightning.mds}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        {lightning.delay}ms gecikme
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{getTimeAgo(new Date(lightning.timestamp))}</div>
                      <div>{formatTimestamp(new Date(lightning.timestamp))}</div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-xl mb-2">{getLocationName(lightning.latitude, lightning.longitude)}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Koordinatlar:</span>
                      <div className="font-mono text-xs">
                        {lightning.latitude.toFixed(4)}, {lightning.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">MDS Değeri:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((lightning.mds / 20000) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{lightning.mds}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Algılayıcı Sayısı:</span>
                      <div className="font-medium">{lightning.detectors.length} adet</div>
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

export default LightningLogs;
