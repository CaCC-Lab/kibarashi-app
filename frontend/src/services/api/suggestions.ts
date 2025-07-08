import { apiClient } from './client';
import { SuggestionsResponse } from './types';
import { SituationId } from '../../types/situation';
import { AgeGroup } from '../../types/ageGroup';

// Suggestion型を他のファイルから使用できるように再エクスポート
export type { Suggestion } from './types';

// SuggestionsResponse は types.ts からインポート済み

export async function fetchSuggestions(
  situation: SituationId,
  duration: 5 | 15 | 30,
  ageGroup?: AgeGroup,
  studentContext?: { concern?: string; subject?: string },
  location?: string
): Promise<SuggestionsResponse> {
  // キャッシュバスターとしてタイムスタンプを追加
  const timestamp = Date.now();
  
  // URLパラメータを構築
  const params = new URLSearchParams({
    situation,
    duration: duration.toString(),
    _t: timestamp.toString()
  });
  
  // 年齢層が指定されている場合は追加
  if (ageGroup) {
    params.set('ageGroup', ageGroup);
  }
  
  // 場所が指定されている場合は追加
  if (location) {
    params.set('location', location);
  }
  
  // 学生向けコンテキストが指定されている場合は追加
  if (studentContext) {
    if (studentContext.concern) {
      params.set('studentConcern', studentContext.concern);
    }
    if (studentContext.subject) {
      params.set('studentSubject', studentContext.subject);
    }
  }
  
  const response = await apiClient.get<SuggestionsResponse>(
    `/api/v1/suggestions?${params.toString()}`
  );
  
  return response;
}