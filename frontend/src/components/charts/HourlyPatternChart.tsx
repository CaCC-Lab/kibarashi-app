import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartTooltipContext } from '../../types/charts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HourlyPatternChartProps {
  hourlyPattern: { [hour: number]: number };
}

/**
 * 時間帯別利用パターンのバーチャート
 * 
 * 設計思想：
 * - 1日の中でどの時間帯に最も気晴らしを利用するかを可視化
 * - ユーザーのライフスタイルパターンを把握可能
 * - 24時間表示で直感的に理解しやすい
 */
const HourlyPatternChart: React.FC<HourlyPatternChartProps> = ({ hourlyPattern }) => {
  const chartData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const counts = hours.map(hour => hourlyPattern[hour] || 0);
    
    return {
      labels: hours.map(hour => `${hour}:00`),
      datasets: [
        {
          label: '実行回数',
          data: counts,
          backgroundColor: 'rgba(59, 59, 107, 0.6)', // primary-500 with opacity
          borderColor: 'rgba(59, 59, 107, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [hourlyPattern]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '時間帯別利用パターン',
        color: 'rgb(25, 25, 25)', // text-primary
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => `${context.parsed.y}回`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '時間',
          color: 'rgb(107, 114, 128)', // text-secondary
        },
        grid: {
          color: 'rgba(59, 59, 107, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          maxTicksLimit: 12, // 2時間間隔で表示
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '実行回数',
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
    <div className="h-64 bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default HourlyPatternChart;