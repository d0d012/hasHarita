# HasHarita Vision Segmentation API – Contract Documentation

##  Genel Açıklama
Bu API, uzaktan algılama görüntülerinden (uydu, drone vb.) **afet sonrası etkilenen alanların otomatik segmentasyonu** için kullanılır.  

- **Request** → Görüntü hakkında bilgi gönderilir (ID, URI, coğrafi sınırlar).  
- **Response** → Modelin ürettiği segmentasyon maskesi ve tespit edilen sınıflar döner.  

API sözleşmesi **JSON Schema (2020-12)** ile tanımlanmıştır. Bu sayede istemci ve sunucu tarafında **tutarlı veri doğrulaması** yapılır.

---

##  1. Request (VisionSegmentRequest)

| Alan        | Tip      | Açıklama |
|-------------|---------|----------|
| `tile_id`   | `string` | Kare/görüntü ID’si. İstek ve cevapta eşleşir. |
| `image_uri` | `string` (zorunlu, min 1 karakter) | Görüntü dosyasının URI’si (örn. `/data/raster/tile_0001.tif`). |
| `bounds`    | `array[number, number, number, number]` | Görüntünün kapsadığı coğrafi sınır kutusu. Format: `[minLon, minLat, maxLon, maxLat]` EPSG:4326 (WGS84). |
| `epsg`      | `integer` (const: 4326) | Koordinat referans sistemi. Sabit **4326** olmak zorunda. |

**Zorunlu Alanlar:** `tile_id`, `image_uri`, `bounds`, `epsg`

**Örnek Request:**
```json
{
  "tile_id": "tile_0001",
  "image_uri": "/data/raster/tile_0001.tif",
  "bounds": [28.95, 41.02, 28.98, 41.05],
  "epsg": 4326
}
```
## 2. Response (VisionSegmentResponse)
| Alan       | Tip                                | Açıklama                                                                |
| ---------- | ---------------------------------- | ----------------------------------------------------------------------- |
| `tile_id`  | `string`                           | İstekte verilen `tile_id` ile aynı.                                     |
| `mask_uri` | `string` (zorunlu, min 1 karakter) | Segmentasyon maskesinin URI’si (örn. `/artifacts/masks/tile_0001.png`). |
| `classes`  | `array<SegClass>` (max 10)         | Görüntüde tespit edilen sınıfların listesi.                             |
**Zorunlu Alanlar**: `tile_id`, `mask_uri`, `classes`
### 2.1. SegClass (Sınıf Yapısı)
| Alan         | Tip             | Açıklama                                                                             |
| ------------ | --------------- | ------------------------------------------------------------------------------------ |
| `name`       | `string` (enum) | Segment sınıfı. Olası değerler: `collapsed_building`, `flooded_area`, `burned_area`. |
| `area_px`    | `integer` (≥0)  | Sınıfa ait alanın piksel cinsinden büyüklüğü.                                        |
| `confidence` | `number` \[0–1] | Tahminin güven skoru.                                                                |

**Örnek Response:**
```json
{
  "tile_id": "tile_0001",
  "mask_uri": "/artifacts/masks/tile_0001.png",
  "classes": [
    { "name": "flooded_area", "area_px": 9321, "confidence": 0.78 }
  ]
}

```
##    3. Şema Bileşenleri
### Bounds4326
- **Tanım:** [`minLon`, `minLat`, `maxLon`, `maxLat`]

- Koordinatlar EPSG:4326 (WGS84).

- `minLon`/`maxLon` ∈ [-180,180]

- `minLat`/`maxLat` ∈ [-90,90]

- Tam olarak 4 eleman olmalı.

## 4. Kullanım Notları

- **Doğrulama:**
  - Request → VisionSegmentRequest
  - Response → VisionSegmentResponse
- **Kısıtlamalar:**
  - `classes` en fazla 10 eleman içerebilir.
  - `epsg` sabit 4326 olmalı.

## 5. Özet Akış
1. İstemci, görüntü hakkında meta verileri (ID, URI, sınırlar) gönderir.
2. Sunucu (AI servisi) görüntüyü işler, segmentasyon maskesi üretir.
3. Dönen cevapta: maske URI’si ve sınıflandırılmış alanlar yer alır.