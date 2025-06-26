import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// バリデーションスキーマ
const ttsRequestSchema = z.object({
  text: z.string().min(1).max(500),
  voice: z.enum(['ja-JP-Standard-A', 'ja-JP-Standard-B', 'ja-JP-Standard-C', 'ja-JP-Standard-D']).optional().default('ja-JP-Standard-A'),
  speed: z.number().min(0.25).max(4.0).optional().default(1.0),
});

// Gemini TTS設定
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

// WAVヘッダーを作成する関数
function createWavHeader(pcmDataLength: number, sampleRate: number = 24000, channels: number = 1, bitDepth: number = 16): Buffer {
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmDataLength, 4); // file size - 8
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // format (1 = PCM)
  header.writeUInt16LE(channels, 22); // number of channels
  header.writeUInt32LE(sampleRate, 24); // sample rate
  header.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28); // byte rate
  header.writeUInt16LE(channels * (bitDepth / 8), 32); // block align
  header.writeUInt16LE(bitDepth, 34); // bits per sample
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(pcmDataLength, 40); // data size
  
  return header;
}

// Gemini音声合成
async function synthesizeSpeechWithGemini(text: string, voice: string, speed: number): Promise<Buffer> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // 音声名を選択（男性：Charon、女性：Kore）
  const voiceName = voice.includes('Standard-B') || voice.includes('Standard-D') ? 'Charon' : 'Kore';

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

  try {
    const response = await fetch(GEMINI_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini TTS API error:', errorText);
      throw new Error(`Gemini TTS API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      throw new Error('No audio data in Gemini response');
    }

    // Base64データをBufferに変換（PCMフォーマット）
    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    
    // PCMデータにWAVヘッダーを追加
    const wavHeader = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
    
    console.log(`Gemini TTS synthesis completed: ${wavBuffer.length} bytes (WAV format)`);
    return wavBuffer;
  } catch (error) {
    console.error('Gemini TTS synthesis failed:', error);
    throw error;
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

    // Gemini TTSを試行
    try {
      const audioBuffer = await synthesizeSpeechWithGemini(text, voice, speed);
      
      // 音声データをBase64でエンコードして返す
      const audioBase64 = audioBuffer.toString('base64');
      
      return res.status(200).json({
        type: 'gemini_tts',
        audio: audioBase64,
        format: 'wav', // WAVフォーマットで返す
        sampleRate: 24000,
        channels: 1,
        size: audioBuffer.length,
        metadata: {
          text_length: text.length,
          voice,
          speed,
          timestamp: new Date().toISOString(),
          source: 'gemini_2.5_flash_preview_tts'
        }
      });
    } catch (ttsError) {
      console.warn('Gemini TTS failed, falling back to browser TTS:', ttsError);
      
      // フォールバック: ブラウザTTS用の設定を返す
      const browserConfig = createBrowserTTSResponse(text, voice, speed);
      
      return res.status(200).json({
        ...browserConfig,
        metadata: {
          text_length: text.length,
          voice,
          speed,
          timestamp: new Date().toISOString(),
          source: 'browser_tts_fallback',
          fallback_reason: 'gemini_tts_unavailable'
        }
      });
    }
  } catch (error) {
    console.error('TTS handler error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
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
        ...browserConfig,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'browser_tts_fallback',
          fallback_reason: 'server_error'
        }
      });
    }

    return res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}