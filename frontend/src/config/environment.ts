/**
 * Environment Configuration
 * Uygulama konfigürasyonu ve environment değişkenleri
 */

export interface AppConfig {
  apiBaseUrl: string;
  appEnv: 'development' | 'production' | 'test';
  appVersion: string;
  useMockApi: boolean;
  mockApiDelay: number;
}

// Environment değişkenlerini oku
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  return value || defaultValue || '';
};

// Konfigürasyon objesi
export const config: AppConfig = {
  // API Base URL - mock API için localhost:8000
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000'),
  
  // Uygulama ortamı
  appEnv: (getEnvVar('VITE_APP_ENV', 'development') as AppConfig['appEnv']),
  
  // Uygulama versiyonu
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  
  // Mock API kullanımı (development için true)
  useMockApi: getEnvVar('VITE_USE_MOCK_API', 'true') === 'true',
  
  // Mock API gecikme süresi (ms)
  mockApiDelay: parseInt(getEnvVar('VITE_MOCK_API_DELAY', '100'), 10),
};

// Development ortamı kontrolü
export const isDevelopment = config.appEnv === 'development';
export const isProduction = config.appEnv === 'production';
export const isTest = config.appEnv === 'test';

// API URL'lerini oluştur
export const apiUrls = {
  base: config.apiBaseUrl,
  health: `${config.apiBaseUrl}/health`,
  sentiment: `${config.apiBaseUrl}/api/v1/predict/sentiment`,
  topics: `${config.apiBaseUrl}/api/v1/predict/topics`,
  vision: `${config.apiBaseUrl}/api/v1/vision/segment`,
  damage: `${config.apiBaseUrl}/api/v1/score/damage`,
} as const;

// Debug bilgileri
if (isDevelopment) {
  console.log('🔧 HasHarita Configuration:', {
    apiBaseUrl: config.apiBaseUrl,
    appEnv: config.appEnv,
    appVersion: config.appVersion,
    useMockApi: config.useMockApi,
    mockApiDelay: config.mockApiDelay,
  });
}

export default config;
