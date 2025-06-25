import React, { useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { FavoritesStorage } from '../../services/storage/favoritesStorage';
import { HistoryStorage } from '../../services/storage/historyStorage';
import { AppDataManager, type ExportStats, type ImportResult } from '../../services/storage/appDataManager';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { clearFavorites } = useFavorites();
  const { clearHistory } = useHistory();
  const [defaultTTS, setDefaultTTS] = useState<'gemini' | 'browser'>(
    localStorage.getItem('defaultTTS') as 'gemini' | 'browser' || 'gemini'
  );
  const [showClearConfirm, setShowClearConfirm] = useState<'favorites' | 'history' | 'all' | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTTSChange = (value: 'gemini' | 'browser') => {
    setDefaultTTS(value);
    localStorage.setItem('defaultTTS', value);
  };

  const handleExportFavorites = () => {
    const json = FavoritesStorage.exportFavorites();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favorites_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setExportMessage('お気に入りをエクスポートしました');
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleExportHistory = () => {
    const json = HistoryStorage.exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setExportMessage('履歴をエクスポートしました');
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleImportFavorites = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = FavoritesStorage.importFavorites(jsonData);
        if (success) {
          setImportMessage('お気に入りをインポートしました');
        } else {
          setImportMessage('インポートに失敗しました');
        }
        setTimeout(() => setImportMessage(null), 3000);
      } catch (error) {
        setImportMessage('インポートに失敗しました');
        setTimeout(() => setImportMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = HistoryStorage.importHistory(jsonData);
        if (success) {
          setImportMessage('履歴をインポートしました');
        } else {
          setImportMessage('インポートに失敗しました');
        }
        setTimeout(() => setImportMessage(null), 3000);
      } catch (error) {
        setImportMessage('インポートに失敗しました');
        setTimeout(() => setImportMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearFavorites = () => {
    clearFavorites();
    setShowClearConfirm(null);
    setExportMessage('お気に入りをクリアしました');
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(null);
    setExportMessage('履歴をクリアしました');
    setTimeout(() => setExportMessage(null), 3000);
  };

  // 統合エクスポート/インポート機能
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
      setExportMessage('全データをエクスポートしました');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (error) {
      console.error('Failed to export all data:', error);
      setExportMessage('エクスポートに失敗しました');
      setTimeout(() => setExportMessage(null), 3000);
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
        setImportMessage(
          `全データを${action}しました（合計: ${totalImported}件 - お気に入り: ${favorites}件、履歴: ${history}件、カスタム: ${customSuggestions}件）`
        );
      } else {
        const errorMessage = result.errors?.join(', ') || 'インポートに失敗しました';
        setImportMessage(errorMessage);
      }
    } catch (error) {
      console.error('Failed to import all data:', error);
      setImportMessage('インポートに失敗しました');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setImportMessage(null), 5000);
    }

    // ファイル選択をリセット
    event.target.value = '';
  };

  const handleClearAll = () => {
    const success = AppDataManager.clearAllData();
    setShowClearConfirm(null);
    if (success) {
      setExportMessage('全データをクリアしました');
    } else {
      setExportMessage('データクリアに失敗しました');
    }
    setTimeout(() => setExportMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>戻る</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">設定</h2>

        {/* アプリ設定 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">アプリ設定</h3>
          
          {/* ダークモード */}
          <div className="mb-6">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">ダークモード</span>
              <button
                onClick={toggleDarkMode}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}
                  transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </label>
          </div>

          {/* デフォルト音声エンジン */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              デフォルト音声エンジン
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tts"
                  value="gemini"
                  checked={defaultTTS === 'gemini'}
                  onChange={() => handleTTSChange('gemini')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  Gemini音声（高品質）
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tts"
                  value="browser"
                  checked={defaultTTS === 'browser'}
                  onChange={() => handleTTSChange('browser')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  ブラウザ音声（無料）
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* データ管理 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">データ管理</h3>
          
          {/* メッセージ表示 */}
          {(exportMessage || importMessage) && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg animate-fadeIn">
              {exportMessage || importMessage}
            </div>
          )}

          {/* 統合データ管理 */}
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
                onClick={() => setShowClearConfirm('all')}
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

          {/* お気に入り管理 */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">お気に入り</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportFavorites}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                エクスポート
              </button>
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                インポート
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFavorites}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowClearConfirm('favorites')}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>

          {/* 履歴管理 */}
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">履歴</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportHistory}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                エクスポート
              </button>
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                インポート
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportHistory}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowClearConfirm('history')}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
        </section>

        {/* アプリ情報 */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">アプリ情報</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>バージョン: 1.0.0 (Phase 2)</p>
            <p>© 2025 5分気晴らし</p>
            <p className="text-xs">
              このアプリは完全無料でご利用いただけます。<br />
              広告表示や課金要素は一切ありません。
            </p>
          </div>
        </section>
      </div>

      {/* 確認ダイアログ */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full animate-slideUp">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {showClearConfirm === 'favorites' ? 'お気に入り' : 
               showClearConfirm === 'history' ? '履歴' : 
               '全データ'}をクリアしますか？
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              この操作は取り消すことができません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={
                  showClearConfirm === 'favorites' ? handleClearFavorites :
                  showClearConfirm === 'history' ? handleClearHistory :
                  handleClearAll
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;