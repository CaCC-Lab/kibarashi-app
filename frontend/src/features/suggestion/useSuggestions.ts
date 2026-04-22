import { useState, useCallback, useRef } from 'react';
import { fetchSuggestions, Suggestion } from '../../services/api/suggestions';
import { SituationId } from '../../types/situation';
import { AgeGroup } from '../../types/ageGroup';
import { fallbackSuggestions } from './fallbackSuggestions';
import { ContextAxes } from '../../utils/contextAxes';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '120000');

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
    skipCache?: boolean,
    axes?: ContextAxes & { mood?: string }
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
        skipCache,
        axes
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
      
      if (!abortController.signal.aborted) {
        const typed = data.suggestions.map((s) => ({
          ...s,
          category: (s.category === '認知的' ? '認知的' : '行動的') as '認知的' | '行動的',
        })) as Suggestion[];
        setSuggestions(typed);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const apiUrl = import.meta.env.VITE_API_URL || '(未設定→origin)';
      console.error('❌ Error in fetchSuggestions:', errMsg, 'API_URL:', apiUrl);

      if (!abortController.signal.aborted) {
        if (err instanceof Error && (err.message === 'API timeout' || !navigator.onLine)) {
          setError('通信環境が不安定なため、代わりの提案を表示します。');
          setSuggestions(fallbackSuggestions);
        } else {
          // デバッグ用: エラー詳細とAPI URLを表示
          const debugInfo = import.meta.env.DEV || import.meta.env.VITE_BUILD_TARGET === 'capacitor'
            ? `\n[DEBUG] ${errMsg}\n[API] ${apiUrl}`
            : '';
          setError(`気晴らし方法の取得に失敗しました。${debugInfo}`);
          setSuggestions(fallbackSuggestions);
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