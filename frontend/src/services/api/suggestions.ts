import { apiClient } from './client';
import { SuggestionsResponse } from './types';

// Suggestion型を他のファイルから使用できるように再エクスポート
export type { Suggestion } from './types';

// SuggestionsResponse は types.ts からインポート済み

export async function fetchSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: 5 | 15 | 30
): Promise<SuggestionsResponse> {
  // キャッシュバスターとしてタイムスタンプを追加
  const timestamp = Date.now();
  const response = await apiClient.get<SuggestionsResponse>(
    `/api/v1/suggestions?situation=${situation}&duration=${duration}&_t=${timestamp}`
  );
  
  return response;
}