import { useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import SuggestionCard from '../suggestion/SuggestionCard';
import SuggestionDetail from '../suggestion/SuggestionDetail';
import { Suggestion } from '../../services/api/types';

/**
 * お気に入りリスト表示コンポーネント
 */
export default function FavoritesList() {
  const { favorites, clearFavorites, exportFavorites, importFavorites } = useFavorites();
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // お気に入りからSuggestion形式に変換
  const suggestions: Suggestion[] = favorites.map(fav => ({
    id: fav.suggestionId,
    title: fav.title,
    description: fav.description,
    category: fav.category,
    duration: fav.duration,
    steps: fav.steps || []
  }));

  const handleExport = () => {
    const data = exportFavorites();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kibarashi-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
  };

  const handleClearFavorites = () => {
    if (window.confirm('すべてのお気に入りを削除しますか？この操作は取り消せません。')) {
      clearFavorites();
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const success = importFavorites(content);
          if (success) {
            alert('お気に入りをインポートしました');
          } else {
            alert('インポートに失敗しました。ファイル形式を確認してください。');
          }
        } catch (error) {
          alert('インポートに失敗しました。ファイル形式を確認してください。');
        }
        setShowImportDialog(false);
      };
      reader.readAsText(file);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">お気に入りがありません</h3>
        <p className="text-gray-500 mb-6">
          気に入った気晴らし方法をハートアイコンで保存しましょう
        </p>
        <button
          onClick={() => setShowImportDialog(true)}
          className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-900/20 dark:hover:bg-primary-900/30"
        >
          保存済みのお気に入りをインポート
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            お気に入り
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {favorites.length}件の気晴らし方法を保存中
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            インポート
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            エクスポート
          </button>
          <button
            onClick={handleClearFavorites}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-800 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            すべて削除
          </button>
        </div>
      </div>

      {/* お気に入りリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            id={suggestion.id}
            title={suggestion.title}
            description={suggestion.description}
            duration={suggestion.duration}
            category={suggestion.category}
            steps={suggestion.steps}
            onStart={() => setSelectedSuggestion(suggestion)}
          />
        ))}
      </div>

      {/* 詳細モーダル */}
      {selectedSuggestion && (
        <SuggestionDetail
          id={selectedSuggestion.id}
          title={selectedSuggestion.title}
          description={selectedSuggestion.description}
          duration={selectedSuggestion.duration}
          guide={selectedSuggestion.guide}
          category={selectedSuggestion.category}
          situation="workplace" // お気に入りからは元のsituationが不明なためデフォルト値
          onBack={() => setSelectedSuggestion(null)}
        />
      )}

      {/* エクスポートダイアログ */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              お気に入りをエクスポート
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              お気に入りをJSONファイルとしてダウンロードします。
              他のデバイスで読み込むことができます。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExportDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                ダウンロード
              </button>
            </div>
          </div>
        </div>
      )}

      {/* インポートダイアログ */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              お気に入りをインポート
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              以前エクスポートしたJSONファイルを選択してください。
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
              id="file_input"
            />
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}