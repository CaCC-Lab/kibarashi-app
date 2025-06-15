import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryDistributionChartProps {
  categoryCounts: {
    認知的: number;
    行動的: number;
  };
}

/**
 * カテゴリー分布のドーナツチャート
 * 
 * 設計思想：
 * - 認知的・行動的気晴らしの割合を円グラフで直感的に表示
 * - バランスの取れた気晴らし実行をサポート
 * - コンパクトで視覚的にわかりやすい表現
 */
const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ 
  categoryCounts 
}) => {
  const chartData = useMemo(() => {
    const totalCount = categoryCounts.認知的 + categoryCounts.行動的;
    
    if (totalCount === 0) {
      return {
        labels: ['データなし'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['rgba(156, 163, 175, 0.5)'], // gray-400
            borderColor: ['rgba(156, 163, 175, 1)'],
            borderWidth: 2,
          },
        ],
      };
    }
    
    return {
      labels: ['認知的', '行動的'],
      datasets: [
        {
          data: [categoryCounts.認知的, categoryCounts.行動的],
          backgroundColor: [
            'rgba(59, 59, 107, 0.7)', // primary-500
            'rgba(184, 151, 15, 0.7)', // accent-500
          ],
          borderColor: [
            'rgba(59, 59, 107, 1)',
            'rgba(184, 151, 15, 1)',
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            'rgba(59, 59, 107, 0.8)',
            'rgba(184, 151, 15, 0.8)',
          ],
          hoverBorderWidth: 3,
        },
      ],
    };
  }, [categoryCounts]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(107, 114, 128)', // text-secondary
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'カテゴリー別分布',
        color: 'rgb(25, 25, 25)', // text-primary
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            if (total === 0 || context.label === 'データなし') {
              return 'まだデータがありません';
            }
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed}回 (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%', // ドーナツの内側の空洞の大きさ
    elements: {
      arc: {
        borderJoinStyle: 'round' as const,
      },
    },
  };

  const totalCount = categoryCounts.認知的 + categoryCounts.行動的;

  return (
    <div className="h-64 bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm relative">
      <Doughnut data={chartData} options={options} />
      
      {/* 中央の統計表示 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary dark:text-white">
            {totalCount}
          </div>
          <div className="text-sm text-text-secondary dark:text-gray-400">
            総実行回数
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDistributionChart;