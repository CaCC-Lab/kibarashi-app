/**
 * ユーザープロフィールのLocalStorage管理
 * Phase A: 年齢層別展開戦略
 */

import { UserProfile, AgeGroup, DEFAULT_AGE_GROUP } from '../../types/ageGroup';

const STORAGE_KEY = 'kibarashi_user_profile';

/**
 * ユーザープロフィール管理サービス
 */
export class UserProfileStorage {
  /**
   * プロフィールを取得
   */
  static getProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const profile = JSON.parse(data) as UserProfile;
      
      // データ検証 - 必須フィールドのチェック
      if (!profile.ageGroup || !profile.selectedAt) {
        console.warn('Invalid profile data found, removing...');
        this.removeProfile();
        return null;
      }
      
      // 新しい必須フィールドが欠けている場合は補完
      if (!profile.userId || !profile.createdAt || !profile.lastUpdated) {
        const now = new Date().toISOString();
        const updatedProfile: UserProfile = {
          userId: profile.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ageGroup: profile.ageGroup,
          selectedAt: profile.selectedAt,
          isFirstTimeUser: profile.isFirstTimeUser ?? false,
          createdAt: profile.createdAt || now,
          lastUpdated: profile.lastUpdated || now,
          preferences: profile.preferences
        };
        
        this.saveProfile(updatedProfile);
        return updatedProfile;
      }
      
      return profile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * プロフィールを保存
   */
  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  /**
   * プロフィールを削除
   */
  static removeProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove user profile:', error);
    }
  }

  /**
   * 年齢層を更新
   */
  static updateAgeGroup(ageGroup: AgeGroup): UserProfile {
    const currentProfile = this.getProfile();
    const now = new Date().toISOString();
    
    const newProfile: UserProfile = {
      userId: currentProfile?.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ageGroup,
      selectedAt: now,
      isFirstTimeUser: !currentProfile,
      createdAt: currentProfile?.createdAt || now,
      lastUpdated: now,
      preferences: currentProfile?.preferences
    };
    
    this.saveProfile(newProfile);
    return newProfile;
  }

  /**
   * 初回ユーザーかどうかを判定
   */
  static isFirstTimeUser(): boolean {
    const profile = this.getProfile();
    return !profile || profile.isFirstTimeUser;
  }

  /**
   * 現在の年齢層を取得（デフォルト値付き）
   */
  static getCurrentAgeGroup(): AgeGroup {
    const profile = this.getProfile();
    return profile?.ageGroup || DEFAULT_AGE_GROUP;
  }

  /**
   * プリファレンスを更新
   */
  static updatePreferences(preferences: Partial<UserProfile['preferences']>): void {
    const profile = this.getProfile();
    if (!profile) return;
    
    const updatedProfile: UserProfile = {
      ...profile,
      lastUpdated: new Date().toISOString(),
      preferences: {
        ...profile.preferences,
        ...preferences
      }
    };
    
    this.saveProfile(updatedProfile);
  }

  /**
   * プロフィールをエクスポート（バックアップ用）
   */
  static exportProfile(): string {
    const profile = this.getProfile();
    if (!profile) {
      throw new Error('No profile to export');
    }
    
    return JSON.stringify({
      profile,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * プロフィールをインポート（復元用）
   */
  static importProfile(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.profile || !parsed.profile.ageGroup) {
        throw new Error('Invalid profile data');
      }
      
      this.saveProfile(parsed.profile);
    } catch (error) {
      console.error('Failed to import profile:', error);
      throw new Error('プロフィールのインポートに失敗しました');
    }
  }

  /**
   * 統計情報を記録（年齢層別の利用状況把握用）
   */
  static recordUsage(event: {
    action: string;
    situation?: string;
    duration?: number;
    category?: string;
  }): void {
    try {
      const profile = this.getProfile();
      if (!profile) return;
      
      // 利用統計はanalytics系のストレージに保存（将来的な実装）
      const analyticsKey = `kibarashi_analytics_${profile.ageGroup}`;
      const existingData = localStorage.getItem(analyticsKey);
      const analytics = existingData ? JSON.parse(existingData) : { events: [] };
      
      analytics.events.push({
        ...event,
        timestamp: new Date().toISOString(),
        ageGroup: profile.ageGroup
      });
      
      // 最新100件のみ保持
      if (analytics.events.length > 100) {
        analytics.events = analytics.events.slice(-100);
      }
      
      localStorage.setItem(analyticsKey, JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  }
}

/**
 * プロフィール変更イベントのカスタムイベント
 */
export class ProfileChangeEvent extends CustomEvent<{ profile: UserProfile }> {
  constructor(profile: UserProfile) {
    super('profileChange', { detail: { profile } });
  }
}

/**
 * プロフィール変更を監視するためのヘルパー
 */
export function subscribeToProfileChanges(callback: (profile: UserProfile) => void): () => void {
  const handler = (event: Event) => {
    if (event instanceof ProfileChangeEvent) {
      callback(event.detail.profile);
    }
  };
  
  window.addEventListener('profileChange', handler);
  
  return () => {
    window.removeEventListener('profileChange', handler);
  };
}