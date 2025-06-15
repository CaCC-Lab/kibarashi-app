/**
 * カスタム気晴らしのローカルストレージ管理サービス
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを操作
 * - バリデーション機能を内蔵し、不正なデータを防ぐ
 * - 最大保存件数を設定し、ストレージ容量を制限
 */

import { CustomSuggestion, CustomSuggestionData, CustomSuggestionFormData } from '../../types/custom';

const STORAGE_KEY = 'kibarashi_custom_suggestions';
const MAX_CUSTOM_SUGGESTIONS = 50; // 最大保存件数

export class CustomStorage {
  /**
   * カスタム気晴らしデータを取得
   */
  static getCustomSuggestions(): CustomSuggestionData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { customs: [], lastUpdated: new Date().toISOString() };
      }
      
      const parsed = JSON.parse(data) as CustomSuggestionData;
      if (!Array.isArray(parsed.customs)) {
        throw new Error('Invalid custom suggestions data');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to load custom suggestions:', error);
      return { customs: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * 新しいカスタム気晴らしを追加
   */
  static addCustomSuggestion(formData: CustomSuggestionFormData): boolean {
    try {
      // バリデーション
      const validation = this.validateFormData(formData);
      if (Object.keys(validation).length > 0) {
        console.error('Validation errors:', validation);
        return false;
      }

      const data = this.getCustomSuggestions();
      
      // 新しいカスタム気晴らしを作成
      const newCustom: CustomSuggestion = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        duration: formData.duration,
        steps: formData.steps.filter(step => step.trim() !== '').map(step => step.trim()),
        createdAt: new Date().toISOString(),
        isCustom: true,
      };

      // 新しい項目を先頭に追加
      data.customs.unshift(newCustom);
      
      // 最大件数を超えたら古いものから削除
      if (data.customs.length > MAX_CUSTOM_SUGGESTIONS) {
        data.customs = data.customs.slice(0, MAX_CUSTOM_SUGGESTIONS);
      }
      
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // storage イベントを発火（他のタブと同期）
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to add custom suggestion:', error);
      return false;
    }
  }

  /**
   * カスタム気晴らしを更新
   */
  static updateCustomSuggestion(id: string, formData: CustomSuggestionFormData): boolean {
    try {
      // バリデーション
      const validation = this.validateFormData(formData);
      if (Object.keys(validation).length > 0) {
        console.error('Validation errors:', validation);
        return false;
      }

      const data = this.getCustomSuggestions();
      const index = data.customs.findIndex(item => item.id === id);
      
      if (index === -1) {
        return false;
      }
      
      // 既存の項目を更新
      data.customs[index] = {
        ...data.customs[index],
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        duration: formData.duration,
        steps: formData.steps.filter(step => step.trim() !== '').map(step => step.trim()),
        updatedAt: new Date().toISOString(),
      };
      
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to update custom suggestion:', error);
      return false;
    }
  }

  /**
   * カスタム気晴らしを削除
   */
  static deleteCustomSuggestion(id: string): boolean {
    try {
      const data = this.getCustomSuggestions();
      const filteredCustoms = data.customs.filter(item => item.id !== id);
      
      if (filteredCustoms.length === data.customs.length) {
        return false; // 項目が見つからなかった
      }
      
      data.customs = filteredCustoms;
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to delete custom suggestion:', error);
      return false;
    }
  }

  /**
   * すべてのカスタム気晴らしをクリア
   */
  static clearCustomSuggestions(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to clear custom suggestions:', error);
      return false;
    }
  }

  /**
   * フォームデータのバリデーション
   */
  static validateFormData(formData: CustomSuggestionFormData) {
    const errors: Record<string, string> = {};

    // タイトルの検証
    if (!formData.title || formData.title.trim().length === 0) {
      errors.title = 'タイトルは必須です';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'タイトルは100文字以内で入力してください';
    }

    // 説明の検証
    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = '説明は必須です';
    } else if (formData.description.trim().length > 500) {
      errors.description = '説明は500文字以内で入力してください';
    }

    // 時間の検証
    if (!formData.duration || formData.duration < 1 || formData.duration > 120) {
      errors.duration = '時間は1分以上120分以下で設定してください';
    }

    // ステップの検証
    const validSteps = formData.steps.filter(step => step.trim() !== '');
    if (validSteps.length > 10) {
      errors.steps = 'ステップは10個以下で設定してください';
    }

    return errors;
  }

  /**
   * カスタム気晴らしのエクスポート
   */
  static exportCustomSuggestions(): string {
    const data = this.getCustomSuggestions();
    return JSON.stringify(data, null, 2);
  }

  /**
   * カスタム気晴らしのインポート
   */
  static importCustomSuggestions(jsonData: string, merge: boolean = false): boolean {
    try {
      const importedData = JSON.parse(jsonData) as CustomSuggestionData;
      
      if (!Array.isArray(importedData.customs)) {
        throw new Error('Invalid custom suggestions data format');
      }

      // 各カスタム気晴らしをバリデーション
      for (const custom of importedData.customs) {
        if (!custom.id || !custom.title || !custom.description || !custom.category || !custom.duration) {
          throw new Error('Invalid custom suggestion format');
        }
      }
      
      if (merge) {
        // 既存のデータとマージ
        const currentData = this.getCustomSuggestions();
        const mergedCustoms = [...importedData.customs, ...currentData.customs];
        
        // 重複を除去（IDベース）
        const uniqueCustoms = mergedCustoms.filter((item, index, self) =>
          index === self.findIndex(i => i.id === item.id)
        );
        
        // 最大件数制限
        const limitedCustoms = uniqueCustoms.slice(0, MAX_CUSTOM_SUGGESTIONS);
        
        const mergedData: CustomSuggestionData = {
          customs: limitedCustoms,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
      } else {
        // 既存のデータを置き換え
        // 最大件数制限を適用
        const limitedData: CustomSuggestionData = {
          customs: importedData.customs.slice(0, MAX_CUSTOM_SUGGESTIONS),
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedData));
      }
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to import custom suggestions:', error);
      return false;
    }
  }
}