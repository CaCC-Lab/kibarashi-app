import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { generateSuggestions } from '../../services/suggestion/generator';

// リクエストパラメータのバリデーションスキーマ
const suggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside', 'studying', 'school', 'commuting']),
  duration: z.enum(['5', '15', '30']).transform(Number),
  // オプショナルパラメータ - AgeGroup型に対応した値のみ許可
  ageGroup: z.enum(['student', 'office_worker', 'middle_school', 'housewife', 'elderly']).optional(),
  studentConcern: z.string().optional(),
  studentSubject: z.string().optional(),
});

export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // パラメータのバリデーション
    const validatedQuery = suggestionsQuerySchema.parse(req.query);
    const { situation, duration, ageGroup, studentConcern, studentSubject } = validatedQuery;

    logger.info(`Generating suggestions for situation: ${situation}, duration: ${duration}, ageGroup: ${ageGroup || 'default'}`);

    // 学生向けコンテキストを構築
    const studentContext = (ageGroup === 'student' && (studentConcern || studentSubject)) ? {
      concern: studentConcern,
      subject: studentSubject,
    } : undefined;

    // 提案の生成
    const suggestions = await generateSuggestions(situation, duration, ageGroup, studentContext);

    // キャッシュを無効化するヘッダーを設定
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    res.json({
      suggestions,
      metadata: {
        situation,
        duration,
        timestamp: new Date().toISOString(),
        ...(ageGroup && { ageGroup }),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 3要素エラーハンドリング: 何が・なぜ・どうすれば
      const errorDetails = error.errors.map(err => {
        const field = err.path.join('.');
        let what: string;
        let why: string;
        let how: string;

        switch (field) {
          case 'ageGroup':
            what = `年齢層パラメータ '${err.message}' が無効です`;
            why = '指定された年齢層が対応していません';
            how = '有効な値: student, office_worker, middle_school, housewife, elderly';
            break;
          case 'situation':
            what = `状況パラメータ '${err.message}' が無効です`;
            why = '指定された状況が対応していません';
            how = '有効な値: workplace, home, outside, studying, school, commuting';
            break;
          case 'duration':
            what = `時間パラメータ '${err.message}' が無効です`;
            why = '指定された時間が対応していません';
            how = '有効な値: 5, 15, 30（分）';
            break;
          default:
            what = `パラメータ '${field}' が無効です`;
            why = 'パラメータの形式または値が正しくありません';
            how = 'APIドキュメントを確認してください';
        }

        return {
          field,
          what,
          why,
          how,
          message: `${what}。${why}。${how}`
        };
      });

      logger.warn('Invalid request parameters:', {
        requestId: (req as any).id,
        query: req.query,
        errors: errorDetails
      });

      const appError = new Error('リクエストパラメータが無効です');
      (appError as any).statusCode = 400;
      (appError as any).details = {
        errors: errorDetails,
        validationErrorsCount: errorDetails.length
      };
      return next(appError);
    }
    next(error);
  }
};