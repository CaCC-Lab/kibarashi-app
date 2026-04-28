import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './Settings';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';

vi.mock('../../hooks/useFavorites');
vi.mock('../../hooks/useHistory');
vi.mock('../../hooks/useAgeGroup', () => ({
  useAgeGroup: () => ({ ageGroup: 'office_worker', updateAgeGroup: vi.fn() }),
}));
vi.mock('../../components/ageGroup/AgeGroupSelector', () => ({
  AgeGroupSelector: ({ onSelect }: { onSelect: (v: string) => void }) => (
    <button onClick={() => onSelect('student')}>年齢層を選択</button>
  ),
}));
vi.mock('./components/ClearDataDialog', () => ({
  ClearDataDialog: ({ showClearConfirm, onCancel, onConfirm }: {
    showClearConfirm: string | null;
    onCancel: () => void;
    onConfirm: (type: string) => void;
  }) => showClearConfirm ? (
    <div>
      <p>{showClearConfirm === 'favorites' ? 'お気に入りをクリアしますか？' : showClearConfirm === 'history' ? '履歴をクリアしますか？' : '全データをクリアしますか？'}</p>
      <p>この操作は取り消すことができません。</p>
      <button onClick={onCancel}>キャンセル</button>
      <button className="bg-red-600" onClick={() => onConfirm(showClearConfirm)}>クリア</button>
    </div>
  ) : null,
}));

describe('Settings', () => {
  const mockOnBack = vi.fn();
  const mockClearFavorites = vi.fn();
  const mockClearHistory = vi.fn();

  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(() => 'gemini'),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('戻るボタンが正しく機能する', () => {
    render(<Settings onBack={mockOnBack} />);
    fireEvent.click(screen.getByText('戻る'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('設定画面の主要セクションが表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    expect(screen.getByText('設定')).toBeInTheDocument();
    expect(screen.getByText('年齢層')).toBeInTheDocument();
    expect(screen.getByText('データ管理')).toBeInTheDocument();
  });

  it('アプリ情報が正しく表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    expect(screen.getByText('気晴らしレシピ v1.0.0')).toBeInTheDocument();
  });

  it('お気に入り削除の確認ダイアログが動作する', async () => {
    render(<Settings onBack={mockOnBack} />);

    fireEvent.click(screen.getByText('お気に入りを削除'));

    expect(screen.getByText('お気に入りをクリアしますか？')).toBeInTheDocument();

    const confirmButton = screen.getAllByText(/クリア/).find(
      btn => btn.className.includes('bg-red-600')
    );
    fireEvent.click(confirmButton!);

    expect(mockClearFavorites).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByText('お気に入りをクリアしました')).toBeInTheDocument();
    });
  });

  it('履歴削除の確認ダイアログが動作する', async () => {
    render(<Settings onBack={mockOnBack} />);

    fireEvent.click(screen.getByText('履歴を削除'));

    expect(screen.getByText('履歴をクリアしますか？')).toBeInTheDocument();
  });

  it('バックアップボタンが表示される', () => {
    render(<Settings onBack={mockOnBack} />);
    expect(screen.getByText('バックアップ')).toBeInTheDocument();
    expect(screen.getByText('復元')).toBeInTheDocument();
  });
});
