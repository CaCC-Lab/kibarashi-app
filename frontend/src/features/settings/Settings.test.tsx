import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './Settings';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { FavoritesStorage } from '../../services/storage/favoritesStorage';
import { HistoryStorage } from '../../services/storage/historyStorage';

// モックの設定
vi.mock('../../hooks/useDarkMode');
vi.mock('../../hooks/useFavorites');
vi.mock('../../hooks/useHistory');
vi.mock('../../services/storage/favoritesStorage');
vi.mock('../../services/storage/historyStorage');

describe('Settings', () => {
  const mockOnBack = vi.fn();
  const mockToggleDarkMode = vi.fn();
  const mockClearFavorites = vi.fn();
  const mockClearHistory = vi.fn();

  beforeEach(() => {
    // localStorage のモック
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'defaultTTS') return 'gemini';
        return null;
      }),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // フックのモック
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    vi.mocked(useFavorites).mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(),
      clearFavorites: mockClearFavorites,
      exportFavorites: vi.fn(),
      importFavorites: vi.fn(),
    });

    vi.mocked(useHistory).mockReturnValue({
      history: [],
      startHistory: vi.fn(),
      completeHistory: vi.fn(),
      clearHistory: mockClearHistory,
    });

    // ストレージのモック
    vi.mocked(FavoritesStorage.exportFavorites).mockReturnValue('[]');
    vi.mocked(HistoryStorage.exportHistory).mockReturnValue('[]');
    vi.mocked(FavoritesStorage.importFavorites).mockReturnValue(true);
    vi.mocked(HistoryStorage.importHistory).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('戻るボタンが正しく機能する', () => {
    render(<Settings onBack={mockOnBack} />);
    
    const backButton = screen.getByText('戻る');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('ダークモードトグルが正しく表示・動作する', () => {
    render(<Settings onBack={mockOnBack} />);
    
    const darkModeLabel = screen.getByText('ダークモード');
    expect(darkModeLabel).toBeInTheDocument();
    
    const toggleButton = darkModeLabel.parentElement?.querySelector('button');
    expect(toggleButton).toBeInTheDocument();
    
    fireEvent.click(toggleButton!);
    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it('デフォルト音声エンジンの選択が機能する', () => {
    render(<Settings onBack={mockOnBack} />);
    
    const geminiRadio = screen.getByLabelText('Gemini音声（高品質）');
    const browserRadio = screen.getByLabelText('ブラウザ音声（無料）');
    
    expect(geminiRadio).toBeChecked();
    expect(browserRadio).not.toBeChecked();
    
    fireEvent.click(browserRadio);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('defaultTTS', 'browser');
  });

  it('お気に入りのエクスポートボタンが表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    
    const exportButtons = screen.getAllByText('エクスポート');
    expect(exportButtons).toHaveLength(2);
    expect(exportButtons[0]).toBeInTheDocument();
  });

  it('履歴のエクスポートボタンが表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    
    const exportButtons = screen.getAllByText('エクスポート');
    expect(exportButtons).toHaveLength(2);
    expect(exportButtons[1]).toBeInTheDocument();
  });

  it('お気に入りのクリア確認ダイアログが表示される', async () => {
    render(<Settings onBack={mockOnBack} />);
    
    const clearButton = screen.getAllByText('クリア')[0];
    fireEvent.click(clearButton);
    
    // 確認ダイアログが表示される
    expect(screen.getByText('お気に入りをクリアしますか？')).toBeInTheDocument();
    expect(screen.getByText('この操作は取り消すことができません。')).toBeInTheDocument();
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    // ダイアログが閉じる
    await waitFor(() => {
      expect(screen.queryByText('お気に入りをクリアしますか？')).not.toBeInTheDocument();
    });
  });

  it('お気に入りのクリアが実行される', async () => {
    render(<Settings onBack={mockOnBack} />);
    
    const clearButton = screen.getAllByText('クリア')[0];
    fireEvent.click(clearButton);
    
    // 確認ダイアログが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByText('お気に入りをクリアしますか？')).toBeInTheDocument();
    });
    
    // 確認ダイアログでクリアボタンをクリック（赤いボタン）
    const confirmButtons = screen.getAllByText('クリア');
    const confirmClearButton = confirmButtons.find(button => 
      button.className.includes('bg-secondary-600')
    );
    fireEvent.click(confirmClearButton!);
    
    expect(mockClearFavorites).toHaveBeenCalledTimes(1);
    
    // クリア成功メッセージの確認
    await waitFor(() => {
      expect(screen.getByText('お気に入りをクリアしました')).toBeInTheDocument();
    });
  });

  it('履歴のクリアが実行される', async () => {
    render(<Settings onBack={mockOnBack} />);
    
    const clearButton = screen.getAllByText('クリア')[1];
    fireEvent.click(clearButton);
    
    // 確認ダイアログが表示される
    expect(screen.getByText('履歴をクリアしますか？')).toBeInTheDocument();
    
    // 確認ダイアログでクリアボタンをクリック
    const confirmClearButton = screen.getAllByText('クリア')[2];
    fireEvent.click(confirmClearButton);
    
    expect(mockClearHistory).toHaveBeenCalledTimes(1);
    
    // クリア成功メッセージの確認
    await waitFor(() => {
      expect(screen.getByText('履歴をクリアしました')).toBeInTheDocument();
    });
  });

  it('インポートボタンが表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    
    const importButtons = screen.getAllByText('インポート');
    expect(importButtons).toHaveLength(2);
    expect(importButtons[0]).toBeInTheDocument();
    expect(importButtons[1]).toBeInTheDocument();
  });

  it('アプリ情報が正しく表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    
    expect(screen.getByText('アプリ情報')).toBeInTheDocument();
    expect(screen.getByText('バージョン: 1.0.0 (Phase 2)')).toBeInTheDocument();
    expect(screen.getByText('© 2025 5分気晴らし')).toBeInTheDocument();
    expect(screen.getByText(/このアプリは完全無料でご利用いただけます/)).toBeInTheDocument();
  });

  it('ダークモードがオンの場合、トグルが正しい状態で表示される', () => {
    vi.mocked(useDarkMode).mockReturnValue({
      isDarkMode: true,
      toggleDarkMode: mockToggleDarkMode,
    });
    
    render(<Settings onBack={mockOnBack} />);
    
    const toggleButton = screen.getByText('ダークモード').parentElement?.querySelector('button');
    expect(toggleButton).toHaveClass('bg-primary-600');
  });

  it('設定画面の主要セクションが表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    
    expect(screen.getByText('設定')).toBeInTheDocument();
    expect(screen.getByText('アプリ設定')).toBeInTheDocument();
    expect(screen.getByText('データ管理')).toBeInTheDocument();
    expect(screen.getByText('アプリ情報')).toBeInTheDocument();
  });
});