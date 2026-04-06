/**
 * A/Bテスト用カスタムフック - Phase A-1
 * コンポーネントから簡単にA/Bテストとメトリクス収集を利用
 */

import { useEffect, useState, useCallback } from 'react';
import { ABTestService, ABTestType, ABTestVariant, ABTestResults } from '../services/analytics/abTestService';
import { AgeGroup } from '../types/ageGroup';
import { UserProfileStorage } from '../services/storage/userProfileStorage';

/**
 * A/Bテストフック
 */
export function useABTest(testName: ABTestType) {
  const [variant, setVariant] = useState<ABTestVariant>('control');
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    // ユーザーIDの取得または生成
    const profile = UserProfileStorage.getProfile();
    const currentUserId = profile?.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // プロファイルにユーザーIDがない場合は保存
    if (!profile?.userId) {
      const now = new Date().toISOString();
      UserProfileStorage.saveProfile({
        userId: currentUserId,
        ageGroup: profile?.ageGroup || 'office_worker',
        selectedAt: profile?.selectedAt || now,
        isFirstTimeUser: profile?.isFirstTimeUser ?? true,
        createdAt: profile?.createdAt || now,
        lastUpdated: now,
        preferences: profile?.preferences
      });
    }
    
    setUserId(currentUserId);
    
    // A/Bテストバリアントの決定
    const assignedVariant = ABTestService.assignVariant(testName, currentUserId);
    setVariant(assignedVariant);
    
    // 初期ページビューのトラッキング
    ABTestService.trackEvent({
      eventType: 'page_view',
      eventName: `${testName}_view`,
      userId: currentUserId,
      abTestVariant: assignedVariant
    });
    
  }, [testName]);
  
  return { variant, userId };
}

/**
 * メトリクストラッキングフック
 */
export function useMetrics() {
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    const profile = UserProfileStorage.getProfile();
    const currentUserId = profile?.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(currentUserId);
  }, []);
  
  // 年齢層選択のトラッキング
  const trackAgeGroupSelection = useCallback((ageGroup: AgeGroup, isFirstTime: boolean) => {
    ABTestService.trackAgeGroupSelection(userId, ageGroup, isFirstTime);
  }, [userId]);
  
  // 提案満足度のトラッキング
  const trackSuggestionSatisfaction = useCallback((suggestionId: string, rating: number) => {
    const profile = UserProfileStorage.getProfile();
    ABTestService.trackSuggestionSatisfaction(userId, suggestionId, rating, profile?.ageGroup);
  }, [userId]);
  
  // セッション完了のトラッキング
  const trackSessionCompletion = useCallback((sessionDuration: number, completedSuggestions: number) => {
    const profile = UserProfileStorage.getProfile();
    ABTestService.trackSessionCompletion(userId, sessionDuration, completedSuggestions, profile?.ageGroup);
  }, [userId]);
  
  // エラーのトラッキング
  const trackError = useCallback((errorType: string, errorMessage: string) => {
    ABTestService.trackError(userId, errorType, errorMessage);
  }, [userId]);
  
  // カスタムイベントのトラッキング
  const trackCustomEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    const profile = UserProfileStorage.getProfile();
    ABTestService.trackEvent({
      eventType: 'interaction',
      eventName,
      userId,
      ageGroup: profile?.ageGroup,
      properties
    });
  }, [userId]);
  
  return {
    trackAgeGroupSelection,
    trackSuggestionSatisfaction,
    trackSessionCompletion,
    trackError,
    trackCustomEvent
  };
}

/**
 * A/Bテスト結果分析フック
 */
export function useABTestResults(testName: ABTestType) {
  const [results, setResults] = useState<ABTestResults | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const analyzeResults = async () => {
      setLoading(true);
      try {
        const testResults = ABTestService.analyzeResults(testName);
        setResults(testResults);
      } catch (error) {
        console.error('Failed to analyze A/B test results:', error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeResults();
  }, [testName]);
  
  const refreshResults = useCallback(() => {
    const testResults = ABTestService.analyzeResults(testName);
    setResults(testResults);
  }, [testName]);
  
  return { results, loading, refreshResults };
}

/**
 * セッション時間計測フック
 */
export function useSessionTracking() {
  const [sessionStartTime] = useState(Date.now());
  const { trackSessionCompletion } = useMetrics();
  
  const endSession = useCallback((completedSuggestions: number = 0) => {
    const sessionDuration = Date.now() - sessionStartTime;
    trackSessionCompletion(Math.floor(sessionDuration / 1000), completedSuggestions);
  }, [sessionStartTime, trackSessionCompletion]);
  
  useEffect(() => {
    // ページ離脱時にセッション終了をトラッキング
    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStartTime;
      // ベストエフォートでセッション終了を記録
      navigator.sendBeacon && navigator.sendBeacon('/api/session-end', JSON.stringify({
        duration: Math.floor(sessionDuration / 1000),
        timestamp: new Date().toISOString()
      }));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionStartTime]);
  
  return { endSession };
}

/**
 * A/Bテスト機能有効化フック
 */
export function useFeatureFlag(testName: ABTestType): boolean {
  const { variant } = useABTest(testName);
  return variant === 'treatment';
}

/**
 * 年齢層機能の有効化フック（Phase A-1専用）
 */
export function useAgeGroupFeature() {
  const isEnabled = useFeatureFlag('age_group_feature');
  const { trackCustomEvent } = useMetrics();
  
  const trackFeatureUsage = useCallback((action: string, properties?: Record<string, unknown>) => {
    trackCustomEvent(`age_group_feature_${action}`, {
      ...properties,
      featureEnabled: isEnabled
    });
  }, [isEnabled, trackCustomEvent]);
  
  return {
    isEnabled,
    trackFeatureUsage
  };
}