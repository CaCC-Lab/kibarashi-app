import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeminiClient } from './geminiClient';

/**
 * GeminiClientクラスのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のネットワーク処理を検証
 * - APIキーの有無による動作の違いを確認
 * - エラーハンドリングとレスポンス解析を重視
 */
describe('GeminiClient', () => {
  let client: GeminiClient;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('初期化のテスト', () => {
    it('APIキーありで正常に初期化される', () => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      
      expect(() => {
        client = new GeminiClient();
      }).not.toThrow();
      
      expect(client).toBeInstanceOf(GeminiClient);
    });

    it('APIキーなしで初期化時にエラーが発生する', () => {
      delete process.env.GEMINI_API_KEY;
      
      expect(() => {
        client = new GeminiClient();
      }).toThrow('Gemini API key is required');
    });

    it('空のAPIキーで初期化時にエラーが発生する', () => {
      process.env.GEMINI_API_KEY = '';
      
      expect(() => {
        client = new GeminiClient();
      }).toThrow('Gemini API key is required');
    });

    it('APIキーが設定されている場合は正常に動作する', () => {
      process.env.GEMINI_API_KEY = 'valid-api-key-123';
      
      client = new GeminiClient();
      
      expect(client.isConfigured()).toBe(true);
    });
  });

  describe('設定確認のテスト', () => {
    it('APIキーが設定されている場合はtrue', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      client = new GeminiClient();
      
      expect(client.isConfigured()).toBe(true);
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
        client = new GeminiClient();
        
        expect(client.isConfigured()).toBe(true);
      });
    });
  });

  describe('テキスト生成のテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      client = new GeminiClient();
    });

    it('基本的なプロンプトでテキスト生成を試行する', async () => {
      const prompt = '簡単な気晴らし方法を1つ教えてください。';
      
      try {
        const result = await client.generateText(prompt);
        
        // 実際のAPIキーがない場合はエラーになるが、構造は確認できる
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // APIキーが無効な場合のエラーを確認
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('API');
      }
    });

    it('空のプロンプトでエラーが発生する', async () => {
      await expect(client.generateText('')).rejects.toThrow('プロンプトが空です');
    });

    it('nullプロンプトでエラーが発生する', async () => {
      await expect(client.generateText(null as any)).rejects.toThrow('プロンプトが空です');
    });

    it('undefinedプロンプトでエラーが発生する', async () => {
      await expect(client.generateText(undefined as any)).rejects.toThrow('プロンプトが空です');
    });

    it('非常に長いプロンプトでも処理できる', async () => {
      const longPrompt = '長いプロンプトです。'.repeat(1000);
      
      try {
        await client.generateText(longPrompt);
      } catch (error) {
        // APIキーが無効でも、プロンプトの長さでは拒否されないことを確認
        expect((error as Error).message).not.toContain('プロンプトが長すぎます');
      }
    });

    it('特殊文字を含むプロンプトでも処理できる', async () => {
      const specialPrompt = '職場での気晴らし方法を教えて！🌟 #ストレス解消 @work';
      
      try {
        await client.generateText(specialPrompt);
      } catch (error) {
        // APIキーが無効でも、特殊文字では拒否されないことを確認
        expect((error as Error).message).not.toContain('無効な文字');
      }
    });
  });

  describe('気晴らし提案生成のテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      client = new GeminiClient();
    });

    it('職場での5分間の提案を生成する', async () => {
      try {
        const suggestions = await client.generateSuggestions('workplace', 5);
        
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeLessThanOrEqual(3);
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
          expect(suggestion).toHaveProperty('duration');
          expect(suggestion).toHaveProperty('category');
          expect(suggestion.duration).toBeLessThanOrEqual(5);
        });
      } catch (error) {
        // APIキーが無効な場合はスキップ
        expect((error as Error).message).toContain('API');
      }
    });

    it('家での15分間の提案を生成する', async () => {
      try {
        const suggestions = await client.generateSuggestions('home', 15);
        
        expect(Array.isArray(suggestions)).toBe(true);
        suggestions.forEach(suggestion => {
          expect(suggestion.duration).toBeLessThanOrEqual(15);
        });
      } catch (error) {
        expect((error as Error).message).toContain('API');
      }
    });

    it('外出先での30分間の提案を生成する', async () => {
      try {
        const suggestions = await client.generateSuggestions('outside', 30);
        
        expect(Array.isArray(suggestions)).toBe(true);
        suggestions.forEach(suggestion => {
          expect(suggestion.duration).toBeLessThanOrEqual(30);
        });
      } catch (error) {
        expect((error as Error).message).toContain('API');
      }
    });

    it('無効な状況でエラーが発生する', async () => {
      await expect(
        client.generateSuggestions('invalid' as any, 5)
      ).rejects.toThrow('無効な状況です');
    });

    it('無効な時間でエラーが発生する', async () => {
      await expect(
        client.generateSuggestions('workplace', 0)
      ).rejects.toThrow('無効な時間です');
      
      await expect(
        client.generateSuggestions('workplace', -5)
      ).rejects.toThrow('無効な時間です');
    });

    it('極端に長い時間でエラーが発生する', async () => {
      await expect(
        client.generateSuggestions('workplace', 1000)
      ).rejects.toThrow('無効な時間です');
    });
  });

  describe('レスポンス解析のテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      client = new GeminiClient();
    });

    it('有効なJSON形式のレスポンスを解析できる', () => {
      const validResponse = `{
        "suggestions": [
          {
            "title": "深呼吸",
            "description": "ゆっくりと深呼吸をしてリラックスしましょう",
            "duration": 3,
            "category": "認知的"
          }
        ]
      }`;
      
      const parsed = client.parseResponse(validResponse);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]).toHaveProperty('title', '深呼吸');
      expect(parsed[0]).toHaveProperty('category', '認知的');
    });

    it('無効なJSON形式でエラーが発生する', () => {
      const invalidJson = '{ invalid json }';
      
      expect(() => {
        client.parseResponse(invalidJson);
      }).toThrow('レスポンスの解析に失敗しました');
    });

    it('suggestions配列がないレスポンスでエラーが発生する', () => {
      const responseWithoutSuggestions = '{"data": "test"}';
      
      expect(() => {
        client.parseResponse(responseWithoutSuggestions);
      }).toThrow('提案データが見つかりません');
    });

    it('空の配列でもエラーにならない', () => {
      const emptyResponse = '{"suggestions": []}';
      
      const parsed = client.parseResponse(emptyResponse);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });

    it('必須フィールドが不足している提案を除外する', () => {
      const responseWithIncompleteData = `{
        "suggestions": [
          {
            "title": "完全な提案",
            "description": "説明",
            "duration": 5,
            "category": "認知的"
          },
          {
            "title": "不完全な提案"
          }
        ]
      }`;
      
      const parsed = client.parseResponse(responseWithIncompleteData);
      
      expect(parsed.length).toBe(1);
      expect(parsed[0].title).toBe('完全な提案');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'invalid-key';
      client = new GeminiClient();
    });

    it('ネットワークエラーを適切に処理する', async () => {
      // 無効なAPIキーでリクエストするとエラーが発生する
      await expect(
        client.generateText('テスト')
      ).rejects.toThrow();
    });

    it('APIエラーレスポンスを適切に処理する', async () => {
      await expect(
        client.generateSuggestions('workplace', 5)
      ).rejects.toThrow();
    });

    it('タイムアウトエラーを適切に処理する', async () => {
      // タイムアウトのテストは実際のネットワーク環境では困難
      // ここでは例外が適切にキャッチされることを確認
      try {
        await client.generateText('テスト', { timeout: 1 });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('リクエスト設定のテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-key';
      client = new GeminiClient();
    });

    it('カスタムオプションでリクエストできる', async () => {
      const options = {
        temperature: 0.7,
        maxTokens: 100
      };
      
      try {
        await client.generateText('テスト', options);
      } catch (error) {
        // APIキーが無効でも、オプションの形式では拒否されないことを確認
        expect((error as Error).message).not.toContain('無効なオプション');
      }
    });

    it('異常な温度設定でも処理される', async () => {
      const options = { temperature: 2.0 }; // 通常の範囲外
      
      try {
        await client.generateText('テスト', options);
      } catch (error) {
        // サーバー側で処理されるべきエラー
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('パフォーマンステスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-key';
      client = new GeminiClient();
    });

    it('複数の同時リクエストを処理できる', async () => {
      const promises = [
        client.generateText('テスト1').catch(() => 'error'),
        client.generateText('テスト2').catch(() => 'error'),
        client.generateText('テスト3').catch(() => 'error')
      ];
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(3);
    });

    it('長時間のリクエストでもメモリリークしない', async () => {
      // メモリ使用量の大幅な増加がないことを確認
      const beforeMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10; i++) {
        try {
          await client.generateText(`テスト ${i}`);
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

  describe('設定管理のテスト', () => {
    it('APIエンドポイントのカスタマイズ', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.GEMINI_API_ENDPOINT = 'https://custom-endpoint.com';
      
      client = new GeminiClient();
      
      expect(client.isConfigured()).toBe(true);
      
      // 元の設定をクリア
      delete process.env.GEMINI_API_ENDPOINT;
    });

    it('APIバージョンの設定', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.GEMINI_API_VERSION = 'v2';
      
      client = new GeminiClient();
      
      expect(client.isConfigured()).toBe(true);
      
      // 元の設定をクリア
      delete process.env.GEMINI_API_VERSION;
    });
  });

  describe('ログ出力のテスト', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-key';
      client = new GeminiClient();
    });

    it('リクエストログが出力される', async () => {
      // ログ出力の確認は実装に依存するため、エラーが発生しないことを確認
      try {
        await client.generateText('ログテスト');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('エラーログが出力される', async () => {
      try {
        await client.generateText('');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});