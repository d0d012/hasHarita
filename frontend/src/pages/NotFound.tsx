import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Home, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LinkPreview from '../components/LinkPreview';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeAlertsCount={0} />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-destructive/10 rounded-full mb-6">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          {/* hata mesajı */}
          <h1 className="text-8xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sayfa Bulunamadı
          </h2>
        

          {/* butonlar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Button asChild size="lg" className="px-8 py-3">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </Button>
          </div>

          {/* Örnek linkler */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Faydalı linkler:</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <LinkPreview url="https://www.afad.gov.tr">
                AFAD - Afet ve Acil Durum Yönetimi
              </LinkPreview>
              <LinkPreview url="https://www.mgm.gov.tr">
                Meteoroloji Genel Müdürlüğü
              </LinkPreview>
              <LinkPreview url="https://www.csb.gov.tr">
                Çevre ve Şehircilik Bakanlığı
              </LinkPreview>
            </div>
          </div>

          
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
