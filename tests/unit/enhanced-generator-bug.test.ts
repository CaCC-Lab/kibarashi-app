import { test, expect, describe } from '@jest/globals';
import { generateEnhancedSuggestions } from '../../packages/core-logic/src/services/suggestion/enhancedGenerator';

describe('Enhanced Generator Bug Fix', () => {
  test('should handle studying situation with student ageGroup and location without crashing', async () => {
    // このテストは現在失敗するはず - 500エラーの再現
    // パラメータは実際のAPIリクエストと同じもの
    const situation = 'studying';
    const duration = 5;
    const ageGroup = 'student';
    const studentContext = undefined;
    const jobHuntingContext = undefined;
    const location = 'Tokyo';

    // GEMINI_API_KEYが設定されていない状況でのテスト
    // (フォールバック処理を確実に実行するため)
    const originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      // この呼び出しが500エラーを引き起こす原因
      const result = await generateEnhancedSuggestions(
        situation,
        duration,
        ageGroup,
        studentContext,
        jobHuntingContext,
        location
      );

      // 修正後はここに到達するはず
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);

      // 各提案の基本構造をチェック
      result.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration', duration);
        expect(suggestion).toHaveProperty('category');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });

    } finally {
      // 環境変数を復元
      if (originalApiKey) {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    }
  });

  test('should handle all valid situations with fallback data', async () => {
    const originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const validSituations = ['workplace', 'home', 'outside', 'studying', 'school', 'commuting', 'job_hunting'];
      const duration = 5;
      const ageGroup = 'student';

      for (const situation of validSituations) {
        const result = await generateEnhancedSuggestions(
          situation,
          duration,
          ageGroup,
          undefined,
          undefined,
          'Tokyo'
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      }
    } finally {
      if (originalApiKey) {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    }
  });
});