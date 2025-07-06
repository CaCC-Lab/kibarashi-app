/**
 * 年齢層管理のカスタムフック
 * Phase A: 年齢層別展開戦略
 */

import { useState, useEffect, useCallback } from 'react';
import { AgeGroup, UserProfile, AGE_GROUPS } from '../types/ageGroup';
import { UserProfileStorage, ProfileChangeEvent, subscribeToProfileChanges } from '../services/storage/userProfileStorage';

interface UseAgeGroupReturn {
  currentAgeGroup: AgeGroup;
  profile: UserProfile | null;
  isFirstTimeUser: boolean;
  isLoading: boolean;
  updateAgeGroup: (ageGroup: AgeGroup) => void;
  resetProfile: () => void;
  availableAgeGroups: typeof AGE_GROUPS;
}

/**
 * 年齢層管理のためのフック
 */
export function useAgeGroup(): UseAgeGroupReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile = UserProfileStorage.getProfile();
        setProfile(savedProfile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // プロフィール変更の監視
  useEffect(() => {
    const unsubscribe = subscribeToProfileChanges((newProfile) => {
      setProfile(newProfile);
    });

    return unsubscribe;
  }, []);

  // 年齢層の更新
  const updateAgeGroup = useCallback((ageGroup: AgeGroup) => {
    try {
      const newProfile = UserProfileStorage.updateAgeGroup(ageGroup);
      setProfile(newProfile);
      
      // カスタムイベントを発行
      window.dispatchEvent(new ProfileChangeEvent(newProfile));
      
      // 利用統計を記録
      UserProfileStorage.recordUsage({
        action: 'age_group_selected',
        category: ageGroup
      });
    } catch (error) {
      console.error('Failed to update age group:', error);
    }
  }, []);

  // プロフィールのリセット
  const resetProfile = useCallback(() => {
    try {
      UserProfileStorage.removeProfile();
      setProfile(null);
      
      // リセットイベントを発行（nullプロフィール）
      window.dispatchEvent(new CustomEvent('profileReset'));
    } catch (error) {
      console.error('Failed to reset profile:', error);
    }
  }, []);

  const currentAgeGroup = profile?.ageGroup || UserProfileStorage.getCurrentAgeGroup();
  const isFirstTimeUser = UserProfileStorage.isFirstTimeUser();

  return {
    currentAgeGroup,
    profile,
    isFirstTimeUser,
    isLoading,
    updateAgeGroup,
    resetProfile,
    availableAgeGroups: AGE_GROUPS
  };
}

/**
 * 年齢層に基づいたコンテンツのフィルタリング
 */
export function useAgeGroupFilter<T extends { ageGroups?: AgeGroup[] }>(
  items: T[],
  currentAgeGroup: AgeGroup
): T[] {
  return items.filter(item => {
    if (!item.ageGroups || item.ageGroups.length === 0) {
      return true; // 年齢層指定がない場合は全員対象
    }
    return item.ageGroups.includes(currentAgeGroup);
  });
}

/**
 * 年齢層別のスタイル適用
 */
export function useAgeGroupStyles(ageGroup: AgeGroup) {
  const getThemeClass = () => {
    switch (ageGroup) {
      case 'student':
        return 'theme-student'; // 明るく親しみやすい
      case 'middle_school':
        return 'theme-middle-school'; // 優しく安全な感じ
      case 'housewife':
        return 'theme-housewife'; // 温かく実用的
      case 'elderly':
        return 'theme-elderly'; // 見やすく落ち着いた
      case 'office_worker':
      default:
        return 'theme-office'; // プロフェッショナル
    }
  };

  const getFontSizeClass = () => {
    switch (ageGroup) {
      case 'elderly':
        return 'text-lg'; // 大きめの文字
      case 'middle_school':
        return 'text-base'; // 標準サイズ
      default:
        return 'text-base';
    }
  };

  return {
    themeClass: getThemeClass(),
    fontSizeClass: getFontSizeClass()
  };
}