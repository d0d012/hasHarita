import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Shield, Globe, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LinkPreview from '../components/LinkPreview';

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeAlertsCount={0} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Açık kaynak ve sosyo-çevresel karar destek sistemi.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                Misyonumuz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                yazarız
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                Vizyonumuz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                ne diyo la bu
              </CardDescription>
            </CardContent>
          </Card>
        </div>

      

        {/* Team */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Ekibimiz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            tuğrap efe dikpınar -- ahmet mert tezcan --
            sürdürülebilir şehirler hackathonu 2025
          </p>
        </div>

        {/* Useful Links */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Faydalı Linkler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Afet Yönetimi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LinkPreview url="https://www.afad.gov.tr">
                  AFAD Resmi Sitesi
                </LinkPreview>
                <LinkPreview url="https://www.afad.gov.tr/afet-bilgi-sistemi">
                  Afet Bilgi Sistemi
                </LinkPreview>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meteoroloji</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LinkPreview url="https://www.mgm.gov.tr">
                  MGM Resmi Sitesi
                </LinkPreview>
                <LinkPreview url="https://www.mgm.gov.tr/tarimsal-hava-tahmini.aspx">
                  Tarımsal Hava Tahmini
                </LinkPreview>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Çevre ve Şehircilik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LinkPreview url="https://www.csb.gov.tr">
                  Çevre ve Şehircilik Bakanlığı
                </LinkPreview>
                <LinkPreview url="https://cevreselgostergeler.csb.gov.tr">
                  Çevresel Göstergeler
                </LinkPreview>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
