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

    const response = await apiClient.post<{
      success: boolean;
      data: {
        type: string;
        audio?: string; // Base64エンコードされた音声データ
        format?: string;
        config?: any; // ブラウザTTSの設定
      };
      metadata?: any;
    }>('/api/v1/tts', requestBody, {
      timeout: 30000, // 30秒のタイムアウト
    });

    // レスポンスのタイプに応じて処理
    if (response.data.data.type === 'browser_tts') {
      // ブラウザTTSの場合はエラーを投げる（SuggestionDetailがハンドリング）
      throw new Error('Browser TTS requested');
    }

    // Gemini TTSまたはGoogle Cloud TTSの音声データを処理
    if (!response.data.data.audio) {
      throw new Error('No audio data received');
    }

    // Base64をBlobに変換
    const binaryString = atob(response.data.data.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // フォーマットに応じてMIMEタイプを設定
    let mimeType = 'audio/wav'; // デフォルトはWAV
    if (response.data.data.format === 'mp3') {
      mimeType = 'audio/mpeg';
    } else if (response.data.data.format === 'pcm') {
      mimeType = 'audio/wav'; // PCMもWAVとして扱う
    }

    return new Blob([bytes], { type: mimeType });
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