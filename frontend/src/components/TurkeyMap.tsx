import React, { useState } from 'react';
import { DisasterAlert, SustainabilityData } from '../types/disaster';
import turkeyMapImage from '../assets/turkey-map.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TurkeyMapProps {
  disasters: DisasterAlert[];
  sustainabilityData: SustainabilityData[];
  monitoringMode: 'disaster' | 'sustainability';
  onMonitoringModeChange: (mode: 'disaster' | 'sustainability') => void;
}

// eliminen tek tek yazmaca
const cityCoordinates = {
  // marmara bölgesi
  'İstanbul': { x: 17, y: 20, region: 'Marmara', importance: 'Metropolitan', isGrandCity: true },
  'Edirne': { x: 6, y: 19, region: 'Marmara', importance: 'Medium', isGrandCity: false },
  'Kırklareli': { x: 11, y: 13, region: 'Marmara', importance: 'Low', isGrandCity: false },
  'Tekirdağ': { x: 10, y: 20, region: 'Marmara', importance: 'Medium', isGrandCity: false },
  'Çanakkale': { x: 7, y: 35, region: 'Marmara', importance: 'Medium', isGrandCity: false },
  'Kocaeli': { x: 23, y: 25, region: 'Marmara', importance: 'High', isGrandCity: true },
  'Bursa': { x: 18, y: 35, region: 'Marmara', importance: 'High', isGrandCity: true },
  'Yalova': { x: 19, y: 28, region: 'Marmara', importance: 'Low', isGrandCity: false },
  'Sakarya': { x: 26, y: 27, region: 'Marmara', importance: 'Medium', isGrandCity: false },
  'Bilecik': { x: 23.5, y: 35, region: 'Marmara', importance: 'Low', isGrandCity: false },
  'Balıkesir': { x: 12, y: 40, region: 'Marmara', importance: 'Medium', isGrandCity: false },
 
  
  // ege bölgesi
  'İzmir': { x: 6.5, y: 52, region: 'Ege', importance: 'Metropolitan', isGrandCity: true },
  'Manisa': { x: 11, y: 50, region: 'Ege', importance: 'Medium', isGrandCity: false },
  'Aydın': { x: 11, y: 66, region: 'Ege', importance: 'Medium', isGrandCity: false },
  'Denizli': { x: 18, y: 66, region: 'Ege', importance: 'Medium', isGrandCity: false },
  'Muğla': { x: 13, y: 74, region: 'Ege', importance: 'Medium', isGrandCity: false },
  'Afyonkarahisar': { x: 25, y: 55, region: 'Ege', importance: 'Medium', isGrandCity: false },
  'Kütahya': { x: 19.5, y: 45, region: 'Ege', importance: 'Medium', isGrandCity: false },
  'Uşak': { x: 19, y: 56, region: 'Ege', importance: 'Low', isGrandCity: false },
  
  // iç anadolu bölgesi
  'Ankara': { x: 37, y: 40, region: 'İç Anadolu', importance: 'Metropolitan', isGrandCity: true },
  'Konya': { x: 35, y: 67, region: 'İç Anadolu', importance: 'High', isGrandCity: true },
  'Kayseri': { x: 51, y: 57, region: 'İç Anadolu', importance: 'High', isGrandCity: true },
  'Sivas': { x: 59, y: 42, region: 'İç Anadolu', importance: 'Medium', isGrandCity: false },
  'Yozgat': { x: 48, y: 42, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Nevşehir': { x: 46.5, y: 57, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Kırşehir': { x: 44, y: 48, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Aksaray': { x: 43, y: 60, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Niğde': { x: 46, y: 67, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Karaman': { x: 40, y: 75, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Çankırı': { x: 40, y: 29, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Kırıkkale': { x: 42, y: 41, region: 'İç Anadolu', importance: 'Low', isGrandCity: false },
  'Eskişehir': { x: 27, y: 42, region: 'İç Anadolu', importance: 'Medium', isGrandCity: false },

  
  
  // karadeniz bölgesi
  'Amasya': { x: 53, y: 30, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Artvin': { x: 83, y: 20, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Bartın': { x: 35.5, y: 17, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Bayburt': { x: 74.5, y: 35, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Bolu': { x: 32, y: 28, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Çorum': { x: 48, y: 32, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Düzce': { x: 29.5, y: 25, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Gümüşhane': { x: 71, y: 34, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Giresun': { x: 66, y: 28, region: 'Karadeniz', importance: 'Medium', isGrandCity: false },
  'Karabük': { x: 36, y: 24, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Kastamonu': { x: 43, y: 20, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Ordu': { x: 61, y: 27, region: 'Karadeniz', importance: 'Medium', isGrandCity: false },
  'Rize': { x: 78, y: 24, region: 'Karadeniz', importance: 'Medium', isGrandCity: false },
  'Samsun': { x: 54, y: 22, region: 'Karadeniz', importance: 'High', isGrandCity: true },
  'Sinop': { x: 48.5, y: 14.5, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Tokat': { x: 56, y: 35, region: 'Karadeniz', importance: 'Low', isGrandCity: false },
  'Trabzon': { x: 73, y: 27, region: 'Karadeniz', importance: 'High', isGrandCity: true },
  'Zonguldak': { x: 32, y: 20, region: 'Karadeniz', importance: 'Medium', isGrandCity: false },



  
  // doğu anadolu bölgesi
  'Erzurum': { x: 80, y: 37, region: 'Doğu Anadolu', importance: 'High', isGrandCity: true },
  'Erzincan': { x: 71, y: 42, region: 'Doğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Bingöl': { x: 76.5, y: 52, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Tunceli': { x: 71, y: 50.5, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Elazığ': { x: 69.5, y: 57, region: 'Doğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Malatya': { x: 65, y: 61, region: 'Doğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Bitlis': { x: 85, y: 57.5, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Muş': { x: 82, y: 53, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Van': { x: 92, y: 55, region: 'Doğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Hakkari': { x: 95, y: 69.5, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Kars': { x: 88, y: 31, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Ardahan': { x: 87, y: 22, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Iğdır': { x: 93, y: 37, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  'Ağrı': { x: 89, y: 42, region: 'Doğu Anadolu', importance: 'Low', isGrandCity: false },
  
  // güneydoğu anadolu bölgesi
  'Şırnak': { x: 87, y: 72, region: 'Güneydoğu Anadolu', importance: 'Low', isGrandCity: false },
  'Mardin': { x: 78, y: 74, region: 'Güneydoğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Siirt': { x: 84, y: 64, region: 'Güneydoğu Anadolu', importance: 'Low', isGrandCity: false },
  'Batman': { x: 80.5, y: 67, region: 'Güneydoğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Gaziantep': { x: 61, y: 78.5, region: 'Güneydoğu Anadolu', importance: 'High', isGrandCity: true },
  'Şanlıurfa': { x: 68, y: 79, region: 'Güneydoğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Diyarbakır': { x: 76, y: 65, region: 'Güneydoğu Anadolu', importance: 'High', isGrandCity: true },
  'Kilis': { x: 59, y: 82, region: 'Güneydoğu Anadolu', importance: 'Low', isGrandCity: false },
  'Adıyaman': { x: 65, y: 68, region: 'Güneydoğu Anadolu', importance: 'Medium', isGrandCity: false },
  'Kahramanmaraş': { x: 58, y: 70, region: 'Güneydoğu Anadolu', importance: 'Medium', isGrandCity: false },
  
  // akdeniz bölgesi
  'Antalya': { x: 26, y: 78, region: 'Akdeniz', importance: 'High', isGrandCity: true },
  'Adana': { x: 50, y: 76, region: 'Akdeniz', importance: 'High', isGrandCity: true },
  'Mersin': { x: 44, y: 82, region: 'Akdeniz', importance: 'High', isGrandCity: true },
  'Hatay': { x: 54, y: 88, region: 'Akdeniz', importance: 'Medium', isGrandCity: false },
  'Osmaniye': { x: 54.5, y: 77, region: 'Akdeniz', importance: 'Low', isGrandCity: false },
  'Isparta': { x: 25.5, y: 66, region: 'Akdeniz', importance: 'Medium', isGrandCity: false },
  'Burdur': { x: 23, y: 71, region: 'Akdeniz', importance: 'Low', isGrandCity: false }
};

// her yeri aktif yaptım ki görebileyim
const ACTIVE_REGIONS = [
  // Marmara Bölgesi
  'İstanbul', 'Bursa', 'Kocaeli', 'Sakarya', 'Tekirdağ', 'Edirne', 
  'Kırklareli', 'Çanakkale', 'Balıkesir', 'Yalova', 'Bilecik',
  // Ege Bölgesi
  'İzmir', 'Manisa', 'Aydın', 'Denizli', 'Muğla', 'Afyonkarahisar', 'Kütahya', 'Uşak',
  // İç Anadolu Bölgesi
  'Ankara', 'Konya', 'Kayseri', 'Sivas', 'Yozgat', 'Nevşehir', 
  'Kırşehir', 'Aksaray', 'Niğde', 'Karaman', 'Çankırı', 'Kırıkkale', 'Eskişehir',
  // Karadeniz Bölgesi
  'Amasya', 'Artvin', 'Bartın', 'Bayburt', 'Bolu', 'Çorum', 'Düzce', 'Gümüşhane', 
  'Giresun', 'Karabük', 'Kastamonu', 'Ordu', 'Rize', 'Samsun', 'Sinop', 'Tokat', 
  'Trabzon', 'Zonguldak',
  // Doğu Anadolu Bölgesi
  'Erzurum', 'Erzincan', 'Bingöl', 'Tunceli', 'Elazığ', 'Malatya', 'Bitlis', 'Muş', 
  'Van', 'Hakkari', 'Kars', 'Ardahan', 'Iğdır', 'Ağrı',
  // Güneydoğu Anadolu Bölgesi
  'Şırnak', 'Mardin', 'Siirt', 'Batman', 'Gaziantep', 'Şanlıurfa', 'Diyarbakır', 
  'Kilis', 'Adıyaman', 'Kahramanmaraş',
  // Akdeniz Bölgesi
  'Antalya', 'Adana', 'Mersin', 'Hatay', 'Osmaniye', 'Isparta', 'Burdur'
];

const TurkeyMap: React.FC<TurkeyMapProps> = ({ disasters, sustainabilityData, monitoringMode, onMonitoringModeChange }) => {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');




  const cityAlerts = disasters.reduce((acc, disaster) => {
    if (!acc[disaster.location]) {
      acc[disaster.location] = [];
    }
    acc[disaster.location].push(disaster);
    return acc;
  }, {} as Record<string, DisasterAlert[]>);


  const citySustainabilityData = sustainabilityData.reduce((acc, data) => {
    if (!acc[data.location]) {
      acc[data.location] = [];
    }
    acc[data.location].push(data);
    return acc;
  }, {} as Record<string, SustainabilityData[]>);

  const getFilteredCities = () => {
    return Object.entries(cityCoordinates).filter(([cityName, cityData]) => {
      if (!ACTIVE_REGIONS.includes(cityName)) return false;
      
      if (regionFilter !== 'all' && cityData.region !== regionFilter) return false;
      
      // tür filter
      if (typeFilter !== 'all') {
        if (monitoringMode === 'disaster') {
          const alerts = cityAlerts[cityName];
          if (!alerts || !alerts.some(alert => alert.type === typeFilter)) return false;
        } else {
          const sustainabilityData = citySustainabilityData[cityName];
          if (!sustainabilityData || !sustainabilityData.some(data => data.type === typeFilter)) return false;
        }
      }
      
      return true;
    });
  };

  const getPointColor = (cityName: string) => {
    const cityData = cityCoordinates[cityName as keyof typeof cityCoordinates];
    if (!cityData) return null;
    
    // şehir filtreleri
    if (regionFilter !== 'all' && cityData.region !== regionFilter) return null;
    
    if (monitoringMode === 'disaster') {
      const alerts = cityAlerts[cityName];
      if (!alerts || alerts.length === 0) return '#3b82f6'; // Aktif şehirler için mavi nokta (afet yoksa)
      
      // en yüksek seviye
      const hasCritical = alerts.some(alert => alert.severity === 'critical');
      const hasHigh = alerts.some(alert => alert.severity === 'high');
      const hasMedium = alerts.some(alert => alert.severity === 'medium');
      
      if (hasCritical) return '#7f1d1d'; // çok kötü
      if (hasHigh) return '#991b1b';     // kötü
      if (hasMedium) return '#ea580c';   // orta
      return '#dc2626';                  // kötü
    } else {
      const sustainabilityData = citySustainabilityData[cityName];
      if (!sustainabilityData || sustainabilityData.length === 0) return '#3b82f6'; //  şehirler için mavi nokta
      
      // Get highest status
      const hasExcellent = sustainabilityData.some(data => data.status === 'excellent');
      const hasGood = sustainabilityData.some(data => data.status === 'good');
      const hasFair = sustainabilityData.some(data => data.status === 'fair');
      
      if (hasExcellent) return '#059669'; // çok iyi
      if (hasGood) return '#10b981';     // iyi
      if (hasFair) return '#f59e0b';     // orta
      return '#dc2626';                  // kötü
    }
  };

  const getPointSize = (cityName: string) => {
    const cityData = cityCoordinates[cityName as keyof typeof cityCoordinates];
    if (!cityData) return 0;
    
    // şehir filtreleri
    if (regionFilter !== 'all' && cityData.region !== regionFilter) return 0;
    
    if (monitoringMode === 'disaster') {
      const alerts = cityAlerts[cityName];
      if (!alerts || alerts.length === 0) return 8; // afet yoksa  mavi nokta
      
      const hasCritical = alerts.some(alert => alert.severity === 'critical');
      const hasHigh = alerts.some(alert => alert.severity === 'high');
      
      if (hasCritical) return 16;
      if (hasHigh) return 12;
      return 8;
    } else {
      const sustainabilityData = citySustainabilityData[cityName];
      if (!sustainabilityData || sustainabilityData.length === 0) return 8; // veri yoksa küçük mavi nokta
      
      const hasExcellent = sustainabilityData.some(data => data.status === 'excellent');
      const hasGood = sustainabilityData.some(data => data.status === 'good');
      
      if (hasExcellent) return 16;
      if (hasGood) return 12;
      return 8;
    }
  };

  const filteredCities = getFilteredCities();

  return (
    <div className="w-full h-full bg-accent/20 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
        
        </div>

            {/* Filtreler */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Switch
            id="monitoring-mode"
            checked={monitoringMode === 'sustainability'}
            onCheckedChange={(checked) => {
              onMonitoringModeChange(checked ? 'sustainability' : 'disaster');
              setTypeFilter('all'); // tür filtreleri sıfırla switch çalışınca
            }}
            className={`${
              monitoringMode === 'sustainability' 
                ? 'data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-green-600' 
                : 'data-[state=unchecked]:bg-red-600'
            }`}
          />
          <Label htmlFor="monitoring-mode" className="text-sm font-medium w-32 text-left">
            {monitoringMode === 'disaster' ? 'Afet' : 'Sürdürülebilirlik'}
          </Label>
        </div>

        <div className="flex items-center gap-2 mx-auto">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tüm Bölgeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Bölgeler</SelectItem>
              <SelectItem value="Marmara">Marmara</SelectItem>
              <SelectItem value="Ege">Ege</SelectItem>
              <SelectItem value="İç Anadolu">İç Anadolu</SelectItem>
              <SelectItem value="Akdeniz">Akdeniz</SelectItem>
              <SelectItem value="Karadeniz">Karadeniz</SelectItem>
              <SelectItem value="Güneydoğu Anadolu">Güneydoğu Anadolu</SelectItem>
              <SelectItem value="Doğu Anadolu">Doğu Anadolu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={monitoringMode === 'disaster' ? 'Tüm Afetler' : 'Tüm Türler'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{monitoringMode === 'disaster' ? 'Tüm Afetler' : 'Tüm Türler'}</SelectItem>
              {monitoringMode === 'disaster' ? (
                <>
                  <SelectItem value="earthquake">Deprem</SelectItem>
                  <SelectItem value="flood">Sel</SelectItem>
                  <SelectItem value="fire">Yangın</SelectItem>
                  <SelectItem value="landslide">Heyelan</SelectItem>
                  <SelectItem value="storm">Fırtına</SelectItem>
                  <SelectItem value="drought">Kuraklık</SelectItem>
                  <SelectItem value="avalanche">Çığ</SelectItem>
                  <SelectItem value="snowstorm">Kar Fırtınası</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="renewable">Yenilenebilir Enerji</SelectItem>
                  <SelectItem value="waste">Atık Yönetimi</SelectItem>
                  <SelectItem value="water">Su Yönetimi</SelectItem>
                  <SelectItem value="air">Hava Kalitesi</SelectItem>
                  <SelectItem value="biodiversity">Biyoçeşitlilik</SelectItem>
                  <SelectItem value="transport">Sürdürülebilir Ulaşım</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground min-w-[150px] text-right">
          {filteredCities.length} şehir gösteriliyor
        </div>
      </div>
      
      <div className="relative w-full h-[500px] flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          <img 
            src={turkeyMapImage} 
            alt="Türkiye Haritası"
            className="max-w-full max-h-full object-contain filter drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 4px 12px hsl(var(--primary) / 0.1))' }}
          />
          
          {/* şehirler için noktalar */}
          <div className="absolute inset-0">
            {Object.entries(cityCoordinates).map(([cityName, coords]) => {
              const color = getPointColor(cityName);
              const size = getPointSize(cityName);
              
              if (!color || size === 0) return null;
              
              return (
                <div
                  key={cityName}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                  }}
                  title={`${cityName} - ${monitoringMode === 'disaster' 
                    ? `${cityAlerts[cityName]?.length || 0} uyarı` 
                    : `${citySustainabilityData[cityName]?.length || 0} veri`}`}
                >
                  {/* uyarı noktası */}
                  <div
                    className="rounded-full animate-pulse shadow-lg"
                    style={{
                      backgroundColor: color,
                      width: `${size}px`,
                      height: `${size}px`,
                      boxShadow: `0 0 ${size}px ${color}40`
                    }}
                  />
                  
                  {/* şehir etiketi */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 
                                  bg-card text-card-foreground text-xs px-2 py-1 rounded shadow-md
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                  whitespace-nowrap z-10">
                    {cityName}
                    <br />
                    <span className="text-muted-foreground">
                      {monitoringMode === 'disaster' 
                        ? `${cityAlerts[cityName]?.length || 0} uyarı`
                        : `${citySustainabilityData[cityName]?.length || 0} veri`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Son güncelleme: {new Date().toLocaleString('tr-TR')}
      </div>
    </div>
  );
};

export default TurkeyMap;
//ayetel kürsü