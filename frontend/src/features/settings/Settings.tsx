import React, { useState } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { useAgeGroup } from '../../hooks/useAgeGroup';
import { FavoritesStorage } from '../../services/storage/favoritesStorage';
import { HistoryStorage } from '../../services/storage/historyStorage';
import { AppDataManager } from '../../services/storage/appDataManager';
import { ABTestDashboard } from '../../components/analytics/ABTestDashboard';
import { AgeGroupSelector } from '../../components/ageGroup/AgeGroupSelector';
import { AgeGroup } from '../../types/ageGroup';
import { DarkModeToggle } from './components/DarkModeToggle';
import { TTSSettings } from './components/TTSSettings';
import { DataExportImport } from './components/DataExportImport';
import { ClearDataDialog } from './components/ClearDataDialog';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { clearFavorites } = useFavorites();
  const { clearHistory } = useHistory();
  const { updateAgeGroup } = useAgeGroup();
  const [defaultTTS, setDefaultTTS] = useState<'gemini' | 'browser'>(
    localStorage.getItem('defaultTTS') as 'gemini' | 'browser' || 'gemini'
  );
  const [showClearConfirm, setShowClearConfirm] = useState<'favorites' | 'history' | 'all' | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [showABTestDashboard, setShowABTestDashboard] = useState(false);
  const [ageGroupChangeMessage, setAgeGroupChangeMessage] = useState<string | null>(null);

  const handleTTSChange = (value: 'gemini' | 'browser') => {
    setDefaultTTS(value);
    localStorage.setItem('defaultTTS', value);
  };

  const handleAgeGroupChange = (newAgeGroup: AgeGroup) => {
    updateAgeGroup(newAgeGroup);
    setAgeGroupChangeMessage('年齢層を更新しました');
    setTimeout(() => setAgeGroupChangeMessage(null), 3000);
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

  const handleExportMessageUpdate = (message: string) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleImportMessageUpdate = (message: string) => {
    setImportMessage(message);
    setTimeout(() => setImportMessage(null), 5000);
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

  const handleClearDataConfirm = (type: 'favorites' | 'history' | 'all') => {
    switch (type) {
      case 'favorites':
        handleClearFavorites();
        break;
      case 'history':
        handleClearHistory();
        break;
      case 'all':
        handleClearAll();
        break;
    }
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
          
          {/* 年齢層設定 */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-3">
              年齢層の変更
            </label>
            <AgeGroupSelector 
              onSelect={handleAgeGroupChange}
              className="w-full"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              年齢層に応じて最適化された気晴らし提案を受け取れます
            </p>
          </div>

          {/* ダークモード */}
          <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

          {/* デフォルト音声エンジン */}
          <TTSSettings defaultTTS={defaultTTS} onTTSChange={handleTTSChange} />
        </section>

        {/* データ管理 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">データ管理</h3>
          
          {/* メッセージ表示 */}
          {(exportMessage || importMessage || ageGroupChangeMessage) && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg animate-fadeIn">
              {exportMessage || importMessage || ageGroupChangeMessage}
            </div>
          )}

          {/* 統合データ管理 */}
          <DataExportImport
            onExportMessage={handleExportMessageUpdate}
            onImportMessage={handleImportMessageUpdate}
            onClearData={(type) => setShowClearConfirm(type)}
          />

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

        {/* A/Bテスト分析（開発者向け） */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">A/Bテスト分析</h3>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Phase A-1 効果測定
              </h4>
              <button
                onClick={() => setShowABTestDashboard(!showABTestDashboard)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showABTestDashboard
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                {showABTestDashboard ? '📊 ダッシュボードを閉じる' : '📈 ダッシュボードを開く'}
              </button>
            </div>
            
            <p className="text-sm text-blue-600 dark:text-blue-300">
              年齢層機能の利用状況とユーザー行動の分析データを確認できます。
              開発チーム向けの機能です。
            </p>
          </div>

          {/* A/Bテストダッシュボード */}
          {showABTestDashboard && (
            <div className="animate-fadeIn">
              <ABTestDashboard />
            </div>
          )}
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
      <ClearDataDialog
        showClearConfirm={showClearConfirm}
        onCancel={() => setShowClearConfirm(null)}
        onConfirm={handleClearDataConfirm}
      />
    </div>
  );
};

export default Settings;