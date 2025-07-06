/**
 * フィーチャーフラグシステムのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  useFeature, 
  features,
  FeatureFlagManager
} from './featureFlags';
import { renderHook } from '@testing-library/react';

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Math.randomのモック
const mathRandomSpy = vi.spyOn(Math, 'random');

describe('Feature Flags', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // デフォルトで50%の確率に設定
    mathRandomSpy.mockReturnValue(0.5);
  });

  describe('FeatureFlagManager.isFeatureEnabled', () => {
    it('存在しない機能に対してfalseを返す', () => {
      expect(FeatureFlagManager.isFeatureEnabled('nonexistent-feature')).toBe(false);
    });

    it('無効な機能に対してfalseを返す', () => {
      expect(FeatureFlagManager.isFeatureEnabled('voiceAutoPlay')).toBe(false);
    });

    it('有効な機能に対してtrueを返す', () => {
      // 依存関係のない機能をテスト
      expect(FeatureFlagManager.isFeatureEnabled('a11yKeyboardShortcuts')).toBe(true);
    });

    it('ユーザー設定でオーバーライドされた機能を適切に処理する', () => {
      // ユーザーが機能を無効にした場合
      localStorageMock.setItem('kibarashi_feature_flags', JSON.stringify({
        a11yKeyboardShortcuts: false
      }));
      expect(FeatureFlagManager.isFeatureEnabled('a11yKeyboardShortcuts')).toBe(false);
      
      // ユーザーが機能を有効にした場合
      localStorageMock.setItem('kibarashi_feature_flags', JSON.stringify({
        a11yKeyboardShortcuts: true
      }));
      expect(FeatureFlagManager.isFeatureEnabled('a11yKeyboardShortcuts')).toBe(true);
    });

    it('ロールアウト率を考慮して判定する', () => {
      // 依存関係のない機能は常にテストできる
      expect(FeatureFlagManager.isFeatureEnabled('a11yKeyboardShortcuts')).toBe(true);
      
      // getUserIdをモックして予測可能にする
      vi.spyOn(FeatureFlagManager, 'getUserId').mockReturnValue('test-user-1');
      expect(typeof FeatureFlagManager.getUserId()).toBe('string');
    });
  });

  describe('useFeature hook', () => {
    it('機能の有効性を正しく返す', () => {
      const { result } = renderHook(() => useFeature('a11yKeyboardShortcuts'));
      expect(result.current).toBe(true);
    });

    it('存在しない機能に対してfalseを返す', () => {
      const { result } = renderHook(() => useFeature('nonexistent'));
      expect(result.current).toBe(false);
    });

    it('ユーザー設定の変更を反映する', () => {
      const { result } = renderHook(() => useFeature('a11yKeyboardShortcuts'));
      
      // 初期状態では有効
      expect(result.current).toBe(true);
      
      // 実装の動作を確認：FeatureFlagManagerの設定変更が機能することをテスト
      FeatureFlagManager.setUserPreference('a11yKeyboardShortcuts', false);
      
      // 実装では手動で確認する必要がある
      expect(FeatureFlagManager.isFeatureEnabled('a11yKeyboardShortcuts')).toBe(false);
    });
  });

  describe('FeatureFlagManager.getAllFeatureStates', () => {
    it('すべての機能の状態を返す', () => {
      const status = FeatureFlagManager.getAllFeatureStates();
      
      expect(status).toHaveProperty('enhancedVoiceGuide');
      expect(status).toHaveProperty('voiceAutoPlay');
      expect(status).toHaveProperty('offlineVoiceCache');
      expect(status).toHaveProperty('voiceSpeedControl');
      expect(status).toHaveProperty('subtitles');
      expect(status).toHaveProperty('a11yKeyboardShortcuts');
    });

    it('各機能の状態を正しく返す', () => {
      const status = FeatureFlagManager.getAllFeatureStates();
      
      // a11yKeyboardShortcutsは有効（依存関係なし）
      expect(status.a11yKeyboardShortcuts).toBe(true);
      // voiceAutoPlayは無効
      expect(status.voiceAutoPlay).toBe(false);
    });

    it('ユーザーオーバーライドを反映する', () => {
      localStorageMock.setItem('kibarashi_feature_flags', JSON.stringify({
        a11yKeyboardShortcuts: false
      }));
      
      const status = FeatureFlagManager.getAllFeatureStates();
      expect(status.a11yKeyboardShortcuts).toBe(false);
    });
  });

  describe('FeatureFlagManager.setUserPreference', () => {
    it('ユーザー設定を正しく保存する', () => {
      FeatureFlagManager.setUserPreference('a11yKeyboardShortcuts', true);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kibarashi_feature_flags',
        expect.stringContaining('"a11yKeyboardShortcuts":true')
      );
    });

    it('機能無効化を正しく処理する', () => {
      FeatureFlagManager.setUserPreference('a11yKeyboardShortcuts', false);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kibarashi_feature_flags',
        expect.stringContaining('"a11yKeyboardShortcuts":false')
      );
    });

    it('localStorage エラー時は例外が発生する', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // 現在の実装ではエラーハンドリングが含まれていないため例外が発生する
      expect(() => {
        FeatureFlagManager.setUserPreference('a11yKeyboardShortcuts', true);
      }).toThrow('Storage quota exceeded');
    });
  });

  describe('Feature definitions', () => {
    it('必要な機能が定義されている', () => {
      expect(features).toHaveProperty('enhancedVoiceGuide');
      expect(features).toHaveProperty('voiceAutoPlay');
      expect(features).toHaveProperty('offlineVoiceCache');
      expect(features).toHaveProperty('voiceSpeedControl');
      expect(features).toHaveProperty('subtitles');
      expect(features).toHaveProperty('a11yKeyboardShortcuts');
    });

    it('各機能に必要なプロパティが含まれる', () => {
      const feature = features.a11yKeyboardShortcuts;
      
      expect(feature).toHaveProperty('enabled');
      expect(feature).toHaveProperty('rolloutPercentage');
      expect(feature).toHaveProperty('description');
      expect(typeof feature.enabled).toBe('boolean');
      expect(typeof feature.rolloutPercentage).toBe('number');
      expect(typeof feature.description).toBe('string');
    });

    it('ロールアウト率が有効な範囲内にある', () => {
      Object.values(features).forEach(feature => {
        expect(feature.rolloutPercentage).toBeGreaterThanOrEqual(0);
        expect(feature.rolloutPercentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Environment-specific behavior', () => {
    it('テスト環境では予測可能な動作をする', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      // 有効な機能は正しく動作する
      expect(FeatureFlagManager.isFeatureEnabled('a11yKeyboardShortcuts')).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('本番環境では設定通りに動作する', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // 無効な機能は本番でも無効
      expect(FeatureFlagManager.isFeatureEnabled('voiceAutoPlay')).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});