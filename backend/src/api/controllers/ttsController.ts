import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { ttsClient } from '../../services/tts/ttsClient';
import { geminiTTS } from '../../services/gemini/geminiTTS';

// リクエストボディのバリデーションスキーマ
const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceSettings: z.object({
    speed: z.number().min(0.5).max(2.0).optional(),
    pitch: z.number().min(-20).max(20).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'NEUTRAL']).optional(),
  }).optional(),
});

export const convertTextToSpeech = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // リクエストボディのバリデーション
    const validatedBody = ttsRequestSchema.parse(req.body);
    const { text, voiceSettings } = validatedBody;

    logger.info(`Converting text to speech: ${text.substring(0, 50)}...`);

    // Gemini APIキーが設定されている場合は、Gemini TTSを使用
    if (process.env.GEMINI_API_KEY) {
      try {
        const audioBuffer = await geminiTTS.synthesizeSpeech(text, {
          ssmlGender: voiceSettings?.gender,
        });

        // 音声ファイルをレスポンスとして返す
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        });

        res.send(audioBuffer);
        return;
      } catch (geminiError) {
        logger.error('Gemini TTS processing failed', { error: geminiError });
        // Gemini TTSが失敗した場合は、フォールバック
      }
    }

    // Google Cloud TTSが有効な場合
    if (process.env.GCP_TTS_ENABLED === 'true') {
      try {
        const audioBuffer = await ttsClient.synthesizeSpeech(text, {
          ssmlGender: voiceSettings?.gender,
        });

        // 音声ファイルをレスポンスとして返す
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        });

        res.send(audioBuffer);
      } catch (ttsError) {
        logger.error('TTS processing failed', { error: ttsError });
        return res.status(500).json({
          error: {
            message: '音声生成に失敗しました。しばらくしてから再度お試しください。',
            code: 'TTS_GENERATION_FAILED'
          }
        });
      }
    } else {
      // どちらのTTSも利用できない場合
      return res.status(503).json({
        error: {
          message: 'Text-to-Speech service is currently disabled',
          code: 'TTS_DISABLED'
        }
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body',
          details: error.errors,
        },
      });
    }
    next(error);
  }
};