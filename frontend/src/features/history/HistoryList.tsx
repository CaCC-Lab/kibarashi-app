import React, { useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import HistoryItem from './HistoryItem';
import HistoryStats from './HistoryStats';
import HistoryFilter from './HistoryFilter';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import type { HistoryItem as HistoryItemType } from '../../types/history';

/**
 * 履歴一覧コンポーネント
 * 
 * 設計思想：
 * - 実行した気晴らしの履歴を時系列で表示
 * - フィルタリング機能で必要な履歴を素早く見つける
 * - 統計情報で振り返りを支援
 * - エクスポート/インポートでデータのバックアップ
 */
const HistoryList: React.FC = () => {
  const {
    history,
    stats,
    deleteHistoryItem,
    updateRating,
    updateNote,
    clearHistory,
    exportHistory,
    importHistory,
    getHistoryByDateRange,
    getHistoryBySituation,
    getHistoryByCategory
  } = useHistory();

  const [filterType, setFilterType] = useState<'all' | 'date' | 'situation' | 'category'>('all');
  const [filterValue, setFilterValue] = useState<any>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [importData, setImportData] = useState('');
  const [importMerge, setImportMerge] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // フィルタリングされた履歴を取得
  const getFilteredHistory = (): HistoryItemType[] => {
    switch (filterType) {
      case 'date':
        if (filterValue?.startDate && filterValue?.endDate) {
          return getHistoryByDateRange(filterValue.startDate, filterValue.endDate);
        }
        return history;
      case 'situation':
        if (filterValue) {
          return getHistoryBySituation(filterValue);
        }
        return history;
      case 'category':
        if (filterValue) {
          return getHistoryByCategory(filterValue);
        }
        return history;
      default:
        return history;
    }
  };

  const filteredHistory = getFilteredHistory();

  // エクスポート処理
  const handleExport = () => {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kibarashi_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // インポート処理
  const handleImport = () => {
    setImportError(null);
    const success = importHistory(importData, importMerge);
    if (success) {
      setShowImportDialog(false);
      setImportData('');
      setImportMerge(false);
    } else {
      setImportError('インポートに失敗しました。JSONデータの形式を確認してください。');
    }
  };

  // ファイル読み込み
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  // 履歴クリア処理
  const handleClearHistory = () => {
    const success = clearHistory();
    if (success) {
      setShowClearConfirm(false);
    }
  };

  if (history.length === 0 && filterType === 'all') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            実行履歴
          </h2>
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              まだ実行履歴がありません
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              気晴らしを実行すると、ここに履歴が表示されます
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            実行履歴
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="統計表示"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
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
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="エクスポート"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="インポート"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </button>
            {history.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                aria-label="履歴クリア"
              >
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        {showStats && <HistoryStats stats={stats} />}

        {/* フィルター */}
        <HistoryFilter
          filterType={filterType}
          filterValue={filterValue}
          onFilterTypeChange={setFilterType}
          onFilterValueChange={setFilterValue}
        />

        {/* 履歴リスト */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              条件に一致する履歴がありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onDelete={deleteHistoryItem}
                onUpdateRating={updateRating}
                onUpdateNote={updateNote}
              />
            ))}
          </div>
        )}

        {/* インポートダイアログ */}
        {showImportDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                履歴のインポート
              </h3>
              {importError && (
                <ErrorMessage
                  message={importError}
                  onRetry={() => setImportError(null)}
                />
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    JSONファイルを選択
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      dark:file:bg-primary-900/20 dark:file:text-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    またはJSONを直接貼り付け
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                      rounded-lg focus:ring-primary-500 focus:border-primary-500
                      dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder='{"history": [...], "lastUpdated": "..."}'
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={importMerge}
                    onChange={(e) => setImportMerge(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    既存の履歴とマージする
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowImportDialog(false);
                    setImportData('');
                    setImportError(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                    dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importData}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg 
                    hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  インポート
                </button>
              </div>
            </div>
          </div>
        )}

        {/* クリア確認ダイアログ */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                履歴のクリア
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                すべての履歴データが削除されます。この操作は取り消せません。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                    dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg 
                    hover:bg-red-600 transition-colors"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;