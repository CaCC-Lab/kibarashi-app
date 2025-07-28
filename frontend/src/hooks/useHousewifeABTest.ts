// CLAUDE-GENERATED: 主婦・主夫最適化A/Bテストフック実装
// パターン: TDD Phase A-2 実装 - React統合

import { useEffect, useState, useCallback, useRef } from 'react';
import { ABTestService } from '../services/analytics/abTestService';

export interface HousewifeABTestFeatures {
  housewifePrompts: boolean;
  homeScenarios: boolean;
  childcareTips: boolean;
  timeManagement: boolean;
  stressRelief: boolean;
}

export interface HousewifeABTestMetricEvent {
  metric: string;
  testGroup: 'A' | 'B';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface HousewifeABTestExposureEvent {
  experiment: string;
  variant: 'A' | 'B';
  timestamp: string;
}

export interface UseHousewifeABTestOptions {
  onExposure?: (event: HousewifeABTestExposureEvent) => void;
  onMetric?: (event: HousewifeABTestMetricEvent) => void;
}

export interface UseHousewifeABTestReturn {
  testGroup: 'A' | 'B';
  isHousewifeOptimized: boolean;
  features: HousewifeABTestFeatures;
  trackMetric: (metric: string, data?: Record<string, unknown>) => void;
  trackCompletion: (suggestionId: string, duration: number) => void;
  shouldRender: (feature: 'housewifeFeature' | 'defaultFeature') => boolean;
  resetForTesting: () => void;
}

/**
 * 主婦・主夫最適化A/Bテスト管理フック
 * コンポーネントで主婦・主夫向け最適化のA/Bテストグループと機能フラグを管理
 */
export function useHousewifeABTest(options: UseHousewifeABTestOptions = {}): UseHousewifeABTestReturn {
  const { onExposure, onMetric } = options;
  const [testGroup, setTestGroup] = useState<'A' | 'B'>('A');
  const [isHousewifeOptimized, setIsHousewifeOptimized] = useState(false);
  const hasTrackedExposure = useRef(false);

  // 初期化とグループ割り当て
  useEffect(() => {
    try {
      // SSR対応: localStorageが使えない場合はデフォルト値を使用
      if (typeof window === 'undefined' || !window.localStorage) {
        setTestGroup('A');
        setIsHousewifeOptimized(false);
        return;
      }

      const group = ABTestService.getTestGroup();
      setTestGroup(group);
      setIsHousewifeOptimized(ABTestService.isHousewifeOptimized());

      // 初回露出イベントを送信
      if (!hasTrackedExposure.current && onExposure) {
        onExposure({
          experiment: 'housewife_optimization_v1',
          variant: group,
          timestamp: new Date().toISOString()
        });
        hasTrackedExposure.current = true;
      }
    } catch (error) {
      console.error('Failed to initialize housewife A/B test:', error);
      // エラー時はコントロール群（A）をデフォルトとする
      setTestGroup('A');
      setIsHousewifeOptimized(false);
    }
  }, [onExposure]);

  // 機能フラグの決定
  const features: HousewifeABTestFeatures = {
    housewifePrompts: isHousewifeOptimized,
    homeScenarios: isHousewifeOptimized,
    childcareTips: isHousewifeOptimized,
    timeManagement: isHousewifeOptimized,
    stressRelief: isHousewifeOptimized
  };

  // メトリクストラッキング
  const trackMetric = useCallback((metric: string, data: Record<string, unknown> = {}) => {
    try {
      if (onMetric) {
        onMetric({
          metric,
          testGroup,
          data,
          timestamp: new Date().toISOString()
        });
      }

      // Phase 2でアナリティクスAPIに送信
      console.log('[Housewife A/B Test Metric]', { metric, testGroup, data });
    } catch (error) {
      // メトリクス送信エラーはサイレントに処理（アプリケーションを停止させない）
      console.error('Failed to track housewife A/B test metric:', error);
    }
  }, [testGroup, onMetric]);

  // 完了メトリクス
  const trackCompletion = useCallback((suggestionId: string, duration: number) => {
    trackMetric('suggestionComplete', {
      suggestionId,
      duration,
      completed: true
    });
  }, [trackMetric]);

  // 条件付きレンダリング支援
  const shouldRender = useCallback((feature: 'housewifeFeature' | 'defaultFeature'): boolean => {
    if (feature === 'housewifeFeature') {
      return isHousewifeOptimized;
    } else if (feature === 'defaultFeature') {
      return !isHousewifeOptimized;
    }
    return false;
  }, [isHousewifeOptimized]);

  // 開発用リセット機能
  const resetForTesting = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      ABTestService.resetTestGroup();
      // 状態をリセットして再初期化
      const newGroup = ABTestService.getTestGroup();
      setTestGroup(newGroup);
      setIsHousewifeOptimized(ABTestService.isHousewifeOptimized());
    }
  }, []);

  return {
    testGroup,
    isHousewifeOptimized,
    features,
    trackMetric,
    trackCompletion,
    shouldRender,
    resetForTesting
  };
}

// 主婦・主夫向け機能の有効化を簡単に確認するヘルパーフック
export function useIsHousewifeOptimized(): boolean {
  const { isHousewifeOptimized } = useHousewifeABTest();
  return isHousewifeOptimized;
}

// SSR対応のためのデフォルトエクスポート
export default useHousewifeABTest;