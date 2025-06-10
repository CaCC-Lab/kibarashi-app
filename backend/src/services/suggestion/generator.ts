import { logger } from '../../utils/logger.js';
import { getFallbackSuggestions } from './fallbackData.js';
import { geminiClient } from '../gemini/geminiClient.js';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  guide?: string;
}

export async function generateSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: number
): Promise<Suggestion[]> {
  try {
    // Gemini APIが有効な場合は使用
    if (process.env.GEMINI_API_KEY) {
      logger.info('Generating suggestions with Gemini API', { situation, duration });
      const suggestions = await geminiClient.generateSuggestions(situation, duration);
      return suggestions.slice(0, 3);
    }
    
    // APIキーがない場合はフォールバック
    logger.info('Using fallback suggestions (Gemini API key not configured)');
    const suggestions = getFallbackSuggestions(situation, duration);
    return suggestions.slice(0, 3);
  } catch (error) {
    logger.error('Error generating suggestions, falling back to static data:', error);
    // エラー時もフォールバックデータを返す
    return getFallbackSuggestions(situation, duration).slice(0, 3);
  }
}