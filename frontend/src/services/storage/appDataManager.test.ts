import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppDataManager, type AppDataExport } from './appDataManager';
import { FavoritesStorage } from './favoritesStorage';
import { HistoryStorage } from './historyStorage';
import { CustomStorage } from './customStorage';

/**
 * AppDataManagerのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のストレージサービスとやり取り
 * - 統合エクスポート/インポート機能の包括的テスト
 * - エラーハンドリングも実際の状況で検証
 * - データ整合性と検証機能の確認
 */
describe('AppDataManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('エクスポート機能', () => {
    it('空の状態で正しいフォーマットでエクスポートできる', () => {
      const exportData = AppDataManager.exportAllData();

      expect(exportData).toMatchObject({
        version: '1.0.0',
        appInfo: {
          name: '5分気晴らし',
          version: '2.0.0'
        },
        data: {
          favorites: { favorites: [], lastUpdated: expect.any(String) },
          history: { history: [], lastUpdated: expect.any(String) },
          customSuggestions: { customs: [], lastUpdated: expect.any(String) }
        }
      });
      expect(exportData.exportedAt).toBeTruthy();
    });

    it('データがある状態で正しくエクスポートできる', () => {
      // テストデータを追加
      const testSuggestion = {
        id: 'test-1',
        title: 'テスト提案',
        description: 'テスト説明',
        category: '認知的' as const,
        duration: 5,
        steps: ['ステップ1']
      };

      // お気に入りを追加
      FavoritesStorage.addFavorite(testSuggestion);

      // 履歴を追加
      const historyItem = {
        id: 'history-1',
        suggestionId: 'test-1',
        title: 'テスト提案',
        description: 'テスト説明',
        category: '認知的' as const,
        duration: 5,
        situation: 'workplace' as const,
        startedAt: new Date().toISOString(),
        completed: true,
        rating: 4,
        memo: 'テストメモ'
      };
      HistoryStorage.addHistoryItem(historyItem);

      // カスタム提案を追加
      CustomStorage.addCustomSuggestion({
        title: 'カスタムテスト',
        description: 'カスタム説明',
        category: '行動的',
        duration: 10,
        steps: ['ステップ1', 'ステップ2']
      });

      const exportData = AppDataManager.exportAllData();

      expect(exportData.data.favorites.favorites).toHaveLength(1);
      expect(exportData.data.history.history).toHaveLength(1);
      expect(exportData.data.customSuggestions.customs).toHaveLength(1);
    });

    it('JSON文字列として正しくエクスポートできる', () => {
      const jsonString = AppDataManager.exportAllDataAsJSON();
      const parsed = JSON.parse(jsonString);

      expect(parsed).toMatchObject({
        version: '1.0.0',
        appInfo: {
          name: '5分気晴らし',
          version: '2.0.0'
        }
      });
    });

    it('エクスポート統計を正しく取得できる', () => {
      // テストデータを追加
      FavoritesStorage.addFavorite({
        id: 'test-1',
        title: 'テスト',
        description: 'テスト',
        category: '認知的',
        duration: 5,
        steps: []
      });

      const stats = AppDataManager.getExportStats();

      expect(stats).toMatchObject({
        totalFavorites: 1,
        totalHistory: 0,
        totalCustomSuggestions: 0,
        exportSize: expect.any(Number)
      });
      expect(stats.exportSize).toBeGreaterThan(0);
    });

    it('ダウンロードリンクを正しく作成できる', () => {
      // DOM要素の作成・操作をモック
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockElement as any);
      
      // URL.createObjectURLとrevokeObjectURLをモック（グローバルに追加）
      const mockUrl = 'blob:mock-url';
      const originalCreateObjectURL = global.URL?.createObjectURL;
      const originalRevokeObjectURL = global.URL?.revokeObjectURL;
      
      if (!global.URL) {
        global.URL = {} as any;
      }
      global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      global.URL.revokeObjectURL = vi.fn();

      expect(() => AppDataManager.downloadBackup()).not.toThrow();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockElement.download).toMatch(/^kibarashi-backup-.*\.json$/);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

      // スパイをリストア
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      if (originalCreateObjectURL) {
        global.URL.createObjectURL = originalCreateObjectURL;
      }
      if (originalRevokeObjectURL) {
        global.URL.revokeObjectURL = originalRevokeObjectURL;
      }
    });
  });

  describe('インポート機能（置換モード）', () => {
    it('有効なデータを正しくインポートできる', () => {
      const testData: AppDataExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appInfo: {
          name: '5分気晴らし',
          version: '2.0.0'
        },
        data: {
          favorites: {
            favorites: [{
              id: 'fav-1',
              suggestionId: 'test-1',
              title: 'インポートテスト',
              description: 'テスト説明',
              category: '認知的',
              duration: 5,
              steps: [],
              addedAt: new Date().toISOString()
            }],
            lastUpdated: new Date().toISOString()
          },
          history: {
            history: [{
              id: 'hist-1',
              suggestionId: 'test-1',
              title: '履歴テスト',
              description: 'テスト説明',
              category: '行動的',
              duration: 10,
              situation: 'home',
              startedAt: new Date().toISOString(),
              completed: true,
              rating: 5
            }],
            lastUpdated: new Date().toISOString()
          },
          customSuggestions: {
            customs: [{
              id: 'custom-1',
              title: 'カスタムテスト',
              description: 'カスタム説明',
              category: '認知的',
              duration: 8,
              steps: ['ステップ1'],
              createdAt: new Date().toISOString(),
              isCustom: true
            }],
            lastUpdated: new Date().toISOString()
          }
        }
      };

      const result = AppDataManager.importAllData(JSON.stringify(testData));

      expect(result.success).toBe(true);
      expect(result.importedData).toMatchObject({
        favorites: 1,
        history: 1,
        customSuggestions: 1
      });

      // 実際にデータが保存されているか確認
      const favorites = FavoritesStorage.getFavorites();
      const history = HistoryStorage.getHistory();
      const customs = CustomStorage.getCustomSuggestions();

      expect(favorites.favorites).toHaveLength(1);
      expect(history.history).toHaveLength(1);
      expect(customs.customs).toHaveLength(1);
    });

    it('無効なJSONでエラーを返す', () => {
      const result = AppDataManager.importAllData('invalid json');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('データの読み込みに失敗しました。ファイル形式を確認してください。');
    });

    it('無効なデータ構造でエラーを返す', () => {
      const invalidData = {
        version: '1.0.0',
        data: {
          favorites: 'invalid', // 配列ではない
          history: { history: [] },
          customSuggestions: { customs: [] }
        }
      };

      const result = AppDataManager.importAllData(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('お気に入りデータの形式が無効です');
    });

    it('バージョン情報がない場合にエラーを返す', () => {
      const invalidData = {
        data: {
          favorites: { favorites: [] },
          history: { history: [] },
          customSuggestions: { customs: [] }
        }
      };

      const result = AppDataManager.importAllData(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('バージョン情報が見つかりません');
    });
  });

  describe('インポート機能（マージモード）', () => {
    it('既存データとマージできる', () => {
      // 既存データを追加
      FavoritesStorage.addFavorite({
        id: 'existing-1',
        title: '既存のお気に入り',
        description: '説明',
        category: '認知的',
        duration: 5,
        steps: []
      });

      CustomStorage.addCustomSuggestion({
        title: '既存のカスタム',
        description: '説明',
        category: '行動的',
        duration: 10,
        steps: []
      });

      // 新しいデータをマージ
      const newData: AppDataExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appInfo: { name: '5分気晴らし', version: '2.0.0' },
        data: {
          favorites: {
            favorites: [{
              id: 'fav-new',
              suggestionId: 'new-1',
              title: '新しいお気に入り',
              description: '説明',
              category: '行動的',
              duration: 15,
              steps: [],
              addedAt: new Date().toISOString()
            }],
            lastUpdated: new Date().toISOString()
          },
          history: {
            history: [{
              id: 'hist-new',
              suggestionId: 'new-1',
              title: '新しい履歴',
              description: '説明',
              category: '認知的',
              duration: 5,
              situation: 'workplace',
              startedAt: new Date().toISOString(),
              completed: false
            }],
            lastUpdated: new Date().toISOString()
          },
          customSuggestions: {
            customs: [{
              id: 'custom-new',
              title: '新しいカスタム',
              description: '説明',
              category: '認知的',
              duration: 7,
              steps: [],
              createdAt: new Date().toISOString(),
              isCustom: true
            }],
            lastUpdated: new Date().toISOString()
          }
        }
      };

      const result = AppDataManager.mergeAllData(JSON.stringify(newData));

      expect(result.success).toBe(true);

      // マージ後のデータを確認
      const favorites = FavoritesStorage.getFavorites();
      const history = HistoryStorage.getHistory();
      const customs = CustomStorage.getCustomSuggestions();

      expect(favorites.favorites.length).toBeGreaterThanOrEqual(1); // 既存 + 新規（重複チェックあり）
      expect(history.history).toHaveLength(1);
      expect(customs.customs).toHaveLength(2); // 既存 + 新規
    });
  });

  describe('ファイルインポート機能', () => {
    it('ファイルから正しくインポートできる', async () => {
      const testData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appInfo: { name: '5分気晴らし', version: '2.0.0' },
        data: {
          favorites: { favorites: [], lastUpdated: new Date().toISOString() },
          history: { history: [], lastUpdated: new Date().toISOString() },
          customSuggestions: { customs: [], lastUpdated: new Date().toISOString() }
        }
      };

      const jsonString = JSON.stringify(testData);
      // Fileオブジェクトのtext()メソッドをモック
      const mockFile = {
        text: vi.fn().mockResolvedValue(jsonString)
      } as any;

      const result = await AppDataManager.importFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(mockFile.text).toHaveBeenCalled();
    });

    it('ファイル読み込みエラーを処理できる', async () => {
      // 無効なFileオブジェクトを作成
      const invalidFile = {
        text: () => Promise.reject(new Error('Read error'))
      } as File;

      const result = await AppDataManager.importFromFile(invalidFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('ファイルの読み込みに失敗しました');
    });
  });

  describe('データクリア機能', () => {
    it('全データを正しくクリアできる', () => {
      // テストデータを追加
      FavoritesStorage.addFavorite({
        id: 'test-1',
        title: 'テスト',
        description: 'テスト',
        category: '認知的',
        duration: 5,
        steps: []
      });

      CustomStorage.addCustomSuggestion({
        title: 'テスト',
        description: 'テスト',
        category: '行動的',
        duration: 10,
        steps: []
      });

      const success = AppDataManager.clearAllData();

      expect(success).toBe(true);

      // データがクリアされているか確認
      const favorites = FavoritesStorage.getFavorites();
      const history = HistoryStorage.getHistory();
      const customs = CustomStorage.getCustomSuggestions();

      expect(favorites.favorites).toHaveLength(0);
      expect(history.history).toHaveLength(0);
      expect(customs.customs).toHaveLength(0);
    });
  });

  describe('データ検証機能', () => {
    it('validateImportDataが適切に動作する', () => {
      // privateメソッドをテストするため、エラーケースでテスト
      const invalidData1 = null;
      const result1 = AppDataManager.importAllData(JSON.stringify(invalidData1));
      expect(result1.success).toBe(false);

      const invalidData2 = { version: '1.0.0' }; // dataセクションなし
      const result2 = AppDataManager.importAllData(JSON.stringify(invalidData2));
      expect(result2.success).toBe(false);
      expect(result2.errors).toContain('データセクションが見つかりません');

      const invalidData3 = {
        version: '1.0.0',
        data: {
          favorites: { favorites: 'invalid' }, // 配列ではない
          history: { history: [] },
          customSuggestions: { customs: [] }
        }
      };
      const result3 = AppDataManager.importAllData(JSON.stringify(invalidData3));
      expect(result3.success).toBe(false);
      expect(result3.errors).toContain('お気に入りデータの形式が無効です');
    });
  });

  describe('エラーハンドリング', () => {
    it('LocalStorageエラーを適切に処理する', () => {
      // 各ストレージサービスのインポートメソッドをモックしてエラーを発生させる
      const originalImportFavorites = FavoritesStorage.importFavorites;
      const originalImportHistory = HistoryStorage.importHistory;
      const originalImportCustom = CustomStorage.importCustomSuggestions;

      FavoritesStorage.importFavorites = vi.fn().mockReturnValue(false);
      HistoryStorage.importHistory = vi.fn().mockReturnValue(false);
      CustomStorage.importCustomSuggestions = vi.fn().mockReturnValue(false);

      try {
        const testData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          appInfo: { name: '5分気晴らし', version: '2.0.0' },
          data: {
            favorites: { favorites: [], lastUpdated: new Date().toISOString() },
            history: { history: [], lastUpdated: new Date().toISOString() },
            customSuggestions: { customs: [], lastUpdated: new Date().toISOString() }
          }
        };

        const result = AppDataManager.importAllData(JSON.stringify(testData));

        // インポートは成功するが、カウントは0になる
        expect(result.success).toBe(true);
        expect(result.importedData).toMatchObject({
          favorites: 0,
          history: 0,
          customSuggestions: 0
        });
      } finally {
        // ストレージサービスを復元
        FavoritesStorage.importFavorites = originalImportFavorites;
        HistoryStorage.importHistory = originalImportHistory;
        CustomStorage.importCustomSuggestions = originalImportCustom;
      }
    });
  });
});