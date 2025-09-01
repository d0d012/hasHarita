/**
 * API Hooks
 * React Query ile API entegrasyonu için custom hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SentimentService, 
  VisionService, 
  DamageService, 
  HealthService 
} from '@/services';
import type {
  SentimentRequest,
  TopicsRequest,
  VisionSegmentRequest,
  DamageScoreRequest,
} from '@/types/api';

// Health Check Hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => HealthService.checkHealth(),
    refetchInterval: 30000, // 30 saniyede bir kontrol et
    retry: 3,
  });
};

// Sentiment Analysis Hook
export const useSentimentAnalysis = () => {
  return useMutation({
    mutationFn: (request: SentimentRequest) => 
      SentimentService.analyzeSentiment(request),
  });
};

// Topic Extraction Hook
export const useTopicExtraction = () => {
  return useMutation({
    mutationFn: (request: TopicsRequest) => 
      SentimentService.extractTopics(request),
  });
};

// Text Analysis Hook (hem sentiment hem topic)
export const useTextAnalysis = () => {
  return useMutation({
    mutationFn: (params: {
      text: string;
      id?: string;
      lang?: 'tr' | 'en' | 'auto';
      geo?: { lat: number; lon: number };
      maxTopics?: number;
    }) => SentimentService.analyzeText(params.text, params),
  });
};

// Vision Segmentation Hook
export const useVisionSegmentation = () => {
  return useMutation({
    mutationFn: (request: VisionSegmentRequest) => 
      VisionService.segmentImage(request),
  });
};

// Damage Assessment Hook
export const useDamageAssessment = () => {
  return useMutation({
    mutationFn: (request: DamageScoreRequest) => 
      DamageService.calculateDamageScore(request),
  });
};

// Disaster Damage Assessment Hook
export const useDisasterDamageAssessment = () => {
  return useMutation({
    mutationFn: (params: {
      locationId: string;
      coordinates: { lat: number; lon: number };
      disasterSignals?: Record<string, any>;
    }) => DamageService.assessDisasterDamage(
      params.locationId,
      params.coordinates,
      params.disasterSignals
    ),
  });
};

// Multiple Location Damage Assessment Hook
export const useMultipleLocationDamageAssessment = () => {
  return useMutation({
    mutationFn: (locations: Array<{
      id: string;
      coordinates: { lat: number; lon: number };
      signals?: Record<string, any>;
    }>) => DamageService.assessMultipleLocations(locations),
  });
};

// API Connection Test Hook
export const useApiConnectionTest = () => {
  return useQuery({
    queryKey: ['api-connection'],
    queryFn: () => HealthService.testConnection(),
    retry: 1,
    staleTime: 60000, // 1 dakika
  });
};
