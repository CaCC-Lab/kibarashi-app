import { describe, it, expect } from 'vitest';
import {
  getSeason,
  getPartOfDay,
  getDayType,
  getTemperatureBand,
  normalizeWeatherCondition,
  computeContextAxes,
  mapHomeMoodToAxis,
} from './contextAxes';

describe('contextAxes', () => {
  describe('getSeason', () => {
    it.each([
      [new Date(2026, 2, 15), 'spring'], // March
      [new Date(2026, 4, 1), 'spring'],  // May
      [new Date(2026, 5, 1), 'summer'],  // June
      [new Date(2026, 7, 31), 'summer'], // August
      [new Date(2026, 8, 1), 'autumn'],  // September
      [new Date(2026, 10, 30), 'autumn'], // November
      [new Date(2026, 11, 1), 'winter'], // December
      [new Date(2026, 1, 28), 'winter'], // February
    ])('%s → %s', (date, expected) => {
      expect(getSeason(date)).toBe(expected);
    });
  });

  describe('getPartOfDay', () => {
    it.each([
      [5, 'morning'],
      [10, 'morning'],
      [11, 'daytime'],
      [16, 'daytime'],
      [17, 'evening'],
      [20, 'evening'],
      [21, 'night'],
      [3, 'night'],
    ])('hour %d → %s', (hour, expected) => {
      const d = new Date(2026, 5, 1, hour, 30);
      expect(getPartOfDay(d)).toBe(expected);
    });
  });

  describe('getDayType', () => {
    it('日曜は weekend', () => expect(getDayType(new Date(2026, 3, 19))).toBe('weekend'));
    it('土曜は weekend', () => expect(getDayType(new Date(2026, 3, 18))).toBe('weekend'));
    it('月曜は weekday', () => expect(getDayType(new Date(2026, 3, 20))).toBe('weekday'));
    it('金曜は weekday', () => expect(getDayType(new Date(2026, 3, 17))).toBe('weekday'));
  });

  describe('getTemperatureBand', () => {
    it.each([
      [-5, 'cold'],
      [9.9, 'cold'],
      [10, 'cool'],
      [16, 'cool'],
      [17, 'mild'],
      [22, 'mild'],
      [23, 'warm'],
      [27.9, 'warm'],
      [28, 'hot'],
      [35, 'hot'],
    ])('%d°C → %s', (t, expected) => {
      expect(getTemperatureBand(t)).toBe(expected);
    });

    it('undefined なら undefined', () => expect(getTemperatureBand(undefined)).toBeUndefined());
    it('NaN なら undefined', () => expect(getTemperatureBand(NaN)).toBeUndefined());
  });

  describe('normalizeWeatherCondition', () => {
    it.each([['sunny'], ['cloudy'], ['rainy'], ['snowy']])('%s はそのまま', (c) => {
      expect(normalizeWeatherCondition(c)).toBe(c);
    });
    it('unknown は undefined', () => expect(normalizeWeatherCondition('unknown')).toBeUndefined());
    it('null/undefined は undefined', () => {
      expect(normalizeWeatherCondition(null)).toBeUndefined();
      expect(normalizeWeatherCondition(undefined)).toBeUndefined();
    });
  });

  describe('mapHomeMoodToAxis', () => {
    it.each([
      ['tired', 'tired'],
      ['anxious', 'anxious'],
      ['bored', 'bored'],
    ])('HomeMoodの %s はそのまま DB Mood に通る', (input, expected) => {
      expect(mapHomeMoodToAxis(input)).toBe(expected);
    });

    it('foggy は tired にマップ（モヤモヤ≒疲れ）', () => {
      expect(mapHomeMoodToAxis('foggy')).toBe('tired');
    });

    it('null/undefined/空文字は undefined', () => {
      expect(mapHomeMoodToAxis(null)).toBeUndefined();
      expect(mapHomeMoodToAxis(undefined)).toBeUndefined();
      expect(mapHomeMoodToAxis('')).toBeUndefined();
    });

    it('未知の値は undefined', () => {
      expect(mapHomeMoodToAxis('unknown')).toBeUndefined();
      expect(mapHomeMoodToAxis('happy')).toBeUndefined();
    });
  });

  describe('computeContextAxes', () => {
    it('weather/temperature なしでも season / partOfDay / dayType は入る', () => {
      const result = computeContextAxes({ now: new Date(2026, 3, 20, 14) });
      expect(result.season).toBe('spring');
      expect(result.partOfDay).toBe('daytime');
      expect(result.dayType).toBe('weekday');
      expect(result.weather).toBeUndefined();
      expect(result.temperatureBand).toBeUndefined();
    });

    it('weather/temperature があれば全軸が埋まる', () => {
      const result = computeContextAxes({
        now: new Date(2026, 6, 19, 10), // 2026-07-19(日) 10時
        weatherCondition: 'sunny',
        temperature: 30,
      });
      expect(result).toEqual({
        season: 'summer',
        partOfDay: 'morning',
        dayType: 'weekend',
        weather: 'sunny',
        temperatureBand: 'hot',
      });
    });
  });
});
