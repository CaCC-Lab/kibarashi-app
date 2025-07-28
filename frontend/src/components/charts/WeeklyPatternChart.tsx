import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyPatternChartProps {
  weeklyPattern: { [day: number]: number };
}

/**
 * 曜日別利用パターンのバーチャート
 * 
 * 設計思想：
 * - 曜日別の利用傾向を可視化
 * - 平日と休日での利用パターンの違いを把握
 * - 週間リズムの把握をサポート
 */
const WeeklyPatternChart: React.FC<WeeklyPatternChartProps> = ({ weeklyPattern }) => {
  const chartData = useMemo(() => {
    const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
    const counts = Array.from({ length: 7 }, (_, day) => weeklyPattern[day] || 0);
    
    // 平日と休日で色分け
    const backgroundColors = Array.from({ length: 7 }, (_, day) => {
      if (day === 0 || day === 6) {
        // 休日: accent色
        return 'rgba(184, 151, 15, 0.6)'; // accent-500 with opacity
      } else {
        // 平日: primary色
        return 'rgba(59, 59, 107, 0.6)'; // primary-500 with opacity
      }
    });
    
    const borderColors = Array.from({ length: 7 }, (_, day) => {
      if (day === 0 || day === 6) {
        return 'rgba(184, 151, 15, 1)'; // accent-500
      } else {
        return 'rgba(59, 59, 107, 1)'; // primary-500
      }
    });
    
    return {
      labels: dayLabels,
      datasets: [
        {
          label: '実行回数',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [weeklyPattern]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '曜日別利用パターン',
        color: 'rgb(25, 25, 25)', // text-primary
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y}回`,
          afterLabel: (context: TooltipItem<'bar'>) => {
            const day = context.dataIndex;
            return day === 0 || day === 6 ? '(休日)' : '(平日)';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '曜日',
          color: 'rgb(107, 114, 128)', // text-secondary
        },
        grid: {
          color: 'rgba(59, 59, 107, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
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

export default WeeklyPatternChart;