import { useState, useCallback, useRef } from 'react';
import { fetchSuggestions } from '../../services/api/suggestions';
import { SituationId } from '../../types/situation';
import { AgeGroup } from '../../types/ageGroup';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
}

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestionsHandler = useCallback(async (
    situation: SituationId,
    duration: 5 | 15 | 30,
    ageGroup?: AgeGroup,
    studentContext?: { concern?: string; subject?: string },
    location?: string
  ) => {
    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSuggestions(situation, duration, ageGroup, studentContext, location);
      console.log('API Response:', data); // デバッグログ追加
      
      // リクエストがキャンセルされていない場合のみ状態を更新
      if (!abortController.signal.aborted) {
        console.log('Setting suggestions:', data.suggestions); // デバッグログ追加
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      // リクエストがキャンセルされた場合はエラーを無視
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        setSuggestions([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions: fetchSuggestionsHandler,
  };
};