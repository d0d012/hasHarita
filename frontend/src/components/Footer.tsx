import React from 'react';
import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
//twitter niye koydum bilmiyom
const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* logo ve açıklama */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
          
              <span className="text-xl font-bold">hasHarita</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Açık kaynak ve sosyo-çevresel karar destek sistemi. 
            </p>
          </div>

          {/* hızlı erişim */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Anasayfa
                </Link>
              </li>
              <li>
              
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  API Dokümantasyonu
                </Link>
              </li>
              
            </ul>
          </div>

          {/* iletişim bilgileri */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">İletişim</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-primary-foreground/80">info@hasharita.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-primary-foreground/80">+90 546 253 46 66</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-8 h-8" />
                <span className="text-primary-foreground/80">Fulya, Yeşilçimen Sokağı Polat Tower Residence Bağımsız Bölüm 12/430, 34394 Şişli/İstanbul</span>
              </div>
            </div>
          </div>

          {/* sosyal medya ve kaynaklar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Takip Edin</h3>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="text-sm space-y-2">
              <div>
                <Link to="/documentation" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
              </div>
              <div>
                <Link to="/documentation" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Kullanım Şartları
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-primary-foreground/20" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/80">
          <div>
            © 2025 hasHarita. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Son güncelleme: {new Date().toLocaleString('tr-TR')}</span>
            <div className="flex items-center gap-1">
             
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;