import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Suggestion } from './generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load suggestions data
const suggestionsData = JSON.parse(
  readFileSync(join(__dirname, '../../data/suggestions.json'), 'utf-8')
);

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

  // Shuffle and pick suggestions
  const shuffled = [...filteredSuggestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(10, shuffled.length)); // Get more than 3 for variety

  // Map to the expected format
  return selected.map((suggestion: any) => ({
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    duration: duration,
    category: suggestion.category === 'cognitive' ? '認知的' : '行動的' as '認知的' | '行動的',
    steps: suggestion.guide[duration.toString()]?.split('。').filter((s: string) => s.trim()).map((s: string) => s.trim() + '。') || [],
    guide: suggestion.guide[duration.toString()] || '', // Add guide field
  }));
}