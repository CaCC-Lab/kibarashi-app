/**
 * A/Bテスト結果表示ダッシュボード - Phase A-1
 * 開発者向けのメトリクス確認画面
 */

import React, { useState, useEffect } from 'react';
import { useABTestResults } from '../../hooks/useABTest';
import { ABTestService, ABTestType, ABTestResults, MetricEvent } from '../../services/analytics/abTestService';

interface ABTestDashboardProps {
  className?: string;
}

export const ABTestDashboard: React.FC<ABTestDashboardProps> = ({ className = '' }) => {
  const [selectedTest, setSelectedTest] = useState<ABTestType>('age_group_feature');
  const [rawMetrics, setRawMetrics] = useState<MetricEvent[]>([]);
  
  const { results, loading, refreshResults } = useABTestResults(selectedTest);
  
  useEffect(() => {
    const metrics = ABTestService.getMetrics();
    setRawMetrics(metrics);
  }, []);
  
  const handleExport = () => {
    const data = ABTestService.exportMetrics();
    
    // ダウンロード用のBlob作成
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ab-test-metrics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleClearMetrics = () => {
    if (window.confirm('すべてのA/Bテストデータをクリアしますか？この操作は元に戻せません。')) {
      ABTestService.clearMetrics();
      setRawMetrics([]);
      refreshResults();
    }
  };
  
  const testOptions: { value: ABTestType; label: string }[] = [
    { value: 'age_group_feature', label: '年齢層機能テスト' },
    { value: 'age_based_prompts', label: '年齢別プロンプトテスト' },
    { value: 'onboarding_modal', label: 'オンボーディングモーダルテスト' }
  ];
  
  const formatNumber = (value: number) => value.toLocaleString();
  
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 A/Bテストダッシュボード
        </h2>
        <p className="text-gray-600">
          Phase A-1年齢層機能の効果測定とメトリクス分析
        </p>
      </div>
      
      {/* テスト選択 */}
      <div className="mb-6">
        <label htmlFor="test-select" className="block text-sm font-medium text-gray-700 mb-2">
          分析対象テスト
        </label>
        <select
          id="test-select"
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value as ABTestType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {testOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* 操作ボタン */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={refreshResults}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 データ更新
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📥 データエクスポート
        </button>
        <button
          onClick={handleClearMetrics}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ データクリア
        </button>
      </div>
      
      {/* 基本統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-1">総イベント数</h3>
          <p className="text-2xl font-bold text-blue-900">{formatNumber(rawMetrics.length)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-1">ユニークユーザー</h3>
          <p className="text-2xl font-bold text-green-900">
            {formatNumber(new Set(rawMetrics.map(m => m.userId)).size)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800 mb-1">セッション数</h3>
          <p className="text-2xl font-bold text-purple-900">
            {formatNumber(new Set(rawMetrics.map(m => m.sessionId)).size)}
          </p>
        </div>
      </div>
      
      {/* A/Bテスト結果 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">結果を分析中...</p>
        </div>
      ) : results ? (
        <ABTestResultsDisplay results={results} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">選択されたテストのデータが見つかりません</p>
          <p className="text-sm text-gray-400 mt-1">
            ユーザーがアプリを使用するとデータが蓄積されます
          </p>
        </div>
      )}
      
      {/* 年齢層別統計 */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">年齢層別分析</h3>
        <AgeGroupAnalysis metrics={rawMetrics} />
      </div>
      
      {/* 最近のイベント */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近のイベント（最新10件）</h3>
        <RecentEvents metrics={rawMetrics.slice(-10).reverse()} />
      </div>
    </div>
  );
};

// A/Bテスト結果表示コンポーネント
const ABTestResultsDisplay: React.FC<{ results: ABTestResults }> = ({ results }) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value: number) => value.toLocaleString();
  
  const improvementRate = results.treatmentGroup.conversionRate - results.controlGroup.conversionRate;
  const isImprovement = improvementRate > 0;
  
  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {results.testName.replace(/_/g, ' ').toUpperCase()} 結果
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">統計的有意性:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            results.statisticalSignificance > 0.95 
              ? 'bg-green-100 text-green-800'
              : results.statisticalSignificance > 0.8
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {formatPercentage(results.statisticalSignificance)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* コントロールグループ */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
            コントロールグループ
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">ユーザー数:</span>
              <span className="font-medium">{formatNumber(results.controlGroup.users)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">コンバージョン:</span>
              <span className="font-medium">{formatNumber(results.controlGroup.conversions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">コンバージョン率:</span>
              <span className="font-medium">{formatPercentage(results.controlGroup.conversionRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均セッション時間:</span>
              <span className="font-medium">{Math.round(results.controlGroup.avgSessionDuration)}秒</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">満足度スコア:</span>
              <span className="font-medium">{results.controlGroup.satisfactionScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        {/* トリートメントグループ */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            トリートメントグループ
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">ユーザー数:</span>
              <span className="font-medium">{formatNumber(results.treatmentGroup.users)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">コンバージョン:</span>
              <span className="font-medium">{formatNumber(results.treatmentGroup.conversions)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">コンバージョン率:</span>
              <span className="font-medium">{formatPercentage(results.treatmentGroup.conversionRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均セッション時間:</span>
              <span className="font-medium">{Math.round(results.treatmentGroup.avgSessionDuration)}秒</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">満足度スコア:</span>
              <span className="font-medium">{results.treatmentGroup.satisfactionScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 改善率 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">コンバージョン率の改善:</span>
          <span className={`font-medium ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
            {isImprovement ? '+' : ''}{formatPercentage(improvementRate)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-700">勝利バリアント:</span>
          <span className="font-medium text-blue-600">
            {results.winningVariant === 'treatment' ? 'トリートメント' : 'コントロール'}
          </span>
        </div>
      </div>
    </div>
  );
};

// 年齢層別統計の型定義
interface AgeGroupStats {
  events: number;
  users: Set<string>;
  conversions: number;
}

// 年齢層別分析コンポーネント
const AgeGroupAnalysis: React.FC<{ metrics: MetricEvent[] }> = ({ metrics }) => {
  const ageGroupStats = metrics
    .filter(m => m.ageGroup)
    .reduce((stats, metric) => {
      const ageGroup = metric.ageGroup ?? 'unknown';
      if (!stats[ageGroup]) {
        stats[ageGroup] = { events: 0, users: new Set(), conversions: 0 };
      }
      stats[ageGroup].events++;
      stats[ageGroup].users.add(metric.userId);
      if (metric.eventType === 'conversion') {
        stats[ageGroup].conversions++;
      }
      return stats;
    }, {} as Record<string, AgeGroupStats>);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(Object.entries(ageGroupStats) as [string, AgeGroupStats][]).map(([ageGroup, stats]) => (
        <div key={ageGroup} className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">{ageGroup}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">イベント数:</span>
              <span>{stats.events}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ユーザー数:</span>
              <span>{stats.users.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">コンバージョン:</span>
              <span>{stats.conversions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CVR:</span>
              <span>{((stats.conversions / stats.users.size) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 最近のイベント表示コンポーネント
const RecentEvents: React.FC<{ metrics: MetricEvent[] }> = ({ metrics }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">時刻</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">イベント</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">年齢層</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">バリアント</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">詳細</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">
                {new Date(metric.timestamp).toLocaleTimeString('ja-JP')}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">{metric.eventName}</td>
              <td className="px-4 py-2 text-sm text-gray-600">{metric.ageGroup || '-'}</td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  metric.abTestVariant === 'treatment' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {metric.abTestVariant || '-'}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {metric.properties ? Object.keys(metric.properties).length + ' properties' : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};