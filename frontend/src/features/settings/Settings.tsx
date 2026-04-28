import React, { useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { useAgeGroup } from '../../hooks/useAgeGroup';
import { useAppearance } from '../../hooks/useAppearance';
import { AppDataManager } from '../../services/storage/appDataManager';
import { AgeGroupSelector } from '../../components/ageGroup/AgeGroupSelector';
import { AgeGroup } from '../../types/ageGroup';
import { ClearDataDialog } from './components/ClearDataDialog';
import { AppearanceSettings } from './components/AppearanceSettings';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { clearFavorites } = useFavorites();
  const { clearHistory } = useHistory();
  const { updateAgeGroup } = useAgeGroup();
  const { appearance, update: updateAppearance } = useAppearance();
  const [showClearConfirm, setShowClearConfirm] = useState<'favorites' | 'history' | 'all' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAgeGroupChange = (newAgeGroup: AgeGroup) => {
    updateAgeGroup(newAgeGroup);
    showMessage('年齢層を更新しました');
  };

  const handleClearDataConfirm = (type: 'favorites' | 'history' | 'all') => {
    switch (type) {
      case 'favorites':
        clearFavorites();
        showMessage('お気に入りをクリアしました');
        break;
      case 'history':
        clearHistory();
        showMessage('履歴をクリアしました');
        break;
      case 'all':
        AppDataManager.clearAllData();
        showMessage('全データをクリアしました');
        break;
    }
    setShowClearConfirm(null);
  };

  const handleBackup = () => {
    try {
      AppDataManager.downloadBackup();
      showMessage('バックアップをダウンロードしました');
    } catch {
      showMessage('バックアップに失敗しました');
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = AppDataManager.importAllData(e.target?.result as string);
        if (result.success) {
          showMessage('データを復元しました');
        } else {
          showMessage('復元に失敗しました');
        }
      } catch {
        showMessage('復元に失敗しました');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">設定</h2>

        {/* メッセージ */}
        {message && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg animate-fadeIn">
            {message}
          </div>
        )}

        {/* 年齢層 */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">年齢層</h3>
          <AgeGroupSelector
            onSelect={handleAgeGroupChange}
            className="w-full"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            年齢層に応じた提案を受け取れます
          </p>
        </section>

        {/* 外観 */}
        <section>
          <AppearanceSettings appearance={appearance} onChange={updateAppearance} />
        </section>

        {/* データ管理 */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">データ管理</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleBackup}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                バックアップ
              </button>
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                復元
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowClearConfirm('favorites')}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                お気に入りを削除
              </button>
              <button
                onClick={() => setShowClearConfirm('history')}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                履歴を削除
              </button>
              <button
                onClick={() => setShowClearConfirm('all')}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                全データを削除
              </button>
            </div>
          </div>
        </section>

        {/* アプリ情報 */}
        <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>気晴らしレシピ v1.0.0</p>
            <p className="text-xs">完全無料・広告なし・課金なし</p>
          </div>
        </section>
      </div>

      <ClearDataDialog
        showClearConfirm={showClearConfirm}
        onCancel={() => setShowClearConfirm(null)}
        onConfirm={handleClearDataConfirm}
      />
    </div>
  );
};

export default Settings;
