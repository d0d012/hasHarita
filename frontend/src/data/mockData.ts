// Yeni veri formatı için tip tanımı
export interface DataItem {
  d: string;
  text?: string;
  timestamp?: string; // ISO 8601 formatında
  geo?: { lat: number; lon: number };
  tags?: string[];
  sentiment?: { label: "positive" | "neutral" | "negative"; score: number };
  topics?: { label: string; score: number }[];
}

export const mockDisasterData: DataItem[] = [
  {
    d: 'İstanbul deprem uyarısı',
    text: '5.2 büyüklüğünde deprem meydana geldi. Vatandaşlarımızın dikkatli olması gerekiyor.',
    timestamp: '2024-01-15T10:30:00Z',
    geo: { lat: 41.0082, lon: 28.9784 },
    tags: ['deprem', 'istanbul', 'acil', 'uyarı'],
    sentiment: { label: 'negative', score: 0.85 },
    topics: [
      { label: 'doğal afet', score: 0.92 },
      { label: 'güvenlik', score: 0.78 }
    ]
  },
  {
    d: 'Ankara fırtına uyarısı',
    text: 'Şiddetli fırtına bekleniyor. Dışarı çıkmaktan kaçının.',
    timestamp: '2024-01-15T12:15:00Z',
    geo: { lat: 39.9334, lon: 32.8597 },
    tags: ['fırtına', 'ankara', 'hava durumu', 'uyarı'],
    sentiment: { label: 'negative', score: 0.72 },
    topics: [
      { label: 'hava durumu', score: 0.88 },
      { label: 'güvenlik', score: 0.65 }
    ]
  },
  {
    d: 'İzmir sel riski',
    text: 'Sel felaketi riski yüksek. Vatandaşlarımızın tedbirli olması gerekiyor.',
    timestamp: '2024-01-15T14:45:00Z',
    geo: { lat: 38.4192, lon: 27.1287 },
    tags: ['sel', 'izmir', 'risk', 'acil'],
    sentiment: { label: 'negative', score: 0.91 },
    topics: [
      { label: 'doğal afet', score: 0.95 },
      { label: 'risk yönetimi', score: 0.82 }
    ]
  },
  {
    d: 'Antalya orman yangını',
    text: 'Orman yangını başladı. İtfaiye ekipleri müdahale ediyor.',
    timestamp: '2024-01-15T16:20:00Z',
    geo: { lat: 36.8969, lon: 30.7133 },
    tags: ['yangın', 'antalya', 'orman', 'acil'],
    sentiment: { label: 'negative', score: 0.88 },
    topics: [
      { label: 'yangın', score: 0.94 },
      { label: 'çevre', score: 0.76 }
    ]
  },
  {
    d: 'Bursa heyelan riski',
    text: 'Heyelan riski bulunuyor. Bölge sakinleri dikkatli olmalı.',
    timestamp: '2024-01-15T18:00:00Z',
    geo: { lat: 40.1826, lon: 29.0665 },
    tags: ['heyelan', 'bursa', 'risk', 'uyarı'],
    sentiment: { label: 'negative', score: 0.69 },
    topics: [
      { label: 'doğal afet', score: 0.87 },
      { label: 'risk yönetimi', score: 0.71 }
    ]
  },
  {
    d: 'Adana Seyhan Nehri taşkın riski',
    text: 'Seyhan Nehri taşkın riski kritik seviyede. Acil önlemler alınıyor.',
    timestamp: '2024-01-15T19:30:00Z',
    geo: { lat: 37.0000, lon: 35.3213 },
    tags: ['taşkın', 'adana', 'seyhan', 'kritik'],
    sentiment: { label: 'negative', score: 0.93 },
    topics: [
      { label: 'sel', score: 0.96 },
      { label: 'acil durum', score: 0.89 }
    ]
  },
  {
    d: 'Gaziantep deprem uyarısı',
    text: '4.8 büyüklüğünde deprem meydana geldi. Hasarlar tespit ediliyor.',
    timestamp: '2024-01-15T20:15:00Z',
    geo: { lat: 37.0662, lon: 37.3833 },
    tags: ['deprem', 'gaziantep', 'hasar', 'uyarı'],
    sentiment: { label: 'negative', score: 0.86 },
    topics: [
      { label: 'doğal afet', score: 0.91 },
      { label: 'hasar tespiti', score: 0.73 }
    ]
  },
  {
    d: 'Konya kuraklık uyarısı',
    text: 'Kuraklık riski artıyor. Su tasarrufu önemli.',
    timestamp: '2024-01-15T21:00:00Z',
    geo: { lat: 37.8667, lon: 32.4833 },
    tags: ['kuraklık', 'konya', 'su', 'uyarı'],
    sentiment: { label: 'negative', score: 0.58 },
    topics: [
      { label: 'kuraklık', score: 0.84 },
      { label: 'çevre', score: 0.67 }
    ]
  },
  {
    d: 'Trabzon heyelan riski',
    text: 'Heyelan riski yüksek. Bölge sakinleri uyarıldı.',
    timestamp: '2024-01-15T22:45:00Z',
    geo: { lat: 41.0015, lon: 39.7178 },
    tags: ['heyelan', 'trabzon', 'risk', 'uyarı'],
    sentiment: { label: 'negative', score: 0.74 },
    topics: [
      { label: 'doğal afet', score: 0.89 },
      { label: 'risk yönetimi', score: 0.76 }
    ]
  },
  {
    d: 'Van büyük deprem',
    text: '6.1 büyüklüğünde büyük deprem meydana geldi. Acil müdahale başladı.',
    timestamp: '2024-01-15T23:30:00Z',
    geo: { lat: 38.4891, lon: 43.4089 },
    tags: ['deprem', 'van', 'büyük', 'acil'],
    sentiment: { label: 'negative', score: 0.95 },
    topics: [
      { label: 'doğal afet', score: 0.98 },
      { label: 'acil durum', score: 0.94 }
    ]
  },
  {
    d: 'Erzurum çığ riski',
    text: 'Çığ riski yüksek. Dağlık bölgelerde dikkatli olun.',
    timestamp: '2024-01-16T00:15:00Z',
    geo: { lat: 39.9000, lon: 41.2700 },
    tags: ['çığ', 'erzurum', 'dağ', 'risk'],
    sentiment: { label: 'negative', score: 0.81 },
    topics: [
      { label: 'doğal afet', score: 0.92 },
      { label: 'kış', score: 0.78 }
    ]
  },
  {
    d: 'Diyarbakır şiddetli yağış',
    text: 'Şiddetli yağış uyarısı. Sel riski bulunuyor.',
    timestamp: '2024-01-16T01:00:00Z',
    geo: { lat: 37.9144, lon: 40.2306 },
    tags: ['yağış', 'diyarbakır', 'sel', 'uyarı'],
    sentiment: { label: 'negative', score: 0.67 },
    topics: [
      { label: 'hava durumu', score: 0.85 },
      { label: 'sel riski', score: 0.72 }
    ]
  },
  {
    d: 'Samsun Kızılırmak taşkın riski',
    text: 'Kızılırmak taşkın riski orta seviyede. Takip ediliyor.',
    timestamp: '2024-01-16T02:30:00Z',
    geo: { lat: 41.2867, lon: 36.3300 },
    tags: ['taşkın', 'samsun', 'kızılırmak', 'risk'],
    sentiment: { label: 'negative', score: 0.63 },
    topics: [
      { label: 'sel', score: 0.78 },
      { label: 'nehir', score: 0.69 }
    ]
  },
  {
    d: 'Kayseri kar fırtınası',
    text: 'Kar fırtınası uyarısı. Yollar kapanabilir.',
    timestamp: '2024-01-16T03:15:00Z',
    geo: { lat: 38.7205, lon: 35.4826 },
    tags: ['kar', 'kayseri', 'fırtına', 'yol'],
    sentiment: { label: 'negative', score: 0.71 },
    topics: [
      { label: 'hava durumu', score: 0.91 },
      { label: 'ulaşım', score: 0.68 }
    ]
  },
  {
    d: 'Mersin deniz fırtınası',
    text: 'Deniz fırtınası uyarısı. Denizciler dikkatli olmalı.',
    timestamp: '2024-01-16T04:00:00Z',
    geo: { lat: 36.8000, lon: 34.6333 },
    tags: ['deniz', 'mersin', 'fırtına', 'denizcilik'],
    sentiment: { label: 'negative', score: 0.66 },
    topics: [
      { label: 'hava durumu', score: 0.87 },
      { label: 'deniz', score: 0.74 }
    ]
  }
];

export const mockSustainabilityData: DataItem[] = [
  {
    d: 'İstanbul güneş enerjisi artışı',
    text: 'Güneş enerjisi üretimi %15 artış gösterdi. Temiz enerji hedeflerine ulaşılıyor.',
    timestamp: '2024-01-15T10:30:00Z',
    geo: { lat: 41.0082, lon: 28.9784 },
    tags: ['güneş enerjisi', 'istanbul', 'temiz enerji', 'sürdürülebilirlik'],
    sentiment: { label: 'positive', score: 0.82 },
    topics: [
      { label: 'yenilenebilir enerji', score: 0.94 },
      { label: 'çevre', score: 0.87 }
    ]
  },
  {
    d: 'Ankara hava kalitesi iyileşmesi',
    text: 'Hava kalitesi iyileşme trendi devam ediyor. AQI değerleri düşüyor.',
    timestamp: '2024-01-15T12:15:00Z',
    geo: { lat: 39.9334, lon: 32.8597 },
    tags: ['hava kalitesi', 'ankara', 'iyileşme', 'çevre'],
    sentiment: { label: 'positive', score: 0.75 },
    topics: [
      { label: 'hava kalitesi', score: 0.91 },
      { label: 'çevre sağlığı', score: 0.78 }
    ]
  },
  {
    d: 'İzmir geri dönüşüm başarısı',
    text: 'Geri dönüşüm oranı %85\'e ulaştı. Avrupa standartlarını aştık.',
    timestamp: '2024-01-15T14:45:00Z',
    geo: { lat: 38.4192, lon: 27.1287 },
    tags: ['geri dönüşüm', 'izmir', 'başarı', 'çevre'],
    sentiment: { label: 'positive', score: 0.89 },
    topics: [
      { label: 'atık yönetimi', score: 0.96 },
      { label: 'sürdürülebilirlik', score: 0.83 }
    ]
  },
  {
    d: 'Antalya korunan alan genişletildi',
    text: '1200 hektar yeni korunan alan eklendi. Biyolojik çeşitlilik korunuyor.',
    timestamp: '2024-01-15T16:20:00Z',
    geo: { lat: 36.8969, lon: 30.7133 },
    tags: ['korunan alan', 'antalya', 'biyolojik çeşitlilik', 'doğa'],
    sentiment: { label: 'positive', score: 0.91 },
    topics: [
      { label: 'biyolojik çeşitlilik', score: 0.93 },
      { label: 'doğa koruma', score: 0.88 }
    ]
  },
  {
    d: 'Bursa su tasarrufu başarısı',
    text: 'Su tasarrufu %92 oranında başarıldı. Örnek proje olarak gösteriliyor.',
    timestamp: '2024-01-15T18:00:00Z',
    geo: { lat: 40.1826, lon: 29.0665 },
    tags: ['su tasarrufu', 'bursa', 'başarı', 'kaynak yönetimi'],
    sentiment: { label: 'positive', score: 0.87 },
    topics: [
      { label: 'su yönetimi', score: 0.95 },
      { label: 'kaynak tasarrufu', score: 0.81 }
    ]
  },
  {
    d: 'Adana elektrikli otobüs projesi',
    text: '45 adet elektrikli otobüs hizmete girdi. Temiz ulaşım hedeflerine ulaşılıyor.',
    timestamp: '2024-01-15T19:30:00Z',
    geo: { lat: 37.0000, lon: 35.3213 },
    tags: ['elektrikli otobüs', 'adana', 'temiz ulaşım', 'teknoloji'],
    sentiment: { label: 'positive', score: 0.79 },
    topics: [
      { label: 'temiz ulaşım', score: 0.89 },
      { label: 'elektrikli araçlar', score: 0.76 }
    ]
  },
  {
    d: 'Gaziantep rüzgar enerjisi projesi',
    text: '120 MW rüzgar enerjisi projesi devreye alındı. Temiz enerji üretimi artıyor.',
    timestamp: '2024-01-15T20:15:00Z',
    geo: { lat: 37.0662, lon: 37.3833 },
    tags: ['rüzgar enerjisi', 'gaziantep', 'temiz enerji', 'proje'],
    sentiment: { label: 'positive', score: 0.84 },
    topics: [
      { label: 'yenilenebilir enerji', score: 0.92 },
      { label: 'rüzgar', score: 0.85 }
    ]
  },
  {
    d: 'Konya hava kalitesi sorunu',
    text: 'Hava kalitesi düşük seviyede. Hava kirliliği önlemleri gerekli.',
    timestamp: '2024-01-15T21:00:00Z',
    geo: { lat: 37.8667, lon: 32.4833 },
    tags: ['hava kalitesi', 'konya', 'kirlilik', 'sorun'],
    sentiment: { label: 'negative', score: 0.68 },
    topics: [
      { label: 'hava kirliliği', score: 0.88 },
      { label: 'çevre sorunu', score: 0.74 }
    ]
  },
  {
    d: 'Trabzon deniz ekosistemi korunuyor',
    text: 'Deniz ekosistemi koruma skoru 95/100. Mükemmel koruma çalışması.',
    timestamp: '2024-01-15T22:45:00Z',
    geo: { lat: 41.0015, lon: 39.7178 },
    tags: ['deniz ekosistemi', 'trabzon', 'koruma', 'mükemmel'],
    sentiment: { label: 'positive', score: 0.93 },
    topics: [
      { label: 'deniz koruma', score: 0.97 },
      { label: 'ekosistem', score: 0.89 }
    ]
  },
  {
    d: 'Van göl su kalitesi iyi',
    text: 'Van Gölü su kalitesi 78/100 skorla iyi seviyede. Koruma çalışmaları başarılı.',
    timestamp: '2024-01-15T23:30:00Z',
    geo: { lat: 38.4891, lon: 43.4089 },
    tags: ['göl su kalitesi', 'van', 'iyi', 'koruma'],
    sentiment: { label: 'positive', score: 0.76 },
    topics: [
      { label: 'su kalitesi', score: 0.91 },
      { label: 'göl koruma', score: 0.82 }
    ]
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