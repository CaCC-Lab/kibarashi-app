import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// バリデーションスキーマ
const ttsRequestSchema = z.object({
  text: z.string().min(1).max(500),
  voice: z.enum(['ja-JP-Standard-A', 'ja-JP-Standard-B', 'ja-JP-Standard-C', 'ja-JP-Standard-D']).optional().default('ja-JP-Standard-A'),
  speed: z.number().min(0.25).max(4.0).optional().default(1.0),
});

// TTS クライアントの初期化
let ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    try {
      // Google Cloud認証情報の設定
      const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (credentials) {
        const parsedCredentials = JSON.parse(credentials);
        ttsClient = new TextToSpeechClient({
          credentials: parsedCredentials,
          projectId: parsedCredentials.project_id,
        });
      } else {
        // 環境変数から個別に認証情報を取得
        ttsClient = new TextToSpeechClient();
      }
    } catch (error) {
      console.error('Failed to initialize TTS client:', error);
      throw new Error('TTS service is not available');
    }
  }
  return ttsClient;
}

// 音声合成
async function synthesizeSpeech(text: string, voice: string, speed: number): Promise<Buffer> {
  const client = getTTSClient();

  const request = {
    input: { text },
    voice: {
      languageCode: 'ja-JP',
      name: voice,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: speed,
      pitch: 0,
      volumeGainDb: 0,
    },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS service');
    }

    return Buffer.from(response.audioContent as Uint8Array);
  } catch (error) {
    console.error('TTS synthesis error:', error);
    throw new Error('Failed to synthesize speech');
  }
}

// ブラウザTTS用のSSMLフォーマット
function createBrowserTTSResponse(text: string, voice: string, speed: number) {
  return {
    type: 'browser_tts',
    config: {
      text,
      voice: voice.includes('Standard-A') || voice.includes('Standard-C') ? 'female' : 'male',
      rate: speed,
      pitch: 1.0,
      volume: 1.0,
      lang: 'ja-JP'
    },
    instructions: {
      message: 'ブラウザの音声合成機能を使用してください',
      fallback_text: text
    }
  };
}

// メインハンドラー
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    // バリデーション
    const validatedData = ttsRequestSchema.parse(req.body);
    const { text, voice, speed } = validatedData;

    console.log(`TTS request: text length=${text.length}, voice=${voice}, speed=${speed}`);

    // Google Cloud TTSを試行
    try {
      const audioBuffer = await synthesizeSpeech(text, voice, speed);
      
      // 音声データをBase64でエンコードして返す
      const audioBase64 = audioBuffer.toString('base64');
      
      return res.status(200).json({
        success: true,
        data: {
          type: 'google_tts',
          audio: audioBase64,
          format: 'mp3',
          size: audioBuffer.length
        },
        metadata: {
          text_length: text.length,
          voice,
          speed,
          timestamp: new Date().toISOString(),
          source: 'google_cloud_tts'
        }
      });
    } catch (ttsError) {
      console.warn('Google Cloud TTS failed, falling back to browser TTS:', ttsError);
      
      // フォールバック: ブラウザTTS用の設定を返す
      const browserConfig = createBrowserTTSResponse(text, voice, speed);
      
      return res.status(200).json({
        success: true,
        data: browserConfig,
        metadata: {
          text_length: text.length,
          voice,
          speed,
          timestamp: new Date().toISOString(),
          source: 'browser_tts_fallback',
          fallback_reason: 'google_cloud_tts_unavailable'
        }
      });
    }
  } catch (error) {
    console.error('TTS handler error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      });
    }

    // エラー時もブラウザTTSフォールバックを提供
    if (req.body?.text) {
      const browserConfig = createBrowserTTSResponse(
        req.body.text,
        req.body.voice || 'ja-JP-Standard-A',
        req.body.speed || 1.0
      );
      
      return res.status(200).json({
        success: true,
        data: browserConfig,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'browser_tts_fallback',
          fallback_reason: 'server_error'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}