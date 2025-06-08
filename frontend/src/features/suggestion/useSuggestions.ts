import { useState, useEffect, useCallback } from 'react';
import { fetchSuggestions } from '../../services/api/suggestions';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
}

export const useSuggestions = (
  situation: 'workplace' | 'home' | 'outside',
  duration: 5 | 15 | 30
) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSuggestions(situation, duration);
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [situation, duration]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    suggestions,
    loading,
    error,
    refetch: fetchData,
  };
};