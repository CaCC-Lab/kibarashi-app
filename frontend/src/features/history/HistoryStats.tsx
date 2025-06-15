import React, { useState } from 'react';
import type { HistoryStats as HistoryStatsType } from '../../types/history';
import HourlyPatternChart from '../../components/charts/HourlyPatternChart';
import WeeklyPatternChart from '../../components/charts/WeeklyPatternChart';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import CategoryDistributionChart from '../../components/charts/CategoryDistributionChart';

interface HistoryStatsProps {
  stats: HistoryStatsType;
}

/**
 * 履歴統計コンポーネント
 * 
 * 設計思想：
 * - 実行履歴から有用な統計情報を視覚的に表示
 * - ユーザーの利用パターンを把握しやすくする
 * - 成果を数値で確認できることでモチベーション向上
 * - グラフによる可視化で傾向を直感的に理解
 */
const HistoryStats: React.FC<HistoryStatsProps> = ({ stats }) => {
  const [showCharts, setShowCharts] = useState(false);
  // 実行時間のフォーマット
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  // 完了率の計算
  const completionRate = stats.totalCount > 0
    ? Math.round((stats.completedCount / stats.totalCount) * 100)
    : 0;

  return (
    <div className="bg-surface-secondary dark:bg-gray-900/50 rounded-lg p-6 mb-6 animate-fadeIn border border-primary-100">
      <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
        統計情報
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 総実行回数 */}
        <div className="bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-5 h-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-text-secondary dark:text-gray-400">
              総実行回数
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary dark:text-white">
            {stats.totalCount}
            <span className="text-sm font-normal text-text-muted dark:text-gray-400 ml-1">
              回
            </span>
          </p>
        </div>

        {/* 完了率 */}
        <div className="bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-5 h-5 text-accent-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-sm text-text-secondary dark:text-gray-400">
              完了率
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary dark:text-white">
            {completionRate}
            <span className="text-sm font-normal text-text-muted dark:text-gray-400 ml-1">
              %
            </span>
          </p>
        </div>

        {/* 総実行時間 */}
        <div className="bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-5 h-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-text-secondary dark:text-gray-400">
              総実行時間
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary dark:text-white">
            {formatTotalDuration(stats.totalDuration)}
          </p>
        </div>

        {/* 平均評価 */}
        <div className="bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-5 h-5 text-accent-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <span className="text-sm text-text-secondary dark:text-gray-400">
              平均評価
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary dark:text-white">
            {stats.averageRating ? stats.averageRating.toFixed(1) : '---'}
            {stats.averageRating && (
              <span className="text-sm font-normal text-text-muted dark:text-gray-400 ml-1">
                / 5
              </span>
            )}
          </p>
        </div>
      </div>

      {/* カテゴリー別・状況別の内訳 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* カテゴリー別 */}
        <div className="bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
          <h4 className="text-sm font-medium text-text-primary dark:text-gray-300 mb-3">
            カテゴリー別
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-gray-400">
                認知的
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-primary-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.totalCount > 0 
                        ? (stats.categoryCounts.認知的 / stats.totalCount) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  {stats.categoryCounts.認知的}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-gray-400">
                行動的
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-accent-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-accent-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.totalCount > 0 
                        ? (stats.categoryCounts.行動的 / stats.totalCount) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  {stats.categoryCounts.行動的}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 状況別 */}
        <div className="bg-surface-primary dark:bg-gray-800 rounded-lg p-4 border border-primary-100 shadow-sm">
          <h4 className="text-sm font-medium text-text-primary dark:text-gray-300 mb-3">
            状況別
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-gray-400">
                職場
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-primary-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.totalCount > 0 
                        ? (stats.situationCounts.workplace / stats.totalCount) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  {stats.situationCounts.workplace}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-gray-400">
                家
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-accent-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-accent-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.totalCount > 0 
                        ? (stats.situationCounts.home / stats.totalCount) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  {stats.situationCounts.home}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary dark:text-gray-400">
                外出先
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-secondary-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-secondary-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${stats.totalCount > 0 
                        ? (stats.situationCounts.outside / stats.totalCount) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary dark:text-white">
                  {stats.situationCounts.outside}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* グラフ表示切り替えボタン */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-text-inverse rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus-ring"
        >
          {showCharts ? (
            <>
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              グラフを非表示
            </>
          ) : (
            <>
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              詳細グラフを表示
            </>
          )}
        </button>
      </div>

      {/* グラフセクション */}
      {showCharts && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* カテゴリー分布とトレンドのグリッド */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* カテゴリー分布チャート */}
            <CategoryDistributionChart categoryCounts={stats.categoryCounts} />
            
            {/* 月別トレンドチャート */}
            <div className="lg:col-span-1">
              <MonthlyTrendChart monthlyTrend={stats.monthlyTrend} />
            </div>
          </div>

          {/* 時間帯・曜日パターンのグリッド */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 時間帯別パターン */}
            <HourlyPatternChart hourlyPattern={stats.hourlyPattern} />
            
            {/* 曜日別パターン */}
            <WeeklyPatternChart weeklyPattern={stats.weeklyPattern} />
          </div>

          {/* 統計の詳細説明 */}
          <div className="bg-surface-secondary dark:bg-gray-900/50 rounded-lg p-4 border border-primary-100">
            <h4 className="text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
              グラフの見方
            </h4>
            <div className="text-sm text-text-secondary dark:text-gray-400 space-y-1">
              <p>• <strong>時間帯別パターン</strong>: 一日の中でどの時間に最も気晴らしを実行するかがわかります</p>
              <p>• <strong>曜日別パターン</strong>: 平日と休日での利用傾向の違いを確認できます</p>
              <p>• <strong>月別トレンド</strong>: 継続的な利用状況と完了率の変化を追跡できます</p>
              <p>• <strong>カテゴリー分布</strong>: 認知的・行動的気晴らしのバランスを確認できます</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryStats;