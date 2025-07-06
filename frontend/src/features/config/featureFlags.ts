/**
 * フィーチャーフラグシステム
 * 機能の段階的ロールアウトと A/Bテストを管理
 * 
 * 設計思想：
 * - 機能の安全な導入
 * - ユーザー体験の段階的改善
 * - 問題発生時の迅速なロールバック
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * フィーチャーフラグの定義
 */
export interface Feature {
  enabled: boolean;
  rolloutPercentage?: number;
  description: string;
  dependencies?: string[]; // 依存する他の機能
  userGroups?: string[]; // 特定のユーザーグループのみ有効
}

/**
 * 利用可能な機能フラグ
 */
export const features: Record<string, Feature> = {
  enhancedVoiceGuide: {
    enabled: import.meta.env.VITE_ENHANCED_VOICE === 'true',
    rolloutPercentage: 100,
    description: '音声ガイド機能（SSML対応、セグメント分割）',
    dependencies: []
  },
  
  voiceAutoPlay: {
    enabled: false,
    rolloutPercentage: 0,
    description: '音声の自動再生（ユーザー許可後）',
    dependencies: ['enhancedVoiceGuide']
  },
  
  offlineVoiceCache: {
    enabled: import.meta.env.VITE_OFFLINE_VOICE === 'true',
    rolloutPercentage: 50,
    description: 'Service Workerによる音声キャッシュ',
    dependencies: ['enhancedVoiceGuide']
  },
  
  voiceSpeedControl: {
    enabled: true,
    rolloutPercentage: 100,
    description: '音声再生速度の調整機能',
    dependencies: ['enhancedVoiceGuide']
  },
  
  subtitles: {
    enabled: true,
    rolloutPercentage: 100,
    description: '音声ガイドの字幕表示',
    dependencies: ['enhancedVoiceGuide']
  },
  
  a11yKeyboardShortcuts: {
    enabled: true,
    rolloutPercentage: 100,
    description: 'キーボードショートカット（アクセシビリティ）',
    dependencies: []
  }
};

/**
 * ユーザーのフィーチャーフラグ設定を管理
 */
class FeatureFlagManager {
  private static STORAGE_KEY = 'kibarashi_feature_flags';
  private static USER_ID_KEY = 'kibarashi_user_id';
  
  /**
   * ユーザーIDの取得または生成
   */
  static getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);
    if (!userId) {
      userId = this.generateUserId();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }
    return userId;
  }
  
  /**
   * ユーザーIDの生成（ハッシュベース）
   */
  private static generateUserId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }
  
  /**
   * ロールアウト対象かチェック
   */
  static isInRollout(feature: Feature, userId: string): boolean {
    if (!feature.rolloutPercentage || feature.rolloutPercentage === 100) {
      return true;
    }
    
    if (feature.rolloutPercentage === 0) {
      return false;
    }
    
    // ユーザーIDからハッシュ値を生成（0-99）
    const hash = userId.split('').reduce((acc, char) => {
      return (acc + char.charCodeAt(0)) % 100;
    }, 0);
    
    return hash < feature.rolloutPercentage;
  }
  
  /**
   * 機能が有効かチェック
   */
  static isFeatureEnabled(featureName: string): boolean {
    const feature = features[featureName];
    if (!feature) return false;
    
    // 基本的な有効チェック
    if (!feature.enabled) return false;
    
    // ユーザー設定をチェック
    const userPreferences = this.getUserPreferences();
    if (userPreferences[featureName] !== undefined) {
      return userPreferences[featureName];
    }
    
    // 依存関係をチェック
    if (feature.dependencies) {
      for (const dep of feature.dependencies) {
        if (!this.isFeatureEnabled(dep)) {
          return false;
        }
      }
    }
    
    // ロールアウト対象かチェック
    const userId = this.getUserId();
    return this.isInRollout(feature, userId);
  }
  
  /**
   * ユーザー設定の取得
   */
  static getUserPreferences(): Record<string, boolean> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  
  /**
   * ユーザー設定の保存
   */
  static setUserPreference(featureName: string, enabled: boolean): void {
    const preferences = this.getUserPreferences();
    preferences[featureName] = enabled;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    
    // カスタムイベントを発火（リアクティブ更新用）
    window.dispatchEvent(new CustomEvent('featureFlagChanged', {
      detail: { feature: featureName, enabled }
    }));
  }
  
  /**
   * すべての機能フラグの状態を取得
   */
  static getAllFeatureStates(): Record<string, boolean> {
    const states: Record<string, boolean> = {};
    for (const featureName in features) {
      states[featureName] = this.isFeatureEnabled(featureName);
    }
    return states;
  }
}

/**
 * フィーチャーフラグのカスタムフック
 * 
 * 使用例：
 * const isVoiceEnabled = useFeature('enhancedVoiceGuide');
 */
export function useFeature(featureName: string): boolean {
  const [enabled, setEnabled] = useState(() => 
    FeatureFlagManager.isFeatureEnabled(featureName)
  );
  
  useEffect(() => {
    // 初期値の設定
    setEnabled(FeatureFlagManager.isFeatureEnabled(featureName));
    
    // フィーチャーフラグ変更のリスナー
    const handleChange = (event: CustomEvent) => {
      if (event.detail.feature === featureName) {
        setEnabled(event.detail.enabled);
      }
    };
    
    window.addEventListener('featureFlagChanged', handleChange as EventListener);
    
    return () => {
      window.removeEventListener('featureFlagChanged', handleChange as EventListener);
    };
  }, [featureName]);
  
  return enabled;
}

/**
 * フィーチャーフラグの設定を変更するフック
 */
export function useFeatureToggle(featureName: string): [boolean, (enabled: boolean) => void] {
  const enabled = useFeature(featureName);
  
  const toggle = useCallback((newValue: boolean) => {
    FeatureFlagManager.setUserPreference(featureName, newValue);
  }, [featureName]);
  
  return [enabled, toggle];
}

/**
 * 複数のフィーチャーフラグをまとめてチェック
 */
export function useFeatures(...featureNames: string[]): Record<string, boolean> {
  const [states, setStates] = useState(() => {
    const initial: Record<string, boolean> = {};
    featureNames.forEach(name => {
      initial[name] = FeatureFlagManager.isFeatureEnabled(name);
    });
    return initial;
  });
  
  useEffect(() => {
    const handleChange = () => {
      const newStates: Record<string, boolean> = {};
      featureNames.forEach(name => {
        newStates[name] = FeatureFlagManager.isFeatureEnabled(name);
      });
      setStates(newStates);
    };
    
    window.addEventListener('featureFlagChanged', handleChange);
    
    return () => {
      window.removeEventListener('featureFlagChanged', handleChange);
    };
  }, [featureNames]);
  
  return states;
}

/**
 * 開発環境用：フィーチャーフラグのデバッグパネル
 * TODO: 別の.tsxファイルに移動する
 */
// export function FeatureFlagDebugPanel() {
//   デバッグパネルはUIコンポーネント用に別ファイルで実装予定
// }

// エクスポート
export { FeatureFlagManager };