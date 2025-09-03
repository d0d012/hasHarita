import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Users, Shield, Globe, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LinkPreview from '../components/LinkPreview';
import TeamMemberCard from '../components/TeamMemberCard';
import { teamMembers } from '../data/teamData';

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
                Vatandaşların dijital etkileşimlerinden doğan kolektif bilgiyi anlamlandırarak, şehirlerin çevresel önceliklerini ve afet sonrası ihtiyaçlarını hızlı ve şeffaf biçimde görünür kılmaktır. Doğal dil işleme ve coğrafi bilgi sistemleri teknolojilerini birleştirerek, karar vericilere veri temelli içgörüler sunmak ve toplumsal dayanışmayı güçlendirmektir.

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
                Şehirlerin çevresel dayanıklılığını artıran, afetlere karşı hazırlıklı ve sürdürülebilir bir kentsel gelecek inşa etmeye katkı sunan öncü bir karar destek sistemi olmaktır. Vatandaşların dijital sesini şehir yönetimine dahil eden, teknoloji ile toplumsal faydayı buluşturan küresel ölçekte referans bir platform haline gelmektir.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

      

        {/* Team */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center justify-center gap-3">
            Ekibimiz
          </h2>
          
          <div className="mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>


      </main>

      <Footer />
    </div>
  );
};

export default About;
