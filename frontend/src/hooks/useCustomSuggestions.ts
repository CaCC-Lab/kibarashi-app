/**
 * カスタム気晴らし管理のカスタムフック
 * 
 * 設計思想：
 * - カスタム気晴らしの CRUD 操作を簡単に行えるインターフェース
 * - storage イベントによる他タブとの同期
 * - バリデーション機能を内蔵
 */

import { useState, useEffect, useCallback } from 'react';
import { CustomStorage } from '../services/storage/customStorage';
import { CustomSuggestion, CustomSuggestionFormData, CustomSuggestionValidation } from '../types/custom';

export function useCustomSuggestions() {
  const [customSuggestions, setCustomSuggestions] = useState<CustomSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<CustomSuggestionValidation>({});

  // カスタム気晴らしデータを読み込む
  const loadCustomSuggestions = useCallback(() => {
    const data = CustomStorage.getCustomSuggestions();
    setCustomSuggestions(data.customs);
  }, []);

  // 初回読み込みとstorage イベントの監視
  useEffect(() => {
    loadCustomSuggestions();

    // 他のタブでの変更を監視
    const handleStorageChange = () => {
      loadCustomSuggestions();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadCustomSuggestions]);

  /**
   * フォームデータのバリデーション
   */
  const validateFormData = useCallback((formData: CustomSuggestionFormData): boolean => {
    const errors = CustomStorage.validateFormData(formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  /**
   * バリデーションエラーをクリア
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  /**
   * 新しいカスタム気晴らしを追加
   */
  const addCustomSuggestion = useCallback(async (formData: CustomSuggestionFormData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // バリデーション
      if (!validateFormData(formData)) {
        return false;
      }

      const success = CustomStorage.addCustomSuggestion(formData);
      if (success) {
        loadCustomSuggestions();
        clearValidationErrors();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [validateFormData, loadCustomSuggestions, clearValidationErrors]);

  /**
   * カスタム気晴らしを更新
   */
  const updateCustomSuggestion = useCallback(async (id: string, formData: CustomSuggestionFormData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // バリデーション
      if (!validateFormData(formData)) {
        return false;
      }

      const success = CustomStorage.updateCustomSuggestion(id, formData);
      if (success) {
        loadCustomSuggestions();
        clearValidationErrors();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [validateFormData, loadCustomSuggestions, clearValidationErrors]);

  /**
   * カスタム気晴らしを削除
   */
  const deleteCustomSuggestion = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = CustomStorage.deleteCustomSuggestion(id);
      if (success) {
        loadCustomSuggestions();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [loadCustomSuggestions]);

  /**
   * すべてのカスタム気晴らしをクリア
   */
  const clearCustomSuggestions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = CustomStorage.clearCustomSuggestions();
      if (success) {
        loadCustomSuggestions();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [loadCustomSuggestions]);

  /**
   * カスタム気晴らしのエクスポート
   */
  const exportCustomSuggestions = useCallback((): string => {
    return CustomStorage.exportCustomSuggestions();
  }, []);

  /**
   * カスタム気晴らしのインポート
   */
  const importCustomSuggestions = useCallback(async (jsonData: string, merge: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = CustomStorage.importCustomSuggestions(jsonData, merge);
      if (success) {
        loadCustomSuggestions();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [loadCustomSuggestions]);

  /**
   * 特定のIDのカスタム気晴らしを取得
   */
  const getCustomSuggestionById = useCallback((id: string): CustomSuggestion | undefined => {
    return customSuggestions.find(custom => custom.id === id);
  }, [customSuggestions]);

  /**
   * カテゴリー別のカスタム気晴らしを取得
   */
  const getCustomSuggestionsByCategory = useCallback((category: '認知的' | '行動的'): CustomSuggestion[] => {
    return customSuggestions.filter(custom => custom.category === category);
  }, [customSuggestions]);

  /**
   * 時間範囲別のカスタム気晴らしを取得
   */
  const getCustomSuggestionsByDuration = useCallback((maxDuration: number): CustomSuggestion[] => {
    return customSuggestions.filter(custom => custom.duration <= maxDuration);
  }, [customSuggestions]);

  return {
    customSuggestions,
    isLoading,
    validationErrors,
    addCustomSuggestion,
    updateCustomSuggestion,
    deleteCustomSuggestion,
    clearCustomSuggestions,
    exportCustomSuggestions,
    importCustomSuggestions,
    getCustomSuggestionById,
    getCustomSuggestionsByCategory,
    getCustomSuggestionsByDuration,
    validateFormData,
    clearValidationErrors,
  };
}