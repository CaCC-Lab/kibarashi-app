import { logger } from '../../utils/logger.js';
import { getFallbackSuggestions } from './fallbackData.js';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
}

export async function generateSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: number
): Promise<Suggestion[]> {
  try {
    // TODO: Gemini APIを使用した提案生成
    // 現時点ではフォールバックデータを使用
    logger.info('Using fallback suggestions (Gemini API not yet implemented)');
    
    const suggestions = getFallbackSuggestions(situation, duration);
    
    // 3つの提案を返す
    return suggestions.slice(0, 3);
  } catch (error) {
    logger.error('Error generating suggestions:', error);
    // エラー時もフォールバックデータを返す
    return getFallbackSuggestions(situation, duration).slice(0, 3);
  }
}