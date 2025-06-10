import { apiClient } from './client';

interface HealthResponse {
  status: string;
  timestamp: string;
  ttsEnabled?: boolean;
}

export const healthService = {
  /**
   * サーバーの健全性とTTS機能の状態を確認
   */
  async checkHealth(): Promise<HealthResponse> {
    return await apiClient.get<HealthResponse>('/health');
  },

  /**
   * TTS機能が利用可能かチェック
   */
  async checkTTSAvailability(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.ttsEnabled === true;
    } catch {
      return false;
    }
  },
};