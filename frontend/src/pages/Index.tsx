import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TurkeyMap from '../components/TurkeyMap';
import List from '../components/List';
import Footer from '../components/Footer';
import { mockDisasterData, mockSustainabilityData, DataItem } from '../data/mockData';
import { useTextAnalysis } from '../hooks/useApi';
import { config } from '../config/environment';
import AggregatedDataService from '../services/aggregatedDataService';
import LightningService from '../services/lightningService';
import type { AggregatedDataItem, LightningAggregatedItem } from '../types/api';

// ProcessedLightningData type definition
interface ProcessedLightningData {
  location: string;
  strikes: number;
  intensity: number;
  risk: 'low' | 'medium' | 'high';
  lastUpdate: string;
}

// Lightning data processing functions
const processLightningData = async (): Promise<ProcessedLightningData[]> => {
  // Mock API kullanılıyorsa mock data döndür
  if (config.useMockApi) {
    return getMockLightningData();
  }
  
  try {
    const response = await LightningService.getLightningAggregates('15m');
    return response.items.map(item => ({
      location: item.city,
      strikes: item.strike_count,
      intensity: item.avg_intensity,
      risk: item.strike_count > 20 ? 'high' : item.strike_count > 10 ? 'medium' : 'low',
      lastUpdate: item.last_strike
    }));
  } catch (error) {
    console.error('Lightning data processing error:', error);
    return getMockLightningData();
  }
};

const getMockLightningData = (): ProcessedLightningData[] => {
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Samsun'];
  return cities.map(city => ({
    location: city,
    strikes: Math.floor(Math.random() * 50) + 5,
    intensity: Math.floor(Math.random() * 100) + 10,
    risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    lastUpdate: new Date().toISOString()
  }));
};

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
  const [disasters, setDisasters] = useState<DataItem[]>([]);
  const [sustainabilityData, setSustainabilityData] = useState<DataItem[]>([]);
  const [lightningData, setLightningData] = useState<ProcessedLightningData[]>([]);
  const [lightningAggregatedData, setLightningAggregatedData] = useState<LightningAggregatedItem[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedDataItem[]>([]);
  const [monitoringMode, setMonitoringMode] = useState<'disaster' | 'sustainability' | 'lightning'>('disaster');
  const [showAllLightning, setShowAllLightning] = useState(false);
  const [lightningLoading, setLightningLoading] = useState(true);
  const [lightningAggregatedLoading, setLightningAggregatedLoading] = useState(false);
  const [aggregatedLoading, setAggregatedLoading] = useState(false);

  // API ile metin analizi
  const textAnalysisMutation = useTextAnalysis();

  // Aggregated data'yı yükle
  const loadAggregatedData = async () => {
    if (config.useMockApi) return; // Mock API kullanılıyorsa aggregated data yükleme
    
    setAggregatedLoading(true);
    try {
      const response = await AggregatedDataService.getAggregatedData('city', '15m');
      setAggregatedData(response.items);
      console.log('Aggregated data loaded:', response.items.length, 'items');
      
      // Aggregated data'yı DataItem formatına dönüştür
      const transformedData = AggregatedDataService.transformToDataItems(response.items);
      setDisasters(transformedData);
      setSustainabilityData(transformedData); // Aynı veriyi her iki modda da göster
    } catch (error) {
      console.error('Aggregated data loading failed:', error);
      // Fallback olarak mock data kullan
      setDisasters(mockDisasterData);
      setSustainabilityData(mockSustainabilityData);
    } finally {
      setAggregatedLoading(false);
    }
  };

  // Lightning aggregated data'yı yükle
  const loadLightningAggregatedData = async () => {
    if (config.useMockApi) return; // Mock API kullanılıyorsa lightning data yükleme
    
    setLightningAggregatedLoading(true);
    try {
      const response = await LightningService.getLightningAggregates('15m');
      setLightningAggregatedData(response.items);
      console.log('Lightning aggregated data loaded:', response.items.length, 'items');
    } catch (error) {
      console.error('Lightning aggregated data yüklenirken hata:', error);
    } finally {
      setLightningAggregatedLoading(false);
    }
  };

  useEffect(() => {
    // Mock API kullanılıyorsa mock data'yı yükle
    if (config.useMockApi) {
      setDisasters(mockDisasterData);
      setSustainabilityData(mockSustainabilityData);
    } else {
      // Gerçek API kullanılıyorsa aggregated data'yı yükle
      loadAggregatedData();
      loadLightningAggregatedData();
    }
    
    // Lightning verilerini yükle (hem mock hem gerçek API için)
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

  // Daha fazla afet verisi gösterme fonksiyonu
  const handleShowMoreDisasters = () => {
    navigate('/disaster-logs');
  };

  // Daha fazla sürdürülebilirlik verisi gösterme fonksiyonu
  const handleShowMoreSustainability = () => {
    navigate('/sustainability-logs');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        activeAlertsCount={disasters.length}
      />
      
      <main className="container mx-auto px-4 py-6 flex-1">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* harita bölümü - 2/3 alanı */}
          <div className="lg:col-span-2">
            <TurkeyMap 
              disasters={disasters} 
              sustainabilityData={sustainabilityData}
              aggregatedData={aggregatedData}
              lightningData={lightningData}
              lightningAggregatedData={lightningAggregatedData}
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
              aggregatedData={aggregatedData}
              lightningData={lightningData}
              lightningAggregatedData={lightningAggregatedData}
              monitoringMode={monitoringMode}
              onTextAnalysis={analyzeText}
              onShowMoreLightning={handleShowMoreLightning}
              onShowMoreDisasters={handleShowMoreDisasters}
              onShowMoreSustainability={handleShowMoreSustainability}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
