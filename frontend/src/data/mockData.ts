import { DisasterAlert, SustainabilityData } from '../types/disaster';

export const mockDisasterData: DisasterAlert[] = [
  {
    id: '1',
    location: 'İstanbul',
    type: 'earthquake',
    severity: 'high',
    description: '5.2 büyüklüğünde deprem',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    coordinates: { lat: 41.0082, lng: 28.9784 }
  },
  {
    id: '2',
    location: 'Ankara',
    type: 'storm',
    severity: 'medium',
    description: 'Şiddetli fırtına uyarısı',
    timestamp: new Date('2024-01-15T12:15:00Z'),
    coordinates: { lat: 39.9334, lng: 32.8597 }
  },
  {
    id: '3',
    location: 'İzmir',
    type: 'flood',
    severity: 'critical',
    description: 'Sel felaketi riski',
    timestamp: new Date('2024-01-15T14:45:00Z'),
    coordinates: { lat: 38.4192, lng: 27.1287 }
  },
  {
    id: '4',
    location: 'Antalya',
    type: 'fire',
    severity: 'high',
    description: 'Orman yangını',
    timestamp: new Date('2024-01-15T16:20:00Z'),
    coordinates: { lat: 36.8969, lng: 30.7133 }
  },
  {
    id: '5',
    location: 'Bursa',
    type: 'landslide',
    severity: 'medium',
    description: 'Heyelan riski',
    timestamp: new Date('2024-01-15T18:00:00Z'),
    coordinates: { lat: 40.1826, lng: 29.0665 }
  },
  {
    id: '6',
    location: 'Adana',
    type: 'flood',
    severity: 'critical',
    description: 'Seyhan Nehri taşkın riski',
    timestamp: new Date('2024-01-15T19:30:00Z'),
    coordinates: { lat: 37.0000, lng: 35.3213 }
  },
  {
    id: '7',
    location: 'Gaziantep',
    type: 'earthquake',
    severity: 'high',
    description: '4.8 büyüklüğünde deprem',
    timestamp: new Date('2024-01-15T20:15:00Z'),
    coordinates: { lat: 37.0662, lng: 37.3833 }
  },
  {
    id: '8',
    location: 'Konya',
    type: 'drought',
    severity: 'medium',
    description: 'Kuraklık uyarısı',
    timestamp: new Date('2024-01-15T21:00:00Z'),
    coordinates: { lat: 37.8667, lng: 32.4833 }
  },
  {
    id: '9',
    location: 'Trabzon',
    type: 'landslide',
    severity: 'high',
    description: 'Heyelan riski',
    timestamp: new Date('2024-01-15T22:45:00Z'),
    coordinates: { lat: 41.0015, lng: 39.7178 }
  },
  {
    id: '10',
    location: 'Van',
    type: 'earthquake',
    severity: 'critical',
    description: '6.1 büyüklüğünde deprem',
    timestamp: new Date('2024-01-15T23:30:00Z'),
    coordinates: { lat: 38.4891, lng: 43.4089 }
  },
  {
    id: '11',
    location: 'Erzurum',
    type: 'avalanche',
    severity: 'high',
    description: 'Çığ riski',
    timestamp: new Date('2024-01-16T00:15:00Z'),
    coordinates: { lat: 39.9000, lng: 41.2700 }
  },
  {
    id: '12',
    location: 'Diyarbakır',
    type: 'storm',
    severity: 'medium',
    description: 'Şiddetli yağış uyarısı',
    timestamp: new Date('2024-01-16T01:00:00Z'),
    coordinates: { lat: 37.9144, lng: 40.2306 }
  },
  {
    id: '13',
    location: 'Samsun',
    type: 'flood',
    severity: 'medium',
    description: 'Kızılırmak taşkın riski',
    timestamp: new Date('2024-01-16T02:30:00Z'),
    coordinates: { lat: 41.2867, lng: 36.3300 }
  },
  {
    id: '14',
    location: 'Kayseri',
    type: 'snowstorm',
    severity: 'high',
    description: 'Kar fırtınası uyarısı',
    timestamp: new Date('2024-01-16T03:15:00Z'),
    coordinates: { lat: 38.7205, lng: 35.4826 }
  },
  {
    id: '15',
    location: 'Mersin',
    type: 'storm',
    severity: 'medium',
    description: 'Deniz fırtınası uyarısı',
    timestamp: new Date('2024-01-16T04:00:00Z'),
    coordinates: { lat: 36.8000, lng: 34.6333 }
  }
];

export const mockSustainabilityData: SustainabilityData[] = [
  {
    id: 's1',
    location: 'İstanbul',
    type: 'renewable',
    status: 'good',
    description: 'Güneş enerjisi üretimi artışı',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    value: 85,
    unit: 'MW',
    coordinates: { lat: 41.0082, lng: 28.9784 }
  },
  {
    id: 's2',
    location: 'Ankara',
    type: 'air',
    status: 'fair',
    description: 'Hava kalitesi iyileşme trendi',
    timestamp: new Date('2024-01-15T12:15:00Z'),
    value: 65,
    unit: 'AQI',
    coordinates: { lat: 39.9334, lng: 32.8597 }
  },
  {
    id: 's3',
    location: 'İzmir',
    type: 'waste',
    status: 'excellent',
    description: 'Geri dönüşüm oranı %85',
    timestamp: new Date('2024-01-15T14:45:00Z'),
    value: 85,
    unit: '%',
    coordinates: { lat: 38.4192, lng: 27.1287 }
  },
  {
    id: 's4',
    location: 'Antalya',
    type: 'biodiversity',
    status: 'good',
    description: 'Korunan alan genişletildi',
    timestamp: new Date('2024-01-15T16:20:00Z'),
    value: 1200,
    unit: 'hektar',
    coordinates: { lat: 36.8969, lng: 30.7133 }
  },
  {
    id: 's5',
    location: 'Bursa',
    type: 'water',
    status: 'excellent',
    description: 'Su tasarrufu başarısı',
    timestamp: new Date('2024-01-15T18:00:00Z'),
    value: 92,
    unit: '%',
    coordinates: { lat: 40.1826, lng: 29.0665 }
  },
  {
    id: 's6',
    location: 'Adana',
    type: 'transport',
    status: 'fair',
    description: 'Elektrikli otobüs sayısı artırıldı',
    timestamp: new Date('2024-01-15T19:30:00Z'),
    value: 45,
    unit: 'adet',
    coordinates: { lat: 37.0000, lng: 35.3213 }
  },
  {
    id: 's7',
    location: 'Gaziantep',
    type: 'renewable',
    status: 'good',
    description: 'Rüzgar enerjisi projesi',
    timestamp: new Date('2024-01-15T20:15:00Z'),
    value: 120,
    unit: 'MW',
    coordinates: { lat: 37.0662, lng: 37.3833 }
  },
  {
    id: 's8',
    location: 'Konya',
    type: 'air',
    status: 'poor',
    description: 'Hava kalitesi düşük',
    timestamp: new Date('2024-01-15T21:00:00Z'),
    value: 25,
    unit: 'AQI',
    coordinates: { lat: 37.8667, lng: 32.4833 }
  },
  {
    id: 's9',
    location: 'Trabzon',
    type: 'biodiversity',
    status: 'excellent',
    description: 'Deniz ekosistemi korunuyor',
    timestamp: new Date('2024-01-15T22:45:00Z'),
    value: 95,
    unit: 'skor',
    coordinates: { lat: 41.0015, lng: 39.7178 }
  },
  {
    id: 's10',
    location: 'Van',
    type: 'water',
    status: 'good',
    description: 'Göl su kalitesi iyi',
    timestamp: new Date('2024-01-15T23:30:00Z'),
    value: 78,
    unit: 'skor',
    coordinates: { lat: 38.4891, lng: 43.4089 }
  }
];

export const turkishCities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Şanlıurfa',
  'Gaziantep', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri',
  'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Muğla',
  'Tekirdağ', 'Trabzon', 'Sakarya', 'Elazığ', 'Malatya', 'Erzurum', 'Ordu',
  'Tokat', 'Afyonkarahisar', 'Zonguldak', 'Çorum', 'Uşak', 'Düzce', 'Yozgat',
  'Kütahya', 'Amasya', 'Isparta', 'Çanakkale', 'Bolu', 'Edirne', 'Kırklareli',
  'Sivas', 'Kastamonu', 'Nevşehir', 'Karaman', 'Aksaray', 'Niğde', 'Kırşehir',
  'Çankırı', 'Sinop', 'Bartın', 'Karabük', 'Yalova', 'Bilecik', 'Kırıkkale',
  'Osmaniye', 'Giresun', 'Rize', 'Artvin', 'Gümüşhane', 'Bayburt', 'Erzincan',
  'Bingöl', 'Tunceli', 'Bitlis', 'Muş', 'Hakkari', 'Şırnak', 'Batman', 'Siirt',
  'Mardin', 'Kilis', 'Adıyaman', 'Iğdır', 'Kars', 'Ardahan', 'Ağrı'
];