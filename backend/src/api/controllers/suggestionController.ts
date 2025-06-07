import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';
import { generateSuggestions } from '../../services/suggestion/generator.js';

// リクエストパラメータのバリデーションスキーマ
const suggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside']),
  duration: z.enum(['5', '15', '30']).transform(Number),
});

export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // パラメータのバリデーション
    const validatedQuery = suggestionsQuerySchema.parse(req.query);
    const { situation, duration } = validatedQuery;

    logger.info(`Generating suggestions for situation: ${situation}, duration: ${duration}`);

    // 提案の生成
    const suggestions = await generateSuggestions(situation, duration);

    res.json({
      suggestions,
      metadata: {
        situation,
        duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid request parameters',
          details: error.errors,
        },
      });
    }
    next(error);
  }
};