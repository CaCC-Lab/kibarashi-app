import React from 'react';

interface ClearDataDialogProps {
  showClearConfirm: 'favorites' | 'history' | 'all' | null;
  onCancel: () => void;
  onConfirm: (type: 'favorites' | 'history' | 'all') => void;
}

export const ClearDataDialog: React.FC<ClearDataDialogProps> = ({
  showClearConfirm,
  onCancel,
  onConfirm,
}) => {
  if (!showClearConfirm) return null;

  return (
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
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => onConfirm(showClearConfirm)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            クリア
          </button>
        </div>
      </div>
    </div>
  );
};