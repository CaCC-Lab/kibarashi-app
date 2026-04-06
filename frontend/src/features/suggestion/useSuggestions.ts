import { useState, useCallback, useRef } from 'react';
import { fetchSuggestions, Suggestion } from '../../services/api/suggestions';
import { SituationId } from '../../types/situation';
import { AgeGroup } from '../../types/ageGroup';
import { fallbackSuggestions } from './fallbackSuggestions';

const API_TIMEOUT = 8000; // 8秒

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
    location?: string,
    skipCache?: boolean
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    console.log('🚀 Starting fetchSuggestions with params:', {
      situation,
      duration,
      ageGroup,
      studentContext,
      location,
      skipCache,
    });

    setSuggestions([]);
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT)
      );

      const fetchPromise = fetchSuggestions(
        situation,
        duration,
        ageGroup,
        studentContext,
        location,
        skipCache
      );

      const data = await Promise.race([fetchPromise, timeoutPromise]) as {
        suggestions: Array<{
          id: string;
          title: string;
          description: string;
          category: string;
          duration: number;
          steps?: string[];
        }>;
      };
      
      console.log('✅ API Response received:', data);

      if (!abortController.signal.aborted) {
        console.log('📝 Setting suggestions to state:', data.suggestions);
        const typed = data.suggestions.map((s) => ({
          ...s,
          category: (s.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
        })) as Suggestion[];
        setSuggestions(typed);
        console.log('✅ Suggestions set successfully. Count:', data.suggestions.length);
      }
    } catch (err) {
      console.error('❌ Error in fetchSuggestions:', err);

      if (!abortController.signal.aborted) {
        if (err instanceof Error && (err.message === 'API timeout' || !navigator.onLine)) {
          setError('通信環境が不安定なため、代わりの提案を表示します。');
          // フォールバック提案にメタデータを追加
          const fallbackResponse = {
            suggestions: fallbackSuggestions,
            metadata: {
              source: 'fallback' as const,
              reason: err.message === 'API timeout' ? 'タイムアウト' : 'オフライン',
              timestamp: new Date().toISOString()
            }
          };
          setSuggestions(fallbackResponse.suggestions);
        } else {
          setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
          // エラー時もフォールバック提案にメタデータを追加
          const fallbackResponse = {
            suggestions: fallbackSuggestions,
            metadata: {
              source: 'fallback' as const,
              reason: 'APIエラー',
              timestamp: new Date().toISOString()
            }
          };
          setSuggestions(fallbackResponse.suggestions);
        }
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