# Link Önizleme Özelliği

Bu projeye eklenen gömülü link önizleme özelliği, kullanıcıların linkleri açmadan önce içeriklerini görmelerine olanak tanır.

## 🚀 Özellikler

- **Hover ile Otomatik Önizleme**: Link üzerine gelindiğinde otomatik olarak önizleme görüntülenir
- **Zengin İçerik**: Başlık, açıklama, görsel ve site bilgileri
- **Responsive Tasarım**: Tüm cihazlarda uyumlu çalışır
- **Loading States**: Yükleme sırasında skeleton animasyonları
- **Error Handling**: Hata durumlarında kullanıcı dostu mesajlar
- **Farklı Link Türleri**: Website, article, video, image, audio için özel ikonlar

## 📁 Dosya Yapısı

```
src/
├── components/
│   └── LinkPreview.tsx          # Ana link önizleme bileşeni
├── pages/
│   ├── NotFound.tsx             # 404 sayfası (örnek kullanım)
│   ├── About.tsx                # Hakkımızda sayfası (örnek kullanım)
│   └── Index.tsx                # Ana sayfa
└── App.tsx                      # Routing konfigürasyonu
```

## 🛠️ Kullanım

### Temel Kullanım

```tsx
import LinkPreview from '../components/LinkPreview';

<LinkPreview url="https://example.com">
  Örnek Link
</LinkPreview>
```

### Özelleştirilmiş Kullanım

```tsx
<LinkPreview 
  url="https://example.com" 
  className="custom-styles"
>
  Özelleştirilmiş Link
</LinkPreview>
```

## 🎯 Örnek Kullanımlar

Link önizleme özelliği şu sayfalarda aktif olarak kullanılmaktadır:

- **NotFound.tsx**: 404 sayfasında faydalı linkler
- **About.tsx**: Hakkımızda sayfasında kategorize edilmiş linkler  
- **DisasterList.tsx**: Ana sayfada afet listesi altında faydalı linkler

## 🔧 Teknik Detaylar

### Props

```typescript
interface LinkPreviewProps {
  url: string;                    // Önizlenecek link URL'i
  children: React.ReactNode;      // Link metni
  className?: string;             // Opsiyonel CSS sınıfları
}
```

### State Management

- `previewData`: Link önizleme verileri
- `isLoading`: Yükleme durumu
- `showPreview`: Önizleme görünürlüğü
- `error`: Hata durumu

### Event Handlers

- `handleMouseEnter`: Mouse hover olayı
- `handleMouseLeave`: Mouse leave olayı
- `handleClick`: Link tıklama olayı

## 🎨 Styling

Bileşen Tailwind CSS ve Shadcn/ui kullanır:

- **Card**: Önizleme popup'ı için
- **Button**: "Linki Aç" butonu için
- **Skeleton**: Loading durumu için
- **Badge**: Link türü ikonları için

## 📱 Responsive Tasarım

- **Desktop**: Hover ile önizleme
- **Mobile**: Touch-friendly tasarım
- **Tablet**: Orta boyut ekranlar için optimize

## 🔮 Gelecek Geliştirmeler

1. **Backend API Entegrasyonu**: Gerçek link metadata çekme
2. **Cache Sistemi**: Önizleme verilerini önbellekleme
3. **Custom Themes**: Farklı görsel temalar
4. **Analytics**: Link tıklama istatistikleri
5. **Social Media Preview**: Sosyal medya platformları için özel önizlemeler

## 🚦 Kurulum

1. Gerekli paketler zaten yüklü:
   ```bash
   npm install @tailwindcss/line-clamp
   ```

2. Tailwind konfigürasyonu güncellendi:
   ```typescript
   plugins: [
     require("tailwindcss-animate"),
     require("@tailwindcss/line-clamp")
   ]
   ```

3. Bileşen import edildi ve routing'e eklendi

## 🧪 Test

Projeyi test etmek için:

```bash
npm run dev
```

Tarayıcıda `http://localhost:8080` adresine gidin ve About, NotFound sayfalarında link önizleme özelliğini test edin.

## 📝 Notlar

- Şu anda mock data kullanılıyor (gerçek API entegrasyonu için hazır)
- Tüm linkler `_blank` ile açılıyor (güvenlik için)
- Hover olayları performans için optimize edildi
- TypeScript ile tam tip güvenliği sağlandı

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
