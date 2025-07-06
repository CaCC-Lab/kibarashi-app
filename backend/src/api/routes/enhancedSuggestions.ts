import { Router } from 'express';
import { 
  getEnhancedSuggestions,
  getVoiceGuideSegment,
  submitSuggestionFeedback
} from '../controllers/enhancedSuggestionController';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * 拡張気晴らし提案エンドポイント
 * 
 * 機能：
 * - 音声ガイド対応の高度な提案生成
 * - 年齢層・詳細度の選択可能
 * - SSML対応の音声セグメント生成
 * 
 * レート制限：
 * - 通常の提案より制限を緩く設定（音声生成のため時間がかかる）
 */
router.get(
  '/',
  rateLimiter.enhancedSuggestions, // 拡張提案用のレート制限
  getEnhancedSuggestions
);

/**
 * 音声ガイドセグメント個別取得
 * 
 * 機能：
 * - 特定の音声セグメントを取得
 * - プログレッシブダウンロード対応
 * - 音声ファイルキャッシュ対応
 */
router.get(
  '/:suggestionId/voice/:segmentId',
  rateLimiter.voiceSegment,
  getVoiceGuideSegment
);

/**
 * 提案フィードバック投稿
 * 
 * 機能：
 * - ユーザーフィードバックの収集
 * - 音声ガイド使用状況の追跡
 * - AI提案の品質向上データ収集
 */
router.post(
  '/:suggestionId/feedback',
  rateLimiter.feedback,
  submitSuggestionFeedback
);

export { router as enhancedSuggestionsRouter };