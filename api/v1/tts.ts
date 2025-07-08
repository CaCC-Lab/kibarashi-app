import { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

// Import core logic from shared package
import { geminiTTS, logger } from "../../packages/core-logic/dist/index.js";

// Standard API response types
type ApiResponseError = {
  status: 'error';
  message: string;
  code?: string;
};

// Request validation schema matching backend logic
const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceSettings: z.object({
    speed: z.number().min(0.5).max(2.0).optional(),
    pitch: z.number().min(-20).max(20).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'NEUTRAL']).optional(),
  }).optional(),
});

function handleError(res: VercelResponse, error: unknown): VercelResponse {
  if (error instanceof z.ZodError) {
    logger.warn('Validation error in TTS API:', error.issues);
    return res.status(400).json({
      status: 'error',
      message: '入力データが無効です。テキストを確認してください。',
      code: 'INVALID_INPUT',
    } as ApiResponseError);
  }

  logger.error('Unhandled error in TTS API:', error);
  return res.status(500).json({
    status: 'error',
    message: '音声生成でエラーが発生しました。時間をおいて再試行してください。',
    code: 'TTS_GENERATION_FAILED',
  } as ApiResponseError);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    } as ApiResponseError);
  }

  try {
    // Validate request body
    const validatedBody = ttsRequestSchema.parse(req.body);
    const { text, voiceSettings } = validatedBody;

    logger.info(`Converting text to speech: ${text.substring(0, 50)}...`);

    // Try Gemini TTS first if API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const audioBuffer = await geminiTTS.synthesizeSpeech(text, {
          ssmlGender: voiceSettings?.gender,
        });

        // Set audio response headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=3600');

        return res.status(200).send(audioBuffer);
      } catch (geminiError) {
        logger.error('Gemini TTS processing failed', { error: geminiError });
        // Fall through to other TTS options
      }
    }

    // Try Google Cloud TTS if enabled
    if (process.env.GCP_TTS_ENABLED === 'true') {
      try {
        // Note: This would require importing ttsClient from core-logic
        // For now, we'll return an error as fallback
        logger.info('Google Cloud TTS fallback would be used here');
        throw new Error('Google Cloud TTS not implemented in Vercel function yet');
      } catch (ttsError) {
        logger.error('Google Cloud TTS processing failed', { error: ttsError });
      }
    }

    // No TTS service available
    return res.status(503).json({
      status: 'error',
      message: 'Text-to-Speech サービスが現在利用できません。ブラウザの音声機能をお試しください。',
      code: 'TTS_DISABLED'
    } as ApiResponseError);

  } catch (error) {
    return handleError(res, error);
  }
}