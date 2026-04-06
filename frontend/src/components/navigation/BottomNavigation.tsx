import React from 'react';

interface BottomNavigationProps {
  onStartClick: () => void;
  onFavoritesClick: () => void;
  onHistoryClick: () => void;
  currentStep: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onStartClick,
  onFavoritesClick,
  onHistoryClick,
  currentStep
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb z-50">
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        
        {/* お気に入りボタン */}
        <button
          onClick={onFavoritesClick}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-ring min-w-[44px] min-h-[44px]"
          aria-label="お気に入り一覧"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs text-gray-600 dark:text-gray-400">お気に入り</span>
        </button>
        
        {/* メイン気晴らし開始ボタン */}
        <button
          onClick={onStartClick}
          className={`flex-1 mx-4 py-4 px-6 rounded-full font-semibold text-white transition-all duration-200 focus-ring shadow-lg hover:shadow-xl min-h-[56px] ${
            currentStep === 'situation' 
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700' 
              : 'bg-primary-400 hover:bg-primary-500'
          }`}
          aria-label="気晴らし選択を開始"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">🌟</span>
            <span className="text-lg font-bold">はればれを始める</span>
          </div>
        </button>
        
        {/* 履歴ボタン */}
        <button
          onClick={onHistoryClick}
          className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-ring min-w-[44px] min-h-[44px]"
          aria-label="履歴一覧"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-600 dark:text-gray-400">履歴</span>
        </button>
        
      </div>
      
      {/* アクセシビリティ向上：ハプティックフィードバック */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom, 0);
          }
        `
      }} />
    </div>
  );
};

export default BottomNavigation;