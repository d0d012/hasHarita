# HasHarita Sentiment & Topics API – Contract Documentation

##  Genel Açıklama
Bu API, sosyal medya veya metin tabanlı girdilerden **duygu analizi (sentiment analysis)** ve **konu tespiti (topic extraction)** için kullanılır.  

- **Request** → Kullanıcının gönderdiği metin ve isteğe bağlı ek bilgiler.  
- **Response** → Metnin duygu etiketi (pozitif/negatif/nötr) ve ilgili konu etiketleri skorlarıyla birlikte döner.  

API sözleşmesi **JSON Schema (2020-12)** ile tanımlanmıştır. Böylece istemci ve sunucu tarafında **tutarlı veri doğrulaması** yapılır.

---

##  1. Request (SentimentRequest)

| Alan        | Tip      | Açıklama |
|-------------|---------|----------|
| `id`        | `string` | İstek için benzersiz kimlik. |
| `text`      | `string` (min 1 karakter) | Analiz edilecek metin. |
| `lang`      | `string` (enum: `tr`, `en`, `auto`) – default: `auto` | Dil seçimi (`auto` = otomatik tespit). |
| `timestamp` | `string` (format: date-time, ISO 8601) | Mesajın zamanı. |
| `geo`       | `GeoPoint` | Opsiyonel konum bilgisi (`lat`, `lon`). |
| `tags`      | `array<string>` (max 10) | Opsiyonel etiketler/hashtag listesi. |

**Zorunlu Alanlar:** `id`, `text`

### GeoPoint
| Alan | Tip     | Açıklama |
|------|--------|----------|
| `lat` | `number` (-90 ile 90) | Enlem |
| `lon` | `number` (-180 ile 180) | Boylam |

---

**Örnek Request:**
```json
{
  "id": "tw_001",
  "text": "Beşiktaş'ta yollar sular altında, yardım lazım.",
  "lang": "tr",
  "timestamp": "2025-08-28T17:35:00Z",
  "geo": { "lat": 41.043, "lon": 29.009 },
  "tags": ["#sel", "#yardım"]
}
```

## 2. Response (SentimentResponse)
| Alan        | Tip                          | Açıklama                           |
| ----------- | ---------------------------- | ---------------------------------- |
| `id`        | `string`                     | İstekte verilen `id` ile aynı.     |
| `sentiment` | `Sentiment`                  | Metnin duygu etiketi ve skoru.     |
| `topics`    | `array<TopicScore>` (max 10) | Metinde geçen konular ve skorları. |

**Zorunlu Alanlar**: `id`, `sentiment`

### 2.1. Sentiment (Duygu Analizi)
| Alan    | Tip                                                | Açıklama             |
| ------- | -------------------------------------------------- | -------------------- |
| `label` | `string` (enum: `positive`, `neutral`, `negative`) | Duygu etiketi        |
| `score` | `number` \[0–1]                                    | Tahminin güven skoru |

### 2.2. TopicScore (Konu Skoru)
| Alan    | Tip                       | Açıklama             |
| ------- | ------------------------- | -------------------- |
| `label` | `string` (min 1 karakter) | Konu etiketi         |
| `score` | `number` \[0–1]           | Tahminin güven skoru |
**Örnek Response:**
```json
{
  "id": "tw_001",
  "sentiment": { "label": "negative", "score": 0.91 },
  "topics": [
    { "label": "altyapi", "score": 0.63 },
    { "label": "yardim", "score": 0.52 }
  ]
}

```

## 3. Şema Bileşenleri
- **GeoPoint** → Konum bilgisi (lat, lon).

- **Sentiment** → Duygu etiketi (positive, neutral, negative) + skor.

- **TopicScore** → Konu etiketi + skor.

- **SentimentRequest** → API’ye gönderilen veri yapısı.

- **SentimentResponse** → API’den dönen veri yapısı.

## 4. Kullanım Notları
- **Doğrulama:**
  - Request → `SentimentRequest`
  - Response → `SentimentResponse`
- **Kısıtlamalar:**
  - `tags` en fazla 10 eleman içerebilir.
  - `topics` en fazla 10 eleman içerebilir.
  - `lang` sadece tr, en, auto olabilir.

## 5. Özet Akış

1. İstemci, analiz edilmesini istediği metni (isteğe bağlı konum/timestamp ile birlikte) gönderir.
2. Sunucu, metni işler ve duygu + konu tespiti yapar.
3. Dönen cevapta: sentiment sonucu ve ilgili topic listesi yer alır.