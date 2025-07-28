import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';
import { FavoritesStorage } from '../../services/storage/favoritesStorage';
import { CustomStorage } from '../../services/storage/customStorage';
import { AppDataManager } from '../../services/storage/appDataManager';

// テストデータ用の定数
const FAVORITE_ITEM = {
  id: 'test-fav-1',
  title: 'テストお気に入り',
  description: 'これはお気に入りの説明です。',
  category: '認知的' as const,
  duration: 5,
  steps: ['ステップ1'],
};

const CUSTOM_ITEM = {
  title: 'テストカスタム',
  description: 'これはカスタム提案の説明です。',
  category: '行動的' as const,
  duration: 10,
  steps: ['ステップA', 'ステップB'],
};

describe('Settings - 統合データ管理機能', () => {
  const mockOnBack = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  // DOM操作のモックを設定
  beforeAll(() => {
    // document.createElementのモック
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const element = originalCreateElement('a');
        // clickメソッドをモック
        element.click = vi.fn();
        return element;
      }
      return originalCreateElement(tagName);
    });
    
    // document.body.appendChildとremoveChildのモック
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });
  
  afterAll(() => {
    vi.restoreAllMocks();
  });

  // 各テストの前にローカルストレージをクリアし、userEventをセットアップ
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it('統合データ管理セクションが正しく表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    expect(screen.getByText('全データ管理')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全データをエクスポート/ })).toBeInTheDocument();
    expect(screen.getByText('インポート（置換）')).toBeInTheDocument();
    expect(screen.getByText('マージ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /全データをクリア/ })).toBeInTheDocument();
  });

  it('統計を表示ボタンが動作し、正しい統計が表示される', async () => {
    // 1. テストデータを準備
    FavoritesStorage.addFavorite(FAVORITE_ITEM);
    CustomStorage.addCustomSuggestion(CUSTOM_ITEM);

    // 2. コンポーネントをレンダリング
    render(<Settings onBack={mockOnBack} />);

    // 3. "統計を表示" ボタンを見つけてクリック
    // "全データ管理"セクションの中にあるボタン、と特定する
    const dataManagementSection = screen.getByText('全データ管理').closest('div');
    expect(dataManagementSection).not.toBeNull();
    const statsButton = within(dataManagementSection!).getByText('統計を表示');
    await user.click(statsButton);

    // 4. 統計情報が表示されるのを待つ
    await waitFor(() => {
      const statsContainer = screen.getByText('お気に入り:').closest('div');
      expect(statsContainer).toBeInTheDocument();
      expect(within(statsContainer!).getByText('1件')).toBeInTheDocument();
    });
    
    const customsContainer = screen.getByText('カスタム:').closest('div');
    expect(customsContainer).toBeInTheDocument();
    expect(within(customsContainer!).getByText('1件')).toBeInTheDocument();
  });

  it('全データエクスポートボタンをクリックすると成功メッセージが表示される', async () => {
    render(<Settings onBack={mockOnBack} />);
    const exportButton = screen.getByRole('button', { name: /全データをエクスポート/ });
    await user.click(exportButton);
    expect(await screen.findByText('全データをエクスポートしました')).toBeInTheDocument();
  });

  it('有効なファイルを置換モードでインポートできる', async () => {
    render(<Settings onBack={mockOnBack} />);
    FavoritesStorage.addFavorite({ ...FAVORITE_ITEM, id: 'existing-1' });

    const importData = { ...CUSTOM_ITEM, id: 'imported-1' };
    const file = new File([JSON.stringify({ version: '1.0.0', data: { customSuggestions: { customs: [importData] } } })], 'import.json', { type: 'application/json' });

    const importInput = screen.getByText('インポート（置換）').parentElement?.querySelector('input[type="file"]');
    expect(importInput).not.toBeNull();
    await user.upload(importInput!, file);

    expect(await screen.findByText(/全データをインポートしました/)).toBeInTheDocument();
    expect(CustomStorage.getCustomSuggestions().customs[0].title).toBe(importData.title);
    expect(FavoritesStorage.getFavorites().favorites).toHaveLength(0); // 既存データは消える
  });

  it('全データクリアボタンをクリックすると確認ダイアログが表示され、クリアが実行される', async () => {
    render(<Settings onBack={mockOnBack} />);
    FavoritesStorage.addFavorite(FAVORITE_ITEM);

    const clearButton = screen.getByRole('button', { name: /全データをクリア/ });
    await user.click(clearButton);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('全データをクリアしますか？')).toBeInTheDocument();

    const confirmButton = within(dialog).getByRole('button', { name: 'クリア' });
    await user.click(confirmButton);

    expect(await screen.findByText('全データをクリアしました')).toBeInTheDocument();
    expect(FavoritesStorage.getFavorites().favorites).toHaveLength(0);
  });

  it('ローディング中にエクスポートボタンが無効化される', async () => {
    const originalDownload = AppDataManager.downloadBackup;
    AppDataManager.downloadBackup = vi.fn(() => new Promise(resolve => setTimeout(resolve, 50)));
    
    render(<Settings onBack={mockOnBack} />);
    const exportButton = screen.getByRole('button', { name: /全データをエクスポート/ });
    
    await user.click(exportButton);
    
    await waitFor(() => expect(exportButton).toBeDisabled());
    await waitFor(() => expect(exportButton).not.toBeDisabled());

    AppDataManager.downloadBackup = originalDownload;
  });
});