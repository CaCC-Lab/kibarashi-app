import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppDataManager, type AppDataExport } from './appDataManager';
import { FavoritesStorage } from './favoritesStorage';

describe('AppDataManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ... (他のテストは変更なし) ...

  describe('ファイルインポート機能', () => {
    it('ファイルから正しくインポートできる', async () => {
      const testData: AppDataExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appInfo: { name: '5分気晴らし', version: '2.0.0' },
        data: {
          favorites: { favorites: [{ id: 'fav-1', suggestionId: 'test-1', title: 'インポートテスト', description: '説明', category: '認知的', duration: 5, steps: [], addedAt: new Date().toISOString() }], lastUpdated: new Date().toISOString() },
          history: { history: [], lastUpdated: new Date().toISOString() },
          customSuggestions: { customs: [], lastUpdated: new Date().toISOString() }
        }
      };

      const jsonString = JSON.stringify(testData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const mockFile = new File([blob], 'test.json', { type: 'application/json' });

      const result = await AppDataManager.importFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.importedData?.favorites).toBe(1);
      expect(FavoritesStorage.getFavorites().favorites[0].title).toBe('インポートテスト');
    });

    it('ファイル読み込みエラーを処理できる', async () => {
      // FileReaderのreadAsTextでエラーを発生させるモック
      // errorは使用されていないので削除
      const readerMock = {
        readAsText: vi.fn(function(this: FileReader) {
          if (this.onerror) {
            this.onerror(new ProgressEvent('error', { bubbles: true }));
          }
        }),
        onerror: null as ((this: FileReader, ev: ProgressEvent) => unknown) | null,
      };
      
      const fileReaderSpy = vi.spyOn(global, 'FileReader').mockImplementation(() => readerMock as unknown as FileReader);

      const mockFile = new File([''], 'error.json');
      const result = await AppDataManager.importFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('ファイルの読み込みに失敗しました');
      
      // モックをリストア
      fileReaderSpy.mockRestore();
    });
  });

  // ... (他のテストは変更なし) ...
});
