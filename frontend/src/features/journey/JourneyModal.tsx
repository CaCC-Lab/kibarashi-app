import { JourneyAnalyzer } from '../../services/gamification/journeyAnalyzer';
import WeeklySummary from './WeeklySummary';
import CategoryAnalysis from './CategoryAnalysis';
import TimePatternChart from './TimePatternChart';

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JourneyModal({ isOpen, onClose }: JourneyModalProps) {
  if (!isOpen) return null;

  const summary = JourneyAnalyzer.getWeeklySummary();
  const categories = JourneyAnalyzer.getEffectiveCategories();
  const timePatterns = JourneyAnalyzer.getTimePatterns();

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
                📊 回復ジャーニー
              </h2>
              <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">
                今週の自分を振り返る
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200"
              aria-label="閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
          {/* 今週のサマリー */}
          <div className="bg-surface-secondary dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">📅 今週のサマリー</h3>
            <WeeklySummary summary={summary} />
          </div>

          {/* カテゴリ分析 */}
          <div className="bg-surface-secondary dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">🎯 最近効いているカテゴリ</h3>
            <CategoryAnalysis result={categories} />
          </div>

          {/* 時間帯傾向 */}
          <div className="bg-surface-secondary dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">🕐 利用パターン</h3>
            <TimePatternChart result={timePatterns} />
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-surface-secondary dark:bg-gray-700">
          <p className="text-sm text-text-secondary dark:text-gray-300 text-center">
            使い続けるほど、自分のパターンが見えてきます
          </p>
        </div>
      </div>
    </div>
  );
}
