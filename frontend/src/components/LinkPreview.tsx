import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Image as ImageIcon, FileText, Video, Music } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LinkPreviewData {
  title: string;
  description: string;
  image?: string;
  url: string;
  siteName?: string;
  type?: 'website' | 'article' | 'video' | 'image' | 'audio';
}

interface LinkPreviewProps {
  url: string;
  children: React.ReactNode;
  className?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, children, className = '' }) => {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIconByType = (type?: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const fetchPreviewData = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
   
      // şimdilik mock data kullanıyoruz
      const mockData: LinkPreviewData = {
        title: "HasHarita - Afet ve Sürdürülebilirlik Takip Sistemi",
        description: "Türkiye'deki afet ve acil durumları gerçek zamanlı olarak takip edin. Sürdürülebilirlik verilerini görselleştirin ve topluluk katkılarıyla güçlendirilmiş açık kaynak platform.",
        image: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&h=200&fit=crop",
        url: url,
        siteName: "hasHarita.com",
        type: "website"
      };
      
      // Simüle edilmiş gecikme
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreviewData(mockData);
    } catch (err) {
      setError('Link önizlemesi yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (!previewData && !isLoading) {
      fetchPreviewData();
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a 
        href={url} 
        onClick={handleClick}
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
      
      {/* Preview Popup */}
      {showPreview && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <Card className="w-80 shadow-lg border-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getIconByType(previewData?.type)}
                  <span>{previewData?.siteName || 'Link'}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            
            {isLoading ? (
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            ) : error ? (
              <CardContent>
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            ) : previewData ? (
              <CardContent className="space-y-3">
                <CardTitle className="text-base leading-tight line-clamp-2">
                  {previewData.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                  {previewData.description}
                </CardDescription>
                {previewData.image && (
                  <div className="relative h-24 w-full overflow-hidden rounded-md">
                    <img 
                      src={previewData.image} 
                      alt={previewData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Linki Aç
                </Button>
              </CardContent>
            ) : null}
          </Card>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
        </div>
      )}
    </div>
  );
};

export default LinkPreview;
