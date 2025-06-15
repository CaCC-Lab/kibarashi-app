import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryList from './HistoryList';
import { useHistory } from '../../hooks/useHistory';
import type { HistoryItem } from '../../types/history';

// useHistoryフックをモック
vi.mock('../../hooks/useHistory');

// 子コンポーネントをモック
vi.mock('./HistoryItem', () => ({
  default: ({ item, onDelete, onUpdateRating, onUpdateNote }: any) => (
    <div data-testid="history-item">
      <div>{item.title}</div>
      <div>{item.description}</div>
    </div>
  )
}));

vi.mock('./HistoryStats', () => ({
  default: ({ stats }: any) => (
    <div data-testid="history-stats">
      <div>統計情報</div>
      <div>総実行回数: {stats.totalCount}</div>
    </div>
  )
}));

vi.mock('./HistoryFilter', () => ({
  default: ({ filterType, filterValue, onFilterTypeChange, onFilterValueChange }: any) => (
    <div data-testid="history-filter">
      <div>フィルター:</div>
      <button onClick={() => onFilterTypeChange('all')}>すべて</button>
      <button onClick={() => onFilterTypeChange('situation')}>状況別</button>
      {filterType === 'situation' && (
        <div>
          <button onClick={() => onFilterValueChange('workplace')}>職場</button>
          <button onClick={() => onFilterValueChange('home')}>家</button>
          <button onClick={() => onFilterValueChange('outside')}>外出先</button>
        </div>
      )}
    </div>
  )
}));

vi.mock('../../components/common/Loading', () => ({
  default: () => <div>読み込み中...</div>
}));

vi.mock('../../components/common/ErrorMessage', () => ({
  default: ({ message, onRetry }: any) => (
    <div>
      <div>{message}</div>
      {onRetry && <button onClick={onRetry}>再試行</button>}
    </div>
  )
}));

/**
 * HistoryListコンポーネントのテスト
 * 
 * 設計思想：
 * - 履歴一覧の表示と管理機能を検証
 * - フィルタリング、エクスポート/インポート機能をテスト
 * - 空状態とデータあり状態の両方をカバー
 */
describe('HistoryList', () => {
  // URL.createObjectURLとURL.revokeObjectURLをモック
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
  const mockHistoryItems: HistoryItem[] = [
    {
      id: 'test-1',
      suggestionId: 'suggestion-1',
      title: 'テスト気晴らし1',
      description: '説明1',
      category: '認知的',
      duration: 5,
      situation: 'workplace',
      startedAt: '2024-01-15T10:00:00Z',
      completed: true,
      completedAt: '2024-01-15T10:05:00Z',
      actualDuration: 300,
      rating: 4,
      note: '良かった'
    },
    {
      id: 'test-2',
      suggestionId: 'suggestion-2',
      title: 'テスト気晴らし2',
      description: '説明2',
      category: '行動的',
      duration: 15,
      situation: 'home',
      startedAt: '2024-01-14T14:00:00Z',
      completed: false
    }
  ];

  const mockStats = {
    totalCount: 2,
    completedCount: 1,
    totalDuration: 300,
    averageRating: 4,
    categoryCounts: {
      認知的: 1,
      行動的: 1
    },
    situationCounts: {
      workplace: 1,
      home: 1,
      outside: 0
    }
  };

  const mockHooks = {
    history: mockHistoryItems,
    stats: mockStats,
    deleteHistoryItem: vi.fn().mockReturnValue(true),
    updateRating: vi.fn().mockReturnValue(true),
    updateNote: vi.fn().mockReturnValue(true),
    clearHistory: vi.fn().mockReturnValue(true),
    exportHistory: vi.fn().mockReturnValue(JSON.stringify({ history: mockHistoryItems })),
    importHistory: vi.fn().mockReturnValue(true),
    getHistoryByDateRange: vi.fn().mockReturnValue(mockHistoryItems),
    getHistoryBySituation: vi.fn().mockReturnValue([mockHistoryItems[0]]),
    getHistoryByCategory: vi.fn().mockReturnValue([mockHistoryItems[0]])
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useHistory as any).mockReturnValue(mockHooks);
  });

  describe('空状態の表示', () => {
    it('履歴がない場合、空状態メッセージが表示される', () => {
      (useHistory as any).mockReturnValue({
        ...mockHooks,
        history: [],
        stats: {
          totalCount: 0,
          completedCount: 0,
          totalDuration: 0,
          averageRating: undefined,
          categoryCounts: { 認知的: 0, 行動的: 0 },
          situationCounts: { workplace: 0, home: 0, outside: 0 }
        }
      });

      render(<HistoryList />);

      expect(screen.getByText('まだ実行履歴がありません')).toBeInTheDocument();
      expect(screen.getByText('気晴らしを実行すると、ここに履歴が表示されます')).toBeInTheDocument();
    });
  });

  describe('履歴一覧の表示', () => {
    it('履歴項目が表示される', () => {
      render(<HistoryList />);

      expect(screen.getByText('実行履歴')).toBeInTheDocument();
      expect(screen.getByText('テスト気晴らし1')).toBeInTheDocument();
      expect(screen.getByText('テスト気晴らし2')).toBeInTheDocument();
    });

    it('ヘッダーのアクションボタンが表示される', () => {
      render(<HistoryList />);

      expect(screen.getByLabelText('統計表示')).toBeInTheDocument();
      expect(screen.getByLabelText('エクスポート')).toBeInTheDocument();
      expect(screen.getByLabelText('インポート')).toBeInTheDocument();
      expect(screen.getByLabelText('履歴クリア')).toBeInTheDocument();
    });
  });

  describe('統計表示', () => {
    it('統計ボタンをクリックすると統計情報が表示される', () => {
      render(<HistoryList />);

      const statsButton = screen.getByLabelText('統計表示');
      fireEvent.click(statsButton);

      expect(screen.getByText('統計情報')).toBeInTheDocument();
    });

    it('再度クリックすると統計情報が非表示になる', () => {
      render(<HistoryList />);

      const statsButton = screen.getByLabelText('統計表示');
      fireEvent.click(statsButton);
      fireEvent.click(statsButton);

      expect(screen.queryByText('統計情報')).not.toBeInTheDocument();
    });
  });

  describe('フィルタリング機能', () => {
    it('フィルターコンポーネントが表示される', () => {
      render(<HistoryList />);

      expect(screen.getByText('フィルター:')).toBeInTheDocument();
      expect(screen.getByText('すべて')).toBeInTheDocument();
    });

    it('フィルターが適用されたときに履歴が絞り込まれる', () => {
      render(<HistoryList />);

      // 状況フィルターを選択
      fireEvent.click(screen.getByText('状況別'));
      fireEvent.click(screen.getByText('職場'));

      // workplaceの項目のみ表示される
      expect(screen.getByText('テスト気晴らし1')).toBeInTheDocument();
      expect(screen.queryByText('テスト気晴らし2')).not.toBeInTheDocument();
    });

    it('フィルターで一致する項目がない場合メッセージが表示される', () => {
      (useHistory as any).mockReturnValue({
        ...mockHooks,
        getHistoryBySituation: vi.fn().mockReturnValue([])
      });

      render(<HistoryList />);

      fireEvent.click(screen.getByText('状況別'));
      fireEvent.click(screen.getByText('職場'));

      expect(screen.getByText('条件に一致する履歴がありません')).toBeInTheDocument();
    });
  });

  describe('エクスポート機能', () => {
    it('エクスポートボタンをクリックするとファイルがダウンロードされる', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('エクスポート'));

      expect(mockHooks.exportHistory).toHaveBeenCalled();
    });
  });

  describe('インポート機能', () => {
    it('インポートボタンをクリックするとダイアログが表示される', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('インポート'));

      expect(screen.getByText('履歴のインポート')).toBeInTheDocument();
      expect(screen.getByText('JSONファイルを選択')).toBeInTheDocument();
      expect(screen.getByText('またはJSONを直接貼り付け')).toBeInTheDocument();
    });

    it('ファイルを選択してインポートできる', async () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('インポート'));

      // JSONファイル選択入力が表示されることを確認
      expect(screen.getByText('JSONファイルを選択')).toBeInTheDocument();
    });

    it('JSONを直接入力してインポートできる', async () => {
      const user = userEvent.setup();
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('インポート'));

      const textarea = screen.getByPlaceholderText('{"history": [...], "lastUpdated": "..."}');
      await user.clear(textarea);
      await user.click(textarea);
      await user.paste('{"history":[],"lastUpdated":"2024-01-15"}');

      fireEvent.click(screen.getByText('インポート'));

      expect(mockHooks.importHistory).toHaveBeenCalledWith(
        '{"history":[],"lastUpdated":"2024-01-15"}',
        false
      );
    });

    it('マージオプションを選択できる', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('インポート'));

      const mergeCheckbox = screen.getByLabelText('既存の履歴とマージする');
      fireEvent.click(mergeCheckbox);

      expect(mergeCheckbox).toBeChecked();
    });

    it('インポートに失敗した場合エラーが表示される', async () => {
      (useHistory as any).mockReturnValue({
        ...mockHooks,
        importHistory: vi.fn().mockReturnValue(false)
      });

      const user = userEvent.setup();
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('インポート'));

      const textarea = screen.getByPlaceholderText('{"history": [...], "lastUpdated": "..."}');
      await user.type(textarea, 'invalid json');

      fireEvent.click(screen.getByText('インポート'));

      expect(screen.getByText('インポートに失敗しました。JSONデータの形式を確認してください。')).toBeInTheDocument();
    });

    it('ダイアログをキャンセルできる', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('インポート'));
      fireEvent.click(screen.getByText('キャンセル'));

      expect(screen.queryByText('履歴のインポート')).not.toBeInTheDocument();
    });
  });

  describe('履歴クリア機能', () => {
    it('クリアボタンをクリックすると確認ダイアログが表示される', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('履歴クリア'));

      expect(screen.getByText('履歴のクリア')).toBeInTheDocument();
      expect(screen.getByText('すべての履歴データが削除されます。この操作は取り消せません。')).toBeInTheDocument();
    });

    it('削除を確認すると履歴がクリアされる', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('履歴クリア'));
      fireEvent.click(screen.getByText('削除する'));

      expect(mockHooks.clearHistory).toHaveBeenCalled();
    });

    it('クリアをキャンセルできる', () => {
      render(<HistoryList />);

      fireEvent.click(screen.getByLabelText('履歴クリア'));
      fireEvent.click(screen.getByText('キャンセル'));

      expect(mockHooks.clearHistory).not.toHaveBeenCalled();
      expect(screen.queryByText('履歴のクリア')).not.toBeInTheDocument();
    });

    it('履歴がない場合クリアボタンは表示されない', () => {
      (useHistory as any).mockReturnValue({
        ...mockHooks,
        history: []
      });

      render(<HistoryList />);

      expect(screen.queryByLabelText('履歴クリア')).not.toBeInTheDocument();
    });
  });

  describe('履歴項目の操作', () => {
    it('履歴項目が正しいpropsで表示される', () => {
      render(<HistoryList />);

      expect(screen.getByText('テスト気晴らし1')).toBeInTheDocument();
      expect(screen.getByText('テスト気晴らし2')).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザイン', () => {
    it('コンテナが適切なクラスを持つ', () => {
      const { container } = render(<HistoryList />);

      expect(container.querySelector('.w-full.max-w-4xl.mx-auto')).toBeInTheDocument();
      expect(container.querySelector('.bg-surface-primary.dark\\:bg-gray-800')).toBeInTheDocument();
    });
  });
});