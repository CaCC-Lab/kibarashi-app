/**
 * 拡張提案APIクライアントのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEnhancedSuggestions, submitSuggestionFeedback, generateCacheKey } from './enhancedSuggestions';
import { apiClient } from './client';

// APIクライアントをモック
vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: {
      baseURL: 'http://localhost:8080/api/v1'
    }
  }
}));

describe('Enhanced Suggestions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // コンソール出力をモック
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('getEnhancedSuggestions', () => {
    const mockResponse = {
      data: {
        suggestions: [
          {
            id: 'test-1',
            title: 'テスト提案',
            description: 'テスト説明',
            duration: 5,
            category: '認知的',
            displaySteps: ['ステップ1', 'ステップ2'],
            displayGuide: 'ガイド',
            voiceGuideScript: {
              totalDuration: 300,
              segments: [],
              settings: {
                pauseBetweenSegments: 1,
                detailLevel: 'standard',
                includeEncouragement: true,
                breathingCues: false
              }
            },
            accessibility: {
              hasSubtitles: true,
              keyboardNavigable: true,
              screenReaderOptimized: true
            }
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          ageGroup: 'office_worker',
          detailLevel: 'standard',
          includeVoiceGuide: true,
          timestamp: new Date().toISOString(),
          voiceGuideInfo: {
            available: true,
            totalSegments: 3,
            totalDuration: 300
          }
        }
      }
    };

    it('正常なレスポンスを処理する', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await getEnhancedSuggestions({
        situation: 'workplace',
        duration: 5
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/enhanced-suggestions?')
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('すべてのパラメータを正しく送信する', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      await getEnhancedSuggestions({
        situation: 'home',
        duration: 15,
        ageGroup: 'student',
        detailLevel: 'detailed',
        includeVoiceGuide: false
      });

      const callArg = vi.mocked(apiClient.get).mock.calls[0][0];
      expect(callArg).toContain('situation=home');
      expect(callArg).toContain('duration=15');
      expect(callArg).toContain('ageGroup=student');
      expect(callArg).toContain('detailLevel=detailed');
      expect(callArg).toContain('includeVoiceGuide=false');
    });

    it('エラー時に適切なエラーオブジェクトを投げる', async () => {
      const networkError = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(networkError);

      await expect(getEnhancedSuggestions({
        situation: 'workplace',
        duration: 5
      })).rejects.toMatchObject({
        message: '音声ガイド付き提案の取得に失敗しました',
        fallbackAction: '通常の提案を表示',
        originalError: networkError
      });
    });

    it('不正なレスポンス形式を検出する', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { invalid: 'response' }
      });

      await expect(getEnhancedSuggestions({
        situation: 'workplace',
        duration: 5
      })).rejects.toMatchObject({
        message: '音声ガイド付き提案の取得に失敗しました',
        fallbackAction: '通常の提案を表示',
        originalError: expect.any(Error)
      });
    });
  });

  describe('submitSuggestionFeedback', () => {
    it('フィードバックを正しく送信する', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      const feedback = {
        suggestionId: 'test-1',
        rating: 5,
        helpful: true,
        completed: true,
        voiceGuideUsed: true,
        detailLevel: 'standard' as const
      };

      await submitSuggestionFeedback(feedback);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/enhanced-suggestions/test-1/feedback',
        feedback
      );
    });

    it('フィードバック送信エラーを静かに処理する', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      const feedback = {
        suggestionId: 'test-1',
        rating: 3,
        helpful: false,
        completed: false
      };

      // エラーを投げずに完了する
      await expect(submitSuggestionFeedback(feedback)).resolves.toBeUndefined();
      
      // 警告のみ出力
      expect(console.warn).toHaveBeenCalledWith(
        'Feedback submission failed:',
        expect.any(Error)
      );
    });
  });

  describe('generateCacheKey', () => {
    it('パラメータからキャッシュキーを生成する', () => {
      const key = generateCacheKey({
        situation: 'workplace',
        duration: 5,
        ageGroup: 'office_worker',
        detailLevel: 'standard'
      });

      expect(key).toBe('enhanced-suggestions-workplace-5-office_worker-standard');
    });

    it('オプションパラメータがundefinedでもキーを生成する', () => {
      const key = generateCacheKey({
        situation: 'home',
        duration: 15
      });

      expect(key).toBe('enhanced-suggestions-home-15-undefined-undefined');
    });
  });
});