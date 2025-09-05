import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Code, Database, Zap, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeAlertsCount={0} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* hero bölümü */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            hasHarita API Dokümantasyonu
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Gerçek zamanlı afet ve acil durum verilerine erişim sağlayan kapsamlı API servisi. 
            Deprem, sel, yangın ve diğer doğal afetler hakkında güncel bilgileri alın.
          </p>
        </div>

        {/* API genel bakış */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            API Özellikleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  Gerçek Zamanlı Veri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Afet ve acil durum verilerini anlık olarak takip edin. 
                  Veriler sürekli güncellenir ve gecikme süresi minimumdur.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-primary" />
                  Kapsamlı Veri Seti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deprem, sel, yangın, fırtına ve diğer doğal afetler hakkında 
                  detaylı bilgiler, konum verileri ve şiddet ölçümleri.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  Kolay Entegrasyon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  RESTful API yapısı ile kolay entegrasyon. 
                  JSON formatında veri döndürür ve standart HTTP metodları kullanır.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            API Endpoint'leri
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Aktif Afetler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mr-2">GET</Badge>
                    <code className="bg-muted px-2 py-1 rounded text-sm">/api/disasters/active</code>
                  </div>
                  <CardDescription>
                    Şu anda aktif olan tüm afet ve acil durum bilgilerini getirir. 
                    Gerçek zamanlı güncellemeler ve detaylı konum bilgileri içerir.
                  </CardDescription>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "status": "success",
  "data": [
    {
      "id": "dis_001",
      "type": "deprem",
      "severity": "orta",
      "location": {
        "city": "İstanbul",
        "district": "Kadıköy",
        "coordinates": {
          "lat": 40.9923,
          "lng": 29.0244
        }
      },
      "magnitude": 4.2,
      "depth": 8.5,
      "timestamp": "2024-01-15T10:30:00Z",
      "affected_area": "5km çap",
      "status": "aktif"
    }
  ],
  "total_count": 1
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Afet Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mr-2">GET</Badge>
                    <code className="bg-muted px-2 py-1 rounded text-sm">/api/disasters/history</code>
                  </div>
                  <CardDescription>
                    Belirli bir tarih aralığındaki afet kayıtlarını getirir. 
                    Filtreleme ve sayfalama desteği sunar.
                  </CardDescription>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Query Parametreleri:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>start_date</code> - Başlangıç tarihi (YYYY-MM-DD)</li>
                      <li>• <code>end_date</code> - Bitiş tarihi (YYYY-MM-DD)</li>
                      <li>• <code>type</code> - Afet türü (deprem, sel, yangın, vb.)</li>
                      <li>• <code>page</code> - Sayfa numarası (varsayılan: 1)</li>
                      <li>• <code>limit</code> - Sayfa başına kayıt sayısı (varsayılan: 50)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Afet Detayı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mr-2">GET</Badge>
                    <code className="bg-muted px-2 py-1 rounded text-sm">/api/disasters/{'{id}'}</code>
                  </div>
                  <CardDescription>
                    Belirli bir afet hakkında detaylı bilgi getirir. 
                    Hasar raporları, etkilenen bölgeler ve güncellemeler dahil.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Konum Bazlı Arama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mr-2">GET</Badge>
                    <code className="bg-muted px-2 py-1 rounded text-sm">/api/disasters/nearby</code>
                  </div>
                  <CardDescription>
                    Belirli koordinatlara yakın afetleri getirir. 
                    Mesafe parametresi ile arama yarıçapını ayarlayabilirsiniz.
                  </CardDescription>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Query Parametreleri:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code>lat</code> - Enlem (zorunlu)</li>
                      <li>• <code>lng</code> - Boylam (zorunlu)</li>
                      <li>• <code>radius</code> - Arama yarıçapı km cinsinden (varsayılan: 50)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Authentication */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Kimlik Doğrulama ve Güvenlik
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Key Kimlik Doğrulama</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  API'ye erişim için geçerli bir API key gereklidir. Key'inizi HTTP header'ında 
                  <code className="bg-muted px-2 py-1 rounded text-sm mx-1">Authorization: Bearer YOUR_API_KEY</code> 
                  formatında gönderin.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
{`curl -H "Authorization: Bearer your_api_key_here" \\
     https://api.hasharita.com/disasters/active`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Key Alma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  API key almak için hesap oluşturun ve geliştirici panelinden yeni bir key oluşturun. 
                  Her key benzersizdir ve güvenli bir şekilde saklanmalıdır.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Ücretsiz Plan</Badge>
                  <Badge variant="outline">Günlük 1000 İstek</Badge>
                  <Badge variant="outline">Temel Veriler</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Rate Limiting ve Kullanım Sınırları
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kullanım Sınırları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    API kullanımında farklı planlar için farklı sınırlar bulunmaktadır:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Ücretsiz Plan</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Günlük 1,000 istek</li>
                        <li>• Dakikada 50 istek</li>
                        <li>• Temel veri erişimi</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Pro Plan</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Günlük 10,000 istek</li>
                        <li>• Dakikada 200 istek</li>
                        <li>• Gelişmiş veri erişimi</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Enterprise</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Sınırsız istek</li>
                        <li>• Özel rate limit</li>
                        <li>• Öncelikli destek</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limit Yanıtları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Rate limit aşıldığında API 429 (Too Many Requests) HTTP status kodu döndürür. 
                  Yanıt header'larında kalan istek sayısı ve sıfırlanma zamanı bilgisi bulunur.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
{`HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642248000

{
  "error": "Rate limit exceeded",
  "message": "Dakikada maksimum 50 istek sınırına ulaştınız",
  "retry_after": 60
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Handling */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Hata Yönetimi
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  API standart HTTP status kodları kullanır ve hatalar JSON formatında döndürülür.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">400</Badge>
                    <span className="text-sm">Bad Request - Geçersiz parametreler</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">401</Badge>
                    <span className="text-sm">Unauthorized - Geçersiz API key</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">404</Badge>
                    <span className="text-sm">Not Found - Kaynak bulunamadı</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">429</Badge>
                    <span className="text-sm">Too Many Requests - Rate limit aşıldı</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">500</Badge>
                    <span className="text-sm">Internal Server Error - Sunucu hatası</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SDKs and Libraries */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            SDK'lar ve Kütüphaneler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>JavaScript/TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Node.js ve tarayıcı ortamları için resmi SDK.
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-sm">
{`npm install @hasharita/api-client

import { HasharitaAPI } from '@hasharita/api-client';

const api = new HasharitaAPI('your-api-key');
const disasters = await api.getActiveDisasters();`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Python</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Python uygulamaları için resmi kütüphane.
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-sm">
{`pip install hasharita-api

from hasharita import HasharitaAPI

api = HasharitaAPI('your-api-key')
disasters = api.get_active_disasters()`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default API;
