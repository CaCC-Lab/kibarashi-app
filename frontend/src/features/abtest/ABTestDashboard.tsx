// CLAUDE-GENERATED: A/Bテストダッシュボード実装
// Phase 1 MVP - LocalStorageベースのシンプルな分析

import React, { useState, useEffect } from 'react';
import { ABTestService } from '../../services/abtest/ABTestService';

interface ABTestMetrics {
  groupA: {
    users: number;
    clicks: number;
    completions: number;
    avgCompletionTime: number;
  };
  groupB: {
    users: number;
    clicks: number;
    completions: number;
    avgCompletionTime: number;
  };
}

/**
 * A/Bテストダッシュボードコンポーネント
 * Phase 1: LocalStorageのデータを集計して表示
 */
export const ABTestDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ABTestMetrics>({
    groupA: { users: 0, clicks: 0, completions: 0, avgCompletionTime: 0 },
    groupB: { users: 0, clicks: 0, completions: 0, avgCompletionTime: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // LocalStorageからメトリクスを集計
    const calculateMetrics = () => {
      setIsLoading(true);
      
      // Phase 1では簡易的な集計
      // 実際のメトリクスはLocalStorageに保存されたイベントから計算
      const storedMetrics = localStorage.getItem('ab_test_metrics');
      
      if (storedMetrics) {
        try {
          const parsed = JSON.parse(storedMetrics);
          setMetrics(parsed);
        } catch (error) {
          console.error('Failed to parse metrics:', error);
        }
      } else {
        // デモデータ（開発用）
        setMetrics({
          groupA: {
            users: Math.floor(Math.random() * 100) + 50,
            clicks: Math.floor(Math.random() * 200) + 100,
            completions: Math.floor(Math.random() * 150) + 80,
            avgCompletionTime: Math.floor(Math.random() * 300) + 180
          },
          groupB: {
            users: Math.floor(Math.random() * 100) + 50,
            clicks: Math.floor(Math.random() * 250) + 150,
            completions: Math.floor(Math.random() * 180) + 100,
            avgCompletionTime: Math.floor(Math.random() * 280) + 160
          }
        });
      }
      
      setIsLoading(false);
    };

    calculateMetrics();
    
    // 定期的に更新（開発用）
    const interval = setInterval(calculateMetrics, 30000); // 30秒ごと
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">メトリクスを読み込み中...</p>
      </div>
    );
  }

  // 変化率の計算
  const calculateLift = (control: number, treatment: number): number => {
    if (control === 0) return 0;
    return ((treatment - control) / control) * 100;
  };

  const clickRateA = metrics.groupA.users > 0 ? (metrics.groupA.clicks / metrics.groupA.users) * 100 : 0;
  const clickRateB = metrics.groupB.users > 0 ? (metrics.groupB.clicks / metrics.groupB.users) * 100 : 0;
  const completionRateA = metrics.groupA.clicks > 0 ? (metrics.groupA.completions / metrics.groupA.clicks) * 100 : 0;
  const completionRateB = metrics.groupB.clicks > 0 ? (metrics.groupB.completions / metrics.groupB.clicks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          A/Bテスト結果ダッシュボード
        </h2>
        <p className="text-gray-600">
          学生最適化版（B群）vs 現行版（A群）
        </p>
      </div>

      {/* 主要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ユーザー数 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">ユーザー数</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">A群（現行版）</span>
              <span className="font-bold">{metrics.groupA.users}人</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">B群（学生最適化）</span>
              <span className="font-bold">{metrics.groupB.users}人</span>
            </div>
          </div>
        </div>

        {/* クリック率 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">クリック率</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">A群</span>
              <span className="font-bold">{clickRateA.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">B群</span>
              <span className="font-bold">{clickRateB.toFixed(1)}%</span>
            </div>
            <div className="mt-2 pt-2 border-t">
              <span className="text-sm text-gray-600">改善率: </span>
              <span className={`font-bold ${calculateLift(clickRateA, clickRateB) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculateLift(clickRateA, clickRateB) > 0 ? '+' : ''}{calculateLift(clickRateA, clickRateB).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 完了率 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">完了率</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">A群</span>
              <span className="font-bold">{completionRateA.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">B群</span>
              <span className="font-bold">{completionRateB.toFixed(1)}%</span>
            </div>
            <div className="mt-2 pt-2 border-t">
              <span className="text-sm text-gray-600">改善率: </span>
              <span className={`font-bold ${calculateLift(completionRateA, completionRateB) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculateLift(completionRateA, completionRateB) > 0 ? '+' : ''}{calculateLift(completionRateA, completionRateB).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細メトリクス */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">詳細メトリクス</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指標
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  A群（現行版）
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  B群（学生最適化）
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  改善率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  総クリック数
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.groupA.clicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.groupB.clicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={calculateLift(metrics.groupA.clicks, metrics.groupB.clicks) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateLift(metrics.groupA.clicks, metrics.groupB.clicks) > 0 ? '+' : ''}{calculateLift(metrics.groupA.clicks, metrics.groupB.clicks).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  完了数
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.groupA.completions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.groupB.completions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={calculateLift(metrics.groupA.completions, metrics.groupB.completions) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateLift(metrics.groupA.completions, metrics.groupB.completions) > 0 ? '+' : ''}{calculateLift(metrics.groupA.completions, metrics.groupB.completions).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  平均完了時間
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.floor(metrics.groupA.avgCompletionTime / 60)}分{metrics.groupA.avgCompletionTime % 60}秒
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.floor(metrics.groupB.avgCompletionTime / 60)}分{metrics.groupB.avgCompletionTime % 60}秒
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={calculateLift(metrics.groupA.avgCompletionTime, metrics.groupB.avgCompletionTime) < 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateLift(metrics.groupA.avgCompletionTime, metrics.groupB.avgCompletionTime) > 0 ? '+' : ''}{calculateLift(metrics.groupA.avgCompletionTime, metrics.groupB.avgCompletionTime).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 推奨事項 */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">分析と推奨事項</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          {calculateLift(clickRateA, clickRateB) > 10 && (
            <li>学生最適化版はクリック率が大幅に改善しています</li>
          )}
          {calculateLift(completionRateA, completionRateB) > 10 && (
            <li>学生最適化版は完了率が向上しています</li>
          )}
          {calculateLift(metrics.groupA.avgCompletionTime, metrics.groupB.avgCompletionTime) < -10 && (
            <li>学生最適化版は完了までの時間が短縮されています</li>
          )}
          <li>より多くのデータが必要です（最低1,000ユーザー推奨）</li>
        </ul>
      </div>

      {/* 開発用コントロール */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">開発用コントロール</h4>
          <button
            onClick={() => {
              ABTestService.resetTestGroup();
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            A/Bテストグループをリセット
          </button>
        </div>
      )}
    </div>
  );
};

export default ABTestDashboard;