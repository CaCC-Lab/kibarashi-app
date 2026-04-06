/**
 * A/Bテストサービス - Phase A-1
 * 年齢層機能の効果測定とメトリクス収集
 */

import { UserProfileStorage } from '../storage/userProfileStorage';
import { AgeGroup } from '../../types/ageGroup';

/**
 * A/Bテストの種類
 */
export type ABTestType = 
  | 'age_group_feature'     // 年齢層機能のテスト
  | 'age_based_prompts'     // 年齢別プロンプトのテスト
  | 'onboarding_modal';     // オンボーディングモーダルのテスト

/**
 * A/Bテストバリアント
 */
export type ABTestVariant = 'control' | 'treatment';

/**
 * A/Bテスト設定
 */
export interface ABTestConfig {
  testName: ABTestType;
  variant: ABTestVariant;
  startDate: string;
  endDate?: string;
  enabled: boolean;
  trafficPercentage: number; // 0-100の範囲
}

/**
 * メトリクスイベント
 */
export interface MetricEvent {
  eventType: 'page_view' | 'interaction' | 'conversion' | 'error';
  eventName: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  ageGroup?: AgeGroup;
  abTestVariant?: ABTestVariant;
  properties?: Record<string, unknown>;
}

/**
 * A/Bテストの結果データ
 */
export interface ABTestResults {
  testName: ABTestType;
  controlGroup: {
    users: number;
    conversions: number;
    conversionRate: number;
    avgSessionDuration: number;
    satisfactionScore: number;
  };
  treatmentGroup: {
    users: number;
    conversions: number;
    conversionRate: number;
    avgSessionDuration: number;
    satisfactionScore: number;
  };
  statisticalSignificance: number;
  winningVariant?: ABTestVariant;
}

/**
 * A/Bテストサービスクラス
 */
export class ABTestService {
  private static readonly STORAGE_KEY = 'ab_test_data';
  private static readonly METRICS_KEY = 'ab_test_metrics';
  private static readonly SESSION_KEY = 'ab_test_session';
  private static readonly TEST_GROUP_KEY = 'ab_test_group';
  private static readonly STUDENT_TEST_KEY = 'ab_test_student';
  private static readonly HOUSEWIFE_TEST_KEY = 'ab_test_housewife';
  
  /**
   * 現在のA/Bテスト設定を取得
   */
  static getCurrentTests(): ABTestConfig[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return this.getDefaultTests();
      
      return JSON.parse(stored);
    } catch {
      return this.getDefaultTests();
    }
  }
  
  /**
   * デフォルトのA/Bテスト設定
   */
  private static getDefaultTests(): ABTestConfig[] {
    return [
      {
        testName: 'age_group_feature',
        variant: 'treatment', // デフォルトで年齢層機能を有効
        startDate: new Date().toISOString(),
        enabled: true,
        trafficPercentage: 100 // Phase A-1では全ユーザーに適用
      },
      {
        testName: 'age_based_prompts',
        variant: 'treatment',
        startDate: new Date().toISOString(),
        enabled: true,
        trafficPercentage: 100
      },
      {
        testName: 'onboarding_modal',
        variant: 'treatment',
        startDate: new Date().toISOString(),
        enabled: true,
        trafficPercentage: 100
      }
    ];
  }
  
  /**
   * ユーザーを特定のテストのバリアントに割り当て
   */
  static assignVariant(testName: ABTestType, userId: string): ABTestVariant {
    const tests = this.getCurrentTests();
    const test = tests.find(t => t.testName === testName);
    
    if (!test || !test.enabled) {
      return 'control';
    }
    
    // Phase A-1では全員をtreatmentグループに
    // 将来的にはuserIdベースのハッシュで分散
    if (test.trafficPercentage === 100) {
      return 'treatment';
    }
    
    // ユーザーIDベースの一貫したハッシュ分散
    const hash = this.hashUserId(userId + testName);
    const percentage = hash % 100;
    
    return percentage < test.trafficPercentage ? 'treatment' : 'control';
  }
  
  /**
   * ユーザーIDのハッシュ化
   */
  private static hashUserId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash);
  }
  
  /**
   * セッションIDの生成または取得
   */
  static getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(this.SESSION_KEY, sessionId);
      }
      return sessionId;
    } catch {
      // SSR環境などでsessionStorageが使えない場合はランダムIDを生成
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  /**
   * メトリクスイベントの記録
   */
  static trackEvent(event: Omit<MetricEvent, 'timestamp' | 'sessionId'>): void {
    try {
      const profile = UserProfileStorage.getProfile();
      const sessionId = this.getSessionId();
      
      const fullEvent: MetricEvent = {
        ...event,
        timestamp: new Date().toISOString(),
        sessionId,
        ageGroup: profile?.ageGroup,
        abTestVariant: event.abTestVariant || this.assignVariant('age_group_feature', event.userId)
      };
      
      // LocalStorageに保存
      this.saveMetricEvent(fullEvent);
      
      // コンソールログ（開発時の確認用）
      console.log('📊 A/B Test Metric:', fullEvent);
      
    } catch (error) {
      console.error('Failed to track A/B test event:', error);
    }
  }
  
  /**
   * メトリクスイベントの保存
   */
  private static saveMetricEvent(event: MetricEvent): void {
    try {
      const stored = localStorage.getItem(this.METRICS_KEY);
      let events: MetricEvent[] = [];
      
      if (stored) {
        try {
          events = JSON.parse(stored);
        } catch {
          events = [];
        }
      }
      
      events.push(event);
      
      // 最大1000イベントまで保存（容量制限）
      if (events.length > 1000) {
        events = events.slice(-1000);
      }
      
      localStorage.setItem(this.METRICS_KEY, JSON.stringify(events));
    } catch (error) {
      // SSR環境やlocalStorageが無効な場合は静かに失敗
      console.warn('Failed to save metric event:', error);
    }
  }
  
  /**
   * 年齢層選択のトラッキング
   */
  static trackAgeGroupSelection(userId: string, ageGroup: AgeGroup, isFirstTime: boolean): void {
    this.trackEvent({
      eventType: 'interaction',
      eventName: 'age_group_selected',
      userId,
      ageGroup,
      properties: {
        selectedAgeGroup: ageGroup,
        isFirstTimeUser: isFirstTime,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * 提案の満足度トラッキング
   */
  static trackSuggestionSatisfaction(
    userId: string, 
    suggestionId: string, 
    rating: number,
    ageGroup?: AgeGroup
  ): void {
    this.trackEvent({
      eventType: 'conversion',
      eventName: 'suggestion_rated',
      userId,
      ageGroup,
      properties: {
        suggestionId,
        rating,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * セッション完了のトラッキング
   */
  static trackSessionCompletion(
    userId: string,
    sessionDuration: number,
    completedSuggestions: number,
    ageGroup?: AgeGroup
  ): void {
    this.trackEvent({
      eventType: 'conversion',
      eventName: 'session_completed',
      userId,
      ageGroup,
      properties: {
        sessionDuration,
        completedSuggestions,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * エラーのトラッキング
   */
  static trackError(userId: string, errorType: string, errorMessage: string): void {
    this.trackEvent({
      eventType: 'error',
      eventName: 'error_occurred',
      userId,
      properties: {
        errorType,
        errorMessage,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * 収集したメトリクスを取得
   */
  static getMetrics(): MetricEvent[] {
    try {
      const stored = localStorage.getItem(this.METRICS_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  /**
   * A/Bテスト結果の分析
   */
  static analyzeResults(testName: ABTestType): ABTestResults | null {
    const metrics = this.getMetrics();
    const testMetrics = metrics.filter(m => 
      m.properties?.testName === testName || 
      m.eventName.includes(testName.replace('_', ''))
    );
    
    if (testMetrics.length === 0) {
      return null;
    }
    
    const controlGroup = testMetrics.filter(m => m.abTestVariant === 'control');
    const treatmentGroup = testMetrics.filter(m => m.abTestVariant === 'treatment');
    
    const controlUsers = new Set(controlGroup.map(m => m.userId)).size;
    const treatmentUsers = new Set(treatmentGroup.map(m => m.userId)).size;
    
    const controlConversions = controlGroup.filter(m => m.eventType === 'conversion').length;
    const treatmentConversions = treatmentGroup.filter(m => m.eventType === 'conversion').length;
    
    const controlConversionRate = controlUsers > 0 ? controlConversions / controlUsers : 0;
    const treatmentConversionRate = treatmentUsers > 0 ? treatmentConversions / treatmentUsers : 0;
    
    // 統計的有意性の簡易計算（実際のプロダクトではより詳細な統計検定が必要）
    const pooledRate = (controlConversions + treatmentConversions) / (controlUsers + treatmentUsers);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlUsers + 1/treatmentUsers));
    const zScore = Math.abs(treatmentConversionRate - controlConversionRate) / standardError;
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    return {
      testName,
      controlGroup: {
        users: controlUsers,
        conversions: controlConversions,
        conversionRate: controlConversionRate,
        avgSessionDuration: this.calculateAvgSessionDuration(controlGroup),
        satisfactionScore: this.calculateAvgSatisfaction(controlGroup)
      },
      treatmentGroup: {
        users: treatmentUsers,
        conversions: treatmentConversions,
        conversionRate: treatmentConversionRate,
        avgSessionDuration: this.calculateAvgSessionDuration(treatmentGroup),
        satisfactionScore: this.calculateAvgSatisfaction(treatmentGroup)
      },
      statisticalSignificance: 1 - pValue,
      winningVariant: treatmentConversionRate > controlConversionRate ? 'treatment' : 'control'
    };
  }
  
  /**
   * 平均セッション時間の計算
   */
  private static calculateAvgSessionDuration(events: MetricEvent[]): number {
    const sessionEvents = events.filter(e => e.properties?.sessionDuration);
    if (sessionEvents.length === 0) return 0;
    
    const totalDuration = sessionEvents.reduce((sum, e) => sum + (Number(e.properties?.sessionDuration) || 0), 0);
    return totalDuration / sessionEvents.length;
  }
  
  /**
   * 平均満足度の計算
   */
  private static calculateAvgSatisfaction(events: MetricEvent[]): number {
    const ratingEvents = events.filter(e => e.properties?.rating);
    if (ratingEvents.length === 0) return 0;
    
    const totalRating = ratingEvents.reduce((sum, e) => sum + (Number(e.properties?.rating) || 0), 0);
    return totalRating / ratingEvents.length;
  }
  
  /**
   * 正規分布の累積分布関数（簡易実装）
   */
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }
  
  /**
   * 誤差関数の近似
   */
  private static erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }
  
  /**
   * メトリクスをエクスポート（JSON形式）
   */
  static exportMetrics(): string {
    const metrics = this.getMetrics();
    const tests = this.getCurrentTests();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      tests,
      metrics,
      summary: {
        totalEvents: metrics.length,
        uniqueUsers: new Set(metrics.map(m => m.userId)).size,
        uniqueSessions: new Set(metrics.map(m => m.sessionId)).size,
        eventTypes: this.groupBy(metrics, 'eventType'),
        ageGroups: this.groupBy(metrics.filter(m => m.ageGroup), 'ageGroup')
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * データのグループ化ヘルパー
   */
  private static groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
  
  /**
   * メトリクスデータのクリア（テスト用）
   */
  static clearMetrics(): void {
    try {
      localStorage.removeItem(this.METRICS_KEY);
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      // SSR環境やlocalStorageが無効な場合は静かに失敗
      console.warn('Failed to clear metrics data:', error);
    }
  }

  // === シンプルA/Bテストグループ管理 ===
  
  /**
   * A/Bテストグループ（A または B）を取得
   */
  static getTestGroup(): 'A' | 'B' {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return 'A'; // SSR環境ではデフォルトでコントロール群
      }

      let group = localStorage.getItem(this.TEST_GROUP_KEY) as 'A' | 'B' | null;
      
      if (!group || (group !== 'A' && group !== 'B')) {
        // ランダムにグループを割り当て（50%ずつ）
        group = Math.random() < 0.5 ? 'A' : 'B';
        localStorage.setItem(this.TEST_GROUP_KEY, group);
      }
      
      return group;
    } catch (error) {
      console.error('Failed to get test group:', error);
      return 'A'; // エラー時はコントロール群
    }
  }

  /**
   * A/Bテストグループをリセット（開発・テスト用）
   */
  static resetTestGroup(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.TEST_GROUP_KEY);
        localStorage.removeItem(this.STUDENT_TEST_KEY);
        localStorage.removeItem(this.HOUSEWIFE_TEST_KEY);
      }
    } catch (error) {
      console.error('Failed to reset test group:', error);
    }
  }

  /**
   * 学生最適化機能が有効かどうか
   */
  static isStudentOptimized(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false; // SSR環境ではデフォルトで無効
      }

      const cached = localStorage.getItem(this.STUDENT_TEST_KEY);
      if (cached !== null) {
        return cached === 'true';
      }

      const group = this.getTestGroup();
      const isOptimized = group === 'B'; // Bグループが処理群（学生最適化有効）
      localStorage.setItem(this.STUDENT_TEST_KEY, String(isOptimized));
      
      return isOptimized;
    } catch (error) {
      console.error('Failed to check student optimization:', error);
      return false;
    }
  }

  /**
   * 主婦・主夫最適化機能が有効かどうか
   */
  static isHousewifeOptimized(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false; // SSR環境ではデフォルトで無効
      }

      const cached = localStorage.getItem(this.HOUSEWIFE_TEST_KEY);
      if (cached !== null) {
        return cached === 'true';
      }

      const group = this.getTestGroup();
      const isOptimized = group === 'B'; // Bグループが処理群（主婦最適化有効）
      localStorage.setItem(this.HOUSEWIFE_TEST_KEY, String(isOptimized));
      
      return isOptimized;
    } catch (error) {
      console.error('Failed to check housewife optimization:', error);
      return false;
    }
  }
}