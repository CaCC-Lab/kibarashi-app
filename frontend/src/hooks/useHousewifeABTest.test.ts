// CLAUDE-GENERATED: 主婦・主夫最適化A/Bテストフック テスト実装
// パターン: TDD Phase A-2 実装 - React統合

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHousewifeABTest } from './useHousewifeABTest';

// ABTestServiceのモック
vi.mock('../services/analytics/abTestService', () => ({
  ABTestService: {
    getTestGroup: vi.fn(),
    isHousewifeOptimized: vi.fn(),
    resetTestGroup: vi.fn()
  }
}));

// モックされたABTestServiceを取得
import { ABTestService } from '../services/analytics/abTestService';
const mockABTestService = vi.mocked(ABTestService);

/**
 * useHousewifeABTestフックのテスト
 * 
 * 設計思想：
 * - Phase A-1（学生）の実装パターンを踏襲
 * - 主婦・主夫向けの特化機能をテスト
 * - TDD実践でテスト先行
 * - モック使用は最小限に抑制
 */
describe('useHousewifeABTest', () => {

  beforeEach(() => {
    // localStorageのモック（windowが存在する場合のみ）
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          clear: vi.fn()
        },
        writable: true,
        configurable: true
      });
    }

    // console.logのモック（メトリクス出力用）
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // ABTestServiceのデフォルトモック設定
    mockABTestService.getTestGroup.mockReturnValue('A');
    mockABTestService.isHousewifeOptimized.mockReturnValue(false);

    vi.clearAllMocks();
  });

  describe('基本機能のテスト', () => {
    it('デフォルトでコントロール群（A）に設定される', () => {
      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.testGroup).toBe('A');
      expect(result.current.isHousewifeOptimized).toBe(false);
    });

    it('処理群（B）の場合、主婦最適化フラグがtrueになる', () => {
      mockABTestService.getTestGroup.mockReturnValue('B');
      mockABTestService.isHousewifeOptimized.mockReturnValue(true);

      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.testGroup).toBe('B');
      expect(result.current.isHousewifeOptimized).toBe(true);
    });

    it('主婦向けA/Bテストサービスが正しく呼び出される', () => {
      renderHook(() => useHousewifeABTest());

      expect(mockABTestService.getTestGroup).toHaveBeenCalled();
      expect(mockABTestService.isHousewifeOptimized).toHaveBeenCalled();
    });
  });

  describe('機能フラグのテスト', () => {
    it('コントロール群（A）では全ての主婦向け機能が無効', () => {
      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.features.housewifePrompts).toBe(false);
      expect(result.current.features.homeScenarios).toBe(false);
      expect(result.current.features.childcareTips).toBe(false);
      expect(result.current.features.timeManagement).toBe(false);
      expect(result.current.features.stressRelief).toBe(false);
    });

    it('処理群（B）では全ての主婦向け機能が有効', () => {
      mockABTestService.getTestGroup.mockReturnValue('B');
      mockABTestService.isHousewifeOptimized.mockReturnValue(true);

      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.features.housewifePrompts).toBe(true);
      expect(result.current.features.homeScenarios).toBe(true);
      expect(result.current.features.childcareTips).toBe(true);
      expect(result.current.features.timeManagement).toBe(true);
      expect(result.current.features.stressRelief).toBe(true);
    });
  });

  describe('メトリクストラッキングのテスト', () => {
    it('trackMetricが正しく動作する', () => {
      const onMetric = vi.fn();
      const { result } = renderHook(() => useHousewifeABTest({ onMetric }));

      act(() => {
        result.current.trackMetric('homeTaskStart', { taskType: 'cooking' });
      });

      expect(onMetric).toHaveBeenCalledWith({
        metric: 'homeTaskStart',
        testGroup: 'A',
        data: { taskType: 'cooking' },
        timestamp: expect.any(String)
      });
    });

    it('trackCompletionが完了メトリクスを送信する', () => {
      const onMetric = vi.fn();
      const { result } = renderHook(() => useHousewifeABTest({ onMetric }));

      act(() => {
        result.current.trackCompletion('housework-break-1', 300);
      });

      expect(onMetric).toHaveBeenCalledWith({
        metric: 'suggestionComplete',
        testGroup: 'A',
        data: {
          suggestionId: 'housework-break-1',
          duration: 300,
          completed: true
        },
        timestamp: expect.any(String)
      });
    });

    it('メトリクスがコンソールログに出力される', () => {
      const { result } = renderHook(() => useHousewifeABTest());

      act(() => {
        result.current.trackMetric('childcareStress', { stressLevel: 'medium' });
      });

      expect(console.log).toHaveBeenCalledWith(
        '[Housewife A/B Test Metric]',
        {
          metric: 'childcareStress',
          testGroup: 'A',
          data: { stressLevel: 'medium' }
        }
      );
    });
  });

  describe('条件付きレンダリングのテスト', () => {
    it('shouldRender - 主婦最適化機能の表示判定', () => {
      mockABTestService.getTestGroup.mockReturnValue('B');
      mockABTestService.isHousewifeOptimized.mockReturnValue(true);

      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.shouldRender('housewifeFeature')).toBe(true);
      expect(result.current.shouldRender('defaultFeature')).toBe(false);
    });

    it('shouldRender - デフォルト機能の表示判定', () => {
      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.shouldRender('housewifeFeature')).toBe(false);
      expect(result.current.shouldRender('defaultFeature')).toBe(true);
    });
  });

  describe('露出イベントのテスト', () => {
    it('初回レンダリング時に露出イベントが送信される', () => {
      const onExposure = vi.fn();

      renderHook(() => useHousewifeABTest({ onExposure }));

      expect(onExposure).toHaveBeenCalledWith({
        experiment: 'housewife_optimization_v1',
        variant: 'A',
        timestamp: expect.any(String)
      });
    });

    it('露出イベントは一度だけ送信される', () => {
      const onExposure = vi.fn();
      const { rerender } = renderHook(() => useHousewifeABTest({ onExposure }));

      rerender();
      rerender();

      expect(onExposure).toHaveBeenCalledTimes(1);
    });
  });

  describe('リセット機能のテスト', () => {
    it('resetForTestingが正しく動作する', () => {
      mockABTestService.resetTestGroup.mockImplementation(() => {});
      mockABTestService.getTestGroup.mockReturnValueOnce('A').mockReturnValueOnce('B');
      mockABTestService.isHousewifeOptimized.mockReturnValueOnce(false).mockReturnValueOnce(true);

      const { result } = renderHook(() => useHousewifeABTest());

      expect(result.current.testGroup).toBe('A');

      act(() => {
        result.current.resetForTesting();
      });

      expect(mockABTestService.resetTestGroup).toHaveBeenCalled();
      expect(result.current.testGroup).toBe('B');
      expect(result.current.isHousewifeOptimized).toBe(true);
    });
  });

  describe('SSR対応のテスト', () => {
    it('localStorageが利用できない環境でもエラーが発生しない', () => {
      // localStorageを一時的に無効化
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      expect(() => renderHook(() => useHousewifeABTest())).not.toThrow();

      const { result } = renderHook(() => useHousewifeABTest());
      expect(result.current.testGroup).toBe('A');
      expect(result.current.isHousewifeOptimized).toBe(false);
    });

    it('サーバーサイドレンダリング環境での安全な動作', () => {
      // localStorageが利用できない状況をシミュレート
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
        configurable: true
      });

      expect(() => renderHook(() => useHousewifeABTest())).not.toThrow();

      const { result } = renderHook(() => useHousewifeABTest());
      expect(result.current.testGroup).toBe('A');
      expect(result.current.isHousewifeOptimized).toBe(false);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('ABTestServiceでエラーが発生してもフックが安全に動作する', () => {
      mockABTestService.getTestGroup.mockImplementation(() => {
        throw new Error('Service error');
      });

      expect(() => renderHook(() => useHousewifeABTest())).not.toThrow();

      const { result } = renderHook(() => useHousewifeABTest());
      expect(result.current.testGroup).toBe('A');
      expect(result.current.isHousewifeOptimized).toBe(false);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize housewife A/B test:',
        expect.any(Error)
      );
    });

    it('メトリクス送信でエラーが発生してもアプリケーションは継続する', () => {
      const onMetric = vi.fn().mockImplementation(() => {
        throw new Error('Metric error');
      });

      const { result } = renderHook(() => useHousewifeABTest({ onMetric }));

      expect(() => {
        act(() => {
          result.current.trackMetric('errorTest', {});
        });
      }).not.toThrow();
    });
  });

  describe('主婦向け特化機能のテスト', () => {
    it('家事タスクのメトリクスを正しく送信する', () => {
      const onMetric = vi.fn();
      const { result } = renderHook(() => useHousewifeABTest({ onMetric }));

      act(() => {
        result.current.trackMetric('houseworkStart', {
          taskType: 'cleaning',
          timeOfDay: 'morning',
          hasChildren: true
        });
      });

      expect(onMetric).toHaveBeenCalledWith({
        metric: 'houseworkStart',
        testGroup: 'A',
        data: {
          taskType: 'cleaning',
          timeOfDay: 'morning',
          hasChildren: true
        },
        timestamp: expect.any(String)
      });
    });

    it('育児ストレスのメトリクスを追跡する', () => {
      const onMetric = vi.fn();
      const { result } = renderHook(() => useHousewifeABTest({ onMetric }));

      act(() => {
        result.current.trackMetric('childcareStress', {
          childAge: '3-5',
          stressLevel: 'high',
          timeOfDay: 'afternoon'
        });
      });

      expect(onMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          metric: 'childcareStress',
          data: expect.objectContaining({
            childAge: '3-5',
            stressLevel: 'high',
            timeOfDay: 'afternoon'
          })
        })
      );
    });
  });

  describe('useIsHousewifeOptimizedヘルパーのテスト', () => {
    it('主婦最適化の状態を正しく返す', () => {
      mockABTestService.getTestGroup.mockReturnValue('B');
      mockABTestService.isHousewifeOptimized.mockReturnValue(true);

      const { result } = renderHook(() => {
        const { isHousewifeOptimized } = useHousewifeABTest();
        return isHousewifeOptimized;
      });

      expect(result.current).toBe(true);
    });
  });
});