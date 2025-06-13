import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { generateSuggestions } from '../../services/suggestion/generator';

// リクエストパラメータのバリデーションスキーマ
const suggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside']),
  duration: z.enum(['5', '15', '30']).transform(Number),
});

export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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
      // エラーハンドラーで処理するために、AppError形式のエラーを作成
      const appError = new Error('Invalid request parameters');
      (appError as any).statusCode = 400;
      (appError as any).details = error.errors;
      return next(appError);
    }
    next(error);
  }
};