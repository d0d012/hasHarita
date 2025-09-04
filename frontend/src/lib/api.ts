/**
 * HasHarita API Client
 * Mock API ile entegrasyon için API servis katmanı
 */

import { config } from '@/config/environment';

// API Base URL - environment konfigürasyonundan al
const API_BASE_URL = config.apiBaseUrl;

// API Response wrapper
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client
class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// API Client instance
const apiClient = new HttpClient(API_BASE_URL);

// Aggregated data API functions
export const aggregatedDataApi = {
  /**
   * Get aggregated data from backend
   * @param level - 'city' or 'district' level aggregation
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getAggregatedData(level: 'city' | 'district' = 'city', window: string = '15m') {
    const params = new URLSearchParams({
      level,
      window
    });
    
    return apiClient.get(`/map/aggregates?${params}`);
  }
};

// Lightning data API functions
export const lightningApi = {
  /**
   * Get raw lightning strike data
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getLightningData(window: string = '15m') {
    const params = new URLSearchParams({ window });
    return apiClient.get(`/lightning/data?${params}`);
  },
  
  /**
   * Get aggregated lightning data by city
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getLightningAggregates(window: string = '15m') {
    const params = new URLSearchParams({ window });
    return apiClient.get(`/lightning/aggregates?${params}`);
  }
};

// Disaster data API functions
export const disasterApi = {
  /**
   * Get raw disaster log data
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getDisasterData(window: string = '15m') {
    const params = new URLSearchParams({ window });
    return apiClient.get(`/disaster/data?${params}`);
  },
  
  /**
   * Get aggregated disaster data by city and type
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getDisasterAggregates(window: string = '15m') {
    const params = new URLSearchParams({ window });
    return apiClient.get(`/disaster/aggregates?${params}`);
  }
};

// Sustainability data API functions
export const sustainabilityApi = {
  /**
   * Get raw sustainability log data
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getSustainabilityData(window: string = '15m') {
    const params = new URLSearchParams({ window });
    return apiClient.get(`/sustainability/data?${params}`);
  },
  
  /**
   * Get aggregated sustainability data by city and type
   * @param window - Time window (e.g., '15m', '1h', '24h')
   */
  async getSustainabilityAggregates(window: string = '15m') {
    const params = new URLSearchParams({ window });
    return apiClient.get(`/sustainability/aggregates?${params}`);
  }
};

export { apiClient, ApiError, type ApiResponse };
export default apiClient;
