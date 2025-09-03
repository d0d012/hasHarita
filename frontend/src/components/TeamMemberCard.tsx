import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TeamMember, getTypeColor, getTypeIcon } from '@/data/teamData';
import { Zap, Brain, Code, Palette, Crown, Lightbulb, HelpCircle, Link } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const typeGradient = getTypeColor(member.type);
  const typeIconName = getTypeIcon(member.type);
  const TypeIcon = (LucideIcons as any)[typeIconName] || HelpCircle;

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'coding': return <Code className="w-4 h-4" />;
      case 'design': return <Palette className="w-4 h-4" />;
      case 'leadership': return <Crown className="w-4 h-4" />;
      case 'creativity': return <Lightbulb className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      case 'adaptation': return <Zap className="w-4 h-4" />;
      case 'associative': return <Link className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStatLabel = (statName: string) => {
    switch (statName) {
      case 'coding': return 'Kodlama';
      case 'design': return 'Tasarım';
      case 'leadership': return 'Liderlik';
      case 'creativity': return 'Yaratıcılık';
      case 'analysis': return 'Analiz';
      case 'adaptation': return 'Uyum';
      case 'associative': return 'İlişkilendirme';
      default: return statName;
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-105">
      {/* Pokemon Card Header */}
      <div className={`h-2 ${typeGradient}`} />
      
      <CardContent className="p-6">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-8 h-8 text-gray-600" />
            <div>
              <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary">
              Level {member.level}
            </Badge>
          </div>
        </div>

        {/* Type Badge */}
        <div className="mb-4">
          <Badge className={`${typeGradient} text-white border-0`}>
            {member.type} Type
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {member.description}
        </p>

        {/* Abilities */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Yetenekler
          </h4>
          <div className="flex flex-wrap gap-1">
            {member.abilities.map((ability, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {ability}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            İstatistikler
          </h4>
          {Object.entries(member.stats)
            .filter(([_, value]) => value > 0) // Sadece 0'dan büyük istatistikleri göster
            .map(([statName, value]) => (
            <div key={statName} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {getStatIcon(statName)}
                  <span className="text-gray-600">{getStatLabel(statName)}</span>
                </div>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
              <Progress 
                value={value} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Card Bottom Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
