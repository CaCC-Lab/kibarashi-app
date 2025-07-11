import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    },
    hourlyPattern: {
      9: 2, 12: 3, 15: 2, 18: 3
    },
    weeklyPattern: {
      1: 2, 2: 1, 3: 2, 4: 1, 5: 3, 6: 1, 0: 0
    },
    monthlyTrend: [
      { month: '2024-01', count: 3, completed: 2 },
      { month: '2024-02', count: 4, completed: 3 },
      { month: '2024-03', count: 3, completed: 3 }
    ]
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
    },
    hourlyPattern: {},
    weeklyPattern: {},
    monthlyTrend: []
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
      const completionSection = screen.getByText('完了率').closest('div.bg-surface-primary');
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
      const cognitiveBar = container.querySelector('.bg-primary-500');
      expect(cognitiveBar).toHaveStyle({ width: '60%' });
      
      // 行動的: 4/10 = 40%
      const behavioralBar = container.querySelector('.bg-accent-500');
      expect(behavioralBar).toHaveStyle({ width: '40%' });
    });

    it('状況別プログレスバーが正しい幅で表示される', () => {
      const { container } = render(<HistoryStats stats={defaultStats} />);
      
      // 職場: 5/10 = 50%
      const workplaceBar = container.querySelector('.bg-primary-600');
      expect(workplaceBar).toHaveStyle({ width: '50%' });
      
      // 家: 3/10 = 30%
      const homeBar = container.querySelector('.bg-accent-600');
      expect(homeBar).toHaveStyle({ width: '30%' });
      
      // 外出先: 2/10 = 20%
      const outsideBar = container.querySelector('.bg-secondary-500');
      expect(outsideBar).toHaveStyle({ width: '20%' });
    });

    it('空データの場合、プログレスバーの幅は0%', () => {
      const { container } = render(<HistoryStats stats={emptyStats} />);
      
      const progressBars = container.querySelectorAll('[class*="rounded-full"][class*="bg-"]');
      progressBars.forEach(bar => {
        if (bar.className.includes('bg-primary-500') || 
            bar.className.includes('bg-accent-500') || 
            bar.className.includes('bg-primary-600') || 
            bar.className.includes('bg-accent-600') || 
            bar.className.includes('bg-secondary-500')) {
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
      const primaryIcons = container.querySelectorAll('svg.text-primary-500');
      const accentIcons = container.querySelectorAll('svg.text-accent-500');
      
      expect(primaryIcons.length).toBeGreaterThan(0);
      expect(accentIcons.length).toBeGreaterThan(0);
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

  describe('グラフ機能', () => {
    it('詳細グラフ表示ボタンが表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      expect(screen.getByText('詳細グラフを表示')).toBeInTheDocument();
    });

    it('グラフ表示ボタンをクリックするとグラフが表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      const toggleButton = screen.getByText('詳細グラフを表示');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('グラフを非表示')).toBeInTheDocument();
      expect(screen.getByText('グラフの見方')).toBeInTheDocument();
    });

    it('グラフの説明が表示される', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      const toggleButton = screen.getByText('詳細グラフを表示');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('時間帯別パターン')).toBeInTheDocument();
      expect(screen.getByText('曜日別パターン')).toBeInTheDocument();
      expect(screen.getByText('月別トレンド')).toBeInTheDocument();
      expect(screen.getByText('カテゴリー分布')).toBeInTheDocument();
    });

    it('グラフを非表示にできる', () => {
      render(<HistoryStats stats={defaultStats} />);
      
      // グラフを表示
      const showButton = screen.getByText('詳細グラフを表示');
      fireEvent.click(showButton);
      
      // グラフを非表示
      const hideButton = screen.getByText('グラフを非表示');
      fireEvent.click(hideButton);
      
      expect(screen.getByText('詳細グラフを表示')).toBeInTheDocument();
      expect(screen.queryByText('グラフの見方')).not.toBeInTheDocument();
    });
  });
});