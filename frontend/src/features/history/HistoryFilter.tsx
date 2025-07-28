import React, { useState } from 'react';

export type FilterValue = null | string | { startDate: Date; endDate: Date };

interface HistoryFilterProps {
  filterType: 'all' | 'date' | 'situation' | 'category';
  filterValue: FilterValue;
  onFilterTypeChange: (type: 'all' | 'date' | 'situation' | 'category') => void;
  onFilterValueChange: (value: FilterValue) => void;
}

/**
 * 履歴フィルターコンポーネント
 * 
 * 設計思想：
 * - 直感的なUIで履歴をフィルタリング
 * - 日付範囲、状況、カテゴリーでの絞り込み
 * - フィルター状態を視覚的に表示
 */
const HistoryFilter: React.FC<HistoryFilterProps> = ({
  filterType,
  filterValue,
  onFilterTypeChange,
  onFilterValueChange
}) => {
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>(() => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      startDate: lastWeek.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  });

  // フィルタータイプの変更処理
  const handleFilterTypeChange = (type: 'all' | 'date' | 'situation' | 'category') => {
    onFilterTypeChange(type);
    onFilterValueChange(null); // フィルター値をリセット
  };

  // 日付範囲の適用
  const applyDateFilter = () => {
    onFilterValueChange({
      startDate: new Date(dateRange.startDate),
      endDate: new Date(dateRange.endDate + 'T23:59:59')
    });
  };

  return (
    <div className="mb-6 p-4 bg-surface-secondary dark:bg-gray-900/50 rounded-lg border border-primary-100">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-text-primary dark:text-gray-300">
          フィルター:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterTypeChange('all')}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 focus-ring ${
              filterType === 'all'
                ? 'bg-primary-500 text-text-inverse shadow-md'
                : 'bg-primary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-primary-200 dark:hover:bg-gray-600'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => handleFilterTypeChange('date')}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 focus-ring ${
              filterType === 'date'
                ? 'bg-primary-500 text-text-inverse shadow-md'
                : 'bg-primary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-primary-200 dark:hover:bg-gray-600'
            }`}
          >
            期間指定
          </button>
          <button
            onClick={() => handleFilterTypeChange('situation')}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 focus-ring ${
              filterType === 'situation'
                ? 'bg-primary-500 text-text-inverse shadow-md'
                : 'bg-primary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-primary-200 dark:hover:bg-gray-600'
            }`}
          >
            状況別
          </button>
          <button
            onClick={() => handleFilterTypeChange('category')}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 focus-ring ${
              filterType === 'category'
                ? 'bg-primary-500 text-text-inverse shadow-md'
                : 'bg-primary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-primary-200 dark:hover:bg-gray-600'
            }`}
          >
            カテゴリー別
          </button>
        </div>
      </div>

      {/* 日付範囲フィルター */}
      {filterType === 'date' && (
        <div className="animate-fadeIn">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                開始日
              </label>
              <input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-primary-300 dark:border-gray-600 rounded-lg 
                  focus:ring-primary-500 focus:border-primary-500 bg-surface-primary
                  dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                終了日
              </label>
              <input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-primary-300 dark:border-gray-600 rounded-lg 
                  focus:ring-primary-500 focus:border-primary-500 bg-surface-primary
                  dark:bg-gray-700 dark:text-white transition-colors duration-200"
              />
            </div>
            <button
              onClick={applyDateFilter}
              className="px-4 py-2 bg-primary-500 text-text-inverse rounded-lg 
                hover:bg-primary-600 transition-all duration-200 focus-ring shadow-md hover:shadow-lg"
            >
              適用
            </button>
          </div>
        </div>
      )}

      {/* 状況フィルター */}
      {filterType === 'situation' && (
        <div className="flex flex-wrap gap-2 animate-fadeIn">
          <button
            onClick={() => onFilterValueChange('workplace')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 focus-ring ${
              filterValue === 'workplace'
                ? 'bg-primary-600 text-text-inverse shadow-md'
                : 'bg-primary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-primary-200 dark:hover:bg-gray-600'
            }`}
          >
            職場
          </button>
          <button
            onClick={() => onFilterValueChange('home')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 focus-ring ${
              filterValue === 'home'
                ? 'bg-accent-600 text-text-inverse shadow-md'
                : 'bg-accent-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-accent-200 dark:hover:bg-gray-600'
            }`}
          >
            家
          </button>
          <button
            onClick={() => onFilterValueChange('outside')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 focus-ring ${
              filterValue === 'outside'
                ? 'bg-secondary-500 text-text-inverse shadow-md'
                : 'bg-secondary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-secondary-200 dark:hover:bg-gray-600'
            }`}
          >
            外出先
          </button>
        </div>
      )}

      {/* カテゴリーフィルター */}
      {filterType === 'category' && (
        <div className="flex flex-wrap gap-2 animate-fadeIn">
          <button
            onClick={() => onFilterValueChange('認知的')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 focus-ring ${
              filterValue === '認知的'
                ? 'bg-primary-500 text-text-inverse shadow-md'
                : 'bg-primary-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-primary-200 dark:hover:bg-gray-600'
            }`}
          >
            認知的
          </button>
          <button
            onClick={() => onFilterValueChange('行動的')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 focus-ring ${
              filterValue === '行動的'
                ? 'bg-accent-500 text-text-inverse shadow-md'
                : 'bg-accent-100 dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-accent-200 dark:hover:bg-gray-600'
            }`}
          >
            行動的
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryFilter;