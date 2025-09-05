# hasHarita 
![WhatsApp Image 2025-08-31 at 23 28 37](https://github.com/user-attachments/assets/cc5163a1-04d4-4216-9b43-286b4a67497a)

**Açık Kaynak Sosyo-Çevresel Karar Destek Sistemi**

hasHarita, vatandaşların dijital etkileşimlerinden doğan kolektif bilgiyi anlamlandırarak, şehirlerin çevresel önceliklerini ve afet sonrası ihtiyaçlarını hızlı ve şeffaf biçimde görünür kılan bir karar destek sistemidir.

**Canlı Demo:** [hasharita.com](https://hasharita.com)

##  Misyonumuz

Vatandaşların dijital etkileşimlerinden doğan kolektif bilgiyi anlamlandırarak, şehirlerin çevresel önceliklerini ve afet sonrası ihtiyaçlarını hızlı ve şeffaf biçimde görünür kılmaktır. Doğal dil işleme ve coğrafi bilgi sistemleri teknolojilerini birleştirerek, karar vericilere veri temelli içgörüler sunmak ve toplumsal dayanışmayı güçlendirmektir.

## Vizyonumuz

Şehirlerin çevresel dayanıklılığını artıran, afetlere karşı hazırlıklı ve sürdürülebilir bir kentsel gelecek inşa etmeye katkı sunan öncü bir karar destek sistemi olmaktır. Vatandaşların dijital sesini şehir yönetimine dahil eden, teknoloji ile toplumsal faydayı buluşturan küresel ölçekte referans bir platform haline gelmektir.

##  Özellikler

- ** Yıldırım Takibi**: Gerçek zamanlı yıldırım verilerini şehir bazında analiz
- ** Afet Yönetimi**: Doğal afet verilerini ve hasar skorlarını takip
- ** Sürdürülebilirlik**: Çevresel sürdürülebilirlik metriklerini izleme
- ** Sentiment Analizi**: Sosyal medya verilerinden duygu analizi
- ** Coğrafi Görselleştirme**: Türkiye haritası üzerinde interaktif veri gösterimi
- ** Makine Öğrenmesi**: NLP ve topic classification ile akıllı veri işleme

##  Teknoloji Stack

### Backend
- **Python 3.13** - Ana programlama dili
- **FastAPI** - Modern, hızlı web framework
- **Pydantic** - Veri validasyonu ve serialization
- **Transformers** - Hugging Face NLP modelleri
- **PyTorch** - Makine öğrenmesi framework
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Tip güvenli JavaScript
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Erişilebilir UI bileşenleri
- **React Router** - Client-side routing
- **Recharts** - Veri görselleştirme
- **Google Analytics 4** - Web analitik takibi

### Veri İşleme
- **JSONL** - Veri saklama formatı
- **Selenium** - Web scraping
- **Twitter API** - Sosyal medya veri toplama
- **Coğrafi Koordinat Sistemi** - Konum tabanlı analiz

##  Kurulum ve Çalıştırma

### Gereksinimler

- Python 3.13+
- Node.js 18+
- npm veya yarn

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/hasHarita.git
cd hasHarita
```

### 2. Backend Kurulumu

```bash
# Python sanal ortamı oluşturun
python -m venv venv

# Sanal ortamı aktifleştirin
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Backend'i çalıştırın
#kök klasör dizininden
 python -m uvicorn backend.main:app --reload --port 8000
```

Backend varsayılan olarak `http://localhost:8000` adresinde çalışacaktır.

### 3. Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

Frontend varsayılan olarak `http://localhost:8080` adresinde çalışacaktır.

### 4. Google Analytics Kurulumu

Web analitik takibi için Google Analytics 4 (GA4) entegrasyonu mevcuttur:

1. **Google Analytics Hesabı Oluşturun:**
   - [Google Analytics](https://analytics.google.com/) adresine gidin
   - Yeni bir GA4 property oluşturun
   - Tracking ID'nizi alın (format: `G-XXXXXXXXXX`)

2. **Environment Variables Ayarlayın:**
   ```bash
   # Frontend dizininde .env.local dosyası oluşturun
   cd frontend
   touch .env.local
   ```

3. **Tracking ID'yi Ekleyin:**
   ```bash
   # .env.local dosyasına aşağıdaki satırı ekleyin
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

4. **Geliştirme Ortamında Test Edin:**
   - Development modunda da analytics çalışır
   - Console'da "Google Analytics initialized" mesajını göreceksiniz

### 5. Veri Hazırlama

Projenin tam işlevselliği için veri dosyalarını hazırlamanız gerekebilir:

```bash
# Lightning verileri için
# backend/data/lightnigData/ klasörüne turkey_lightning_strikes.jsonl dosyasını ekleyin

# Disaster verileri için
# backend/data/disasterData/ klasörüne turkey_disaster_logs.jsonl dosyasını ekleyin

# Sustainability verileri için
# backend/data/sustainabilityData/ klasörüne turkey_sustainability_logs.jsonl dosyasını ekleyin
```

##  Proje Yapısı

```
hasHarita/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # Ana API dosyası
│   ├── models/                # NLP modelleri
│   │   └── nlp/
│   │       ├── sentiment/     # Sentiment analizi servisi
│   │       └── topics/        # Topic classification servisi
│   ├── data/                  # Veri dosyaları
│   │   ├── lightnigData/      # Yıldırım verileri
│   │   ├── disasterData/      # Afet verileri
│   │   └── sustainabilityData/ # Sürdürülebilirlik verileri
│   └── data scrapers/         # Veri toplama araçları
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # UI bileşenleri
│   │   ├── pages/            # Sayfa bileşenleri
│   │   ├── services/         # API servisleri
│   │   ├── hooks/            # Custom React hooks
│   │   └── types/            # TypeScript tip tanımları
│   ├── public/               # Statik dosyalar
│   └── dist/                 # Build çıktısı
├── contracts/                 # API şemaları
├── docs/                     # Dokümantasyon
└── samples/                  # Örnek veri dosyaları
'''





### API Endpoints

#### Sentiment Analizi
- `POST /predict/sentiment` - Metin sentiment analizi
- `POST /predict/topics` - Topic classification

#### Veri Endpoints
- `GET /lightning/data` - Yıldırım verileri
- `GET /lightning/aggregates` - Yıldırım toplu verileri
- `GET /disaster/data` - Afet verileri
- `GET /disaster/aggregates` - Afet toplu verileri
- `GET /sustainability/data` - Sürdürülebilirlik verileri
- `GET /sustainability/aggregates` - Sürdürülebilirlik toplu verileri
- `GET /map/aggregates` - Harita toplu verileri

#### Sistem
- `GET /healthz` - Sistem durumu

### Build ve Deploy

```bash
# Frontend build
cd frontend
npm run build

# Production build
npm run build:dev
```

## Ekip

### Tuğrap Efe Dikpınar


### Ahmet Mert Tezcan




## İletişim

- **Website**: [hasharita.com](https://hasharita.com)
- **GitHub**: [github.com/d0d012/hasHarita](https://github.com/d0d012/hasHarita)

## Elif Bülbül'e Özel Teşekkürlerimzi Sunarız.




