import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { generateEnhancedSuggestions } from '../../services/suggestion/enhancedGenerator';

// 拡張提案リクエストパラメータのバリデーションスキーマ
const enhancedSuggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside']),
  duration: z.enum(['5', '15', '30']).transform(Number),
  ageGroup: z.enum(['office_worker', 'student', 'middle_school', 'housewife', 'elderly']).optional(),
  detailLevel: z.enum(['simple', 'standard', 'detailed']).optional(),
  includeVoiceGuide: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});

/**
 * 拡張気晴らし提案を取得
 * 音声ガイド対応の高度な提案を生成
 */
export const getEnhancedSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // パラメータのバリデーション
    const validatedQuery = enhancedSuggestionsQuerySchema.parse(req.query);
    const { 
      situation, 
      duration, 
      ageGroup = 'office_worker',
      detailLevel = 'standard',
      includeVoiceGuide = true 
    } = validatedQuery;

    logger.info(`Generating enhanced suggestions`, {
      situation,
      duration,
      ageGroup,
      detailLevel,
      includeVoiceGuide,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // 拡張提案の生成
    const suggestions = await generateEnhancedSuggestions(situation, duration, {
      ageGroup,
      detailLevel,
      includeVoiceGuide
    });

    // 成功ログ
    logger.info('Enhanced suggestions generated successfully', {
      situation,
      duration,
      ageGroup,
      suggestionCount: suggestions.length,
      hasVoiceGuide: suggestions.some(s => s.voiceGuideScript?.segments?.length > 0)
    });

    // キャッシュを無効化するヘッダーを設定（新しい提案を毎回生成）
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
        ageGroup,
        detailLevel,
        includeVoiceGuide,
        timestamp: new Date().toISOString(),
        // 音声ガイド情報
        voiceGuideInfo: {
          available: suggestions.some(s => s.voiceGuideScript?.segments?.length > 0),
          totalSegments: suggestions.reduce((total, s) => 
            total + (s.voiceGuideScript?.segments?.length || 0), 0
          ),
          totalDuration: suggestions.reduce((total, s) => 
            total + (s.voiceGuideScript?.totalDuration || 0), 0
          )
        }
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // バリデーションエラーの詳細をログ出力
      logger.warn('Enhanced suggestions validation error', {
        errors: error.errors,
        query: req.query,
        ip: req.ip
      });
      
      const appError = new Error('Invalid request parameters for enhanced suggestions');
      (appError as any).statusCode = 400;
      (appError as any).details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return next(appError);
    }
    
    // その他のエラー
    logger.error('Enhanced suggestions generation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query,
      ip: req.ip
    });
    
    next(error);
  }
};

/**
 * 音声ガイドセグメントを個別取得
 * 特定の提案の音声セグメントを取得（プログレッシブダウンロード用）
 */
export const getVoiceGuideSegment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { suggestionId, segmentId } = req.params;
    
    logger.info('Voice guide segment requested', {
      suggestionId,
      segmentId,
      ip: req.ip
    });

    // TODO: 実装
    // 1. 提案IDから音声セグメントを取得
    // 2. TTSでSSMLを音声に変換
    // 3. キャッシュされた音声ファイルがあれば返す
    // 4. なければリアルタイム生成
    
    res.status(501).json({
      error: 'Voice guide segment endpoint not yet implemented',
      suggestionId,
      segmentId
    });
    
  } catch (error) {
    logger.error('Voice guide segment error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestionId: req.params.suggestionId,
      segmentId: req.params.segmentId,
      ip: req.ip
    });
    
    next(error);
  }
};

/**
 * 提案フィードバック受信
 * ユーザーの提案に対するフィードバックを収集（Phase 2以降で活用）
 */
export const submitSuggestionFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const feedbackSchema = z.object({
      suggestionId: z.string(),
      rating: z.number().min(1).max(5),
      helpful: z.boolean(),
      completed: z.boolean(),
      comments: z.string().optional(),
      voiceGuideUsed: z.boolean().optional(),
      detailLevel: z.enum(['simple', 'standard', 'detailed']).optional()
    });
    
    const feedback = feedbackSchema.parse(req.body);
    
    logger.info('Suggestion feedback received', {
      ...feedback,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // TODO: Phase 2でデータベースに保存
    // await saveFeedbackToDatabase(feedback);
    
    res.json({
      message: 'Feedback received successfully',
      suggestionId: feedback.suggestionId
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Feedback validation error', {
        errors: error.errors,
        body: req.body,
        ip: req.ip
      });
      
      const appError = new Error('Invalid feedback data');
      (appError as any).statusCode = 400;
      (appError as any).details = error.errors;
      return next(appError);
    }
    
    next(error);
  }
};