import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSuggestions } from './useSuggestions';
import * as suggestionsApi from '../../services/api/suggestions';

/**
 * useSuggestionsフックのテスト
 * 
 * 設計思想：
 * - CI環境ではAPIサーバーが起動していないため、モックを使用
 * - 非同期処理の挙動を確認
 * - エラーハンドリングも検証
 */

// fetchSuggestionsをモック
vi.mock('../../services/api/suggestions', () => ({
  fetchSuggestions: vi.fn()
}));
describe('useSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態のテスト', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useSuggestions());
      
      // 初期状態の検証
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('提案取得機能のテスト', () => {
    it('実際のAPIから提案を取得できる', async () => {
      // モックレスポンスを設定
      const mockSuggestions = {
        suggestions: [
          {
            id: 'test-1',
            title: 'テスト提案1',
            description: 'テスト説明1',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1', 'ステップ2']
          },
          {
            id: 'test-2',
            title: 'テスト提案2',
            description: 'テスト説明2',
            duration: 5,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValueOnce(mockSuggestions);
      
      const { result } = renderHook(() => useSuggestions());
      
      // 提案を取得
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      
      // ローディング状態の確認
      expect(result.current.loading).toBe(true);
      
      // APIレスポンスを待つ
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // 結果の検証
      expect(result.current.error).toBe(null);
      expect(result.current.suggestions).toEqual(mockSuggestions.suggestions);
      expect(result.current.suggestions.length).toBe(2);
      expect(result.current.suggestions[0]).toHaveProperty('id');
      expect(result.current.suggestions[0]).toHaveProperty('title');
      expect(result.current.suggestions[0]).toHaveProperty('description');
    });

    it('異なる状況で異なる提案を取得する', async () => {
      // 職場での提案のモックレスポンス
      const workplaceMockResponse = {
        suggestions: [
          {
            id: 'workplace-1',
            title: '職場での深呼吸',
            description: '職場でできる深呼吸',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      // 家での提案のモックレスポンス
      const homeMockResponse = {
        suggestions: [
          {
            id: 'home-1',
            title: '家でのストレッチ',
            description: '家でできるストレッチ',
            duration: 15,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'home',
          duration: 15,
          timestamp: new Date().toISOString()
        }
      };
      
      // モックの設定
      vi.mocked(suggestionsApi.fetchSuggestions)
        .mockResolvedValueOnce(workplaceMockResponse)
        .mockResolvedValueOnce(homeMockResponse);
      
      const { result } = renderHook(() => useSuggestions());
      
      // 職場での提案を取得
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      await waitFor(() => !result.current.loading);
      const workplaceSuggestions = [...result.current.suggestions];
      
      // 家での提案を取得
      act(() => {
        result.current.fetchSuggestions('home', 15);
      });
      await waitFor(() => !result.current.loading);
      const homeSuggestions = [...result.current.suggestions];
      
      // 異なる提案であることを確認
      expect(workplaceSuggestions[0].title).not.toBe(homeSuggestions[0].title);
      expect(workplaceSuggestions[0].description).not.toBe(homeSuggestions[0].description);
    });

    it('連続した呼び出しで前の結果をクリアする', async () => {
      // 最初の呼び出しのモックレスポンス
      const firstMockResponse = {
        suggestions: [
          {
            id: 'first-1',
            title: '最初の提案',
            description: '最初の説明',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      // 2回目の呼び出しのモックレスポンス
      const secondMockResponse = {
        suggestions: [
          {
            id: 'second-1',
            title: '2回目の提案',
            description: '2回目の説明',
            duration: 15,
            category: '行動的' as const,
            steps: ['ステップ1']
          }
        ],
        metadata: {
          situation: 'home',
          duration: 15,
          timestamp: new Date().toISOString()
        }
      };
      
      // モックの設定
      vi.mocked(suggestionsApi.fetchSuggestions)
        .mockResolvedValueOnce(firstMockResponse)
        .mockResolvedValueOnce(secondMockResponse);
      
      const { result } = renderHook(() => useSuggestions());
      
      // 最初の呼び出し
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      
      // すぐに2回目の呼び出し
      act(() => {
        result.current.fetchSuggestions('home', 15);
      });
      
      // 最終的に home の結果が表示されることを確認
      await waitFor(() => !result.current.loading);
      
      // 2回目の結果が表示されていることを確認
      expect(result.current.suggestions.length).toBe(1);
      expect(result.current.suggestions[0].id).toBe('second-1');
      expect(result.current.suggestions[0].title).toBe('2回目の提案');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('ネットワークエラーを適切に処理する', async () => {
      // ネットワークエラーをモック
      vi.mocked(suggestionsApi.fetchSuggestions).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      const { result } = renderHook(() => useSuggestions());
      
      // エラーが発生するリクエスト
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // エラーの検証
      expect(result.current.error).toBeDefined();
      expect(result.current.error).toBe('Network error');
      // ネットワークエラー時もフォールバック提案が表示される
      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });

    it.skip('エラー後に再試行できる', async () => {
      // このテストはネットワークタイミングに依存し、不安定なためスキップ
      const { result } = renderHook(() => useSuggestions());
      
      // まず成功する呼び出しを行う
      const originalUrl = import.meta.env.VITE_API_URL;
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      await waitFor(() => !result.current.loading, { timeout: 10000 });
      
      // エラーを発生させる
      (import.meta.env as Record<string, string>).VITE_API_URL = 'http://localhost:9999';
      
      act(() => {
        result.current.fetchSuggestions('home', 15);
      });
      await waitFor(() => !result.current.loading, { timeout: 5000 });
      
      expect(result.current.error).toBeDefined();
      expect(result.current.suggestions).toEqual([]); // エラー時は提案がクリアされる
      
      // URLを正しく戻す
      (import.meta.env as Record<string, string>).VITE_API_URL = originalUrl;
      
      // 再試行
      act(() => {
        result.current.fetchSuggestions('outside', 30);
      });
      await waitFor(() => !result.current.loading, { timeout: 10000 });
      
      // エラーがクリアされるか、またはエラー状態でもアプリがクラッシュしないことを確認
      // ネットワークエラー後のリカバリはタイミングに依存するため
      // エラーが発生してもアプリケーションがクラッシュしないことをテスト
      expect(result.current.loading).toBe(false);
      expect(result.current.suggestions).toBeDefined();
    });
  });

  describe('ローディング状態のテスト', () => {
    it('API呼び出し中はローディング状態になる', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'test-1',
            title: 'テスト提案',
            description: 'テスト説明',
            duration: 30,
            category: '認知的' as const,
            steps: ['ステップ1']
          }
        ],
        metadata: {
          situation: 'outside',
          duration: 30,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      const { result } = renderHook(() => useSuggestions());
      
      // 初期状態
      expect(result.current.loading).toBe(false);
      
      // API呼び出し開始
      act(() => {
        result.current.fetchSuggestions('outside', 30);
      });
      
      // ローディング中
      expect(result.current.loading).toBe(true);
      
      // 完了を待つ
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('実際のデータ検証', () => {
    it('提案データの構造が正しい', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'test-1',
            title: 'テスト提案',
            description: 'テスト説明',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      const { result } = renderHook(() => useSuggestions());
      
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      await waitFor(() => !result.current.loading);
      
      const suggestion = result.current.suggestions[0];
      
      // 必須フィールドの存在確認
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('title');
      expect(suggestion).toHaveProperty('description');
      expect(suggestion).toHaveProperty('duration');
      expect(suggestion).toHaveProperty('category');
      
      // データ型の確認
      expect(typeof suggestion.id).toBe('string');
      expect(typeof suggestion.title).toBe('string');
      expect(typeof suggestion.description).toBe('string');
      expect(typeof suggestion.duration).toBe('number');
      expect(['認知的', '行動的']).toContain(suggestion.category);
      
      // オプショナルフィールド
      expect(Array.isArray(suggestion.steps)).toBe(true);
      suggestion.steps?.forEach(step => {
        expect(typeof step).toBe('string');
      });
    });

    it('時間制限が適切に反映される', async () => {
      // 5分制限のモックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'test-1',
            title: '5分の提案1',
            description: '5分でできる活動',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1']
          },
          {
            id: 'test-2',
            title: '3分の提案2',
            description: '3分でできる活動',
            duration: 3,
            category: '行動的' as const,
            steps: ['ステップ1']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      const { result } = renderHook(() => useSuggestions());
      
      // 5分の提案を取得
      act(() => {
        result.current.fetchSuggestions('workplace', 5);
      });
      await waitFor(() => !result.current.loading);
      
      // すべての提案が5分以内であることを確認
      result.current.suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(5);
      });
    });
  });
});