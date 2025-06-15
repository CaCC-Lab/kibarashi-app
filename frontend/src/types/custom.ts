/**
 * カスタム気晴らしの型定義
 * 
 * 設計思想：
 * - ユーザーが独自の気晴らし方法を登録・管理できる機能
 * - Suggestionインターフェースと互換性を保ち、既存の実行機能を流用
 * - シンプルな入力フォームで手軽に登録可能
 */

export interface CustomSuggestion {
  id: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number; // 分
  steps?: string[]; // ガイドステップ
  createdAt: string; // ISO 8601形式
  updatedAt?: string; // ISO 8601形式
  isCustom: true; // カスタム気晴らしであることを示すフラグ
}

export interface CustomSuggestionData {
  customs: CustomSuggestion[];
  lastUpdated: string;
}

export interface CustomSuggestionFormData {
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number;
  steps: string[];
}

export interface CustomSuggestionValidation {
  title?: string;
  description?: string;
  duration?: string;
  steps?: string;
}