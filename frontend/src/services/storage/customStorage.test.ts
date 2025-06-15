import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomStorage } from './customStorage';
import type { CustomSuggestionFormData } from '../../types/custom';

/**
 * CustomStorageクラスのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを使用
 * - バリデーション機能を重視
 * - データの永続化とエラーハンドリングを検証
 */
describe('CustomStorage', () => {
  const mockFormData: CustomSuggestionFormData = {
    title: 'テスト気晴らし',
    description: 'これはテスト用の気晴らしです',
    category: '認知的',
    duration: 10,
    steps: ['ステップ1', 'ステップ2', 'ステップ3']
  };

  // console.errorをスパイ化してテスト中のエラー出力を抑制
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    // 各テスト前にスパイをリセット
    consoleErrorSpy.mockClear();
  });

  describe('getCustomSuggestionsのテスト', () => {
    it('初期状態では空の配列を返す', () => {
      const result = CustomStorage.getCustomSuggestions();
      
      expect(result.customs).toEqual([]);
      expect(result.lastUpdated).toBeTruthy();
    });

    it('保存されたデータを正しく取得できる', () => {
      const data = {
        customs: [{
          id: 'custom-1',
          title: 'テスト',
          description: '説明',
          category: '認知的' as const,
          duration: 5,
          steps: ['step1'],
          createdAt: new Date().toISOString(),
          isCustom: true as const
        }],
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('kibarashi_custom_suggestions', JSON.stringify(data));
      
      const result = CustomStorage.getCustomSuggestions();
      expect(result.customs).toHaveLength(1);
      expect(result.customs[0].title).toBe('テスト');
    });

    it('不正なデータの場合は空の配列を返す', () => {
      localStorage.setItem('kibarashi_custom_suggestions', 'invalid json');
      
      const result = CustomStorage.getCustomSuggestions();
      expect(result.customs).toEqual([]);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load custom suggestions:', expect.any(Error));
    });
  });

  describe('addCustomSuggestionのテスト', () => {
    it('カスタム気晴らしを追加できる', () => {
      const success = CustomStorage.addCustomSuggestion(mockFormData);
      
      expect(success).toBe(true);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(1);
      expect(data.customs[0].title).toBe('テスト気晴らし');
      expect(data.customs[0].isCustom).toBe(true);
    });

    it('無効なデータは追加できない', () => {
      const invalidData: CustomSuggestionFormData = {
        title: '', // 空のタイトル
        description: 'テスト',
        category: '認知的',
        duration: 5,
        steps: []
      };

      const success = CustomStorage.addCustomSuggestion(invalidData);
      expect(success).toBe(false);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(0);
    });

    it('最大数を超えた場合は古いものを削除', () => {
      // 50個追加
      for (let i = 0; i < 50; i++) {
        const formData: CustomSuggestionFormData = {
          ...mockFormData,
          title: `テスト${i}`
        };
        CustomStorage.addCustomSuggestion(formData);
      }
      
      // 51個目を追加
      const newFormData: CustomSuggestionFormData = {
        ...mockFormData,
        title: '新しい気晴らし'
      };
      const success = CustomStorage.addCustomSuggestion(newFormData);
      
      expect(success).toBe(true);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(50);
      expect(data.customs[0].title).toBe('新しい気晴らし'); // 新しいものが先頭に
    });

    it('ステップの空文字列を除去する', () => {
      const formDataWithEmptySteps: CustomSuggestionFormData = {
        ...mockFormData,
        steps: ['ステップ1', '', 'ステップ3', '   ', 'ステップ5']
      };

      const success = CustomStorage.addCustomSuggestion(formDataWithEmptySteps);
      expect(success).toBe(true);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs[0].steps).toEqual(['ステップ1', 'ステップ3', 'ステップ5']);
    });
  });

  describe('updateCustomSuggestionのテスト', () => {
    it('カスタム気晴らしを更新できる', () => {
      // 先に追加
      CustomStorage.addCustomSuggestion(mockFormData);
      const data = CustomStorage.getCustomSuggestions();
      const customId = data.customs[0].id;

      // 更新
      const updatedFormData: CustomSuggestionFormData = {
        ...mockFormData,
        title: '更新されたタイトル'
      };
      
      const success = CustomStorage.updateCustomSuggestion(customId, updatedFormData);
      expect(success).toBe(true);
      
      const updatedData = CustomStorage.getCustomSuggestions();
      expect(updatedData.customs[0].title).toBe('更新されたタイトル');
      expect(updatedData.customs[0].updatedAt).toBeDefined();
    });

    it('存在しないIDの更新はfalseを返す', () => {
      const success = CustomStorage.updateCustomSuggestion('non-existent', mockFormData);
      expect(success).toBe(false);
    });
  });

  describe('deleteCustomSuggestionのテスト', () => {
    it('カスタム気晴らしを削除できる', () => {
      CustomStorage.addCustomSuggestion(mockFormData);
      const data = CustomStorage.getCustomSuggestions();
      const customId = data.customs[0].id;
      
      const success = CustomStorage.deleteCustomSuggestion(customId);
      expect(success).toBe(true);
      
      const updatedData = CustomStorage.getCustomSuggestions();
      expect(updatedData.customs).toHaveLength(0);
    });

    it('存在しないIDの削除はfalseを返す', () => {
      const success = CustomStorage.deleteCustomSuggestion('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('validateFormDataのテスト', () => {
    it('有効なデータはエラーなし', () => {
      const errors = CustomStorage.validateFormData(mockFormData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('タイトルが空の場合エラー', () => {
      const invalidData = { ...mockFormData, title: '' };
      const errors = CustomStorage.validateFormData(invalidData);
      expect(errors.title).toBeDefined();
    });

    it('タイトルが長すぎる場合エラー', () => {
      const invalidData = { ...mockFormData, title: 'a'.repeat(101) };
      const errors = CustomStorage.validateFormData(invalidData);
      expect(errors.title).toBeDefined();
    });

    it('説明が空の場合エラー', () => {
      const invalidData = { ...mockFormData, description: '' };
      const errors = CustomStorage.validateFormData(invalidData);
      expect(errors.description).toBeDefined();
    });

    it('時間が範囲外の場合エラー', () => {
      const invalidData1 = { ...mockFormData, duration: 0 };
      const invalidData2 = { ...mockFormData, duration: 121 };
      
      const errors1 = CustomStorage.validateFormData(invalidData1);
      const errors2 = CustomStorage.validateFormData(invalidData2);
      
      expect(errors1.duration).toBeDefined();
      expect(errors2.duration).toBeDefined();
    });

    it('ステップが多すぎる場合エラー', () => {
      const invalidData = { 
        ...mockFormData, 
        steps: Array(11).fill('ステップ') 
      };
      const errors = CustomStorage.validateFormData(invalidData);
      expect(errors.steps).toBeDefined();
    });
  });

  describe('clearCustomSuggestionsのテスト', () => {
    it('すべてのカスタム気晴らしをクリアできる', () => {
      CustomStorage.addCustomSuggestion(mockFormData);
      CustomStorage.addCustomSuggestion({ ...mockFormData, title: 'テスト2' });
      
      CustomStorage.clearCustomSuggestions();
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(0);
      
      // localStorageから削除されている
      expect(localStorage.getItem('kibarashi_custom_suggestions')).toBeNull();
    });
  });

  describe('exportCustomSuggestionsのテスト', () => {
    it('JSON形式でエクスポートできる', () => {
      CustomStorage.addCustomSuggestion(mockFormData);
      CustomStorage.addCustomSuggestion({ ...mockFormData, title: 'テスト2' });
      
      const exported = CustomStorage.exportCustomSuggestions();
      const data = JSON.parse(exported);
      
      expect(data.customs).toHaveLength(2);
      expect(data.customs[0].title).toBe('テスト2'); // 新しいものが先頭
      expect(data.customs[1].title).toBe('テスト気晴らし');
    });

    it('整形されたJSONを出力する', () => {
      CustomStorage.addCustomSuggestion(mockFormData);
      
      const exported = CustomStorage.exportCustomSuggestions();
      
      // インデントされているか確認
      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });
  });

  describe('importCustomSuggestionsのテスト', () => {
    it('有効なJSONをインポートできる', () => {
      const importData = {
        customs: [{
          id: 'imported-1',
          title: 'インポートされた気晴らし',
          description: 'インポートテスト',
          category: '行動的' as const,
          duration: 15,
          steps: ['ステップ1'],
          createdAt: new Date().toISOString(),
          isCustom: true as const
        }],
        lastUpdated: new Date().toISOString()
      };
      
      const success = CustomStorage.importCustomSuggestions(JSON.stringify(importData));
      expect(success).toBe(true);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(1);
      expect(data.customs[0].title).toBe('インポートされた気晴らし');
    });

    it('無効なJSONは失敗する', () => {
      const success = CustomStorage.importCustomSuggestions('invalid json');
      expect(success).toBe(false);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to import custom suggestions:', expect.any(Error));
    });

    it('不正な形式は失敗する', () => {
      const success = CustomStorage.importCustomSuggestions(JSON.stringify({ data: 'test' }));
      expect(success).toBe(false);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to import custom suggestions:', expect.any(Error));
    });

    it('マージオプションが動作する', () => {
      // 既存データを追加
      CustomStorage.addCustomSuggestion(mockFormData);
      
      const importData = {
        customs: [{
          id: 'imported-1',
          title: 'インポートされた気晴らし',
          description: 'インポートテスト',
          category: '行動的' as const,
          duration: 15,
          steps: [],
          createdAt: new Date().toISOString(),
          isCustom: true as const
        }],
        lastUpdated: new Date().toISOString()
      };
      
      const success = CustomStorage.importCustomSuggestions(JSON.stringify(importData), true);
      expect(success).toBe(true);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(2); // マージされている
    });

    it('最大数を超える場合は制限される', () => {
      const customs = [];
      for (let i = 0; i < 60; i++) {
        customs.push({
          id: `imported-${i}`,
          title: `インポート${i}`,
          description: 'テスト',
          category: '認知的' as const,
          duration: 5,
          steps: [],
          createdAt: new Date().toISOString(),
          isCustom: true as const
        });
      }
      
      const importData = { customs, lastUpdated: new Date().toISOString() };
      
      const success = CustomStorage.importCustomSuggestions(JSON.stringify(importData));
      expect(success).toBe(true);
      
      const data = CustomStorage.getCustomSuggestions();
      expect(data.customs).toHaveLength(50); // 制限されている
    });
  });
});