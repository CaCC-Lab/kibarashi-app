import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyTrendChartProps {
  monthlyTrend: {
    month: string;
    count: number;
    completed: number;
  }[];
}

/**
 * 月別トレンドのラインチャート
 * 
 * 設計思想：
 * - 最近12ヶ月の利用傾向を時系列で表示
 * - 実行回数と完了回数を比較可能
 * - 継続性の可視化でモチベーション向上をサポート
 */
const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ monthlyTrend }) => {
  const chartData = useMemo(() => {
    const labels = monthlyTrend.map(item => {
      const [year, month] = item.month.split('-');
      return `${year}年${parseInt(month)}月`;
    });
    
    const totalCounts = monthlyTrend.map(item => item.count);
    const completedCounts = monthlyTrend.map(item => item.completed);
    
    return {
      labels,
      datasets: [
        {
          label: '実行回数',
          data: totalCounts,
          borderColor: 'rgba(59, 59, 107, 1)', // primary-500
          backgroundColor: 'rgba(59, 59, 107, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointBackgroundColor: 'rgba(59, 59, 107, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: '完了回数',
          data: completedCounts,
          borderColor: 'rgba(184, 151, 15, 1)', // accent-500
          backgroundColor: 'rgba(184, 151, 15, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointBackgroundColor: 'rgba(184, 151, 15, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [monthlyTrend]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: '月別利用トレンド（過去12ヶ月）',
        color: 'rgb(25, 25, 25)', // text-primary
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            return `${label}: ${context.parsed.y}回`;
          },
          afterBody: (context: TooltipItem<'line'>[]) => {
            if (context.length >= 2) {
              const total = context[0].parsed.y;
              const completed = context[1].parsed.y;
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return [`完了率: ${rate}%`];
            }
            return [];
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '月',
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(59, 59, 107, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          maxTicksLimit: 6, // 2ヶ月間隔で表示
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '回数',
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgba(59, 59, 107, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-80 bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MonthlyTrendChart;