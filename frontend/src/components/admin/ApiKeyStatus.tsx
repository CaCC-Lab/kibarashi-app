import React, { useState, useEffect } from 'react';

interface ApiKeyDetail {
  index: number;
  lastUsed: string | null;
  failureCount: number;
  isOnCooldown: boolean;
  cooldownUntil: string | null;
  status: 'AVAILABLE' | 'COOLDOWN';
}

interface ApiKeyStats {
  summary: {
    totalKeys: number;
    availableKeys: number;
    totalRequests: number;
    successfulRequests: number;
    successRate: string;
    keyRotations: number;
    rateLimitHits: number;
  };
  keyDetails: ApiKeyDetail[];
}

const ApiKeyStatus: React.FC = () => {
  const [stats, setStats] = useState<ApiKeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/v1/admin/api-keys/status');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch API key status');
      }

      setStats(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async () => {
    try {
      setError(null);
      const response = await fetch('/api/v1/admin/api-keys/rotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to rotate API key');
      }

      // 成功後、ステータスを再取得
      await fetchStats();
      alert('APIキーのローテーションが完了しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleResetCooldowns = async () => {
    if (!confirm('全てのAPIキーのクールダウンをリセットしますか？')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/v1/admin/api-keys/reset-cooldowns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset cooldowns');
      }

      // 成功後、ステータスを再取得
      await fetchStats();
      alert('全てのクールダウンをリセットしました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchStats();

    // 30秒ごとに自動更新
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'COOLDOWN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">エラー</h3>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 p-8">
        データが見つかりません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">API キー管理</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            更新
          </button>
          <button
            onClick={handleRotateKey}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            手動ローテーション
          </button>
          <button
            onClick={handleResetCooldowns}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            クールダウンリセット
          </button>
        </div>
      </div>

      {/* 最終更新時刻 */}
      {lastUpdated && (
        <div className="text-sm text-gray-500">
          最終更新: {lastUpdated.toLocaleString('ja-JP')}
        </div>
      )}

      {/* サマリー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{stats.summary.totalKeys}</div>
          <div className="text-sm text-gray-600">総キー数</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{stats.summary.availableKeys}</div>
          <div className="text-sm text-gray-600">利用可能</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{stats.summary.successRate}</div>
          <div className="text-sm text-gray-600">成功率</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="text-2xl font-bold text-orange-600">{stats.summary.keyRotations}</div>
          <div className="text-sm text-gray-600">ローテーション回数</div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">詳細統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">総リクエスト数:</span>
            <span className="font-medium ml-2">{stats.summary.totalRequests.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">成功リクエスト数:</span>
            <span className="font-medium ml-2">{stats.summary.successfulRequests.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">レート制限回数:</span>
            <span className="font-medium ml-2">{stats.summary.rateLimitHits.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* キー詳細テーブル */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">APIキー詳細</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  キー番号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終使用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  失敗回数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  クールダウン解除時刻
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.keyDetails.map((key) => (
                <tr key={key.index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Key #{key.index}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(key.status)}`}>
                      {key.status === 'AVAILABLE' ? '利用可能' : 'クールダウン中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(key.lastUsed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.failureCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.cooldownUntil ? formatDate(key.cooldownUntil) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyStatus;