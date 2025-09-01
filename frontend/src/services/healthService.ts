/**
 * Health Check Service
 * Mock API'nin health endpoint'i ile entegrasyon
 */

import apiClient from '@/lib/api';
import type { HealthResponse } from '@/types/api';

export class HealthService {
  /**
   * API sağlık durumunu kontrol eder
   */
  static async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await apiClient.get<HealthResponse>('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * API bağlantısını test eder
   */
  static async testConnection(): Promise<{
    isConnected: boolean;
    response?: HealthResponse;
    error?: string;
  }> {
    try {
      const response = await this.checkHealth();
      return {
        isConnected: true,
        response,
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * API durumunu periyodik olarak kontrol eder
   */
  static startHealthMonitoring(
    intervalMs: number = 30000, // 30 saniye
    onStatusChange?: (isHealthy: boolean, response?: HealthResponse) => void
  ): () => void {
    let isMonitoring = true;
    let lastStatus: boolean | null = null;

    const checkHealth = async () => {
      if (!isMonitoring) return;

      try {
        const response = await this.checkHealth();
        const isHealthy = response.status === 'healthy';

        if (lastStatus !== isHealthy) {
          lastStatus = isHealthy;
          onStatusChange?.(isHealthy, response);
        }
      } catch (error) {
        if (lastStatus !== false) {
          lastStatus = false;
          onStatusChange?.(false);
        }
      }

      if (isMonitoring) {
        setTimeout(checkHealth, intervalMs);
      }
    };

    // İlk kontrolü hemen yap
    checkHealth();

    // Monitoring'i durdurmak için cleanup fonksiyonu döndür
    return () => {
      isMonitoring = false;
    };
  }
}

export default HealthService;
