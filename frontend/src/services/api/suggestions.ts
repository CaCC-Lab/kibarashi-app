import { apiClient } from './client';
import { Suggestion } from '../../features/suggestion/useSuggestions';

interface SuggestionsResponse {
  suggestions: Suggestion[];
  metadata: {
    situation: string;
    duration: number;
    timestamp: string;
  };
}

export async function fetchSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: 5 | 15 | 30
): Promise<SuggestionsResponse> {
  const response = await apiClient.get<SuggestionsResponse>(
    `/suggestions?situation=${situation}&duration=${duration}`
  );
  
  return response;
}