import React, { useState } from 'react';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';
import { CustomSuggestion } from '../../types/custom';
import CustomSuggestionForm from './CustomSuggestionForm';

interface CustomSuggestionListProps {
  onSuggestionSelect?: (suggestion: CustomSuggestion) => void;
}

/**
 * カスタム気晴らしリスト表示コンポーネント
 * 
 * 設計思想：
 * - 登録済みカスタム気晴らしの一覧表示
 * - 編集・削除・実行機能を統合
 * - 検索・フィルタリング機能
 * - カード形式で見やすく表示
 */
const CustomSuggestionList: React.FC<CustomSuggestionListProps> = ({ onSuggestionSelect }) => {
  const {
    customSuggestions,
    deleteCustomSuggestion,
    exportCustomSuggestions,
    importCustomSuggestions,
    clearCustomSuggestions,
    isLoading
  } = useCustomSuggestions();

  const [showForm, setShowForm] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<CustomSuggestion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | '認知的' | '行動的'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importMerge, setImportMerge] = useState(false);

  // フィルタリング
  const filteredSuggestions = customSuggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || suggestion.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (suggestion: CustomSuggestion) => {
    setEditingSuggestion(suggestion);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteCustomSuggestion(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSuggestion(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSuggestion(null);
  };

  const handleExport = () => {
    const data = exportCustomSuggestions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `カスタム気晴らし_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importData.trim()) return;
    
    const success = await importCustomSuggestions(importData, importMerge);
    if (success) {
      setShowImportDialog(false);
      setImportData('');
      setImportMerge(false);
    }
  };

  const handleClear = async () => {
    const success = await clearCustomSuggestions();
    if (success) {
      setShowClearConfirm(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
    return `${minutes}分`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-surface-primary dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary dark:text-white mb-4 sm:mb-0">
            マイ気晴らし
          </h2>
          <div className="flex items-center space-x-2">
            {customSuggestions.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-lg"
                  aria-label="エクスポート"
                  title="エクスポート"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-lg"
                  aria-label="インポート"
                  title="インポート"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 text-text-secondary hover:text-secondary-500 transition-colors focus-ring rounded-lg"
                  aria-label="すべて削除"
                  title="すべて削除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-text-inverse rounded-lg transition-colors focus-ring font-medium"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新規追加
            </button>
          </div>
        </div>

        {/* 検索・フィルター */}
        {customSuggestions.length > 0 && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="タイトルや説明で検索..."
                className="w-full px-4 py-2 rounded-lg border border-primary-200 dark:border-gray-600 bg-surface-secondary dark:bg-gray-700 text-text-primary dark:text-white placeholder-text-muted focus-ring focus:border-primary-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | '認知的' | '行動的')}
              className="px-4 py-2 rounded-lg border border-primary-200 dark:border-gray-600 bg-surface-secondary dark:bg-gray-700 text-text-primary dark:text-white focus-ring focus:border-primary-500"
            >
              <option value="all">すべてのカテゴリー</option>
              <option value="認知的">認知的</option>
              <option value="行動的">行動的</option>
            </select>
          </div>
        )}
      </div>

      {/* カスタム気晴らしリスト */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-surface-primary dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-gray-700 p-8 text-center">
          {customSuggestions.length === 0 ? (
            <>
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-lg font-medium text-text-primary dark:text-white mb-2">
                まだカスタム気晴らしがありません
              </h3>
              <p className="text-text-secondary dark:text-gray-400 mb-4">
                あなただけの気晴らし方法を追加してみましょう
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-text-inverse rounded-lg transition-colors focus-ring font-medium"
              >
                最初のカスタム気晴らしを追加
              </button>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-text-primary dark:text-white mb-2">
                条件に一致する気晴らしがありません
              </h3>
              <p className="text-text-secondary dark:text-gray-400">
                検索条件やフィルターを変更してみてください
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-surface-primary dark:bg-gray-800 rounded-xl shadow-sm border border-primary-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="text-text-secondary dark:text-gray-400 text-sm line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => handleEdit(suggestion)}
                    className="p-2 text-text-muted hover:text-text-primary transition-colors focus-ring rounded"
                    aria-label="編集"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(suggestion.id)}
                    className="p-2 text-text-muted hover:text-secondary-500 transition-colors focus-ring rounded"
                    aria-label="削除"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-text-secondary dark:text-gray-400">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    suggestion.category === '認知的' 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
                  }`}>
                    {suggestion.category}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(suggestion.duration)}
                  </span>
                </div>
                
                {onSuggestionSelect && (
                  <button
                    onClick={() => onSuggestionSelect(suggestion)}
                    className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-text-inverse text-sm rounded-lg transition-colors focus-ring font-medium"
                  >
                    実行
                  </button>
                )}
              </div>

              {suggestion.steps && suggestion.steps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-primary-100 dark:border-gray-700">
                  <p className="text-xs text-text-muted mb-2">ステップ数: {suggestion.steps.length}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* フォームモーダル */}
      {showForm && (
        <CustomSuggestionForm
          editingSuggestion={editingSuggestion}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-primary dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
              カスタム気晴らしを削除
            </h3>
            <p className="text-text-secondary dark:text-gray-400 mb-6">
              この操作は取り消せません。本当に削除しますか？
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-text-inverse rounded-lg transition-colors focus-ring font-medium"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* クリア確認ダイアログ */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-primary dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
              すべてのカスタム気晴らしを削除
            </h3>
            <p className="text-text-secondary dark:text-gray-400 mb-6">
              すべてのカスタム気晴らしが削除されます。この操作は取り消せません。
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-text-inverse rounded-lg transition-colors focus-ring font-medium"
              >
                すべて削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* インポートダイアログ */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-primary dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
              カスタム気晴らしのインポート
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  JSONデータ
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-primary-200 dark:border-gray-600 bg-surface-secondary dark:bg-gray-700 text-text-primary dark:text-white placeholder-text-muted focus-ring focus:border-primary-500 text-sm font-mono"
                  placeholder='{"customs": [...], "lastUpdated": "..."}'
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="importMerge"
                  checked={importMerge}
                  onChange={(e) => setImportMerge(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="importMerge" className="text-sm text-text-secondary dark:text-gray-400">
                  既存のデータとマージする
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim() || isLoading}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-text-inverse rounded-lg transition-colors focus-ring font-medium"
              >
                インポート
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSuggestionList;