import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * APIクライアントのテスト
 *
 * 設計思想：
 * - fetchをモックして、実際のHTTPリクエストを送信せずにテスト
 * - エラーハンドリングの挙動を確認
 * - タイムアウト処理のテスト
 */

// fetchをモック化（client.tsがモジュールトップレベルでAPIクライアントを初期化するため、
// テスト対象のimportより前にモックを設定する必要がある）
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// client.tsを動的インポート
const { apiClient } = await import('./client');

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HTTPメソッドのテスト', () => {
    it('GETリクエストを送信できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok', timestamp: '2024-01-01T00:00:00Z' }),
      });

      const response = await apiClient.get('/health');

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.timestamp).toBeDefined();
    });

    it('POSTリクエストでデータを送信できる', async () => {
      const testData = {
        text: 'テストペイロード',
        options: { foo: 'bar' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const response = await apiClient.post('/api/v1/tts', testData);
      expect(response).toBeDefined();

      // fetchが正しいbodyで呼ばれたことを確認
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].method).toBe('POST');
      expect(callArgs[1].body).toBe(JSON.stringify(testData));
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('存在しないエンドポイントで404エラーを適切に処理する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Not Found' } }),
      });

      try {
        await apiClient.get('/api/v1/nonexistent');
        expect.fail('エラーが発生するはずです');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toBeDefined();
        // 404エラー時のメッセージを検証
        expect(errorMessage).toContain('見つかりません');
      }
    });

    it('ネットワークエラーを適切に処理する', async () => {
      const fetchError = new Error('fetch failed');
      mockFetch.mockRejectedValueOnce(fetchError);

      try {
        await apiClient.get('/health');
        expect.fail('ネットワークエラーが発生するはずです');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('ネットワークエラー');
        expect(errorMessage).toContain('サーバーに接続できません');
        expect(errorMessage).toContain('インターネット接続を確認');
      }
    });
  });

  describe('タイムアウト処理のテスト', () => {
    it('AbortErrorはタイムアウトとして処理される', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      try {
        await apiClient.get('/api/v1/suggestions?situation=workplace&duration=5');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('タイムアウト');
      }
    });
  });

  describe('ヘッダーとオプションのテスト', () => {
    it('Content-Typeヘッダーが正しく設定される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const testData = { test: 'data' };
      await apiClient.post('/api/v1/test', testData);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
    });
  });

  describe('レスポンス処理のテスト', () => {
    it('JSONレスポンスを正しくパースする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok', version: '1.0' }),
      });

      const response = await apiClient.get('/health');
      expect(typeof response).toBe('object');
      expect(response).not.toBe(null);
    });

    it('304レスポンスはnullを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 304,
        json: async () => null,
      });

      const response = await apiClient.get('/health');
      expect(response).toBe(null);
    });
  });
});
