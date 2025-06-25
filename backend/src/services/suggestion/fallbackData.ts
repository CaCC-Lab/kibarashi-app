import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Suggestion } from './generator';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load suggestions data
const suggestionsData = JSON.parse(
  readFileSync(join(__dirname, '../../data/suggestions.json'), 'utf-8')
);

// Fisher-Yatesシャッフルアルゴリズムの実装
// なぜ必要か：Math.random() - 0.5を使ったソートは完全にランダムではなく、
// 偏りが生じるため、より公平なシャッフルアルゴリズムを使用
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getFallbackSuggestions(
  situation: 'workplace' | 'home' | 'outside',
  duration: number
): Suggestion[] {
  // Filter suggestions based on situation and duration
  const filteredSuggestions = suggestionsData.suggestions.filter(
    (suggestion: any) =>
      suggestion.situations.includes(situation) &&
      suggestion.durations.includes(duration)
  );

  // 選択肢が少ない場合の警告ログ
  if (filteredSuggestions.length < 5) {
    console.warn(`Limited suggestions available for ${situation} - ${duration}min: only ${filteredSuggestions.length} options`);
  }

  // Fisher-Yatesアルゴリズムでシャッフル
  const shuffled = fisherYatesShuffle(filteredSuggestions);
  
  // 最大3つを選択（利用可能な数が少ない場合はすべて返す）
  const selected = shuffled.slice(0, Math.min(3, shuffled.length));

  // Map to the expected format
  return selected.map((suggestion: any) => ({
    id: `${suggestion.id}-${Date.now()}-${Math.random()}`, // より一意性の高いIDを生成
    title: suggestion.title,
    description: suggestion.description,
    duration: duration,
    category: suggestion.category === 'cognitive' ? '認知的' : '行動的' as '認知的' | '行動的',
    steps: suggestion.guide[duration.toString()]?.split('。').filter((s: string) => s.trim()).map((s: string) => s.trim() + '。') || [],
    guide: suggestion.guide[duration.toString()] || '', // Add guide field
  }));
}