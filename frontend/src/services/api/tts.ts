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
    // APIエンドポイントに送信する形式に変換
    const requestBody = {
      text: options.text,
      voice: 'ja-JP-Standard-A', // デフォルト音声
      speed: options.voiceSettings?.speed || 1.0,
    };

    // 音声タイプに応じて適切な音声を選択
    if (options.voiceSettings?.gender === 'MALE') {
      requestBody.voice = 'ja-JP-Standard-B';
    } else if (options.voiceSettings?.gender === 'FEMALE') {
      requestBody.voice = 'ja-JP-Standard-A';
    }

    try {
      // バックエンドから直接バイナリ音声データを取得
      const audioBlob = await apiClient.post<Blob>('/api/v1/tts', requestBody, {
        timeout: 30000, // 30秒のタイムアウト
        responseType: 'blob', // 重要: Blobとしてレスポンスを受け取る
      });

      // 正常なBlobが返されたか確認
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('No audio data received');
      }

      return audioBlob;
    } catch (error) {
      // エラーレスポンスがJSONの場合の処理
      if (error instanceof Error && error.message.includes('TTS_DISABLED')) {
        throw new Error('Browser TTS requested');
      }
      throw error;
    }
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