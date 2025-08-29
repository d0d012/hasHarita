import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TurkeyMap from '../components/TurkeyMap';
import DisasterList from '../components/DisasterList';
import Footer from '../components/Footer';
import { mockDisasterData, mockSustainabilityData } from '../data/mockData';
import { DisasterAlert, SustainabilityData } from '../types/disaster';

const Index = () => {
  const [disasters, setDisasters] = useState<DisasterAlert[]>([]);
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [monitoringMode, setMonitoringMode] = useState<'disaster' | 'sustainability'>('disaster');

  useEffect(() => {
    // backendden veri alıyoruz hahahah
    setDisasters(mockDisasterData);
    setSustainabilityData(mockSustainabilityData);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeAlertsCount={disasters.length} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* harita bölümü - 2/3 alanı */}
          <div className="lg:col-span-2">
            <TurkeyMap 
              disasters={disasters} 
              sustainabilityData={sustainabilityData}
              monitoringMode={monitoringMode}
              onMonitoringModeChange={setMonitoringMode}
            />
          </div>
          
          {/* afet listesi bölümü - 1/3 alanı */}
          <div className="lg:col-span-1">
            <DisasterList 
              disasters={disasters} 
              sustainabilityData={sustainabilityData}
              monitoringMode={monitoringMode}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
