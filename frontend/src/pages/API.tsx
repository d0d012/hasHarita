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
            API Dokümantasyonu
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            hasHarita API
          </p>
        </div>

        {/* API genel bakış */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            API Genel Bakış
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  RESTful API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Standart HTTP metodları kullanarak veri erişimi sağlayın.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-primary" />
                  JSON Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tüm veriler JSON formatında döndürülür.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  Açık Kaynak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ücretsiz ve açık kaynak API erişimi.
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
                  Afet Listesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mr-2">GET</Badge>
                    <code className="bg-muted px-2 py-1 rounded text-sm">/api/disasters</code>
                  </div>
                  <CardDescription>
                    Tüm aktif afet ve acil durum bilgilerini getirir.
                  </CardDescription>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm">
{`{
  "disasters": [
    {
      "id": "1",
      "type": "deprem",
      "location": "İstanbul",
      "magnitude": 5.2,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
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
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Authentication */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Kimlik Doğrulama
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                API key kullanımı için kimlik doğrulama gereklidir.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limiting */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Rate Limiting
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                API kullanımında dakikada maksimum 50 istek sınırı bulunmaktadır.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default API;
