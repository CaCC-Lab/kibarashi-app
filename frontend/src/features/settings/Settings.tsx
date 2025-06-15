import React, { useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { FavoritesStorage } from '../../services/storage/favoritesStorage';
import { HistoryStorage } from '../../services/storage/historyStorage';

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
  const [showClearConfirm, setShowClearConfirm] = useState<'favorites' | 'history' | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

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
              {showClearConfirm === 'favorites' ? 'お気に入り' : '履歴'}をクリアしますか？
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
                onClick={showClearConfirm === 'favorites' ? handleClearFavorites : handleClearHistory}
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