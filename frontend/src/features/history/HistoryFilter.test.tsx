import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryFilter from './HistoryFilter';

/**
 * HistoryFilterコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーインタラクションを重視したテスト
 * - 各フィルタータイプの切り替えと値の変更を確認
 */
describe('HistoryFilter', () => {
  const mockOnFilterTypeChange = vi.fn();
  const mockOnFilterValueChange = vi.fn();

  const defaultProps = {
    filterType: 'all' as const,
    filterValue: null,
    onFilterTypeChange: mockOnFilterTypeChange,
    onFilterValueChange: mockOnFilterValueChange
  };

  beforeEach(() => {
    mockOnFilterTypeChange.mockClear();
    mockOnFilterValueChange.mockClear();
  });

  describe('フィルタータイプの切り替え', () => {
    it('すべてのフィルタータイプボタンが表示される', () => {
      render(<HistoryFilter {...defaultProps} />);
      
      expect(screen.getByText('すべて')).toBeInTheDocument();
      expect(screen.getByText('期間指定')).toBeInTheDocument();
      expect(screen.getByText('状況別')).toBeInTheDocument();
      expect(screen.getByText('カテゴリー別')).toBeInTheDocument();
    });

    it('現在のフィルタータイプがハイライト表示される', () => {
      const { rerender } = render(<HistoryFilter {...defaultProps} />);
      
      expect(screen.getByText('すべて')).toHaveClass('bg-primary-500');
      expect(screen.getByText('期間指定')).not.toHaveClass('bg-primary-500');
      
      rerender(<HistoryFilter {...defaultProps} filterType="date" />);
      
      expect(screen.getByText('すべて')).not.toHaveClass('bg-primary-500');
      expect(screen.getByText('期間指定')).toHaveClass('bg-primary-500');
    });

    it('フィルタータイプボタンをクリックするとコールバックが呼ばれる', () => {
      render(<HistoryFilter {...defaultProps} />);
      
      fireEvent.click(screen.getByText('期間指定'));
      
      expect(mockOnFilterTypeChange).toHaveBeenCalledWith('date');
      expect(mockOnFilterValueChange).toHaveBeenCalledWith(null);
    });
  });

  describe('日付範囲フィルター', () => {
    it('日付フィルター選択時に日付入力フォームが表示される', () => {
      render(<HistoryFilter {...defaultProps} filterType="date" />);
      
      expect(screen.getByLabelText('開始日')).toBeInTheDocument();
      expect(screen.getByLabelText('終了日')).toBeInTheDocument();
      expect(screen.getByText('適用')).toBeInTheDocument();
    });

    it('デフォルトで過去7日間が設定される', () => {
      render(<HistoryFilter {...defaultProps} filterType="date" />);
      
      const startInput = screen.getByLabelText('開始日') as HTMLInputElement;
      const endInput = screen.getByLabelText('終了日') as HTMLInputElement;
      
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      expect(startInput.value).toBe(lastWeek.toISOString().split('T')[0]);
      expect(endInput.value).toBe(today.toISOString().split('T')[0]);
    });

    it('日付を変更して適用できる', async () => {
      const user = userEvent.setup();
      render(<HistoryFilter {...defaultProps} filterType="date" />);
      
      const startInput = screen.getByLabelText('開始日') as HTMLInputElement;
      const endInput = screen.getByLabelText('終了日') as HTMLInputElement;
      
      await user.clear(startInput);
      await user.type(startInput, '2024-01-01');
      await user.clear(endInput);
      await user.type(endInput, '2024-01-31');
      
      fireEvent.click(screen.getByText('適用'));
      
      expect(mockOnFilterValueChange).toHaveBeenCalledWith({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31T23:59:59')
      });
    });
  });

  describe('状況フィルター', () => {
    it('状況フィルター選択時に状況ボタンが表示される', () => {
      render(<HistoryFilter {...defaultProps} filterType="situation" />);
      
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('家')).toBeInTheDocument();
      expect(screen.getByText('外出先')).toBeInTheDocument();
    });

    it('状況ボタンをクリックするとコールバックが呼ばれる', () => {
      render(<HistoryFilter {...defaultProps} filterType="situation" />);
      
      fireEvent.click(screen.getByText('職場'));
      expect(mockOnFilterValueChange).toHaveBeenCalledWith('workplace');
      
      fireEvent.click(screen.getByText('家'));
      expect(mockOnFilterValueChange).toHaveBeenCalledWith('home');
      
      fireEvent.click(screen.getByText('外出先'));
      expect(mockOnFilterValueChange).toHaveBeenCalledWith('outside');
    });

    it('選択された状況がハイライト表示される', () => {
      render(<HistoryFilter {...defaultProps} filterType="situation" filterValue="workplace" />);
      
      expect(screen.getByText('職場')).toHaveClass('bg-primary-600');
      expect(screen.getByText('家')).not.toHaveClass('bg-accent-600');
      expect(screen.getByText('外出先')).not.toHaveClass('bg-secondary-500');
    });
  });

  describe('カテゴリーフィルター', () => {
    it('カテゴリーフィルター選択時にカテゴリーボタンが表示される', () => {
      render(<HistoryFilter {...defaultProps} filterType="category" />);
      
      expect(screen.getByText('認知的')).toBeInTheDocument();
      expect(screen.getByText('行動的')).toBeInTheDocument();
    });

    it('カテゴリーボタンをクリックするとコールバックが呼ばれる', () => {
      render(<HistoryFilter {...defaultProps} filterType="category" />);
      
      fireEvent.click(screen.getByText('認知的'));
      expect(mockOnFilterValueChange).toHaveBeenCalledWith('認知的');
      
      fireEvent.click(screen.getByText('行動的'));
      expect(mockOnFilterValueChange).toHaveBeenCalledWith('行動的');
    });

    it('選択されたカテゴリーがハイライト表示される', () => {
      render(<HistoryFilter {...defaultProps} filterType="category" filterValue="認知的" />);
      
      expect(screen.getByText('認知的')).toHaveClass('bg-primary-500');
      expect(screen.getByText('行動的')).not.toHaveClass('bg-accent-500');
    });
  });

  describe('アニメーション', () => {
    it('フィルターコンテンツがフェードインアニメーションを持つ', () => {
      const { rerender } = render(<HistoryFilter {...defaultProps} />);
      
      // 日付フィルターに切り替え
      rerender(<HistoryFilter {...defaultProps} filterType="date" />);
      const dateSection = screen.getByLabelText('開始日').closest('div.animate-fadeIn');
      expect(dateSection).toBeInTheDocument();
      
      // 状況フィルターに切り替え
      rerender(<HistoryFilter {...defaultProps} filterType="situation" />);
      const situationSection = screen.getByText('職場').closest('div.animate-fadeIn');
      expect(situationSection).toBeInTheDocument();
      
      // カテゴリーフィルターに切り替え
      rerender(<HistoryFilter {...defaultProps} filterType="category" />);
      const categorySection = screen.getByText('認知的').closest('div.animate-fadeIn');
      expect(categorySection).toBeInTheDocument();
    });
  });
});