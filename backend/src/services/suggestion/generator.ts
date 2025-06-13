import { logger } from '../../utils/logger';
import { getFallbackSuggestions } from './fallbackData';
import { geminiClient } from '../gemini/geminiClient';

// 気晴らし提案のデータ構造
// なぜこの構造か：ユーザーが実践しやすいように、
// 必要な情報を構造化して提供
export interface Suggestion {
  id: string; // 一意識別子
  title: string; // 提案のタイトル（例：「深呼吸でリラックス」）
  description: string; // 提案の説明
  duration: number; // 所要時間（分）
  category: '認知的' | '行動的'; // 気晴らしのタイプ
  steps?: string[]; // 実践手順（オプション）
  guide?: string; // 音声ガイド用テキスト（オプション）
}

/**
 * 気晴らし提案を生成する中核機能
 * 
 * 設計思想：
 * 1. AIを使った動的生成をメインとし、フォールバックで安定性を保証
 * 2. エラー発生時でもユーザーに価値を提供できるようにする
 * 3. 常に3つの提案を返すことで、選択肢を提供
 * 
 * なぜこの設計か：
 * - Gemini APIが利用できない場合でもサービスが停止しない
 * - APIキー設定を忘れても基本機能が動作する
 * - エラーをユーザーに見せず、シームレスな体験を提供
 * 
 * 処理の流れ：
 * 1. Gemini APIが有効か確認
 * 2a. 有効ならAIで提案を生成
 * 2b. 無効またはエラーならフォールバックデータを使用
 * 3. 必ず3つの提案を返す
 * 
 * @param situation - ユーザーの現在の場所
 * @param duration - 希望する気晴らし時間
 * @returns 3つの気晴らし提案の配列
 */
export async function generateSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: number
): Promise<Suggestion[]> {
  try {
    // ステップ1: Gemini APIの有効性を確認
    // なぜAPIキーを確認するか：APIキーが設定されていない場合、
    // 無駄なAPI呼び出しを避け、即座にフォールバックを使用するため
    if (process.env.GEMINI_API_KEY) {
      logger.info('Generating suggestions with Gemini API', { situation, duration });
      
      // ステップ2: AIを使ってパーソナライズされた提案を生成
      const suggestions = await geminiClient.generateSuggestions(situation, duration);
      
      // ステップ3: 必ず3つの提案を返す
      // なぜ3つか：選択肢を提供しつつ、情報過多を避けるため
      return suggestions.slice(0, 3);
    }
    
    // APIキーが設定されていない場合の処理
    // これはエラーではなく、意図的な設計
    logger.info('Using fallback suggestions (Gemini API key not configured)', {
      situation,
      duration,
      reason: 'GEMINI_API_KEY environment variable not set'
    });
    
    const suggestions = getFallbackSuggestions(situation, duration);
    return suggestions.slice(0, 3);
    
  } catch (error) {
    // エラーハンドリング：AI生成が失敗してもサービスを継続
    // なぜフォールバックするか：
    // - ユーザーにエラーを見せず、常に価値を提供する
    // - ネットワークエラーやAPIの一時的な問題でサービスが停止しない
    logger.error('Error generating suggestions, falling back to static data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      situation,
      duration,
    });
    
    // フォールバックデータを使用
    // ユーザーにはこの切り替えが透明に行われる
    return getFallbackSuggestions(situation, duration).slice(0, 3);
  }
}