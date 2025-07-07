/**
 * 就職活動者向けA/Bテストフック
 * Phase A-3: 就職活動者(20-24歳)専用機能のテスト
 */

import { useEffect, useCallback } from 'react';
import { useAgeGroup } from './useAgeGroup';
import { trackEvent, MetricsEvent } from '../utils/metrics';

interface UseJobSeekerABTestOptions {
  /** A/Bテストグループ割り当て時のコールバック */
  onExposure?: (event: MetricsEvent) => void;
  /** メトリクスイベント発生時のコールバック */
  onMetric?: (event: MetricsEvent) => void;
}

interface UseJobSeekerABTestReturn {
  /** ユーザーのテストグループ ('control' | 'optimized') */
  testGroup: 'control' | 'optimized';
  /** 現在のユーザーが就職活動者最適化版かどうか */
  isJobSeekerOptimized: boolean;
  /** メトリクスをトラッキングする関数 */
  trackMetric: (eventName: string, properties?: Record<string, any>) => void;
  /** 機能の表示可否を判定する関数 */
  shouldRender: (featureName: string) => boolean;
}

/**
 * 就職活動者向けA/Bテストフック
 * 
 * 就職活動者（20-24歳）向けに最適化された機能をテストするためのフック。
 * ユーザーの年齢層に基づいて自動的にA/Bテストグループを割り当て、
 * 就活特化コンテンツの効果を測定します。
 */
export function useJobSeekerABTest(
  options: UseJobSeekerABTestOptions = {}
): UseJobSeekerABTestReturn {
  const { currentAgeGroup } = useAgeGroup();
  const isJobSeeker = currentAgeGroup === 'job_seeker';
  
  // A/Bテストグループの決定
  // 就職活動者の場合、50%の確率で最適化版を表示
  const testGroup = isJobSeeker && Math.random() < 0.5 ? 'optimized' : 'control';
  const isJobSeekerOptimized = testGroup === 'optimized';
  
  // 初回露出時のトラッキング
  useEffect(() => {
    if (isJobSeeker && isJobSeekerOptimized) {
      const event: MetricsEvent = {
        name: 'job_seeker_abtest_exposure',
        timestamp: Date.now(),
        properties: {
          testGroup,
          ageGroup: currentAgeGroup,
          variant: 'job_seeker_optimized'
        }
      };
      
      trackEvent(event);
      options.onExposure?.(event);
    }
  }, [isJobSeeker, isJobSeekerOptimized, testGroup, currentAgeGroup, options]);
  
  // メトリクストラッキング関数
  const trackMetric = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    const event: MetricsEvent = {
      name: `job_seeker_${eventName}`,
      timestamp: Date.now(),
      properties: {
        ...properties,
        testGroup,
        ageGroup: currentAgeGroup,
        isJobSeeker,
        isOptimized: isJobSeekerOptimized
      }
    };
    
    trackEvent(event);
    options.onMetric?.(event);
  }, [testGroup, currentAgeGroup, isJobSeeker, isJobSeekerOptimized, options]);
  
  // 機能の表示可否を判定
  const shouldRender = useCallback((featureName: string): boolean => {
    // 就職活動者最適化版でない場合は表示しない
    if (!isJobSeekerOptimized) return false;
    
    // 就職活動者向け機能の許可リスト
    const allowedFeatures = [
      'jobSeekerFeature',
      'careerAdvice',
      'interviewTips',
      'resumeBreak'
    ];
    
    return allowedFeatures.includes(featureName);
  }, [isJobSeekerOptimized]);
  
  return {
    testGroup,
    isJobSeekerOptimized,
    trackMetric,
    shouldRender
  };
}