import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TurkeyMap from '../components/TurkeyMap';
import List from '../components/List';
import Footer from '../components/Footer';
import { mockDisasterData, mockSustainabilityData } from '../data/mockData';
import { DisasterAlert, SustainabilityData } from '../types/disaster';
import { useApiConnectionTest, useTextAnalysis } from '../hooks/useApi';
import { config } from '../config/environment';

// Mock lightning data
const mockLightningData = [
  {
    location: 'İstanbul',
    intensity: 85,
    strikes: 23,
    lastStrike: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    risk: 'high' as const
  },
  {
    location: 'Ankara',
    intensity: 45,
    strikes: 8,
    lastStrike: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    risk: 'medium' as const
  },
  {
    location: 'İzmir',
    intensity: 25,
    strikes: 3,
    lastStrike: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    risk: 'low' as const
  },
  {
    location: 'Antalya',
    intensity: 70,
    strikes: 15,
    lastStrike: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    risk: 'high' as const
  },
  {
    location: 'Bursa',
    intensity: 35,
    strikes: 5,
    lastStrike: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    risk: 'low' as const
  }
];

const Index = () => {
  const [disasters, setDisasters] = useState<DisasterAlert[]>([]);
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [lightningData, setLightningData] = useState(mockLightningData);
  const [monitoringMode, setMonitoringMode] = useState<'disaster' | 'sustainability' | 'lightning'>('disaster');
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // API bağlantı testi
  const { data: connectionTest } = useApiConnectionTest();
  const textAnalysisMutation = useTextAnalysis();

  useEffect(() => {
    // Mock API kullanılıyorsa mock data'yı yükle
    if (config.useMockApi) {
      setDisasters(mockDisasterData);
      setSustainabilityData(mockSustainabilityData);
    }
  }, []);

  useEffect(() => {
    // API bağlantı durumunu güncelle
    if (connectionTest) {
      setApiStatus(connectionTest.isConnected ? 'connected' : 'disconnected');
    }
  }, [connectionTest]);

  // API ile metin analizi yapma fonksiyonu
  const analyzeText = async (text: string, coordinates?: { lat: number; lng: number }) => {
    if (!config.useMockApi) {
      try {
        const result = await textAnalysisMutation.mutateAsync({
          text,
          geo: coordinates ? { lat: coordinates.lat, lon: coordinates.lng } : undefined,
        });
        return result;
      } catch (error) {
        console.error('Text analysis failed:', error);
        return null;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        activeAlertsCount={disasters.length} 
        apiStatus={apiStatus}
      />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* API Durumu Göstergesi */}
        {!config.useMockApi && (
          <div className="mb-4 p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-500' : 
                apiStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm">
                API Durumu: {
                  apiStatus === 'connected' ? 'Bağlı' : 
                  apiStatus === 'disconnected' ? 'Bağlantı Yok' : 'Kontrol Ediliyor...'
                }
              </span>
              {config.apiBaseUrl && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({config.apiBaseUrl})
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* harita bölümü - 2/3 alanı */}
          <div className="lg:col-span-2">
            <TurkeyMap 
              disasters={disasters} 
              sustainabilityData={sustainabilityData}
              monitoringMode={monitoringMode}
              onMonitoringModeChange={setMonitoringMode}
              onTextAnalysis={analyzeText}
            />
          </div>
          
          {/* afet listesi bölümü - 1/3 alanı */}
          <div className="lg:col-span-1">
            <List 
              disasters={disasters} 
              sustainabilityData={sustainabilityData}
              lightningData={lightningData}
              monitoringMode={monitoringMode}
              onTextAnalysis={analyzeText}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
