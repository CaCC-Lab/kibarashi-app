// 提案軸（season / part_of_day / day_type / temperature_band / weather / mood / intent）の計算
// 仕様: docs/specs/suggestion-axes-extension.md
import { isHoliday } from 'japanese-holidays';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy';
export type TemperatureBand = 'cold' | 'cool' | 'mild' | 'warm' | 'hot';
export type PartOfDay = 'morning' | 'daytime' | 'evening' | 'night';
export type DayType = 'weekday' | 'weekend' | 'holiday';
export type Mood = 'tired' | 'anxious' | 'irritated' | 'lonely' | 'bored' | 'sad' | 'calm';
export type Intent = 'activating' | 'calming' | 'mindful' | 'problem_solving';

export interface ContextAxes {
  season?: Season;
  weather?: Weather;
  temperatureBand?: TemperatureBand;
  partOfDay?: PartOfDay;
  dayType?: DayType;
  mood?: Mood;
  intent?: Intent;
}

export function getSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

export function getPartOfDay(date: Date = new Date()): PartOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'daytime';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function getDayType(date: Date = new Date()): DayType {
  // 祝日（振替休日含む）が最優先
  if (isHoliday(date)) return 'holiday';
  const d = date.getDay();
  return d === 0 || d === 6 ? 'weekend' : 'weekday';
}

export function getTemperatureBand(celsius: number | undefined | null): TemperatureBand | undefined {
  if (typeof celsius !== 'number' || Number.isNaN(celsius)) return undefined;
  if (celsius < 10) return 'cold';
  if (celsius < 17) return 'cool';
  if (celsius < 23) return 'mild';
  if (celsius < 28) return 'warm';
  return 'hot';
}

export function normalizeWeatherCondition(condition: string | undefined | null): Weather | undefined {
  if (condition === 'sunny' || condition === 'cloudy' || condition === 'rainy' || condition === 'snowy') {
    return condition;
  }
  return undefined;
}

// HomeMood の MoodId（'tired' | 'foggy' | 'anxious' | 'bored'）を DB 側 Mood enum に変換。
// 'foggy'（モヤモヤ）は DB に対応値が無いため 'tired' にマップ（低エネルギー系として近い）。
export function mapHomeMoodToAxis(mood: string | null | undefined): Mood | undefined {
  if (!mood) return undefined;
  if (mood === 'tired' || mood === 'anxious' || mood === 'bored') return mood;
  if (mood === 'foggy') return 'tired';
  return undefined;
}

export function computeContextAxes(params: {
  now?: Date;
  weatherCondition?: string | null;
  temperature?: number | null;
}): ContextAxes {
  const now = params.now ?? new Date();
  return {
    season: getSeason(now),
    partOfDay: getPartOfDay(now),
    dayType: getDayType(now),
    weather: normalizeWeatherCondition(params.weatherCondition ?? undefined),
    temperatureBand: getTemperatureBand(params.temperature ?? undefined),
  };
}
