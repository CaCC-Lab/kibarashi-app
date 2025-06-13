import * as textToSpeech from '@google-cloud/text-to-speech';
import { logger } from '../../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class TTSClient {
  private client: textToSpeech.TextToSpeechClient;
  private cacheDir: string;

  constructor() {
    this.client = new textToSpeech.TextToSpeechClient();
    this.cacheDir = path.join(process.cwd(), 'cache', 'tts');
    this.initializeCacheDir();
  }

  private async initializeCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create TTS cache directory', { error });
    }
  }

  async synthesizeSpeech(text: string, voiceConfig?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  }): Promise<Buffer> {
    try {
      // キャッシュキーの生成
      const cacheKey = this.generateCacheKey(text, voiceConfig);
      const cachedFile = await this.getCachedAudio(cacheKey);
      
      if (cachedFile) {
        logger.info('Using cached TTS audio', { cacheKey });
        return cachedFile;
      }

      // Google Cloud TTSのリクエスト設定
      const request = {
        input: { text },
        voice: {
          languageCode: voiceConfig?.languageCode || 'ja-JP',
          name: voiceConfig?.name || 'ja-JP-Neural2-B', // 女性の声
          ssmlGender: voiceConfig?.ssmlGender || 'FEMALE' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0.0,
        },
      };

      // 音声合成実行
      const [response] = await this.client.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content in TTS response');
      }

      const audioBuffer = Buffer.from(response.audioContent);
      
      // キャッシュに保存
      await this.saveToCache(cacheKey, audioBuffer);
      
      logger.info('TTS synthesis completed', { 
        textLength: text.length,
        audioSize: audioBuffer.length 
      });

      return audioBuffer;
    } catch (error) {
      logger.error('TTS synthesis failed', { error, text: text.substring(0, 50) });
      throw error;
    }
  }

  private generateCacheKey(text: string, voiceConfig?: any): string {
    const config = JSON.stringify(voiceConfig || {});
    const hash = crypto.createHash('md5').update(text + config).digest('hex');
    return hash;
  }

  private async getCachedAudio(cacheKey: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
      const audio = await fs.readFile(filePath);
      return audio;
    } catch (error) {
      // キャッシュが存在しない場合はnullを返す
      return null;
    }
  }

  private async saveToCache(cacheKey: string, audioBuffer: Buffer): Promise<void> {
    try {
      const filePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
      await fs.writeFile(filePath, audioBuffer);
      
      // キャッシュサイズ管理（簡易版：100ファイルを超えたら古いものを削除）
      await this.cleanupCache();
    } catch (error) {
      logger.error('Failed to save TTS cache', { error, cacheKey });
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      
      if (files.length > 100) {
        // ファイルの統計情報を取得
        const fileStats = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(this.cacheDir, file);
            const stats = await fs.stat(filePath);
            return { file, mtime: stats.mtime };
          })
        );

        // 古い順にソート
        fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

        // 古いファイルを削除（50ファイルまで削減）
        const filesToDelete = fileStats.slice(0, fileStats.length - 50);
        await Promise.all(
          filesToDelete.map(({ file }) => 
            fs.unlink(path.join(this.cacheDir, file))
          )
        );

        logger.info('TTS cache cleanup completed', { 
          deletedCount: filesToDelete.length 
        });
      }
    } catch (error) {
      logger.error('TTS cache cleanup failed', { error });
    }
  }
}

// シングルトンインスタンス
let instance: TTSClient | null = null;

export const ttsClient = {
  synthesizeSpeech: async (text: string, voiceConfig?: any) => {
    if (!instance) {
      instance = new TTSClient();
    }
    return instance.synthesizeSpeech(text, voiceConfig);
  }
};