import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Download, Book, Video, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeAlertsCount={0} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* hero bölümü */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            Dokümantasyon
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            hasHarita platformunu kullanmaya başlamak için gerekli tüm bilgiler.
          </p>
        </div>

        {/* hızlı başlangıç */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Hızlı Başlangıç
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Book className="w-6 h-6 text-primary" />
                  Platform Tanıtımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  hasHarita'nın temel özelliklerini ve nasıl çalıştığını öğrenin.
                </CardDescription>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF İndir
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-primary" />
                  Video Eğitimler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Platform kullanımı hakkında detaylı video eğitimler.
                </CardDescription>
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  İzle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Topluluk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Diğer kullanıcılarla etkileşime geçin ve deneyimlerinizi paylaşın.
                </CardDescription>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Katıl
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* kullanıcı kılavuzları */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Kullanıcı Kılavuzları
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  Başlangıç Kılavuzu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  İlk kez hasHarita kullanıyorsanız, bu kılavuz size yardımcı olacaktır.
                </CardDescription>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Platform hesabı oluşturma</p>
                  <p>• Temel navigasyon</p>
                  <p>• Harita kullanımı</p>
                  <p>• Afet listesi takibi</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  Gelişmiş Özellikler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Platformun gelişmiş özelliklerini keşfedin.
                </CardDescription>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Filtreleme ve arama</p>
                  <p>• Bildirim ayarları</p>
                  <p>• Veri dışa aktarma</p>
                  <p>• API entegrasyonu</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            API Dokümantasyonu
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Geliştiriciler için detaylı API dokümantasyonu ve örnekler.
              </p>
              <Button asChild>
                <a href="/#/api">API Dokümantasyonuna Git</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  hasHarita nasıl çalışır?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  hasHarita, çeşitli kaynaklardan gelen afet ve acil durum verilerini 
                  toplar, işler ve kullanıcılara görsel bir arayüz ile sunar.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Veriler ne kadar güncel?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Veriler gerçek zamanlı olarak güncellenir ve maksimum 1 dakika 
                  gecikme ile kullanıcılara sunulur.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Platform ücretsiz mi?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Evet, hasHarita tamamen ücretsizdir ve açık kaynak kodlu bir 
                  platformdur. Kurucularımız verinin erişilebilir olmasını sağlamak için çalışıyor.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;
