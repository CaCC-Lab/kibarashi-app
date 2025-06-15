import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryItem from './HistoryItem';
import type { HistoryItem as HistoryItemType } from '../../types/history';

/**
 * HistoryItemコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - 履歴項目の表示、編集、削除機能をテスト
 * - ユーザーインタラクションを重視
 */
describe('HistoryItem', () => {
  const mockOnDelete = vi.fn();
  const mockOnUpdateRating = vi.fn();
  const mockOnUpdateNote = vi.fn();

  const defaultItem: HistoryItemType = {
    id: 'test-1',
    suggestionId: 'suggestion-1',
    title: 'テスト気晴らし',
    description: 'これはテスト用の気晴らし提案です',
    category: '認知的',
    duration: 5,
    situation: 'workplace',
    startedAt: '2024-01-15T10:00:00Z',
    completed: false
  };

  const completedItem: HistoryItemType = {
    ...defaultItem,
    completed: true,
    completedAt: '2024-01-15T10:05:30Z',
    actualDuration: 330,
    rating: 4,
    note: 'とてもリフレッシュできました'
  };

  beforeEach(() => {
    mockOnDelete.mockReset();
    mockOnUpdateRating.mockReset();
    mockOnUpdateNote.mockReset();
  });

  describe('基本情報の表示', () => {
    it('履歴項目の基本情報が表示される', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      expect(screen.getByText('テスト気晴らし')).toBeInTheDocument();
      expect(screen.getByText('これはテスト用の気晴らし提案です')).toBeInTheDocument();
      expect(screen.getByText('認知的')).toBeInTheDocument();
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('設定: 5分')).toBeInTheDocument();
    });

    it('未完了の場合「実行中」バッジが表示される', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      expect(screen.getByText('実行中')).toBeInTheDocument();
    });

    it('完了済みの場合実際の実行時間が表示される', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      expect(screen.queryByText('実行中')).not.toBeInTheDocument();
      expect(screen.getByText('実際: 5分30秒')).toBeInTheDocument();
    });

    it('日時が適切なフォーマットで表示される', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      // 日時フォーマットの確認
      expect(screen.getByText('1/15 19:00')).toBeInTheDocument();
    });
  });

  describe('詳細の展開/折りたたみ', () => {
    it('初期状態では詳細が非表示', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      expect(screen.queryByText('満足度')).not.toBeInTheDocument();
      expect(screen.queryByText('メモ')).not.toBeInTheDocument();
    });

    it('展開ボタンをクリックすると詳細が表示される', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      const expandButton = screen.getByLabelText('詳細を表示');
      fireEvent.click(expandButton);

      expect(screen.getByText('満足度')).toBeInTheDocument();
      expect(screen.getByText('メモ')).toBeInTheDocument();
      expect(screen.getByText('とてもリフレッシュできました')).toBeInTheDocument();
    });

    it('再度クリックすると詳細が非表示になる', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      const expandButton = screen.getByLabelText('詳細を表示');
      fireEvent.click(expandButton);
      fireEvent.click(screen.getByLabelText('詳細を閉じる'));

      expect(screen.queryByText('満足度')).not.toBeInTheDocument();
    });
  });

  describe('評価機能', () => {
    it('完了済み項目で評価が表示される', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));

      // 4つ目までの星が黄色で表示される
      const stars = screen.getAllByRole('button', { name: /\d点/ });
      expect(stars).toHaveLength(5);
      expect(screen.getByText('4点')).toBeInTheDocument();
    });

    it('未完了項目では評価が表示されない', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));

      expect(screen.queryByText('満足度')).not.toBeInTheDocument();
    });

    it('評価をクリックで更新できる', () => {
      mockOnUpdateRating.mockReturnValue(true);
      
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));
      fireEvent.click(screen.getByLabelText('5点'));

      expect(mockOnUpdateRating).toHaveBeenCalledWith('test-1', 5);
    });

    it('同じ評価をクリックしても更新されない', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));
      fireEvent.click(screen.getByLabelText('4点'));

      expect(mockOnUpdateRating).not.toHaveBeenCalled();
    });
  });

  describe('メモ機能', () => {
    it('メモがある場合表示される', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));

      expect(screen.getByText('とてもリフレッシュできました')).toBeInTheDocument();
    });

    it('メモがない場合プレースホルダーが表示される', () => {
      render(
        <HistoryItem
          item={{ ...completedItem, note: undefined }}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));

      expect(screen.getByText('クリックしてメモを追加...')).toBeInTheDocument();
    });

    it('メモエリアをクリックすると編集モードになる', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));
      fireEvent.click(screen.getByText('とてもリフレッシュできました'));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('メモを編集して保存できる', async () => {
      mockOnUpdateNote.mockReturnValue(true);
      const user = userEvent.setup();
      
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));
      fireEvent.click(screen.getByText('とてもリフレッシュできました'));

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, '新しいメモ内容');

      fireEvent.click(screen.getByText('保存'));

      expect(mockOnUpdateNote).toHaveBeenCalledWith('test-1', '新しいメモ内容');
    });

    it('キャンセルで編集を取り消せる', async () => {
      const user = userEvent.setup();
      
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('詳細を表示'));
      fireEvent.click(screen.getByText('とてもリフレッシュできました'));

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, '新しいメモ内容');

      fireEvent.click(screen.getByText('キャンセル'));

      expect(mockOnUpdateNote).not.toHaveBeenCalled();
      expect(screen.getByText('とてもリフレッシュできました')).toBeInTheDocument();
    });
  });

  describe('削除機能', () => {
    it('削除ボタンが表示される', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      expect(screen.getByLabelText('削除')).toBeInTheDocument();
    });

    it('削除ボタンをクリックすると確認ダイアログが表示される', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('削除'));

      expect(screen.getByText('履歴の削除')).toBeInTheDocument();
      expect(screen.getByText('この履歴を削除しますか？この操作は取り消せません。')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
      expect(screen.getByText('削除する')).toBeInTheDocument();
    });

    it('削除を確認するとコールバックが呼ばれる', () => {
      mockOnDelete.mockReturnValue(true);
      
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('削除'));
      fireEvent.click(screen.getByText('削除する'));

      expect(mockOnDelete).toHaveBeenCalledWith('test-1');
    });

    it('削除をキャンセルできる', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      fireEvent.click(screen.getByLabelText('削除'));
      fireEvent.click(screen.getByText('キャンセル'));

      expect(mockOnDelete).not.toHaveBeenCalled();
      expect(screen.queryByText('履歴の削除')).not.toBeInTheDocument();
    });
  });

  describe('スタイルと外観', () => {
    it('未完了アイテムは黄色の背景色を持つ', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      const container = screen.getByText('テスト気晴らし').closest('div[class*="border"]');
      expect(container).toHaveClass('bg-yellow-50');
    });

    it('完了アイテムは白色の背景色を持つ', () => {
      render(
        <HistoryItem
          item={completedItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      const container = screen.getByText('テスト気晴らし').closest('div[class*="border"]');
      expect(container).toHaveClass('bg-white');
    });

    it('カテゴリーごとに適切な色が付けられる', () => {
      render(
        <HistoryItem
          item={defaultItem}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      const cognitiveTag = screen.getByText('認知的');
      expect(cognitiveTag).toHaveClass('bg-blue-100');

      const { rerender } = render(
        <HistoryItem
          item={{ ...defaultItem, category: '行動的' }}
          onDelete={mockOnDelete}
          onUpdateRating={mockOnUpdateRating}
          onUpdateNote={mockOnUpdateNote}
        />
      );

      const behavioralTag = screen.getByText('行動的');
      expect(behavioralTag).toHaveClass('bg-green-100');
    });
  });
});