// 提案軸（season / part_of_day / day_type / temperature_band / weather）の計算
// 仕様: docs/specs/suggestion-axes-extension.md

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy';
export type TemperatureBand = 'cold' | 'cool' | 'mild' | 'warm' | 'hot';
export type PartOfDay = 'morning' | 'daytime' | 'evening' | 'night';
export type DayType = 'weekday' | 'weekend';
export type Mood = 'tired' | 'anxious' | 'irritated' | 'lonely' | 'bored' | 'sad' | 'calm';

export interface ContextAxes {
  season?: Season;
  weather?: Weather;
  temperatureBand?: TemperatureBand;
  partOfDay?: PartOfDay;
  dayType?: DayType;
  mood?: Mood;
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
  const d = date.getDay();
  // 祝日判定は Phase 2 で japanese-holidays 等を導入予定
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
