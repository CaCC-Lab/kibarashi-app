// CLAUDE-GENERATED: 学生最適化A/Bテストフック実装
// パターン: Phase 1 MVP - React統合

import { useEffect, useState, useCallback, useRef } from 'react';
import { ABTestService } from '../services/abtest/ABTestService';
import { ABTestMetricData } from '../types/metrics';

export interface StudentABTestFeatures {
  studentPrompts: boolean;
  ageGroupSelector: boolean;
  benefitDisplay: boolean;
  returnToStudyTips: boolean;
  enhancedMetrics: boolean;
}

export interface StudentABTestMetricEvent {
  metric: string;
  testGroup: 'A' | 'B';
  data: ABTestMetricData;
  timestamp: string;
}

export interface StudentABTestExposureEvent {
  experiment: string;
  variant: 'A' | 'B';
  timestamp: string;
}

export interface UseStudentABTestOptions {
  onExposure?: (event: StudentABTestExposureEvent) => void;
  onMetric?: (event: StudentABTestMetricEvent) => void;
}

export interface UseStudentABTestReturn {
  testGroup: 'A' | 'B';
  isStudentOptimized: boolean;
  features: StudentABTestFeatures;
  trackMetric: (metric: string, data?: ABTestMetricData) => void;
  trackCompletion: (suggestionId: string, duration: number) => void;
  shouldRender: (feature: 'studentFeature' | 'defaultFeature') => boolean;
  resetForTesting: () => void;
}

/**
 * 学生最適化A/Bテスト管理フック
 * コンポーネントで学生向け最適化のA/Bテストグループと機能フラグを管理
 */
export function useStudentABTest(options: UseStudentABTestOptions = {}): UseStudentABTestReturn {
  const { onExposure, onMetric } = options;
  const [testGroup, setTestGroup] = useState<'A' | 'B'>('A');
  const [isStudentOptimized, setIsStudentOptimized] = useState(false);
  const hasTrackedExposure = useRef(false);

  // 初期化とグループ割り当て
  useEffect(() => {
    try {
      // SSR対応: localStorageが使えない場合はデフォルト値を使用
      if (typeof window === 'undefined' || !window.localStorage) {
        setTestGroup('A');
        setIsStudentOptimized(false);
        return;
      }

      const group = ABTestService.getTestGroup();
      setTestGroup(group);
      setIsStudentOptimized(ABTestService.isStudentOptimized());

      // 初回露出イベントを送信
      if (!hasTrackedExposure.current && onExposure) {
        onExposure({
          experiment: 'student_optimization_v1',
          variant: group,
          timestamp: new Date().toISOString()
        });
        hasTrackedExposure.current = true;
      }
    } catch (error) {
      console.error('Failed to initialize student A/B test:', error);
      // エラー時はコントロール群（A）をデフォルトとする
      setTestGroup('A');
      setIsStudentOptimized(false);
    }
  }, [onExposure]);

  // 機能フラグの決定
  const features: StudentABTestFeatures = {
    studentPrompts: isStudentOptimized,
    ageGroupSelector: isStudentOptimized,
    benefitDisplay: isStudentOptimized,
    returnToStudyTips: isStudentOptimized,
    enhancedMetrics: isStudentOptimized
  };

  // メトリクストラッキング
  const trackMetric = useCallback((metric: string, data: ABTestMetricData = {}) => {
    if (onMetric) {
      onMetric({
        metric,
        testGroup,
        data,
        timestamp: new Date().toISOString()
      });
    }

    // Phase 2でアナリティクスAPIに送信
    console.log('[Student A/B Test Metric]', { metric, testGroup, data });
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
  const shouldRender = useCallback((feature: 'studentFeature' | 'defaultFeature'): boolean => {
    if (feature === 'studentFeature') {
      return isStudentOptimized;
    } else if (feature === 'defaultFeature') {
      return !isStudentOptimized;
    }
    return false;
  }, [isStudentOptimized]);

  // 開発用リセット機能
  const resetForTesting = useCallback(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      ABTestService.resetTestGroup();
      // 状態をリセットして再初期化
      const newGroup = ABTestService.getTestGroup();
      setTestGroup(newGroup);
      setIsStudentOptimized(ABTestService.isStudentOptimized());
    }
  }, []);

  return {
    testGroup,
    isStudentOptimized,
    features,
    trackMetric,
    trackCompletion,
    shouldRender,
    resetForTesting
  };
}

// 学生向け機能の有効化を簡単に確認するヘルパーフック
export function useIsStudentOptimized(): boolean {
  const { isStudentOptimized } = useStudentABTest();
  return isStudentOptimized;
}

// SSR対応のためのデフォルトエクスポート
export default useStudentABTest;