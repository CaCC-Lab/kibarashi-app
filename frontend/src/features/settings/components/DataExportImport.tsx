import React, { useState } from 'react';
import { AppDataManager, type ExportStats, type ImportResult } from '../../../services/storage/appDataManager';

interface DataExportImportProps {
  onExportMessage: (message: string) => void;
  onImportMessage: (message: string) => void;
  onClearData: (type: 'all') => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({
  onExportMessage,
  onImportMessage,
  onClearData,
}) => {
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGetStats = () => {
    try {
      const stats = AppDataManager.getExportStats();
      setExportStats(stats);
    } catch (error) {
      console.error('Failed to get export stats:', error);
    }
  };

  const handleExportAll = async () => {
    setIsProcessing(true);
    try {
      AppDataManager.downloadBackup();
      onExportMessage('全データをエクスポートしました');
    } catch (error) {
      console.error('Failed to export all data:', error);
      onExportMessage('エクスポートに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportAll = async (event: React.ChangeEvent<HTMLInputElement>, merge: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result: ImportResult = merge 
        ? await AppDataManager.mergeFromFile(file)
        : await AppDataManager.importFromFile(file);

      if (result.success && result.importedData) {
        const { favorites, history, customSuggestions } = result.importedData;
        const totalImported = favorites + history + customSuggestions;
        const action = merge ? 'マージ' : 'インポート';
        onImportMessage(
          `全データを${action}しました（合計: ${totalImported}件 - お気に入り: ${favorites}件、履歴: ${history}件、カスタム: ${customSuggestions}件）`
        );
      } else {
        const errorMessage = result.errors?.join(', ') || 'インポートに失敗しました';
        onImportMessage(errorMessage);
      }
    } catch (error) {
      console.error('Failed to import all data:', error);
      onImportMessage('インポートに失敗しました');
    } finally {
      setIsProcessing(false);
    }

    // ファイル選択をリセット
    event.target.value = '';
  };

  return (
    <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-primary-700 dark:text-primary-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          全データ管理
        </h4>
        <button
          onClick={handleGetStats}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
        >
          統計を表示
        </button>
      </div>
      
      {exportStats && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400">お気に入り:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{exportStats.totalFavorites}件</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">履歴:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{exportStats.totalHistory}件</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">カスタム:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{exportStats.totalCustomSuggestions}件</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">サイズ:</span>
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                {(exportStats.exportSize / 1024).toFixed(1)}KB
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportAll}
          disabled={isProcessing}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>処理中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>全データをエクスポート</span>
            </>
          )}
        </button>

        <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>インポート（置換）</span>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleImportAll(e, false)}
            disabled={isProcessing}
            className="hidden"
          />
        </label>

        <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>マージ</span>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleImportAll(e, true)}
            disabled={isProcessing}
            className="hidden"
          />
        </label>

        <button
          onClick={() => onClearData('all')}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>全データをクリア</span>
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <strong>インポート方法:</strong> 「置換」は既存データを上書き、「マージ」は既存データに追加します。
      </p>
    </div>
  );
};