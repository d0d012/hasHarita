import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TurkeyMap from '../components/TurkeyMap';
import List from '../components/List';
import Footer from '../components/Footer';
import { mockDisasterData, mockSustainabilityData } from '../data/mockData';
import { DisasterAlert, SustainabilityData } from '../types/disaster';
import { useApiConnectionTest, useTextAnalysis } from '../hooks/useApi';
import { config } from '../config/environment';
import { processLightningData, ProcessedLightningData } from '../services/lightningService';

// Gerçek yıldırım verilerini yükle ve işle
const loadLightningData = async (): Promise<ProcessedLightningData[]> => {
  try {
    return await processLightningData();
  } catch (error) {
    console.error('Yıldırım verileri yüklenirken hata:', error);
    return [];
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = useState<DisasterAlert[]>([]);
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [lightningData, setLightningData] = useState<ProcessedLightningData[]>([]);
  const [monitoringMode, setMonitoringMode] = useState<'disaster' | 'sustainability' | 'lightning'>('disaster');
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [showAllLightning, setShowAllLightning] = useState(false);
  const [lightningLoading, setLightningLoading] = useState(true);

  // API bağlantı testi
  const { data: connectionTest } = useApiConnectionTest();
  const textAnalysisMutation = useTextAnalysis();

  useEffect(() => {
    // Mock API kullanılıyorsa mock data'yı yükle
    if (config.useMockApi) {
      setDisasters(mockDisasterData);
      setSustainabilityData(mockSustainabilityData);
    }
    
    // Gerçek yıldırım verilerini yükle
    const loadData = async () => {
      try {
        const data = await loadLightningData();
        setLightningData(data);
        setLightningLoading(false);
        console.log('Lightning data loaded:', data.length, 'strikes');
      } catch (error) {
        console.error('Lightning data loading failed:', error);
        setLightningLoading(false);
      }
    };
    
    loadData();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
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

  // Daha fazla yıldırım verisi gösterme fonksiyonu
  const handleShowMoreLightning = () => {
    navigate('/lightning-logs');
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
              onShowMoreLightning={handleShowMoreLightning}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
