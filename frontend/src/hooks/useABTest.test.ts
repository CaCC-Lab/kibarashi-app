// CLAUDE-GENERATED: useABTestフックのテスト
// TDD: Red Phase - 失敗するテストを先に作成

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useABTest } from './useABTest';
import { ABTestService } from '../services/abtest/ABTestService';

// ABTestServiceをモック化
vi.mock('../services/abtest/ABTestService', () => ({
  ABTestService: {
    getTestGroup: vi.fn(),
    isStudentOptimized: vi.fn(),
    getAssignment: vi.fn(),
    resetTestGroup: vi.fn()
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
    it('should return test group from ABTestService', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      vi.mocked(ABTestService.isStudentOptimized).mockReturnValue(true);

      // Act
      const { result } = renderHook(() => useABTest());

      // Assert
      expect(result.current.testGroup).toBe('B');
      expect(result.current.isStudentOptimized).toBe(true);
      expect(ABTestService.getTestGroup).toHaveBeenCalledTimes(1);
    });

    it('should handle control group (A)', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('A');
      vi.mocked(ABTestService.isStudentOptimized).mockReturnValue(false);

      // Act
      const { result } = renderHook(() => useABTest());

      // Assert
      expect(result.current.testGroup).toBe('A');
      expect(result.current.isStudentOptimized).toBe(false);
    });
  });

  describe('実験的な機能フラグ', () => {
    it('should provide feature flags based on test group', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      vi.mocked(ABTestService.isStudentOptimized).mockReturnValue(true);

      // Act
      const { result } = renderHook(() => useABTest());

      // Assert
      expect(result.current.features).toEqual({
        studentPrompts: true,
        ageGroupSelector: true,
        benefitDisplay: true,
        returnToStudyTips: true,
        enhancedMetrics: true
      });
    });

    it('should disable features for control group', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('A');
      vi.mocked(ABTestService.isStudentOptimized).mockReturnValue(false);

      // Act
      const { result } = renderHook(() => useABTest());

      // Assert
      expect(result.current.features).toEqual({
        studentPrompts: false,
        ageGroupSelector: false,
        benefitDisplay: false,
        returnToStudyTips: false,
        enhancedMetrics: false
      });
    });
  });

  describe('イベントトラッキング', () => {
    it('should track experiment exposure', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      const trackEventSpy = vi.fn();

      // Act
      const { result } = renderHook(() => useABTest({ onExposure: trackEventSpy }));

      // Assert
      expect(trackEventSpy).toHaveBeenCalledWith({
        experiment: 'student_optimization_v1',
        variant: 'B',
        timestamp: expect.any(String)
      });
    });

    it('should only track exposure once per session', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      const trackEventSpy = vi.fn();

      // Act
      const { rerender } = renderHook(() => useABTest({ onExposure: trackEventSpy }));
      
      // Re-render multiple times
      rerender();
      rerender();

      // Assert
      expect(trackEventSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('リセット機能', () => {
    it('should provide reset function for development', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('A');

      // Act
      const { result } = renderHook(() => useABTest());
      
      act(() => {
        result.current.resetForTesting();
      });

      // Assert
      expect(ABTestService.resetTestGroup).toHaveBeenCalledTimes(1);
    });
  });

  describe('A/Bテストメトリクス', () => {
    it('should provide tracking functions for metrics', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      const metricsCallback = vi.fn();

      // Act
      const { result } = renderHook(() => useABTest({ onMetric: metricsCallback }));

      // Track suggestion click
      act(() => {
        result.current.trackMetric('suggestionClick', { suggestionId: 'test-123' });
      });

      // Assert
      expect(metricsCallback).toHaveBeenCalledWith({
        metric: 'suggestionClick',
        testGroup: 'B',
        data: { suggestionId: 'test-123' },
        timestamp: expect.any(String)
      });
    });

    it('should track completion metrics', () => {
      // Arrange
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      const metricsCallback = vi.fn();

      // Act
      const { result } = renderHook(() => useABTest({ onMetric: metricsCallback }));

      act(() => {
        result.current.trackCompletion('test-123', 300); // 5分間
      });

      // Assert
      expect(metricsCallback).toHaveBeenCalledWith({
        metric: 'suggestionComplete',
        testGroup: 'B',
        data: {
          suggestionId: 'test-123',
          duration: 300,
          completed: true
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('条件付きレンダリング支援', () => {
    it('should provide shouldRender helper for conditional rendering', () => {
      // Arrange & Act - Test group B
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('B');
      vi.mocked(ABTestService.isStudentOptimized).mockReturnValue(true);
      const { result: resultB } = renderHook(() => useABTest());

      // Assert
      expect(resultB.current.shouldRender('studentFeature')).toBe(true);
      expect(resultB.current.shouldRender('defaultFeature')).toBe(false);

      // Arrange & Act - Test group A
      vi.mocked(ABTestService.getTestGroup).mockReturnValue('A');
      vi.mocked(ABTestService.isStudentOptimized).mockReturnValue(false);
      const { result: resultA } = renderHook(() => useABTest());

      // Assert
      expect(resultA.current.shouldRender('studentFeature')).toBe(false);
      expect(resultA.current.shouldRender('defaultFeature')).toBe(true);
    });
  });

  describe('サーバーサイドレンダリング対応', () => {
    it('should handle SSR environment gracefully', () => {
      // Arrange - LocalStorageでエラーが発生する環境をシミュレート
      const originalGetItem = Storage.prototype.getItem;
      const originalSetItem = Storage.prototype.setItem;
      
      // localStorage でエラーが発生するようにモック
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage is not available');
      });
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage is not available');
      });

      // Act
      const { result } = renderHook(() => useABTest());

      // Assert - デフォルト値が返される（エラーでも動作する）
      expect(result.current.testGroup).toBe('A');
      expect(result.current.isStudentOptimized).toBe(false);

      // Cleanup
      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
    });
  });
});