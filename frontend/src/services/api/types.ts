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