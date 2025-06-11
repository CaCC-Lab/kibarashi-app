import { apiClient } from './client';

export interface TTSOptions {
  text: string;
  voiceSettings?: {
    speed?: number;
    pitch?: number;
    gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
}

export const ttsService = {
  /**
   * テキストを音声に変換
   */
  async synthesizeSpeech(options: TTSOptions): Promise<Blob> {
    return await apiClient.post<Blob>('/api/v1/tts', options, {
      responseType: 'blob',
      headers: {
        'Accept': 'audio/mpeg',
      },
      timeout: 30000, // 30秒のタイムアウト（音声生成には時間がかかる場合がある）
    });
  },

  /**
   * 音声URLを生成（Blob URLを作成）
   */
  createAudioUrl(audioBlob: Blob): string {
    return URL.createObjectURL(audioBlob);
  },

  /**
   * 音声URLを解放（メモリリーク防止）
   */
  revokeAudioUrl(url: string): void {
    URL.revokeObjectURL(url);
  },
};