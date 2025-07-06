/**
 * 提案型アダプター
 * 既存のSuggestion型とEnhancedSuggestion型の相互変換
 * 
 * 設計思想：
 * - 段階的移行を可能にする
 * - 既存コンポーネントへの影響を最小化
 * - 型安全性を保証
 */

import type { Suggestion, EnhancedSuggestion, VoiceGuideScript } from './types';

/**
 * デフォルトの音声ガイドスクリプトを生成
 * 既存の提案から音声ガイドを自動生成
 * 
 * なぜ自動生成か：
 * - 既存の提案も音声ガイド対応可能に
 * - 段階的移行期間中の互換性確保
 * - フォールバック時の安定動作
 */
function generateDefaultVoiceGuide(suggestion: Suggestion): VoiceGuideScript {
  // 合計時間を計算（秒）
  const totalDuration = suggestion.duration * 60;
  
  // イントロ（30秒）
  const intro = {
    id: `${suggestion.id}-intro`,
    type: 'intro' as const,
    text: `それでは、${suggestion.title}を始めましょう。${suggestion.duration}分間、ゆっくりとリラックスして行いましょう。`,
    ssml: `<speak><p>それでは、<emphasis level="moderate">${suggestion.title}</emphasis>を始めましょう。</p><break time="1s"/><p>${suggestion.duration}分間、ゆっくりとリラックスして行いましょう。</p></speak>`,
    duration: 30,
    startTime: 0,
    autoPlay: true
  };

  // メインセグメント（全体時間 - イントロ30秒 - 締め30秒）
  const mainDuration = totalDuration - 60;
  const mainSegments = [];
  
  if (suggestion.steps && suggestion.steps.length > 0) {
    const stepDuration = Math.floor(mainDuration / suggestion.steps.length);
    let currentTime = 30;
    
    suggestion.steps.forEach((step, index) => {
      mainSegments.push({
        id: `${suggestion.id}-main-${index}`,
        type: 'main' as const,
        text: step,
        ssml: `<speak><p>ステップ${index + 1}です。</p><break time="1s"/><p>${step}</p></speak>`,
        duration: stepDuration,
        startTime: currentTime,
        autoPlay: true
      });
      currentTime += stepDuration;
    });
  } else {
    // ステップがない場合は説明文を使用
    mainSegments.push({
      id: `${suggestion.id}-main-0`,
      type: 'main' as const,
      text: suggestion.description,
      ssml: `<speak><p>${suggestion.description}</p></speak>`,
      duration: mainDuration,
      startTime: 30,
      autoPlay: true
    });
  }

  // 締めくくり（30秒）
  const closing = {
    id: `${suggestion.id}-closing`,
    type: 'closing' as const,
    text: 'お疲れさまでした。気持ちが少しでも軽くなったでしょうか。またいつでも、お気軽にご利用ください。',
    ssml: '<speak><p>お疲れさまでした。</p><break time="1s"/><p>気持ちが少しでも軽くなったでしょうか。</p><break time="1s"/><p>またいつでも、お気軽にご利用ください。</p></speak>',
    duration: 30,
    startTime: totalDuration - 30,
    autoPlay: true
  };

  return {
    totalDuration,
    segments: [intro, ...mainSegments, closing],
    settings: {
      pauseBetweenSegments: 1,
      detailLevel: 'standard',
      includeEncouragement: true,
      breathingCues: false
    }
  };
}

/**
 * 提案型アダプター
 * 双方向の型変換を提供
 */
export const suggestionAdapter = {
  /**
   * 既存のSuggestion型からEnhancedSuggestion型への変換
   * 
   * 変換ルール：
   * - 既存のフィールドはそのまま保持
   * - 音声ガイドは自動生成
   * - displayフィールドは既存データから生成
   */
  toEnhanced(suggestion: Suggestion): EnhancedSuggestion {
    return {
      // 既存フィールドの継承
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      duration: suggestion.duration,
      category: suggestion.category,
      steps: suggestion.steps,
      guide: suggestion.guide,
      
      // 拡張フィールドの生成
      displaySteps: suggestion.steps || [
        '快適な場所を見つけてリラックスしましょう',
        `${suggestion.title}を実践します`,
        '効果を感じながら締めくくります'
      ],
      displayGuide: suggestion.guide || suggestion.description,
      
      // 音声ガイドの自動生成
      voiceGuideScript: generateDefaultVoiceGuide(suggestion),
      
      // アクセシビリティ設定（デフォルト値）
      accessibility: {
        hasSubtitles: true,
        keyboardNavigable: true,
        screenReaderOptimized: true
      }
    };
  },

  /**
   * EnhancedSuggestion型から既存コンポーネント用への変換
   * 
   * 変換ルール：
   * - 既存コンポーネントが必要とするフィールドのみ抽出
   * - 拡張フィールドは無視（後方互換性）
   * - null/undefinedの安全な処理
   */
  toDisplay(enhanced: EnhancedSuggestion): Suggestion {
    return {
      id: enhanced.id,
      title: enhanced.title,
      description: enhanced.description,
      duration: enhanced.duration,
      category: enhanced.category,
      steps: enhanced.steps || enhanced.displaySteps,
      guide: enhanced.guide || enhanced.displayGuide
    };
  },

  /**
   * 配列の一括変換（既存→拡張）
   */
  toEnhancedArray(suggestions: Suggestion[]): EnhancedSuggestion[] {
    return suggestions.map(suggestion => this.toEnhanced(suggestion));
  },

  /**
   * 配列の一括変換（拡張→既存）
   */
  toDisplayArray(enhancedSuggestions: EnhancedSuggestion[]): Suggestion[] {
    return enhancedSuggestions.map(enhanced => this.toDisplay(enhanced));
  },

  /**
   * 音声ガイドの有無をチェック
   * 
   * なぜ必要か：
   * - UIで音声機能の表示/非表示を判定
   * - フォールバック処理の判断
   */
  hasVoiceGuide(suggestion: EnhancedSuggestion): boolean {
    return !!(
      suggestion.voiceGuideScript &&
      suggestion.voiceGuideScript.segments &&
      suggestion.voiceGuideScript.segments.length > 0
    );
  },

  /**
   * 音声ガイドの総時間を取得（分）
   */
  getVoiceDuration(suggestion: EnhancedSuggestion): number {
    if (!suggestion.voiceGuideScript) return suggestion.duration;
    return Math.ceil(suggestion.voiceGuideScript.totalDuration / 60);
  },

  /**
   * 提案の互換性チェック
   * 既存UIで表示可能かどうかを判定
   */
  isCompatibleWithLegacyUI(suggestion: EnhancedSuggestion): boolean {
    return !!(
      suggestion.title &&
      suggestion.description &&
      suggestion.duration &&
      suggestion.category
    );
  }
};