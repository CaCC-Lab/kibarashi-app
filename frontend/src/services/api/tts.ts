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
      // バックエンドからJSONレスポンスを取得
      const response = await apiClient.post<{type: string; audioContent?: string; error?: string}>('/api/v1/tts', requestBody, {
        timeout: 30000, // 30秒のタイムアウト
        // responseType は指定しない（JSONを受け取るため）
      });

      // レスポンスの型をチェック
      if (response.type === 'browser_tts') {
        // ブラウザTTSフォールバックの場合
        throw new Error('Browser TTS requested');
      }

      // Gemini TTSの場合、Base64音声データをデコード
      if (response.type === 'gemini_tts' && response.audio) {
        // Base64文字列をバイナリに変換
        const binaryString = atob(response.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // WAVファイルとしてBlobを作成
        const audioBlob = new Blob([bytes], { type: 'audio/wav' });

        // 正常なBlobが返されたか確認
        if (!audioBlob || audioBlob.size === 0) {
          throw new Error('No audio data received');
        }

        return audioBlob;
      }

      // 予期しないレスポンス形式
      throw new Error('Invalid response format from TTS API');
    } catch (error) {
      // エラーレスポンスがJSONの場合の処理
      if (error instanceof Error && error.message.includes('Browser TTS requested')) {
        throw error;
      }
      console.error('TTS synthesis error:', error);
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