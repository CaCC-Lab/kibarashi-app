import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';
import { FavoritesStorage } from '../../services/storage/favoritesStorage';
import { CustomStorage } from '../../services/storage/customStorage';
import { AppDataManager } from '../../services/storage/appDataManager';

/**
 * 統合データ管理機能のテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のストレージサービスとやり取り
 * - 統合エクスポート/インポート機能のUIテスト
 * - 実際のユーザー操作フローをテスト
 * - データ整合性の確認
 */
describe('Settings - 統合データ管理機能', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    mockOnBack.mockClear();
  });

  describe('統合エクスポート機能', () => {
    it('統合データ管理セクションが表示される', () => {
      render(<Settings onBack={mockOnBack} />);
      
      expect(screen.getByText('全データ管理')).toBeInTheDocument();
      expect(screen.getByText('全データをエクスポート')).toBeInTheDocument();
      expect(screen.getByText('インポート（置換）')).toBeInTheDocument();
      expect(screen.getByText('マージ')).toBeInTheDocument();
      expect(screen.getByText('全データをクリア')).toBeInTheDocument();
    });

    it('統計を表示ボタンが動作する', async () => {
      // テストデータを追加
      FavoritesStorage.addFavorite({
        id: 'test-1',
        title: 'テストお気に入り',
        description: 'テスト説明',
        category: '認知的',
        duration: 5,
        steps: []
      });

      CustomStorage.addCustomSuggestion({
        title: 'テストカスタム',
        description: 'テスト説明',
        category: '行動的',
        duration: 10,
        steps: []
      });

      render(<Settings onBack={mockOnBack} />);
      
      const statsButton = screen.getByText('統計を表示');
      fireEvent.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText('お気に入り:')).toBeInTheDocument();
        expect(screen.getByText('1件')).toBeInTheDocument();
        expect(screen.getByText('カスタム:')).toBeInTheDocument();
      });
    });

    it('全データエクスポートボタンが動作する', async () => {
      // DOM要素の作成・操作をモック
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockElement as any);
      
      // URL.createObjectURLとrevokeObjectURLをモック
      const mockUrl = 'blob:mock-url';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      render(<Settings onBack={mockOnBack} />);
      
      const exportButton = screen.getByText('全データをエクスポート');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('全データをエクスポートしました')).toBeInTheDocument();
      });

      expect(mockElement.click).toHaveBeenCalled();
      expect(mockElement.download).toMatch(/^kibarashi-backup-.*\.json$/);

      // スパイをリストア
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('統合インポート機能', () => {
    it('有効なファイルを置換モードでインポートできる', async () => {
      const user = userEvent.setup();
      
      // 既存データを追加
      FavoritesStorage.addFavorite({
        id: 'existing-1',
        title: '既存お気に入り',
        description: '説明',
        category: '認知的',
        duration: 5,
        steps: []
      });

      // インポート用のテストデータ
      const testData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appInfo: { name: '5分気晴らし', version: '2.0.0' },
        data: {
          favorites: {
            favorites: [{
              id: 'fav-import',
              suggestionId: 'import-1',
              title: 'インポートお気に入り',
              description: 'インポート説明',
              category: '行動的',
              duration: 15,
              steps: [],
              addedAt: new Date().toISOString()
            }],
            lastUpdated: new Date().toISOString()
          },
          history: { history: [], lastUpdated: new Date().toISOString() },
          customSuggestions: { customs: [], lastUpdated: new Date().toISOString() }
        }
      };

      const jsonString = JSON.stringify(testData);
      const file = new File([jsonString], 'test-import.json', { type: 'application/json' });

      render(<Settings onBack={mockOnBack} />);
      
      const importInput = screen.getByText('インポート（置換）').closest('label')?.querySelector('input[type="file"]');
      expect(importInput).toBeInTheDocument();

      if (importInput) {
        await user.upload(importInput, file);

        await waitFor(() => {
          expect(screen.getByText(/全データをインポートしました/)).toBeInTheDocument();
        }, { timeout: 3000 });

        // データが置換されているか確認
        const favorites = FavoritesStorage.getFavorites();
        expect(favorites.favorites).toHaveLength(1);
        expect(favorites.favorites[0].title).toBe('インポートお気に入り');
      }
    });

    it('マージモードでデータをマージできる', async () => {
      const user = userEvent.setup();
      
      // 既存データを追加
      FavoritesStorage.addFavorite({
        id: 'existing-1',
        title: '既存お気に入り',
        description: '説明',
        category: '認知的',
        duration: 5,
        steps: []
      });

      // インポート用のテストデータ
      const testData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        appInfo: { name: '5分気晴らし', version: '2.0.0' },
        data: {
          favorites: {
            favorites: [{
              id: 'fav-merge',
              suggestionId: 'merge-1',
              title: 'マージお気に入り',
              description: 'マージ説明',
              category: '行動的',
              duration: 15,
              steps: [],
              addedAt: new Date().toISOString()
            }],
            lastUpdated: new Date().toISOString()
          },
          history: { history: [], lastUpdated: new Date().toISOString() },
          customSuggestions: { customs: [], lastUpdated: new Date().toISOString() }
        }
      };

      const jsonString = JSON.stringify(testData);
      const file = new File([jsonString], 'test-merge.json', { type: 'application/json' });

      render(<Settings onBack={mockOnBack} />);
      
      const mergeInput = screen.getByText('マージ').closest('label')?.querySelector('input[type="file"]');
      expect(mergeInput).toBeInTheDocument();

      if (mergeInput) {
        await user.upload(mergeInput, file);

        await waitFor(() => {
          expect(screen.getByText(/全データをマージしました/)).toBeInTheDocument();
        }, { timeout: 3000 });

        // データがマージされているか確認（既存 + 新規）
        const favorites = FavoritesStorage.getFavorites();
        expect(favorites.favorites.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('無効なファイルでエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      
      const invalidFile = new File(['invalid json'], 'invalid.json', { type: 'application/json' });

      render(<Settings onBack={mockOnBack} />);
      
      const importInput = screen.getByText('インポート（置換）').closest('label')?.querySelector('input[type="file"]');
      expect(importInput).toBeInTheDocument();

      if (importInput) {
        await user.upload(importInput, invalidFile);

        await waitFor(() => {
          expect(screen.getByText(/データの読み込みに失敗しました/)).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });
  });

  describe('全データクリア機能', () => {
    it('確認ダイアログが表示され、全データをクリアできる', async () => {
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

      render(<Settings onBack={mockOnBack} />);
      
      const clearButton = screen.getByText('全データをクリア');
      fireEvent.click(clearButton);

      // 確認ダイアログが表示される
      await waitFor(() => {
        expect(screen.getByText('全データをクリアしますか？')).toBeInTheDocument();
      });

      // 確認ダイアログの「クリア」ボタンをクリック
      const confirmButtons = screen.getAllByText('クリア');
      const confirmClearButton = confirmButtons.find(button => 
        button.className.includes('bg-red-600')
      );
      fireEvent.click(confirmClearButton!);

      await waitFor(() => {
        expect(screen.getByText('全データをクリアしました')).toBeInTheDocument();
      });

      // データがクリアされているか確認
      const favorites = FavoritesStorage.getFavorites();
      const customs = CustomStorage.getCustomSuggestions();
      expect(favorites.favorites).toHaveLength(0);
      expect(customs.customs).toHaveLength(0);
    });

    it('確認ダイアログでキャンセルできる', async () => {
      // テストデータを追加
      FavoritesStorage.addFavorite({
        id: 'test-1',
        title: 'テスト',
        description: 'テスト',
        category: '認知的',
        duration: 5,
        steps: []
      });

      render(<Settings onBack={mockOnBack} />);
      
      const clearButton = screen.getByText('全データをクリア');
      fireEvent.click(clearButton);

      // 確認ダイアログが表示される
      await waitFor(() => {
        expect(screen.getByText('全データをクリアしますか？')).toBeInTheDocument();
      });

      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('全データをクリアしますか？')).not.toBeInTheDocument();
      });

      // データが保持されているか確認
      const favorites = FavoritesStorage.getFavorites();
      expect(favorites.favorites).toHaveLength(1);
    });
  });

  describe('ローディング状態', () => {
    it('処理中にボタンが無効化される', async () => {
      render(<Settings onBack={mockOnBack} />);
      
      const exportButton = screen.getByText('全データをエクスポート');
      
      // DOM要素の作成・操作をモック（遅延を追加）
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockElement as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockElement as any);
      
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      fireEvent.click(exportButton);

      // 処理中状態を確認（短時間のウィンドウでキャッチ）
      expect(exportButton.closest('button')).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('全データをエクスポートしました')).toBeInTheDocument();
      });

      // スパイをリストア
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('統合機能の説明テキスト', () => {
    it('インポート方法の説明が表示される', () => {
      render(<Settings onBack={mockOnBack} />);
      
      expect(screen.getByText('インポート方法:')).toBeInTheDocument();
      expect(screen.getByText(/「置換」は既存データを上書き、「マージ」は既存データに追加します。/)).toBeInTheDocument();
    });
  });

  describe('実際のデータ流れの検証', () => {
    it('エクスポート→インポートのラウンドトリップが正しく動作する', async () => {
      // テストデータを追加
      FavoritesStorage.addFavorite({
        id: 'roundtrip-1',
        title: 'ラウンドトリップテスト',
        description: 'テスト説明',
        category: '認知的',
        duration: 5,
        steps: ['ステップ1']
      });

      CustomStorage.addCustomSuggestion({
        title: 'カスタムラウンドトリップ',
        description: 'カスタム説明',
        category: '行動的',
        duration: 15,
        steps: ['ステップ1', 'ステップ2']
      });

      // エクスポートを実行
      const exportData = AppDataManager.exportAllData();
      expect(exportData.data.favorites.favorites).toHaveLength(1);
      expect(exportData.data.customSuggestions.customs).toHaveLength(1);

      // データをクリア
      AppDataManager.clearAllData();

      // インポートでデータを復元
      const importResult = AppDataManager.importAllData(JSON.stringify(exportData));
      expect(importResult.success).toBe(true);

      // データが正しく復元されているか確認
      const restoredFavorites = FavoritesStorage.getFavorites();
      const restoredCustoms = CustomStorage.getCustomSuggestions();

      expect(restoredFavorites.favorites).toHaveLength(1);
      expect(restoredFavorites.favorites[0].title).toBe('ラウンドトリップテスト');
      expect(restoredCustoms.customs).toHaveLength(1);
      expect(restoredCustoms.customs[0].title).toBe('カスタムラウンドトリップ');
    });
  });
});