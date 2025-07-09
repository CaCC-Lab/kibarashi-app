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
  location?: string,
  skipCache?: boolean
): Promise<SuggestionsResponse> {
  // 強力なキャッシュバスターを実装
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const performanceNow = performance.now();
  
  console.log('🔄 Fetching suggestions with cache-busting:', {
    situation,
    duration,
    ageGroup,
    timestamp,
    randomId,
    performanceNow
  });
  
  // URLパラメータを構築
  const params = new URLSearchParams({
    situation,
    duration: duration.toString(),
    _t: timestamp.toString(),
    _r: randomId,
    _p: performanceNow.toString()
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
  
  // キャッシュスキップフラグ
  if (skipCache) {
    params.set('skipCache', 'true');
  }
  
  const url = `/api/v1/suggestions?${params.toString()}`;
  console.log('📡 API Request URL:', url);
  
  const response = await apiClient.get<SuggestionsResponse>(url, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  
  console.log('📨 API Response:', response);
  
  // 304 Not Modifiedの場合、nullが返される可能性があるため、デフォルトレスポンスを返す
  if (response === null) {
    console.log('📦 304 Not Modified - returning empty suggestions');
    return {
      suggestions: [],
      metadata: {
        situation,
        duration,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return response;
}