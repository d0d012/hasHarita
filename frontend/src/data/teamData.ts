export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  image?: string;
  type: string; // Pokemon type equivalent
  level: number;
  abilities: string[];
  description: string;
  stats: {
    coding: number;
    design: number;
    leadership: number;
    creativity: number;
    analysis: number;
    adaptation: number;
    associative: number;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: "tugrap",
    name: "Tuğrap Efe Dikpınar",
    role: "Full Stack Developer",
    title: "Designer/Developer",
    type: "Electric", // Yıldırım temasına uygun
    level: 21,
    abilities: ["React", "Python", "Data", "Design", "Critical"],
    description:  "Hızlı düşünür, veriyi analiz eder, tasarımı parlatır. Yaratıcılığı ve zekâsıyla projelere enerji katar.",
    stats: {
      coding: 76, // React, Python, Data yetenekleri
      design: 83, // Design yeteneği
      leadership: 0, // Critical düşünme liderlikle ilgili
      creativity: 94, // Design ve Critical yetenekleri
      analysis: 91, // Data yeteneği
      adaptation: 0, // Genel uyum
      associative: 0 // Farklı kavramları birleştirme yeteneği
    }
  },
  {
    id: "ahmet",
    name: "Ahmet Mert Tezcan",
    role: "Full Stack Developer",
    title: "Full Stack Developer",
    type: "Psychic",
    level: 21,
    abilities: ["Machine Learning", "Backend", "Sentiment Analysis"],
    description: "Takımı sezgileriyle yönlendirir, veriyi çözer, strateji kurar. Liderliği ve analiziyle her duruma uyum sağlar.",
    stats: {
      coding: 90, // Machine Learning, Backend, NLP, Sentiment Analysis (en güçlü)
      design: 0, // Yeteneklerinde tasarım yok
      leadership: 88, // Takım kaptanı, Adaptation yeteneği
      creativity: 0, // Yeteneklerinde yaratıcılık yok
      analysis: 0, // NLP Expertise, Sentiment Analysis (en güçlü)
      adaptation: 86, // Adaptation yeteneği
      associative: 92 // Machine Learning ve Sentiment Analysis ilişkilendirme
    }
  }
];

export const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    Electric: "bg-yellow-500",
    Psychic: "bg-purple-500",
    Fire: "bg-red-500",
    Water: "bg-blue-500",
    Grass: "bg-green-500",
    Fighting: "bg-orange-500",
    Steel: "bg-gray-500"
  };
  return colors[type] || "bg-gray-500";
};

export const getTypeIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    Electric: "Zap",
    Psychic: "Brain",
    Fire: "Flame",
    Water: "Droplets",
    Grass: "Leaf",
    Fighting: "Fist",
    Steel: "Settings"
  };
  return icons[type] || "HelpCircle";
};
