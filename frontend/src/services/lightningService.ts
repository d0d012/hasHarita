export interface LightningStrike {
  timestamp: string;
  strike_time: number;
  latitude: number;
  longitude: number;
  delay: number;
  mds: number;
  status: number;
  detectors: Array<{
    lat: number;
    lon: number;
    status: number;
  }>;
}

export interface ProcessedLightningData {
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


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// En yakın şehri bul
function findNearestCity(lat: number, lng: number): string {
  let nearestCity = '';
  let minDistance = Infinity;

  for (const [cityName, coords] of Object.entries(cityCoordinates)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = cityName;
    }
  }

  return nearestCity;
}

// Risk seviyesini hesapla
function calculateRiskLevel(intensity: number, strikes: number): 'low' | 'medium' | 'high' {
  if (intensity > 70 || strikes > 30) return 'high';
  if (intensity > 40 || strikes > 15) return 'medium';
  return 'low';
}

// Gerçek lightning verilerini işle
export async function processLightningData(): Promise<ProcessedLightningData[]> {
  try {
    // JSONL dosyasını oku (cache busting ile)
    const response = await fetch(`/turkey_lightning_strikes.jsonl?t=${Date.now()}`);
    const text = await response.text();
    
    // JSONL satırlarını parse et
    const lines = text.trim().split('\n');
    const strikes: LightningStrike[] = lines.map(line => JSON.parse(line));
    
    // Zaman bazlı filtreleme - son 7 günlük veriler
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentStrikes = strikes.filter(strike => {
      const strikeTime = strike.strike_time / 1000000; // Nanosaniyeyi milisaniyeye çevir
      return strikeTime >= sevenDaysAgo;
    });
    
    // Şehirlere göre grupla
    const cityStrikes: Record<string, LightningStrike[]> = {};
    
    recentStrikes.forEach(strike => {
      const nearestCity = findNearestCity(strike.latitude, strike.longitude);
      if (!cityStrikes[nearestCity]) {
        cityStrikes[nearestCity] = [];
      }
      cityStrikes[nearestCity].push(strike);
    });
    
    // Her şehir için işlenmiş veri oluştur
    const processedData: ProcessedLightningData[] = [];
    
    console.log('Lightning data processing:', {
      totalStrikes: strikes.length,
      recentStrikes: recentStrikes.length,
      citiesWithStrikes: Object.keys(cityStrikes).length,
      cityStrikes: Object.entries(cityStrikes).map(([city, strikes]) => ({ 
        city, 
        count: strikes.length,
        totalStrikes: strikes.reduce((sum, strike) => sum + 1, 0)
      })),
      processedDataCount: processedData.length,
      totalProcessedStrikes: processedData.reduce((sum, data) => sum + data.strikes, 0)
    });
    
    for (const [cityName, cityStrikeList] of Object.entries(cityStrikes)) {
      if (cityStrikeList.length === 0) continue;
      
      // Yoğunluk hesapla (MDS değerlerinin ortalaması)
      const avgIntensity = Math.round(
        cityStrikeList.reduce((sum, strike) => sum + strike.mds, 0) / cityStrikeList.length
      );
      
      // Son yıldırım zamanı
      const lastStrike = new Date(
        Math.max(...cityStrikeList.map(strike => strike.strike_time / 1000000))
      );
      
      // Risk seviyesi
      const risk = calculateRiskLevel(avgIntensity, cityStrikeList.length);
      
      const processedItem = {
        location: cityName,
        intensity: Math.min(100, Math.round(avgIntensity / 100)), // 0-100 arası normalize et
        strikes: cityStrikeList.length,
        lastStrike,
        risk,
        coordinates: cityCoordinates[cityName as keyof typeof cityCoordinates]
      };
      
      processedData.push(processedItem);
      
      console.log(`City: ${cityName}, Strikes: ${cityStrikeList.length}, Intensity: ${processedItem.intensity}%, Risk: ${risk}`);
    }
    
    return processedData;
  } catch (error) {
    console.error('Lightning data işlenirken hata:', error);
    return [];
  }
}

// Zaman bazlı lightning verilerini al
export async function getTimeBasedLightningData(hours: number): Promise<ProcessedLightningData[]> {
  try {
    const response = await fetch('/turkey_lightning_strikes.jsonl');
    const text = await response.text();
    
    const lines = text.trim().split('\n');
    const strikes: LightningStrike[] = lines.map(line => JSON.parse(line));
    
    // Zaman bazlı filtreleme
    const now = Date.now();
    const timeThreshold = now - (hours * 60 * 60 * 1000);
    
    const filteredStrikes = strikes.filter(strike => {
      const strikeTime = strike.strike_time / 1000000;
      return strikeTime >= timeThreshold;
    });
    
    // Şehirlere göre grupla
    const cityStrikes: Record<string, LightningStrike[]> = {};
    
    filteredStrikes.forEach(strike => {
      const nearestCity = findNearestCity(strike.latitude, strike.longitude);
      if (!cityStrikes[nearestCity]) {
        cityStrikes[nearestCity] = [];
      }
      cityStrikes[nearestCity].push(strike);
    });
    
    // İşlenmiş veri oluştur
    const processedData: ProcessedLightningData[] = [];
    
    for (const [cityName, cityStrikeList] of Object.entries(cityStrikes)) {
      if (cityStrikeList.length === 0) continue;
      
      const avgIntensity = Math.round(
        cityStrikeList.reduce((sum, strike) => sum + strike.mds, 0) / cityStrikeList.length
      );
      
      const lastStrike = new Date(
        Math.max(...cityStrikeList.map(strike => strike.strike_time / 1000000))
      );
      
      const risk = calculateRiskLevel(avgIntensity, cityStrikeList.length);
      
      processedData.push({
        location: cityName,
        intensity: Math.min(100, Math.round(avgIntensity / 100)),
        strikes: cityStrikeList.length,
        lastStrike,
        risk,
        coordinates: cityCoordinates[cityName as keyof typeof cityCoordinates]
      });
    }
    
    return processedData;
  } catch (error) {
    console.error('Time-based lightning data işlenirken hata:', error);
    return [];
  }
}

// Mock data fallback
export function getMockLightningData(): ProcessedLightningData[] {
  const cities = Object.keys(cityCoordinates);
  return cities.map(city => ({
    location: city,
    intensity: Math.floor(Math.random() * 100) + 1,
    strikes: Math.floor(Math.random() * 50) + 1,
    lastStrike: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    coordinates: cityCoordinates[city as keyof typeof cityCoordinates]
  }));
}
