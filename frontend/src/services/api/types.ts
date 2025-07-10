/**
 * API関連の共通型定義
 */

// Suggestion型の定義（他の場所で使用される）
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
  // データソース情報
  dataSource?: 'ai' | 'fallback' | 'cache' | 'error';
  apiKeyIndex?: number;
  responseTime?: number;
}

/**
 * 音声ガイドセグメント（SSML対応）
 */
export interface VoiceSegment {
  id: string;
  type: 'intro' | 'main' | 'transition' | 'encouragement' | 'closing';
  text: string;
  ssml: string;
  duration: number; // 秒
  startTime?: number; // 開始時間（秒）
  autoPlay?: boolean; // 自動再生するか
}

/**
 * 高度な音声ガイドスクリプト
 */
export interface VoiceGuideScript {
  totalDuration: number; // 合計時間（秒）
  segments: VoiceSegment[];
  settings: {
    pauseBetweenSegments: number; // セグメント間のポーズ（秒）
    detailLevel: 'simple' | 'standard' | 'detailed'; // 詳細度
    includeEncouragement: boolean; // 励ましの言葉を含むか
    breathingCues: boolean; // 呼吸指示を含むか
  };
}

/**
 * 拡張された提案（音声ガイド対応）
 */
export interface EnhancedSuggestion extends Suggestion {
  // 画面表示用（簡潔）
  displaySteps: string[]; // 画面表示用の簡潔なステップ
  displayGuide: string; // 画面表示用の簡潔なガイド

  // 音声ガイド用（詳細）
  voiceGuideScript: VoiceGuideScript;
  
  // メタデータ
  accessibility: {
    hasSubtitles: boolean; // 字幕対応
    keyboardNavigable: boolean; // キーボード操作対応
    screenReaderOptimized: boolean; // スクリーンリーダー最適化
  };
}

// 状況タイプ
export type Situation = 'workplace' | 'home' | 'outside';

// 時間タイプ
export type Duration = 5 | 15 | 30;

// API レスポンス型
export interface SuggestionsResponse {
  suggestions: Suggestion[];
  metadata: {
    situation: string;
    duration: number;
    timestamp: string;
  };
}

/**
 * 拡張提案APIレスポンス
 */
export interface EnhancedSuggestionsResponse {
  suggestions: EnhancedSuggestion[];
  metadata: {
    situation: string;
    duration: number;
    ageGroup: string;
    detailLevel: 'simple' | 'standard' | 'detailed';
    includeVoiceGuide: boolean;
    timestamp: string;
    voiceGuideInfo: {
      available: boolean;
      totalSegments: number;
      totalDuration: number; // 秒
    };
  };
}

export interface TTSRequest {
  text: string;
  voiceSettings?: {
    gender?: 'MALE' | 'FEMALE';
    speed?: number;
  };
}

export interface TTSResponse {
  audioContent: string;
  metadata: {
    contentType: string;
    size: number;
  };
}