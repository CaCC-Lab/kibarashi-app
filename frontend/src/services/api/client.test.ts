import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './client';

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('正常なレスポンスを処理する', async () => {
      const mockData = { message: 'Success' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('HTTPエラーを処理する', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Not Found' } }),
      } as Response);

      await expect(apiClient.get('/test')).rejects.toThrow('Not Found');
    });

    it('ネットワークエラーを処理する', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    it('タイムアウトを処理する', async () => {
      // AbortErrorを即座にスロー
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      vi.mocked(fetch).mockRejectedValue(abortError);

      await expect(apiClient.get('/test', { timeout: 50 })).rejects.toThrow('リクエストがタイムアウトしました');
    });
  });

  describe('post', () => {
    it('正常なJSONレスポンスを処理する', async () => {
      const mockData = { id: 1, name: 'Test' };
      const postData = { name: 'Test' };
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await apiClient.post('/test', postData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('Blobレスポンスを処理する', async () => {
      const mockBlob = new Blob(['test'], { type: 'audio/mpeg' });
      const postData = { text: 'Test' };
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const result = await apiClient.post('/test', postData, { responseType: 'blob' });

      expect(result).toBeInstanceOf(Blob);
    });

    it('HTTPエラーを処理する', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad Request' } }),
      } as Response);

      await expect(apiClient.post('/test', {})).rejects.toThrow('Bad Request');
    });
  });
});