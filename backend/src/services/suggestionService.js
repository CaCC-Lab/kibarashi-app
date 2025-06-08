import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load suggestions data
const suggestionsData = JSON.parse(
  readFileSync(join(__dirname, '../data/suggestions.json'), 'utf-8')
);

/**
 * Get suggestions based on situation and duration
 * @param {string} situation - 'workplace', 'home', or 'outside'
 * @param {number} duration - 5, 15, or 30 (minutes)
 * @returns {Array} Array of 3 suggestions
 */
export function getSuggestions(situation, duration) {
  // Filter suggestions based on situation and duration
  const filteredSuggestions = suggestionsData.suggestions.filter(
    (suggestion) =>
      suggestion.situations.includes(situation) &&
      suggestion.durations.includes(duration)
  );

  // Shuffle and pick 3 suggestions
  const shuffled = [...filteredSuggestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  // Format the response
  return selected.map((suggestion) => ({
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    category: suggestion.category,
    subcategory: suggestion.subcategory,
    guide: suggestion.guide[duration.toString()],
    estimatedTime: duration,
    audioAvailable: false, // Will be true when TTS is integrated
  }));
}

/**
 * Get a specific suggestion by ID
 * @param {string} id - Suggestion ID
 * @returns {Object|null} Suggestion object or null if not found
 */
export function getSuggestionById(id) {
  return suggestionsData.suggestions.find((s) => s.id === id) || null;
}

/**
 * Get all available situations
 * @returns {Array} Array of situation objects
 */
export function getAvailableSituations() {
  return [
    { id: 'workplace', label: '職場', description: 'オフィスや仕事場で' },
    { id: 'home', label: '家', description: '自宅でリラックス' },
    { id: 'outside', label: '外出先', description: '外出中や移動中に' },
  ];
}

/**
 * Get all available durations
 * @returns {Array} Array of duration objects
 */
export function getAvailableDurations() {
  return [
    { id: 5, label: '5分', description: 'ちょっとした気分転換に' },
    { id: 15, label: '15分', description: 'しっかりリフレッシュ' },
    { id: 30, label: '30分', description: 'じっくり気晴らし' },
  ];
}