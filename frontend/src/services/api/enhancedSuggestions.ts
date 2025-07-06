/**
 * 拡張提案APIクライアント
 * 音声ガイド対応の高度な提案を取得
 */

import { apiClient } from './client';
import type { 
  EnhancedSuggestion, 
  EnhancedSuggestionsResponse,
  Situation,
  Duration
} from './types';

/**
 * 拡張提案のリクエストパラメータ
 */
export interface EnhancedSuggestionsParams {
  situation: Situation;
  duration: Duration;
  ageGroup?: 'office_worker' | 'student' | 'middle_school' | 'housewife' | 'elderly';
  detailLevel?: 'simple' | 'standard' | 'detailed';
  includeVoiceGuide?: boolean;
}

/**
 * 拡張気晴らし提案を取得
 * 
 * 機能：
 * - 音声ガイド対応の提案取得
 * - 詳細度レベルの選択
 * - 年齢層別のカスタマイズ
 * 
 * なぜこの設計か：
 * - 段階的移行を可能にするため、既存APIとは別のエンドポイント
 * - オプションパラメータで柔軟な制御
 * - 音声ガイドはオプトインで使用可能
 */
export async function getEnhancedSuggestions({
  situation,
  duration,
  ageGroup = 'office_worker',
  detailLevel = 'standard',
  includeVoiceGuide = true
}: EnhancedSuggestionsParams): Promise<EnhancedSuggestionsResponse> {
  try {
    const params = new URLSearchParams({
      situation,
      duration: duration.toString(),
      ageGroup,
      detailLevel,
      includeVoiceGuide: includeVoiceGuide.toString()
    });

    const response = await apiClient.get<EnhancedSuggestionsResponse>(
      `/enhanced-suggestions?${params}`
    );

    // レスポンスの検証
    if (!response.data.suggestions || !Array.isArray(response.data.suggestions)) {
      throw new Error('Invalid response format from enhanced suggestions API');
    }

    return response.data;
  } catch (error) {
    // エラーハンドリング
    console.error('Enhanced suggestions API error:', error);
    
    // フォールバック処理の提案
    throw {
      message: '音声ガイド付き提案の取得に失敗しました',
      fallbackAction: '通常の提案を表示',
      originalError: error
    };
  }
}

/**
 * 音声ガイドセグメントを個別取得
 * プログレッシブダウンロード用
 * 
 * なぜ個別取得か：
 * - 音声データは重いため、必要な部分のみ取得
 * - ユーザーが次のセグメントに進む前にプリロード
 * - ネットワーク負荷の分散
 */
export async function getVoiceSegmentAudio(
  suggestionId: string,
  segmentId: string
): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `/enhanced-suggestions/${suggestionId}/voice/${segmentId}`,
      {
        responseType: 'blob'
      }
    );

    return response.data;
  } catch (error) {
    console.error('Voice segment fetch error:', error);
    throw {
      message: '音声データの取得に失敗しました',
      fallbackAction: 'テキスト表示のみ',
      originalError: error
    };
  }
}

/**
 * 提案フィードバックを送信
 * 
 * なぜフィードバックが重要か：
 * - AI提案の品質向上
 * - ユーザー満足度の測定
 * - 音声ガイドの効果測定
 */
export interface SuggestionFeedback {
  suggestionId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  completed: boolean;
  comments?: string;
  voiceGuideUsed?: boolean;
  detailLevel?: 'simple' | 'standard' | 'detailed';
}

export async function submitSuggestionFeedback(
  feedback: SuggestionFeedback
): Promise<void> {
  try {
    await apiClient.post(
      `/enhanced-suggestions/${feedback.suggestionId}/feedback`,
      feedback
    );
  } catch (error) {
    // フィードバックの送信失敗は静かに処理
    // ユーザー体験を妨げないため
    console.warn('Feedback submission failed:', error);
  }
}

/**
 * キャッシュキーの生成
 * Service Workerでのキャッシュ管理用
 */
export function generateCacheKey(params: EnhancedSuggestionsParams): string {
  return `enhanced-suggestions-${params.situation}-${params.duration}-${params.ageGroup}-${params.detailLevel}`;
}

/**
 * 音声URLの生成（将来の実装用）
 * TTSサービスから直接音声URLを取得する場合
 */
export function getVoiceSegmentUrl(
  suggestionId: string,
  segmentId: string
): string {
  return `${apiClient.defaults.baseURL}/enhanced-suggestions/${suggestionId}/voice/${segmentId}`;
}