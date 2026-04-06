// useABTestフックのテスト
// 実際のhook APIに合わせたテスト

import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useABTest, useMetrics, useABTestResults, useFeatureFlag } from './useABTest';
import { ABTestService } from '../services/analytics/abTestService';
import { UserProfileStorage } from '../services/storage/userProfileStorage';

// ABTestServiceをモック化
vi.mock('../services/analytics/abTestService', () => ({
  ABTestService: {
    assignVariant: vi.fn(),
    trackEvent: vi.fn(),
    trackAgeGroupSelection: vi.fn(),
    trackSuggestionSatisfaction: vi.fn(),
    trackSessionCompletion: vi.fn(),
    trackError: vi.fn(),
    analyzeResults: vi.fn(),
  },
  // 型エクスポートのダミー
}));

vi.mock('../services/storage/userProfileStorage', () => ({
  UserProfileStorage: {
    getProfile: vi.fn(),
    saveProfile: vi.fn(),
  }
}));

describe('useABTest hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本機能', () => {
    it('should return variant and userId from ABTestService', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-1',
        ageGroup: 'office_worker',
        selectedAt: '2024-01-01T00:00:00.000Z',
        isFirstTimeUser: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('treatment');

      const { result } = renderHook(() => useABTest('age_group_feature'));

      expect(result.current.variant).toBe('treatment');
      expect(result.current.userId).toBe('test-user-1');
      expect(ABTestService.assignVariant).toHaveBeenCalledWith('age_group_feature', 'test-user-1');
    });

    it('should return control variant', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-2',
        ageGroup: 'office_worker',
        selectedAt: '2024-01-01T00:00:00.000Z',
        isFirstTimeUser: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      const { result } = renderHook(() => useABTest('age_group_feature'));

      expect(result.current.variant).toBe('control');
    });
  });

  describe('ユーザーID生成', () => {
    it('should generate userId when profile has no userId', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue(null);
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      const { result } = renderHook(() => useABTest('age_group_feature'));

      // userId should be generated (starts with user_)
      expect(result.current.userId).toMatch(/^user_\d+_/);
      expect(UserProfileStorage.saveProfile).toHaveBeenCalled();
    });
  });

  describe('イベントトラッキング', () => {
    it('should track page_view event on mount', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-3',
        ageGroup: 'office_worker',
        selectedAt: '2024-01-01T00:00:00.000Z',
        isFirstTimeUser: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('treatment');

      renderHook(() => useABTest('age_group_feature'));

      expect(ABTestService.trackEvent).toHaveBeenCalledWith({
        eventType: 'page_view',
        eventName: 'age_group_feature_view',
        userId: 'test-user-3',
        abTestVariant: 'treatment',
      });
    });
  });

  describe('useFeatureFlag', () => {
    it('should return true when variant is treatment', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-4',
        ageGroup: 'office_worker',
        selectedAt: '2024-01-01T00:00:00.000Z',
        isFirstTimeUser: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('treatment');

      const { result } = renderHook(() => useFeatureFlag('age_group_feature'));

      expect(result.current).toBe(true);
    });

    it('should return false when variant is control', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-5',
        ageGroup: 'office_worker',
        selectedAt: '2024-01-01T00:00:00.000Z',
        isFirstTimeUser: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      const { result } = renderHook(() => useFeatureFlag('age_group_feature'));

      expect(result.current).toBe(false);
    });
  });

  describe('useMetrics', () => {
    it('should provide tracking functions', () => {
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-6',
        ageGroup: 'office_worker',
        selectedAt: '2024-01-01T00:00:00.000Z',
        isFirstTimeUser: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
      });

      const { result } = renderHook(() => useMetrics());

      expect(typeof result.current.trackAgeGroupSelection).toBe('function');
      expect(typeof result.current.trackSuggestionSatisfaction).toBe('function');
      expect(typeof result.current.trackSessionCompletion).toBe('function');
      expect(typeof result.current.trackError).toBe('function');
      expect(typeof result.current.trackCustomEvent).toBe('function');
    });
  });

  describe('useABTestResults', () => {
    it('should load and return test results', async () => {
      const mockResults = {
        testName: 'age_group_feature',
        controlGroup: { variant: 'control' as const, sampleSize: 100, metrics: {} },
        treatmentGroup: { variant: 'treatment' as const, sampleSize: 100, metrics: {} },
        isSignificant: false,
        confidence: 0.85,
        recommendation: 'Continue testing',
      };
      vi.mocked(ABTestService.analyzeResults).mockReturnValue(mockResults);

      const { result } = renderHook(() => useABTestResults('age_group_feature'));

      // Wait for loading to complete
      await vi.waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.results).toEqual(mockResults);
      expect(typeof result.current.refreshResults).toBe('function');
    });
  });

  describe('サーバーサイドレンダリング対応', () => {
    it('should use default variant before effect runs', () => {
      // getProfile returns null (no profile stored)
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue(null);
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      const { result } = renderHook(() => useABTest('age_group_feature'));

      // After effect, variant should be set to 'control'
      expect(result.current.variant).toBe('control');
    });
  });
});
