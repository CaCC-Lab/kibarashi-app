/**
 * 転職活動者向けA/Bテストフック
 * Phase A-3: 転職活動者(25-49歳)専用機能のテスト
 */

import { useEffect, useCallback } from 'react';
import { useAgeGroup } from './useAgeGroup';
import { trackEvent, MetricsEvent } from '../utils/metrics';

interface UseCareerChangerABTestOptions {
  /** A/Bテストグループ割り当て時のコールバック */
  onExposure?: (event: MetricsEvent) => void;
  /** メトリクスイベント発生時のコールバック */
  onMetric?: (event: MetricsEvent) => void;
}

interface UseCareerChangerABTestReturn {
  /** ユーザーのテストグループ ('control' | 'optimized') */
  testGroup: 'control' | 'optimized';
  /** 現在のユーザーが転職活動者最適化版かどうか */
  isCareerChangerOptimized: boolean;
  /** メトリクスをトラッキングする関数 */
  trackMetric: (eventName: string, properties?: Record<string, any>) => void;
  /** 機能の表示可否を判定する関数 */
  shouldRender: (featureName: string) => boolean;
}

/**
 * 転職活動者向けA/Bテストフック
 * 
 * 転職活動者（25-49歳）向けに最適化された機能をテストするためのフック。
 * ユーザーの年齢層に基づいて自動的にA/Bテストグループを割り当て、
 * 転職特化コンテンツの効果を測定します。
 */
export function useCareerChangerABTest(
  options: UseCareerChangerABTestOptions = {}
): UseCareerChangerABTestReturn {
  const { currentAgeGroup } = useAgeGroup();
  const isCareerChanger = currentAgeGroup === 'career_changer';
  
  // A/Bテストグループの決定
  // 転職活動者の場合、50%の確率で最適化版を表示
  const testGroup = isCareerChanger && Math.random() < 0.5 ? 'optimized' : 'control';
  const isCareerChangerOptimized = testGroup === 'optimized';
  
  // 初回露出時のトラッキング
  useEffect(() => {
    if (isCareerChanger && isCareerChangerOptimized) {
      const event: MetricsEvent = {
        name: 'career_changer_abtest_exposure',
        timestamp: Date.now(),
        properties: {
          testGroup,
          ageGroup: currentAgeGroup,
          variant: 'career_changer_optimized'
        }
      };
      
      trackEvent(event);
      options.onExposure?.(event);
    }
  }, [isCareerChanger, isCareerChangerOptimized, testGroup, currentAgeGroup, options]);
  
  // メトリクストラッキング関数
  const trackMetric = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    const event: MetricsEvent = {
      name: `career_changer_${eventName}`,
      timestamp: Date.now(),
      properties: {
        ...properties,
        testGroup,
        ageGroup: currentAgeGroup,
        isCareerChanger,
        isOptimized: isCareerChangerOptimized
      }
    };
    
    trackEvent(event);
    options.onMetric?.(event);
  }, [testGroup, currentAgeGroup, isCareerChanger, isCareerChangerOptimized, options]);
  
  // 機能の表示可否を判定
  const shouldRender = useCallback((featureName: string): boolean => {
    // 転職活動者最適化版でない場合は表示しない
    if (!isCareerChangerOptimized) return false;
    
    // 転職活動者向け機能の許可リスト
    const allowedFeatures = [
      'careerChangerFeature',
      'careerTransition',
      'networkingBreak',
      'skillRefresh'
    ];
    
    return allowedFeatures.includes(featureName);
  }, [isCareerChangerOptimized]);
  
  return {
    testGroup,
    isCareerChangerOptimized,
    trackMetric,
    shouldRender
  };
}