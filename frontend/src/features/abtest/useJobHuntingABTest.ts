import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

/**
 * 就活・転職活動者向けA/Bテストのインターフェース
 */
interface JobHuntingABTest {
  testId: string;
  userId: string;
  testGroup: 'control' | 'variant';
  enrolledAt: Date;
  features: {
    showJobHuntingOption: boolean;
    useOptimizedPrompts: boolean;
    showEncouragementMessages: boolean;
  };
  metrics: {
    optionClicked: number;
    sessionsCompleted: number;
    feedbackPositive: number;
    feedbackNegative: number;
  };
}

interface UseJobHuntingABTestOptions {
  userId: string;
  enabled?: boolean;
}

interface UseJobHuntingABTestReturn {
  testGroup: 'control' | 'variant';
  isJobHuntingOptimized: boolean;
  features: JobHuntingABTest['features'];
  trackMetric: (metricName: keyof JobHuntingABTest['metrics']) => void;
  trackJobHuntingSelection: () => void;
  shouldRender: boolean;
}

/**
 * 就活・転職活動者向けA/Bテストフック
 * 
 * Phase 2で「就職・転職活動」選択肢の表示をテストする
 */
export function useJobHuntingABTest({
  userId,
  enabled = true
}: UseJobHuntingABTestOptions): UseJobHuntingABTestReturn {
  const [testData, setTestData] = useLocalStorage<JobHuntingABTest | null>(
    'jobhunting-ab-test',
    null
  );
  
  const [isInitialized, setIsInitialized] = useState(false);

  // テスト登録
  useEffect(() => {
    if (!enabled || !userId || isInitialized) return;

    // 既存のテストデータがある場合はそれを使用
    if (testData?.userId === userId) {
      setIsInitialized(true);
      return;
    }

    // 新規登録（50/50でランダム割り当て）
    const testGroup = Math.random() < 0.5 ? 'control' : 'variant';
    
    const newTestData: JobHuntingABTest = {
      testId: `jobhunting-test-${Date.now()}`,
      userId,
      testGroup,
      enrolledAt: new Date(),
      features: {
        showJobHuntingOption: testGroup === 'variant',
        useOptimizedPrompts: testGroup === 'variant',
        showEncouragementMessages: testGroup === 'variant'
      },
      metrics: {
        optionClicked: 0,
        sessionsCompleted: 0,
        feedbackPositive: 0,
        feedbackNegative: 0
      }
    };

    setTestData(newTestData);
    setIsInitialized(true);

    // 登録イベントを送信（将来的にはAnalyticsへ）
    console.log('[JobHunting A/B Test] User enrolled:', {
      userId,
      testGroup,
      features: newTestData.features
    });
  }, [enabled, userId, testData, setTestData, isInitialized]);

  // メトリクス追跡
  const trackMetric = useCallback((metricName: keyof JobHuntingABTest['metrics']) => {
    if (!testData) return;

    const updatedTestData = {
      ...testData,
      metrics: {
        ...testData.metrics,
        [metricName]: testData.metrics[metricName] + 1
      }
    };

    setTestData(updatedTestData);

    // イベント送信（将来的にはAnalyticsへ）
    console.log('[JobHunting A/B Test] Metric tracked:', {
      userId: testData.userId,
      testGroup: testData.testGroup,
      metric: metricName,
      value: updatedTestData.metrics[metricName]
    });
  }, [testData, setTestData]);

  // 就活・転職活動選択の追跡
  const trackJobHuntingSelection = useCallback(() => {
    trackMetric('optionClicked');
  }, [trackMetric]);

  // デフォルト値（テストが無効またはデータがない場合）
  const defaultReturn: UseJobHuntingABTestReturn = {
    testGroup: 'control',
    isJobHuntingOptimized: false,
    features: {
      showJobHuntingOption: false,
      useOptimizedPrompts: false,
      showEncouragementMessages: false
    },
    trackMetric: () => {},
    trackJobHuntingSelection: () => {},
    shouldRender: false
  };

  if (!enabled || !testData) {
    return defaultReturn;
  }

  return {
    testGroup: testData.testGroup,
    isJobHuntingOptimized: testData.testGroup === 'variant',
    features: testData.features,
    trackMetric,
    trackJobHuntingSelection,
    shouldRender: true
  };
}

/**
 * 就活・転職活動者向けメッセージを取得するヘルパー関数
 */
export function getJobHuntingEncouragementMessage(): string {
  const messages = [
    'あなたのペースで、一歩ずつ。',
    '今日の頑張りは、未来につながっています。',
    '深呼吸して、リラックスしましょう。',
    '自分を信じて。あなたならできます。',
    'ちょっと休憩も大切な時間です。',
    '焦らなくて大丈夫。今この瞬間を大切に。',
    '一息ついて、また前を向いて。',
    'あなたの努力は必ず報われます。'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * 就活・転職活動者向けの状況判定ヘルパー
 */
export function isJobHuntingContext(situation?: string): boolean {
  return situation === 'job-hunting' || situation === 'career-change';
}