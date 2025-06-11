import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSuggestions } from './useSuggestions';

// APIクライアントのモック
vi.mock('../../services/api/suggestions', () => ({
  fetchSuggestions: vi.fn()
}));

import { fetchSuggestions } from '../../services/api/suggestions';

describe('useSuggestions', () => {
  const mockSuggestions = [
    {
      id: '1',
      title: 'テスト提案1',
      description: 'テスト説明1',
      duration: 5,
      category: 'cognitive' as const,
      guide: 'ガイド1'
    },
    {
      id: '2',
      title: 'テスト提案2',
      description: 'テスト説明2',
      duration: 5,
      category: 'behavioral' as const,
      guide: 'ガイド2'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態では loading が true で、その後 false になる', async () => {
    vi.mocked(fetchSuggestions).mockResolvedValue({
      suggestions: mockSuggestions
    });
    
    const { result } = renderHook(() => useSuggestions('workplace', 5));
    
    // 初期状態では loading が true
    expect(result.current.loading).toBe(true);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
    
    // データ取得後は loading が false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('正常に提案を取得できる', async () => {
    vi.mocked(fetchSuggestions).mockResolvedValue({
      suggestions: mockSuggestions
    });
    
    const { result } = renderHook(() => useSuggestions('workplace', 5));
    
    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('APIエラーをハンドリングする', async () => {
    const errorMessage = 'ネットワークエラー';
    vi.mocked(fetchSuggestions).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useSuggestions('workplace', 5));
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
    
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('situation または duration が変更されると再取得する', async () => {
    vi.mocked(fetchSuggestions).mockResolvedValue({
      suggestions: mockSuggestions
    });
    
    const { result, rerender } = renderHook(
      ({ situation, duration }) => useSuggestions(situation, duration),
      {
        initialProps: { situation: 'workplace' as const, duration: 5 as const }
      }
    );
    
    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });
    
    expect(vi.mocked(fetchSuggestions)).toHaveBeenCalledTimes(1);
    
    // duration を変更
    rerender({ situation: 'workplace' as const, duration: 15 as const });
    
    await waitFor(() => {
      expect(vi.mocked(fetchSuggestions)).toHaveBeenCalledTimes(2);
    });
  });

  it('前回のリクエストをキャンセルする', async () => {
    vi.mocked(fetchSuggestions).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ suggestions: mockSuggestions }), 100))
    );
    
    const { result, rerender } = renderHook(
      ({ situation, duration }) => useSuggestions(situation, duration),
      {
        initialProps: { situation: 'workplace' as const, duration: 5 as const }
      }
    );
    
    // すぐに situation を変更
    rerender({ situation: 'home' as const, duration: 5 as const });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // 最後のリクエストのみが反映される
    expect(vi.mocked(fetchSuggestions)).toHaveBeenLastCalledWith('home', 5);
  });
});