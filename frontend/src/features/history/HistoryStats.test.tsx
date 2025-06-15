import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryStats from './HistoryStats';
import type { HistoryStats as HistoryStatsType } from '../../types/history';

/**
 * HistoryStatsコンポーネントのテスト
 * 
 * 設計思想：
 * - 統計情報の正確な表示を検証
 * - ゼロ値や特殊なケースのハンドリングをテスト
 * - プログレスバーの表示を確認
 */
describe('HistoryStats', () => {
  const defaultStats: HistoryStatsType = {
    totalCount: 10,
    completedCount: 8,
    totalDuration: 7200, // 2時間
    averageRating: 4.2,
    categoryCounts: {
      認知的: 6,
      行動的: 4
    },
    situationCounts: {
      workplace: 5,
      home: 3,
      outside: 2
    }
  };

  const emptyStats: HistoryStatsType = {
    totalCount: 0,
    completedCount: 0,
    totalDuration: 0,
    averageRating: undefined,
    categoryCounts: {
      認知的: 0,
      行動的: 0
    },
    situationCounts: {
      workplace: 0,
      home: 0,
      outside: 0
    }
  };

  describe('基本統計の表示', () => {
    it('総実行回数が表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('総実行回数')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('回')).toBeInTheDocument();
    });

    it('完了率が正しく計算されて表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('完了率')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument(); // 8/10 * 100 = 80%
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('総実行時間が適切にフォーマットされる', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('総実行時間')).toBeInTheDocument();
      expect(screen.getByText('2時間0分')).toBeInTheDocument();
    });

    it('平均評価が表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('平均評価')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
    });
  });

  describe('空データのハンドリング', () => {
    it('空データの場合、完了率は0%と表示される', () => {
      render(<HistoryStats stats={emptyStats} />);
      
      // 完了率ラベルが存在することを確認
      expect(screen.getByText('完了率')).toBeInTheDocument();
      
      // 完了率ラベルの近くに0と%が表示されることを確認
      const completionSection = screen.getByText('完了率').closest('div.bg-white');
      expect(completionSection).toHaveTextContent('0');
      expect(completionSection).toHaveTextContent('%');
    });

    it('空データの場合、実行時間は0分と表示される', () => {
      render(<HistoryStats stats={emptyStats} />);
      
      expect(screen.getByText('0分')).toBeInTheDocument();
    });

    it('評価がない場合、---と表示される', () => {
      render(<HistoryStats stats={emptyStats} />);
      
      expect(screen.getByText('---')).toBeInTheDocument();
    });
  });

  describe('時間のフォーマット', () => {
    it('1時間未満の場合、分のみ表示される', () => {
      const stats = { ...defaultStats, totalDuration: 2700 }; // 45分
      render(<HistoryStats stats={stats} />);
      
      expect(screen.getByText('45分')).toBeInTheDocument();
      expect(screen.queryByText('時間')).not.toBeInTheDocument();
    });

    it('1時間以上の場合、時間と分が表示される', () => {
      const stats = { ...defaultStats, totalDuration: 5400 }; // 1時間30分
      render(<HistoryStats stats={stats} />);
      
      expect(screen.getByText('1時間30分')).toBeInTheDocument();
    });
  });

  describe('カテゴリー別・状況別の表示', () => {
    it('カテゴリー別の内訳が表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('カテゴリー別')).toBeInTheDocument();
      expect(screen.getByText('認知的')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('行動的')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('状況別の内訳が表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('状況別')).toBeInTheDocument();
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('家')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('外出先')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('プログレスバーの表示', () => {
    it('カテゴリー別プログレスバーが正しい幅で表示される', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      // 認知的: 6/10 = 60%
      const cognitiveBar = container.querySelector('.bg-blue-500');
      expect(cognitiveBar).toHaveStyle({ width: '60%' });
      
      // 行動的: 4/10 = 40%
      const behavioralBar = container.querySelector('.bg-green-500');
      expect(behavioralBar).toHaveStyle({ width: '40%' });
    });

    it('状況別プログレスバーが正しい幅で表示される', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      // 職場: 5/10 = 50%
      const workplaceBar = container.querySelector('.bg-purple-500');
      expect(workplaceBar).toHaveStyle({ width: '50%' });
      
      // 家: 3/10 = 30%
      const homeBar = container.querySelector('.bg-indigo-500');
      expect(homeBar).toHaveStyle({ width: '30%' });
      
      // 外出先: 2/10 = 20%
      const outsideBar = container.querySelector('.bg-pink-500');
      expect(outsideBar).toHaveStyle({ width: '20%' });
    });

    it('空データの場合、プログレスバーの幅は0%', () => {
      const { container } = render(<HistoryStats stats={emptyStats} />);
      
      const progressBars = container.querySelectorAll('[class*="rounded-full"][class*="bg-"]');
      progressBars.forEach(bar => {
        if (bar.className.includes('bg-blue-500') || 
            bar.className.includes('bg-green-500') || 
            bar.className.includes('bg-purple-500') || 
            bar.className.includes('bg-indigo-500') || 
            bar.className.includes('bg-pink-500')) {
          expect(bar).toHaveStyle({ width: '0%' });
        }
      });
    });
  });

  describe('アイコンの表示', () => {
    it('各統計項目に適切なアイコンが表示される', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      // SVGアイコンが4つ存在することを確認
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(4);
      
      // 色が正しく設定されていることを確認
      expect(container.querySelector('.text-primary-500')).toBeInTheDocument();
      expect(container.querySelector('.text-green-500')).toBeInTheDocument();
      expect(container.querySelector('.text-blue-500')).toBeInTheDocument();
      expect(container.querySelector('.text-yellow-500')).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザイン', () => {
    it('統計情報のグリッドが適切に表示される', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      // 基本統計のグリッド
      const mainGrid = container.querySelector('.grid.grid-cols-2.md\\:grid-cols-4');
      expect(mainGrid).toBeInTheDocument();
      
      // カテゴリー別・状況別のグリッド
      const detailGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(detailGrid).toBeInTheDocument();
    });
  });

  describe('アニメーション', () => {
    it('コンポーネントがフェードインアニメーションを持つ', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      const animatedContainer = container.querySelector('.animate-fadeIn');
      expect(animatedContainer).toBeInTheDocument();
    });

    it('プログレスバーがトランジションを持つ', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      const progressBars = container.querySelectorAll('.transition-all.duration-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
});