import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchSuggestions } from '../suggestions';
import { apiClient } from '../client';

// fetchのモックを作成
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('キャッシュ無効化のテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('タイムスタンプがURLに追加されること', async () => {
    // 現在時刻を固定
    const mockTime = 1234567890123;
    vi.setSystemTime(new Date(mockTime));

    // fetchのモックレスポンス
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    // APIを呼び出し
    await fetchSuggestions('workplace', 5);

    // fetchが呼ばれたことを確認
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // URLにタイムスタンプが含まれていることを確認
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain(`_t=${mockTime}`);
    expect(calledUrl).toContain('situation=workplace');
    expect(calledUrl).toContain('duration=5');
  });

  it('Cache-Controlヘッダーが設定されること', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    await fetchSuggestions('home', 15);

    // fetchのオプションを確認
    const fetchOptions = mockFetch.mock.calls[0][1];
    
    // Cache-Controlヘッダーの確認
    expect(fetchOptions.headers['Cache-Control']).toBe('no-cache, no-store, must-revalidate');
    expect(fetchOptions.headers['Pragma']).toBe('no-cache');
    
    // cacheオプションの確認
    expect(fetchOptions.cache).toBe('no-store');
  });

  it('連続して呼び出した場合、異なるタイムスタンプが使用されること', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    // 1回目の呼び出し
    vi.setSystemTime(new Date(1000));
    await fetchSuggestions('outside', 30);
    const firstUrl = mockFetch.mock.calls[0][0];

    // 時間を進める
    vi.advanceTimersByTime(1000);

    // 2回目の呼び出し
    await fetchSuggestions('outside', 30);
    const secondUrl = mockFetch.mock.calls[1][0];

    // URLが異なることを確認
    expect(firstUrl).not.toBe(secondUrl);
    expect(firstUrl).toContain('_t=1000');
    expect(secondUrl).toContain('_t=2000');
  });
});