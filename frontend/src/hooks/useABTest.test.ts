// CLAUDE-GENERATED: useABTestフックのテスト
// TDD: Red Phase - 失敗するテストを先に作成

import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useABTest } from './useABTest';
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
    analyzeResults: vi.fn()
  }
}));

// UserProfileStorageをモック化
vi.mock('../services/storage/userProfileStorage', () => ({
  UserProfileStorage: {
    getProfile: vi.fn(),
    saveProfile: vi.fn()
  }
}));

describe('useABTest hook', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    vi.clearAllMocks();
    // LocalStorageもクリア
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本機能', () => {
    it('should return test variant from ABTestService', () => {
      // Arrange
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-123',
        ageGroup: 'office_worker',
        selectedAt: '2025-01-01T00:00:00Z',
        isFirstTimeUser: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastUpdated: '2025-01-01T00:00:00Z'
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('treatment');

      // Act
      const { result } = renderHook(() => useABTest('age_group_feature'));

      // Assert
      expect(result.current.variant).toBe('treatment');
      expect(result.current.userId).toBe('test-user-123');
      expect(ABTestService.assignVariant).toHaveBeenCalledWith('age_group_feature', 'test-user-123');
      expect(ABTestService.trackEvent).toHaveBeenCalledWith({
        eventType: 'page_view',
        eventName: 'age_group_feature_view',
        userId: 'test-user-123',
        abTestVariant: 'treatment'
      });
    });

    it('should handle control variant', () => {
      // Arrange
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue(null);
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      // Act
      const { result } = renderHook(() => useABTest('age_group_feature'));

      // Assert
      expect(result.current.variant).toBe('control');
      expect(result.current.userId).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(ABTestService.assignVariant).toHaveBeenCalled();
    });
  });

  describe('ユーザーIDの管理', () => {
    it('should generate new userId if profile does not exist', () => {
      // Arrange
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue(null);
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      // Act
      const { result } = renderHook(() => useABTest('age_group_feature'));

      // Assert
      expect(result.current.userId).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(UserProfileStorage.saveProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: result.current.userId,
          ageGroup: 'office_worker',
          isFirstTimeUser: true
        })
      );
    });

    it('should use existing userId from profile', () => {
      // Arrange
      const mockProfile = {
        userId: 'existing-user-456',
        ageGroup: 'student' as const,
        selectedAt: '2025-01-01T00:00:00Z',
        isFirstTimeUser: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastUpdated: '2025-01-01T00:00:00Z'
      };
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue(mockProfile);
      vi.mocked(ABTestService.assignVariant).mockReturnValue('treatment');

      // Act
      const { result } = renderHook(() => useABTest('age_group_feature'));

      // Assert
      expect(result.current.userId).toBe('existing-user-456');
      expect(UserProfileStorage.saveProfile).not.toHaveBeenCalled();
    });
  });

  describe('イベントトラッキング', () => {
    it('should track page view on mount', () => {
      // Arrange
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-789',
        ageGroup: 'office_worker',
        selectedAt: '2025-01-01T00:00:00Z',
        isFirstTimeUser: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastUpdated: '2025-01-01T00:00:00Z'
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('treatment');

      // Act
      renderHook(() => useABTest('age_group_feature'));

      // Assert
      expect(ABTestService.trackEvent).toHaveBeenCalledWith({
        eventType: 'page_view',
        eventName: 'age_group_feature_view',
        userId: 'test-user-789',
        abTestVariant: 'treatment'
      });
    });

    it('should track page view once per mount', () => {
      // Arrange
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue(null);
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      // Act
      const { rerender } = renderHook(() => useABTest('age_group_feature'));
      
      // Clear previous calls
      vi.mocked(ABTestService.trackEvent).mockClear();
      
      // Re-render multiple times
      rerender();
      rerender();

      // Assert - trackEvent should not be called on re-renders
      expect(ABTestService.trackEvent).not.toHaveBeenCalled();
    });
  });

  describe('テスト名の変更', () => {
    it('should re-assign variant when test name changes', () => {
      // Arrange
      vi.mocked(UserProfileStorage.getProfile).mockReturnValue({
        userId: 'test-user-999',
        ageGroup: 'office_worker',
        selectedAt: '2025-01-01T00:00:00Z',
        isFirstTimeUser: false,
        createdAt: '2025-01-01T00:00:00Z',
        lastUpdated: '2025-01-01T00:00:00Z'
      });
      vi.mocked(ABTestService.assignVariant).mockReturnValue('control');

      // Act - initial render
      const { rerender } = renderHook(
        ({ testName }) => useABTest(testName),
        { initialProps: { testName: 'age_group_feature' as const } }
      );

      // Clear previous calls
      vi.mocked(ABTestService.assignVariant).mockClear();
      vi.mocked(ABTestService.trackEvent).mockClear();

      // Change test name
      rerender({ testName: 'student_mode' as const });

      // Assert
      expect(ABTestService.assignVariant).toHaveBeenCalledWith('student_mode', 'test-user-999');
      expect(ABTestService.trackEvent).toHaveBeenCalledWith({
        eventType: 'page_view',
        eventName: 'student_mode_view',
        userId: 'test-user-999',
        abTestVariant: 'control'
      });
    });
  });



});