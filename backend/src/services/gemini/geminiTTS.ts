import { logger } from '../../utils/logger.js';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

class GeminiTTSClient {
  private apiKey: string;
  private apiUrl: string;
  private tempDir: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.apiKey}`;
    this.tempDir = path.join(process.cwd(), 'temp');
    this.initializeTempDir();
  }

  private async initializeTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create temp directory', { error });
    }
  }

  async synthesizeSpeech(text: string, voiceConfig?: {
    languageCode?: string;
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  }): Promise<Buffer> {
    try {
      logger.info('Generating speech with Gemini TTS API', { textLength: text.length });

      // 音声名を選択（日本語対応の音声）
      const voiceName = voiceConfig?.ssmlGender === 'MALE' ? 'Charon' : 'Kore';

      const requestBody = {
        contents: [{
          parts: [{
            text: text
          }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        },
        model: "gemini-2.5-flash-preview-tts",
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini TTS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioBase64) {
        throw new Error('No audio data in Gemini response');
      }

      // Base64からPCMデータにデコード
      const pcmBuffer = Buffer.from(audioBase64, 'base64');
      
      // PCMをMP3に変換
      const mp3Buffer = await this.convertPCMtoMP3(pcmBuffer);
      
      logger.info('Gemini TTS synthesis completed', { 
        audioSize: mp3Buffer.length 
      });

      return mp3Buffer;
    } catch (error) {
      logger.error('Gemini TTS synthesis failed', { error });
      throw error;
    }
  }

  private async convertPCMtoMP3(pcmBuffer: Buffer): Promise<Buffer> {
    const tempId = uuidv4();
    const pcmPath = path.join(this.tempDir, `${tempId}.pcm`);
    const mp3Path = path.join(this.tempDir, `${tempId}.mp3`);

    try {
      // PCMデータを一時ファイルに保存
      await fs.writeFile(pcmPath, pcmBuffer);

      // ffmpegでPCMからMP3に変換
      const command = `ffmpeg -f s16le -ar 24000 -ac 1 -i ${pcmPath} -acodec mp3 -ab 128k ${mp3Path}`;
      await execAsync(command);

      // MP3ファイルを読み込み
      const mp3Buffer = await fs.readFile(mp3Path);

      // 一時ファイルを削除
      await fs.unlink(pcmPath).catch(() => {});
      await fs.unlink(mp3Path).catch(() => {});

      return mp3Buffer;
    } catch (error) {
      // エラー時も一時ファイルを削除
      await fs.unlink(pcmPath).catch(() => {});
      await fs.unlink(mp3Path).catch(() => {});
      throw error;
    }
  }
}

// シングルトンインスタンス
let instance: GeminiTTSClient | null = null;

export const geminiTTS = {
  synthesizeSpeech: async (text: string, voiceConfig?: any) => {
    if (!instance) {
      instance = new GeminiTTSClient();
    }
    return instance.synthesizeSpeech(text, voiceConfig);
  }
};