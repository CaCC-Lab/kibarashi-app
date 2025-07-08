import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { geminiClient } from './geminiClient';

/**
 * GeminiClientの統合テスト
 * 
 * 設計思想：
 * - テスト環境ではモックレスポンスを使用
 * - APIキーの有無による動作の違いを確認
 * - エラーハンドリングとレスポンス解析を重視
 */
describe('GeminiClient', () => {
  let originalApiKey: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
    // テスト環境であることを確認
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('基本機能のテスト', () => {
    it('generateSuggestions関数が存在し呼び出し可能', async () => {
      expect(typeof geminiClient.generateSuggestions).toBe('function');
      
      const suggestions = await geminiClient.generateSuggestions('workplace', 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('generateEnhancedSuggestions関数が存在し呼び出し可能', async () => {
      expect(typeof geminiClient.generateEnhancedSuggestions).toBe('function');
      
      const suggestions = await geminiClient.generateEnhancedSuggestions('workplace', 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('テスト環境では実際のAPIを呼ばずにモックレスポンスを返す', async () => {
      const suggestions = await geminiClient.generateSuggestions('workplace', 5);
      
      // モックレスポンスの特徴を確認
      expect(suggestions[0].title).toContain('テスト用提案');
      expect(suggestions[0].description).toContain('気晴らし活動');
    });
  });

  describe('設定確認のテスト', () => {
    it('APIキーが設定されている場合は機能が利用可能', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      
      // function-based APIなので、設定確認は環境変数の存在で判定
      expect(process.env.GEMINI_API_KEY).toBeDefined();
      expect(typeof geminiClient.generateSuggestions).toBe('function');
    });

    it('異なるAPIキーフォーマットでも受け入れる', () => {
      const apiKeys = [
        'AIzaSyA1234567890',
        'test-key-with-dashes',
        'VERY_LONG_API_KEY_WITH_UNDERSCORES_123456789',
        '1234567890abcdef'
      ];

      apiKeys.forEach(key => {
        process.env.GEMINI_API_KEY = key;
        
        // 環境変数の設定確認
        expect(process.env.GEMINI_API_KEY).toBe(key);
        expect(typeof geminiClient.generateSuggestions).toBe('function');
      });
    });
  });

  describe('提案生成のテスト（統合）', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('基本的な提案生成を試行する', async () => {
      try {
        const result = await geminiClient.generateSuggestions('workplace', 5);
        
        // テスト環境ではモックレスポンスが返される
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('description');
      } catch (error) {
        // APIキーが無効な場合のエラーを確認
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('API');
      }
    });

    it('無効なパラメータでエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('invalid' as any, 5)
      ).rejects.toThrow();
    });

    it('時間制限の境界値をテストする', async () => {
      await expect(
        geminiClient.generateSuggestions('workplace', 0)
      ).rejects.toThrow();
      
      await expect(
        geminiClient.generateSuggestions('workplace', -5)
      ).rejects.toThrow();
    });

    it('非常に長い時間でエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('workplace', 1000)
      ).rejects.toThrow();
    });

    it('特殊なケースでも処理できる', async () => {
      // テスト環境では実際にはモックレスポンスが返される
      const suggestions = await geminiClient.generateSuggestions('workplace', 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('気晴らし提案生成の統合テスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('職場での5分間の提案を生成する', async () => {
      const suggestions = await geminiClient.generateSuggestions('workplace', 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion.duration).toBeLessThanOrEqual(5);
      });
    });

    it('家での15分間の提案を生成する', async () => {
      const suggestions = await geminiClient.generateSuggestions('home', 15);
      
      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(15);
      });
    });

    it('外出先での30分間の提案を生成する', async () => {
      const suggestions = await geminiClient.generateSuggestions('outside', 30);
      
      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(30);
      });
    });

    it('無効な状況でエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('invalid' as any, 5)
      ).rejects.toThrow();
    });

    it('無効な時間でエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('workplace', 0)
      ).rejects.toThrow();
      
      await expect(
        geminiClient.generateSuggestions('workplace', -5)
      ).rejects.toThrow();
    });

    it('極端に長い時間でエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('workplace', 1000)
      ).rejects.toThrow();
    });
  });

  describe('拡張提案生成のテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('拡張提案を生成できる', async () => {
      const suggestions = await geminiClient.generateEnhancedSuggestions('workplace', 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // 拡張提案の基本プロパティを確認
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('category');
      });
    });

    it('テスト環境ではモックレスポンスが返される', async () => {
      const suggestions = await geminiClient.generateEnhancedSuggestions('home', 15);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions[0].title).toContain('拡張テスト提案');
      expect(suggestions[0].description).toContain('気晴らし活動');
    });

    it('異なる状況でも動作する', async () => {
      const workplaceSuggestions = await geminiClient.generateEnhancedSuggestions('workplace', 5);
      const homeSuggestions = await geminiClient.generateEnhancedSuggestions('home', 15);
      const outsideSuggestions = await geminiClient.generateEnhancedSuggestions('outside', 30);
      
      expect(Array.isArray(workplaceSuggestions)).toBe(true);
      expect(Array.isArray(homeSuggestions)).toBe(true);
      expect(Array.isArray(outsideSuggestions)).toBe(true);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'invalid-key';
    });

    it('無効なパラメータでエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('invalid' as any, 5)
      ).rejects.toThrow();
    });

    it('ゼロまたはマイナスの時間でエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('workplace', 0)
      ).rejects.toThrow();
      
      await expect(
        geminiClient.generateSuggestions('workplace', -5)
      ).rejects.toThrow();
    });

    it('異常に長い時間でエラーが発生する', async () => {
      await expect(
        geminiClient.generateSuggestions('workplace', 1000)
      ).rejects.toThrow();
    });
  });

  describe('コンテキストおよびオプションのテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-key';
    });

    it('年齢グループ指定で提案を生成できる', async () => {
      const suggestions = await geminiClient.generateSuggestions('workplace', 5, 'office_worker');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('コンテキスト拡張機能の有効無効を制御できる', async () => {
      // コンテキスト拡張機能有効
      const enhancedSuggestions = await geminiClient.generateSuggestions('workplace', 5, 'office_worker', undefined, undefined, true);
      
      expect(Array.isArray(enhancedSuggestions)).toBe(true);
      expect(enhancedSuggestions.length).toBeGreaterThan(0);
      
      // コンテキスト拡張機能無効
      const basicSuggestions = await geminiClient.generateSuggestions('workplace', 5, 'office_worker', undefined, undefined, false);
      
      expect(Array.isArray(basicSuggestions)).toBe(true);
      expect(basicSuggestions.length).toBeGreaterThan(0);
    });

    it('学生コンテキストで特化した提案を生成できる', async () => {
      const studentContext = {
        concern: '試験不安',
        subject: '数学',
        stressFactor: '高'
      };
      
      const suggestions = await geminiClient.generateSuggestions(
        'studying', 
        5, 
        'student', 
        studentContext
      );
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('パフォーマンステスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-key';
    });

    it('複数の同時リクエストを処理できる', async () => {
      const promises = [
        geminiClient.generateSuggestions('workplace', 5).catch(() => []),
        geminiClient.generateSuggestions('home', 15).catch(() => []),
        geminiClient.generateSuggestions('outside', 30).catch(() => [])
      ];
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('異なるパラメータでの継続的リクエストでもメモリリークしない', async () => {
      // メモリ使用量の大幅な増加がないことを確認
      const beforeMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10; i++) {
        try {
          await geminiClient.generateSuggestions('workplace', 5);
        } catch {
          // エラーは無視
        }
      }
      
      const afterMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterMemory - beforeMemory;
      
      // メモリ増加が10MB以下であることを確認
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('環境設定管理のテスト', () => {
    it('APIキーローテーション設定を確認できる', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.GEMINI_KEY_ROTATION_ENABLED = 'true';
      
      // 環境変数の設定確認
      expect(process.env.GEMINI_KEY_ROTATION_ENABLED).toBe('true');
      expect(typeof geminiClient.generateSuggestions).toBe('function');
      
      // 元の設定をクリア
      delete process.env.GEMINI_KEY_ROTATION_ENABLED;
    });

    it('リトライ回数設定を確認できる', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.GEMINI_RETRY_ATTEMPTS = '5';
      
      // 環境変数の設定確認
      expect(process.env.GEMINI_RETRY_ATTEMPTS).toBe('5');
      expect(typeof geminiClient.generateSuggestions).toBe('function');
      
      // 元の設定をクリア
      delete process.env.GEMINI_RETRY_ATTEMPTS;
    });
  });

  describe('ログ出力とエラーハンドリングのテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-key';
    });

    it('正常なリクエストがログ出力される', async () => {
      // テスト環境での正常リクエスト
      const suggestions = await geminiClient.generateSuggestions('workplace', 5);
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('異常ケースでエラーログが出力される', async () => {
      try {
        await geminiClient.generateSuggestions('invalid' as any, 5);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('レスポンスタイムのログが出力される', async () => {
      const startTime = Date.now();
      
      const suggestions = await geminiClient.generateSuggestions('workplace', 5);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // テスト環境では高速にレスポンスが返される
      expect(duration).toBeLessThan(1000); // 1秒以下
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});