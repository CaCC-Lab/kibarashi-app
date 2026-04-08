import { useLayoutEffect, useState } from 'react';
import { BadgeEngine } from '../../services/gamification/badgeEngine';
import type { BadgeEvaluationResult } from '../../types/badge';
import BadgeList from './BadgeList';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgeModal({ isOpen, onClose }: BadgeModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<BadgeEvaluationResult | null>(
    null
  );

  useLayoutEffect(() => {
    if (!isOpen) {
      setEvaluation(null);
      return;
    }
    setEvaluation(BadgeEngine.evaluateBadges());
  }, [isOpen]);

  if (!isOpen) return null;
  if (!evaluation) return null;

  const total = BadgeEngine.getBadgeDefinitions().length;
  const unlocked = evaluation.unlocked.length;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-text-inverse">
                🏅 実績バッジ
              </h2>
              <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">
                {unlocked} / {total} 獲得済み
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200"
              aria-label="閉じる"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* バッジ一覧 */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          <BadgeList
            evaluation={evaluation}
            selectedId={selectedId}
            onSelectBadge={(id) => setSelectedId(selectedId === id ? null : id)}
          />
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-surface-secondary dark:bg-gray-700">
          <p className="text-sm text-text-secondary dark:text-gray-300 text-center">
            アプリを使い続けると新しいバッジが解除されます
          </p>
        </div>
      </div>
    </div>
  );
}
