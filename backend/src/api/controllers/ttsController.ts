import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';

// リクエストボディのバリデーションスキーマ
const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceSettings: z.object({
    speed: z.number().min(0.5).max(2.0).optional(),
    pitch: z.number().min(-20).max(20).optional(),
  }).optional(),
});

export const convertTextToSpeech = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // リクエストボディのバリデーション
    const validatedBody = ttsRequestSchema.parse(req.body);
    const { text, voiceSettings } = validatedBody;

    logger.info(`Converting text to speech: ${text.substring(0, 50)}...`);

    // TODO: Google Cloud Text-to-Speech APIの実装
    // 現時点では仮の実装
    res.json({
      message: 'Text-to-Speech conversion will be implemented',
      text,
      voiceSettings,
    });
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