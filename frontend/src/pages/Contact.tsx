import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, MessageSquare, Send, Twitter, Linkedin, Github, Instagram, Facebook } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeAlertsCount={0} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            İletişim
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            hasHarita hakkında sorularınız mı var? Bizimle iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Mesaj Gönderin
            </h2>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ad</Label>
                      <Input id="firstName" placeholder="Adınız" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input id="lastName" placeholder="Soyadınız" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" type="email" placeholder="ornek@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Konu</Label>
                    <Input id="subject" placeholder="Mesaj konusu" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mesaj</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Mesajınızı buraya yazın..."
                      rows={5}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* iletişim bilgileri */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              İletişim Bilgileri
            </h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    E-posta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <a href="mailto:info@hasharita.com" className="text-primary hover:underline">
                      info@hasharita.com
                    </a>
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    Telefon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    <a href="tel:+902121234567" className="text-primary hover:underline">
                      +90 546 253 46 66
                    </a>
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    Adres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                  Fulya, Yeşilçimen Sokağı Polat Tower Residence Bağımsız Bölüm 12/430, 34394 Şişli/İstanbul
                  </CardDescription>
                </CardContent>
              </Card>

            </div>

            {/* sosyal medya */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Sosyal Medya
              </h3>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-gray-900 hover:border-gray-900 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* sıkça sorulan sorular */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Sıkça Sorulan Sorular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Ne kadar sürede yanıt alırım?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Genellikle 24 saat içinde yanıt veririz. 
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Teknik destek alabilir miyim?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  no figure it out
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  İş birliği teklifleri kabul ediyor musunuz?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Evet
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Veri doğruluğu nasıl sağlanıyor?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  trust me bro
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

export default Contact;
