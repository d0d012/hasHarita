# HasHarita Frontend - API Entegrasyonu

Bu dokümantasyon, HasHarita frontend uygulamasının mock API ile nasıl entegre edildiğini açıklar.

## 🚀 Kurulum ve Çalıştırma

### 1. Mock API'yi Başlatın

```bash
# Backend dizinine gidin
cd ../backend

# Mock API'yi başlatın
python mock_api.py
# veya
uvicorn mock_api:app --reload --host 0.0.0.0 --port 8000
```

Mock API şu adreste çalışacak: `http://localhost:8000`

### 2. Frontend'i Başlatın

```bash
# Frontend dizininde
npm run dev
# veya
yarn dev
```

Frontend şu adreste çalışacak: `http://localhost:3000`

## 📁 API Entegrasyonu Yapısı

### Servis Katmanı (`src/services/`)

- **`sentimentService.ts`** - Duygu analizi ve topic çıkarımı
- **`visionService.ts`** - Görüntü segmentasyonu
- **`damageService.ts`** - Hasar değerlendirmesi
- **`healthService.ts`** - API sağlık kontrolü

### API Client (`src/lib/api.ts`)

- HTTP istekleri için merkezi client
- Hata yönetimi
- Request/Response wrapper'ları

### TypeScript Tipleri (`src/types/api.ts`)

- Mock API ile uyumlu tip tanımları
- Request/Response interface'leri

### React Hooks (`src/hooks/useApi.ts`)

- React Query ile API entegrasyonu
- Custom hooks her endpoint için

## 🔧 Konfigürasyon

### Environment Değişkenleri

`src/config/environment.ts` dosyasında:

```typescript
export const config: AppConfig = {
  apiBaseUrl: 'http://localhost:8000',  // Mock API URL
  useMockApi: true,                     // Mock API kullanımı
  appEnv: 'development',                // Ortam
  // ...
};
```

### Mock API vs Gerçek API

- **Development**: Mock API kullanılır (`useMockApi: true`)
- **Production**: Gerçek API kullanılır (`useMockApi: false`)

## 🧪 API Test Sayfası

`/api-test` sayfasında tüm endpoint'leri test edebilirsiniz:

- **Health Check** - API bağlantı durumu
- **Sentiment Analysis** - Duygu analizi
- **Topic Extraction** - Topic çıkarımı
- **Vision Segmentation** - Görüntü analizi
- **Damage Assessment** - Hasar değerlendirmesi

## 📊 Kullanım Örnekleri

### 1. Duygu Analizi

```typescript
import { useSentimentAnalysis } from '@/hooks/useApi';

const MyComponent = () => {
  const sentimentMutation = useSentimentAnalysis();

  const analyzeText = async () => {
    const result = await sentimentMutation.mutateAsync({
      id: 'unique_id',
      text: 'İstanbul\'da deprem oldu!',
      lang: 'tr',
    });
    console.log(result);
  };

  return <button onClick={analyzeText}>Analiz Et</button>;
};
```

### 2. Topic Çıkarımı

```typescript
import { useTopicExtraction } from '@/hooks/useApi';

const MyComponent = () => {
  const topicMutation = useTopicExtraction();

  const extractTopics = async () => {
    const result = await topicMutation.mutateAsync({
      id: 'unique_id',
      text: 'Deprem sonrası yardım çalışmaları devam ediyor',
      lang: 'tr',
      max_topics: 5,
    });
    console.log(result);
  };

  return <button onClick={extractTopics}>Topic Çıkar</button>;
};
```

### 3. Hasar Değerlendirmesi

```typescript
import { useDamageAssessment } from '@/hooks/useApi';

const MyComponent = () => {
  const damageMutation = useDamageAssessment();

  const assessDamage = async () => {
    const result = await damageMutation.mutateAsync({
      location_id: 'istanbul_001',
      geo: { lat: 41.0082, lon: 28.9784 },
      signals: {
        earthquake_magnitude: 5.2,
        flood_depth: 0.5,
      },
      timestamp: new Date().toISOString(),
    });
    console.log(result);
  };

  return <button onClick={assessDamage}>Hasar Değerlendir</button>;
};
```

## 🔄 Gerçek API'ye Geçiş

Mock API'den gerçek API'ye geçiş için:

1. **Environment değişkenlerini güncelleyin**:
   ```typescript
   // src/config/environment.ts
   export const config: AppConfig = {
     apiBaseUrl: 'https://your-real-api.com',
     useMockApi: false,
     // ...
   };
   ```

2. **API endpoint'lerini kontrol edin** - Gerçek API'nin mock API ile aynı endpoint'leri kullandığından emin olun

3. **Authentication ekleyin** - Gerçek API authentication gerektiriyorsa, `src/lib/api.ts`'de token yönetimi ekleyin

## 🐛 Hata Ayıklama

### API Bağlantı Sorunları

1. **Mock API çalışıyor mu?**
   ```bash
   curl http://localhost:8000/health
   ```

2. **CORS sorunları** - Mock API'de CORS ayarları kontrol edin

3. **Network tab'ında istekleri kontrol edin** - Browser DevTools'da

### Yaygın Hatalar

- **404 Not Found**: Endpoint URL'lerini kontrol edin
- **CORS Error**: Mock API CORS ayarlarını kontrol edin
- **TypeScript Errors**: API tiplerini kontrol edin

## 📝 Notlar

- Mock API tamamen test amaçlıdır
- Gerçek API'ye geçişte endpoint'ler aynı kalmalıdır
- React Query cache yönetimi otomatiktir
- Error handling tüm servislerde mevcuttur

## 🔗 Faydalı Linkler

- [Mock API Dokümantasyonu](../backend/mock_api.py)
- [React Query Dokümantasyonu](https://tanstack.com/query/latest)
- [FastAPI Dokümantasyonu](https://fastapi.tiangolo.com/)
