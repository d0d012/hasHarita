/**
 * API Test Sayfası
 * Mock API endpoint'lerini test etmek için
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useHealthCheck, 
  useSentimentAnalysis, 
  useTopicExtraction, 
  useTextAnalysis,
  useVisionSegmentation,
  useDamageAssessment 
} from '@/hooks/useApi';
import { config } from '@/config/environment';

const ApiTest: React.FC = () => {
  const [testText, setTestText] = useState('İstanbul\'da deprem oldu, yardım edin!');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API hooks
  const { data: healthData, isLoading: healthLoading } = useHealthCheck();
  const sentimentMutation = useSentimentAnalysis();
  const topicMutation = useTopicExtraction();
  const textAnalysisMutation = useTextAnalysis();
  const visionMutation = useVisionSegmentation();
  const damageMutation = useDamageAssessment();

  const runSentimentTest = async () => {
    setIsLoading(true);
    try {
      const result = await sentimentMutation.mutateAsync({
        id: `test_${Date.now()}`,
        text: testText,
        lang: 'tr',
      });
      setTestResults({ type: 'sentiment', data: result });
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  const runTopicTest = async () => {
    setIsLoading(true);
    try {
      const result = await topicMutation.mutateAsync({
        id: `test_${Date.now()}`,
        text: testText,
        lang: 'tr',
        max_topics: 5,
      });
      setTestResults({ type: 'topics', data: result });
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  const runTextAnalysisTest = async () => {
    setIsLoading(true);
    try {
      const result = await textAnalysisMutation.mutateAsync({
        text: testText,
        lang: 'tr',
        geo: { lat: 41.0082, lon: 28.9784 }, // İstanbul koordinatları
      });
      setTestResults({ type: 'textAnalysis', data: result });
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  const runVisionTest = async () => {
    setIsLoading(true);
    try {
      const result = await visionMutation.mutateAsync({
        tile_id: `test_tile_${Date.now()}`,
        image_uri: 'https://example.com/satellite-image.jpg',
        bounds: [28.5, 40.8, 29.2, 41.2], // İstanbul sınırları
        epsg: 4326,
      });
      setTestResults({ type: 'vision', data: result });
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  const runDamageTest = async () => {
    setIsLoading(true);
    try {
      const result = await damageMutation.mutateAsync({
        location_id: `test_location_${Date.now()}`,
        geo: { lat: 41.0082, lon: 28.9784 },
        signals: {
          earthquake_magnitude: 5.2,
          flood_depth: 0.5,
        },
        timestamp: new Date().toISOString(),
      });
      setTestResults({ type: 'damage', data: result });
    } catch (error) {
      setTestResults({ type: 'error', data: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Sayfası</h1>
        
        {/* API Konfigürasyonu */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Konfigürasyonu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">API Base URL:</label>
                <p className="text-sm text-muted-foreground">{config.apiBaseUrl}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Mock API Kullanımı:</label>
                <Badge variant={config.useMockApi ? 'default' : 'secondary'}>
                  {config.useMockApi ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Check */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <p>Kontrol ediliyor...</p>
            ) : healthData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Bağlı</Badge>
                  <span>Status: {healthData.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Version: {healthData.version}
                </p>
                <p className="text-sm text-muted-foreground">
                  Timestamp: {new Date(healthData.timestamp).toLocaleString('tr-TR')}
                </p>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  API bağlantısı kurulamadı. Mock API'nin çalıştığından emin olun.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Test Alanı */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Metni</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Test edilecek metni buraya yazın..."
              className="mb-4"
            />
          </CardContent>
        </Card>

        {/* Test Butonları */}
        <Tabs defaultValue="nlp" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nlp">NLP</TabsTrigger>
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="damage">Damage</TabsTrigger>
            <TabsTrigger value="results">Sonuçlar</TabsTrigger>
          </TabsList>

          <TabsContent value="nlp" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={runSentimentTest} 
                disabled={isLoading}
                className="w-full"
              >
                Sentiment Analysis
              </Button>
              <Button 
                onClick={runTopicTest} 
                disabled={isLoading}
                className="w-full"
              >
                Topic Extraction
              </Button>
              <Button 
                onClick={runTextAnalysisTest} 
                disabled={isLoading}
                className="w-full"
              >
                Full Text Analysis
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="vision" className="space-y-4">
            <Button 
              onClick={runVisionTest} 
              disabled={isLoading}
              className="w-full"
            >
              Vision Segmentation
            </Button>
          </TabsContent>

          <TabsContent value="damage" className="space-y-4">
            <Button 
              onClick={runDamageTest} 
              disabled={isLoading}
              className="w-full"
            >
              Damage Assessment
            </Button>
          </TabsContent>

          <TabsContent value="results">
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Test Sonuçları - {testResults.type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <Alert>
            <AlertDescription>
              API isteği gönderiliyor... Lütfen bekleyin.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ApiTest;
