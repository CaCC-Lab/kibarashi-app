const assert = require('node:assert/strict');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { buildAxes, buildAxisKey } = require('./contextAxes');

describe('contextAxes shared module', () => {
  const origEnabled = process.env.CONTEXT_AXES_ENABLED;

  beforeEach(() => {
    process.env.CONTEXT_AXES_ENABLED = 'true';
  });

  afterEach(() => {
    if (origEnabled === undefined) delete process.env.CONTEXT_AXES_ENABLED;
    else process.env.CONTEXT_AXES_ENABLED = origEnabled;
  });

  describe('buildAxes', () => {
    it('CONTEXT_AXES_ENABLED=false のときは {} を返す', () => {
      process.env.CONTEXT_AXES_ENABLED = 'false';
      assert.deepEqual(buildAxes({ season: 'spring', mood: 'tired' }), {});
    });

    it('正しい値は採用、不正値は undefined に落ちる', () => {
      const axes = buildAxes({
        season: 'spring',
        weather: 'rainy',
        temperatureBand: 'mild',
        partOfDay: 'morning',
        dayType: 'weekday',
        mood: 'tired',
      });
      assert.equal(axes.season, 'spring');
      assert.equal(axes.weather, 'rainy');
      assert.equal(axes.temperature_band, 'mild');
      assert.equal(axes.part_of_day, 'morning');
      assert.equal(axes.day_type, 'weekday');
      assert.equal(axes.mood, 'tired');
    });

    it('不正値は undefined', () => {
      const axes = buildAxes({ season: 'invalid', mood: 'happy' });
      assert.equal(axes.season, undefined);
      assert.equal(axes.mood, undefined);
    });

    it('camelCase 入力を snake_case キーに変換する', () => {
      const axes = buildAxes({ temperatureBand: 'hot', partOfDay: 'night', dayType: 'weekend' });
      assert.equal(axes.temperature_band, 'hot');
      assert.equal(axes.part_of_day, 'night');
      assert.equal(axes.day_type, 'weekend');
    });
  });

  describe('buildAxisKey', () => {
    it('空 axes は空文字', () => {
      assert.equal(buildAxisKey({}), '');
      assert.equal(buildAxisKey({ season: undefined }), '');
    });

    it('キー順はアルファベット順で安定', () => {
      const k = buildAxisKey({ weather: 'sunny', season: 'spring', day_type: 'weekday' });
      assert.equal(k, 'day_type=weekday&season=spring&weather=sunny');
    });

    it('mood は sha256 先頭8文字でハッシュ化され、生値を含まない', () => {
      const k = buildAxisKey({ mood: 'tired' });
      assert.match(k, /^mood=h:[a-f0-9]{8}$/);
      assert.ok(!k.includes('tired'), 'mood の生値が含まれてはいけない');
    });

    it('同じ mood は同じハッシュ（キャッシュヒット可能）', () => {
      const a = buildAxisKey({ mood: 'anxious' });
      const b = buildAxisKey({ mood: 'anxious' });
      assert.equal(a, b);
    });

    it('異なる mood は異なるハッシュ', () => {
      const a = buildAxisKey({ mood: 'tired' });
      const b = buildAxisKey({ mood: 'anxious' });
      assert.notEqual(a, b);
    });
  });
});
