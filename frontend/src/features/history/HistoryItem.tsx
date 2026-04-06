import React, { useState } from 'react';
import type { HistoryItem as HistoryItemType } from '../../types/history';
import { getSituationLabel } from '../../types/situation';

interface HistoryItemProps {
  item: HistoryItemType;
  onDelete: (id: string) => boolean;
  onUpdateRating: (id: string, rating: 1 | 2 | 3 | 4 | 5) => boolean;
  onUpdateNote: (id: string, note: string) => boolean;
}

/**
 * 履歴項目コンポーネント
 * 
 * 設計思想：
 * - 各履歴の詳細情報を見やすく表示
 * - 評価やメモの編集を直感的に行える
 * - 完了/未完了の状態を視覚的に表現
 */
const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onDelete,
  onUpdateRating,
  onUpdateNote
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(item.note || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 実行時間のフォーマット
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '---';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  // 日時のフォーマット
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };


  // 評価の更新
  const handleRatingClick = (rating: 1 | 2 | 3 | 4 | 5) => {
    if (item.rating === rating) return; // 同じ評価なら何もしない
    onUpdateRating(item.id, rating);
  };

  // メモの保存
  const handleSaveNote = () => {
    onUpdateNote(item.id, editingNote);
    setIsEditingNote(false);
  };

  // 削除処理
  const handleDelete = () => {
    const success = onDelete(item.id);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all duration-200
        ${item.completed 
          ? 'bg-surface-primary dark:bg-gray-800 border-primary-200 dark:border-gray-700' 
          : 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800'
        }
        hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-text-primary dark:text-white">
              {item.title}
            </h3>
            <span className={`
              inline-flex px-2 py-1 text-xs rounded-full
              ${item.category === '認知的' 
                ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' 
                : 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
              }
            `}>
              {item.category}
            </span>
            <span className="text-sm text-text-secondary dark:text-gray-400">
              {getSituationLabel(item.situation)}
            </span>
            {!item.completed && (
              <span className="inline-flex px-2 py-1 text-xs rounded-full bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300 shadow-sm">
                実行中
              </span>
            )}
          </div>
          
          <p className="text-sm text-text-secondary dark:text-gray-400 mb-2">
            {item.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-text-muted dark:text-gray-500">
            <span>{formatDateTime(item.startedAt)}</span>
            <span>•</span>
            <span>設定: {item.duration}分</span>
            {item.completed && item.actualDuration && (
              <>
                <span>•</span>
                <span>実際: {formatDuration(item.actualDuration)}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200 focus-ring hover:scale-105"
            aria-label={isExpanded ? '詳細を閉じる' : '詳細を表示'}
          >
            <svg
              className={`w-5 h-5 text-text-secondary dark:text-gray-400 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-all duration-200 focus-ring hover:scale-105"
            aria-label="削除"
          >
            <svg
              className="w-5 h-5 text-secondary-600 dark:text-secondary-400"
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
        </div>
      </div>

      {/* 詳細セクション */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-primary-200 dark:border-gray-700 space-y-4 animate-fadeIn">
          {/* 評価 */}
          {item.completed && (
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
                満足度
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star as 1 | 2 | 3 | 4 | 5)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`${star}点`}
                  >
                    <svg
                      className={`w-6 h-6 transition-colors duration-200 ${
                        item.rating && star <= item.rating
                          ? 'text-accent-500 fill-current drop-shadow-sm'
                          : 'text-primary-200 dark:text-gray-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
                {item.rating && (
                  <span className="ml-2 text-sm text-text-secondary dark:text-gray-400">
                    {item.rating}点
                  </span>
                )}
              </div>
            </div>
          )}

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
              メモ
            </label>
            {isEditingNote ? (
              <div>
                <textarea
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 dark:border-gray-600 
                    rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-surface-primary
                    dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  rows={3}
                  placeholder="気づいたことや感想を記録..."
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingNote(item.note || '');
                      setIsEditingNote(false);
                    }}
                    className="px-3 py-1 text-sm text-text-secondary dark:text-gray-400 
                      hover:bg-surface-secondary dark:hover:bg-gray-700 rounded transition-all duration-200 focus-ring"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 text-sm bg-primary-500 text-text-inverse 
                      rounded hover:bg-primary-600 transition-all duration-200 focus-ring shadow-sm hover:shadow-md"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNote(true)}
                className="min-h-[60px] px-3 py-2 bg-surface-secondary dark:bg-gray-700/50 
                  rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700 
                  transition-all duration-200 border border-primary-100 hover:border-primary-200"
              >
                {item.note ? (
                  <p className="text-sm text-text-primary dark:text-gray-300 whitespace-pre-wrap">
                    {item.note}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted dark:text-gray-500">
                    クリックしてメモを追加...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl border border-primary-200">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
              履歴の削除
            </h3>
            <p className="text-text-secondary dark:text-gray-400 mb-6">
              この履歴を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-text-primary dark:text-gray-300 hover:bg-surface-secondary 
                  dark:hover:bg-gray-700 rounded-lg transition-all duration-200 focus-ring"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-secondary-500 text-text-inverse rounded-lg 
                  hover:bg-secondary-600 transition-all duration-200 focus-ring shadow-md hover:shadow-lg"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryItem;