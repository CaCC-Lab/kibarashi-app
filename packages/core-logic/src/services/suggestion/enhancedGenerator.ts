/**
 * 拡張提案生成サービス
 * 従来のSuggestionインターフェースを拡張し、音声ガイド対応を追加
 */

import { logger } from '../../utils/logger';
import { getFallbackSuggestions } from './fallbackData';
import { geminiClient } from '../gemini/geminiClient';
import { EnhancedSuggestionGenerator } from './enhancedSuggestionGenerator.js';

// 拡張提案のデータ構造（後方互換性を保持）
export interface EnhancedSuggestion {
  // 従来のSuggestionフィールド（後方互換性）
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
  
  // 拡張フィールド（新機能）
  displaySteps: string[];
  displayGuide: string;
  voiceGuideScript: {
    totalDuration: number;
    segments: Array<{
      id: string;
      type: 'intro' | 'main' | 'transition' | 'encouragement' | 'closing';
      text: string;
      ssml: string;
      duration: number;
      startTime?: number;
      autoPlay?: boolean;
    }>;
    settings: {
      pauseBetweenSegments: number;
      detailLevel: 'simple' | 'standard' | 'detailed';
      includeEncouragement: boolean;
      breathingCues: boolean;
    };
  };
  accessibility: {
    hasSubtitles: boolean;
    keyboardNavigable: boolean;
    screenReaderOptimized: boolean;
  };
}

/**
 * 拡張気晴らし提案を生成する機能
 * 
 * 設計思想：
 * 1. 既存のgenerateS uggestions関数との完全な互換性を保持
 * 2. 音声ガイド機能を段階的に導入可能
 * 3. エラー時のフォールバック機能を強化
 * 
 * 音声ガイドの特徴：
 * - 画面表示用と音声用でコンテンツを分離
 * - SSML対応で自然な音声読み上げ
 * - セグメント分割で部分再生対応
 * - 詳細度を選択可能（simple/standard/detailed）
 * 
 * 後方互換性：
 * - 従来のsteps, guideフィールドを保持
 * - 新フィールドは追加のみ、既存APIに影響なし
 * 
 * @param situation - ユーザーの現在の場所
 * @param duration - 希望する気晴らし時間
 * @param options - 拡張オプション（音声設定など）
 * @returns 3つの拡張気晴らし提案の配列
 */
export async function generateEnhancedSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: number,
  options: {
    ageGroup?: string;
    detailLevel?: 'simple' | 'standard' | 'detailed';
    includeVoiceGuide?: boolean;
  } = {}
): Promise<EnhancedSuggestion[]> {
  const { ageGroup = 'office_worker', detailLevel = 'standard', includeVoiceGuide = true } = options;
  
  try {
    // ステップ1: Gemini APIの有効性を確認
    if (process.env.GEMINI_API_KEY && includeVoiceGuide) {
      logger.info('Generating enhanced suggestions with Gemini API', { 
        situation, 
        duration, 
        ageGroup,
        detailLevel 
      });
      
      // ステップ2: AIを使って拡張提案を生成
      const enhancedSuggestions = await geminiClient.generateEnhancedSuggestions(
        situation, 
        duration, 
        ageGroup
      );
      
      // ステップ3: 必ず3つの提案を返す
      const limitedSuggestions = enhancedSuggestions.slice(0, 3);
      
      // ステップ4: 詳細度の調整
      return limitedSuggestions.map(suggestion => adjustDetailLevel(suggestion, detailLevel));
    }
    
    // APIキーが設定されていない場合または音声ガイドが不要な場合
    logger.info('Using enhanced fallback suggestions', {
      situation,
      duration,
      reason: !process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY not configured' : 'Voice guide disabled',
      includeVoiceGuide
    });
    
    return await generateEnhancedFallback(situation, duration, detailLevel);
    
  } catch (error) {
    // エラーハンドリング：AI生成が失敗してもサービスを継続
    logger.error('Error generating enhanced suggestions, falling back to enhanced static data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      situation,
      duration,
      ageGroup,
      detailLevel
    });
    
    // 拡張フォールバックデータを使用
    return await generateEnhancedFallback(situation, duration, detailLevel);
  }
}

/**
 * 拡張フォールバック提案を生成
 * 従来のフォールバックデータを拡張形式に変換
 */
async function generateEnhancedFallback(
  situation: 'workplace' | 'home' | 'outside',
  duration: number,
  detailLevel: 'simple' | 'standard' | 'detailed'
): Promise<EnhancedSuggestion[]> {
  // 従来のフォールバックデータを取得
  const fallbackSuggestions = getFallbackSuggestions(situation, duration);
  
  // 拡張提案ジェネレーターを使用して音声ガイドを生成
  const enhancedGenerator = new EnhancedSuggestionGenerator();
  
  return fallbackSuggestions.slice(0, 3).map((suggestion) => {
    // 従来の提案データを拡張形式用のデータに変換
    const enhancedData = {
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      duration: suggestion.duration,
      category: suggestion.category,
      displaySteps: suggestion.steps || [
        '快適な場所を見つける',
        '深呼吸でリラックス',
        '効果を実感する'
      ],
      displayGuide: suggestion.guide || 'ゆっくりと実践し、心地よいペースで行いましょう',
      detailedSteps: [
        `${suggestion.title}を始めるため、まず快適な姿勢を取ります。背筋を伸ばし、肩の力を抜いて、自然にリラックスしましょう`,
        `ゆっくりと呼吸を整えながら、${suggestion.description}の効果を感じていきます。自分のペースで行うことが大切です`,
        `最後に深呼吸をして、心身の変化を感じてみましょう。リラックスできた感覚を味わってください`
      ],
      breathingInstructions: [
        '鼻からゆっくりと4秒かけて息を吸い込みます',
        '4秒間息を止めて、体の感覚を意識します',
        '口からゆっくりと6秒かけて息を吐き出します'
      ],
      encouragementPhases: [
        'とても良い調子です。このまま続けましょう',
        'リラックスできていますね。心地よいペースで進めてください',
        'あと少しです。効果を実感できているでしょうか'
      ],
      timingCues: duration === 5 ? [
        '開始から1分経過：深呼吸を意識しましょう',
        '中間地点：体の緊張が解けているのを感じてください',
        '終了30秒前：徐々に現実に意識を戻していきましょう'
      ] : duration === 15 ? [
        '開始から3分経過：深呼吸を意識しましょう',
        '5分経過：体の緊張をチェックして、力を抜きましょう',
        '10分経過：心の変化を感じてみてください',
        '終了1分前：徐々に現実に意識を戻していきましょう'
      ] : [
        '開始から5分経過：深呼吸を意識しましょう',
        '10分経過：体の緊張をチェックして、力を抜きましょう',
        '15分経過：心の変化を感じてみてください',
        '20分経過：リラックス効果を実感してください',
        '終了2分前：徐々に現実に意識を戻していきましょう'
      ]
    };
    
    // 音声ガイドスクリプトを生成
    const voiceGuideScript = enhancedGenerator.generateVoiceGuideScript(enhancedData, detailLevel);
    
    // 拡張提案オブジェクトを構築
    return {
      // 従来フィールド（後方互換性）
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      duration: suggestion.duration,
      category: suggestion.category,
      steps: suggestion.steps,
      guide: suggestion.guide,
      
      // 拡張フィールド
      displaySteps: enhancedData.displaySteps,
      displayGuide: enhancedData.displayGuide,
      voiceGuideScript,
      accessibility: {
        hasSubtitles: true,
        keyboardNavigable: true,
        screenReaderOptimized: true
      }
    };
  });
}

/**
 * 提案の詳細度を調整
 */
function adjustDetailLevel(
  suggestion: any, 
  detailLevel: 'simple' | 'standard' | 'detailed'
): EnhancedSuggestion {
  // 詳細度に応じて音声ガイドの設定を調整
  if (suggestion.voiceGuideScript) {
    suggestion.voiceGuideScript.settings.detailLevel = detailLevel;
    suggestion.voiceGuideScript.settings.includeEncouragement = detailLevel !== 'simple';
    suggestion.voiceGuideScript.settings.pauseBetweenSegments = detailLevel === 'detailed' ? 2 : 1;
    
    // シンプルモードでは励ましセグメントを除去
    if (detailLevel === 'simple') {
      suggestion.voiceGuideScript.segments = suggestion.voiceGuideScript.segments.filter(
        (segment: any) => segment.type !== 'encouragement'
      );
    }
  }
  
  return suggestion;
}

/**
 * 拡張提案から従来の提案形式に変換（後方互換性）
 */
export function toLegacySuggestion(enhancedSuggestion: EnhancedSuggestion): any {
  return {
    id: enhancedSuggestion.id,
    title: enhancedSuggestion.title,
    description: enhancedSuggestion.description,
    duration: enhancedSuggestion.duration,
    category: enhancedSuggestion.category,
    steps: enhancedSuggestion.steps || enhancedSuggestion.displaySteps,
    guide: enhancedSuggestion.guide || enhancedSuggestion.displayGuide
  };
}