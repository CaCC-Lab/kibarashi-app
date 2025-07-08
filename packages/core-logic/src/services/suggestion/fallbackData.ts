import { readFileSync } from 'fs';
import { join } from 'path';
import { Suggestion } from './generator';

// __dirname is available in CommonJS automatically

// Load suggestions data
const suggestionsData = JSON.parse(
  readFileSync(join(__dirname, '../../data/suggestions.json'), 'utf-8')
);

// Load job hunting suggestions data
const jobHuntingSuggestionsData = JSON.parse(
  readFileSync(join(__dirname, '../../data/jobHuntingSuggestions.json'), 'utf-8')
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
  situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
  duration: number,
  ageGroup?: string
): Suggestion[] {
  // 就活・転職活動者の場合は専用の提案を使用
  const isJobHunting = ageGroup === 'job_seeker' || ageGroup === 'career_changer';
  const suggestionSource = isJobHunting ? jobHuntingSuggestionsData : suggestionsData;
  
  // Filter suggestions based on situation and duration
  let filteredSuggestions = suggestionSource.suggestions.filter(
    (suggestion: any) =>
      suggestion.situations.includes(situation) &&
      suggestion.durations.includes(duration)
  );
  
  // 就活・転職活動者の場合、年齢層でさらにフィルタリング
  if (isJobHunting && ageGroup) {
    filteredSuggestions = filteredSuggestions.filter(
      (suggestion: any) => 
        !suggestion.ageGroups || suggestion.ageGroups.includes(ageGroup)
    );
  }

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