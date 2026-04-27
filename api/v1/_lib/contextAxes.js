// 文脈軸の値域検証・axes 組み立て・キャッシュキー生成を v1/v2 で共有するモジュール。
// 重複を排除し、enum が片方だけ増える事故を防ぐ。
//
// 使い方:
//   const { buildAxes, buildAxisKey } = require('./contextAxes');
//   const axes = buildAxes({ season, weather, ... });  // CONTEXT_AXES_ENABLED=false なら {}
//   const axisKey = buildAxisKey(axes);                 // mood はハッシュ化
//
// 仕様: docs/specs/suggestion-axes-extension.md

const crypto = require('crypto');

const VALID = {
  season: ['spring', 'summer', 'autumn', 'winter'],
  weather: ['sunny', 'cloudy', 'rainy', 'snowy'],
  temperature_band: ['cold', 'cool', 'mild', 'warm', 'hot'],
  part_of_day: ['morning', 'daytime', 'evening', 'night'],
  day_type: ['weekday', 'weekend', 'holiday'],
  mood: ['tired', 'anxious', 'irritated', 'lonely', 'bored', 'sad', 'calm'],
  intent: ['activating', 'calming', 'mindful', 'problem_solving'],
  seasonal_events: ['rainy_season', 'gw', 'obon', 'year_end_new_year', 'fiscal_year_change', 'pollen_high', 'heat_wave'],
};

/**
 * raw クエリパラメータから正規化された axes を組み立てる。
 * CONTEXT_AXES_ENABLED=false のときは {} を返す（キャッシュキーも分断しない）。
 *
 * @param {Object} input - キー: season/weather/temperatureBand/partOfDay/dayType/mood
 * @returns {Object} DB カラム名キー (snake_case) の axes オブジェクト
 */
function buildAxes(input = {}) {
  if (process.env.CONTEXT_AXES_ENABLED !== 'true') return {};
  const pick = (col, val) => (VALID[col].includes(val) ? val : undefined);
  return {
    season: pick('season', input.season),
    weather: pick('weather', input.weather),
    temperature_band: pick('temperature_band', input.temperatureBand),
    part_of_day: pick('part_of_day', input.partOfDay),
    day_type: pick('day_type', input.dayType),
    mood: pick('mood', input.mood),
    intent: pick('intent', input.intent),
    seasonal_events: pick('seasonal_events', input.seasonalEvent),
  };
}

/**
 * axes からキャッシュキー用の文字列を生成する。
 * mood は心理情報のため生値を出さず、SHA-256 の先頭8文字でハッシュ化する
 * （cache.js が console.log で key を平文出力するため）。
 *
 * @param {Object} axes - buildAxes() の戻り値
 * @returns {string} "col=val&..." 形式、axes が空なら空文字
 */
function buildAxisKey(axes) {
  const entries = Object.entries(axes || {}).filter(([, v]) => Boolean(v));
  if (entries.length === 0) return '';
  return entries
    .map(([k, v]) => {
      if (k === 'mood') {
        const digest = crypto.createHash('sha256').update(String(v)).digest('hex').slice(0, 8);
        return `mood=h:${digest}`;
      }
      return `${k}=${v}`;
    })
    .sort()
    .join('&');
}

module.exports = { VALID, buildAxes, buildAxisKey };
