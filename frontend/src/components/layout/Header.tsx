import React, { useState } from 'react';
import DarkModeToggle from '../common/DarkModeToggle';
import LocationSelector from '../location/LocationSelector';
import HelpModal from '../help/HelpModal';

interface HeaderProps {
  onFavoritesClick?: () => void;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  onCustomClick?: () => void;
  showFavoritesButton?: boolean;
  showHistoryButton?: boolean;
  showCustomButton?: boolean;
  currentLocation?: string;
  onLocationChange?: (location: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onFavoritesClick, 
  onHistoryClick,
  onSettingsClick,
  onCustomClick,
  showFavoritesButton = true,
  showHistoryButton = true,
  showCustomButton = true,
  currentLocation = 'Tokyo',
  onLocationChange
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000); // 3秒後に自動で非表示
    }
  };

  const handleLocationChange = (location: string) => {
    if (onLocationChange) {
      onLocationChange(location);
    }
  };

  // 場所の表示名を取得
  const getLocationDisplayName = (location: string) => {
    const locationMap: Record<string, string> = {
      'Tokyo': '東京',
      'Osaka': '大阪',
      'Kyoto': '京都',
      'Yokohama': '横浜',
      'Nagoya': '名古屋',
      'Sapporo': '札幌',
      'Fukuoka': '福岡',
      'Sendai': '仙台',
      'Hiroshima': '広島',
      'Kobe': '神戸'
    };
    return locationMap[location] || location;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-primary-100 dark:border-gray-700 transition-colors backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* ブランドロゴ - 新しいプライマリカラーでブランド認知度向上 */}
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <span className="text-text-inverse font-bold text-lg">気</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary dark:text-text-inverse">気晴らしアプリ</h1>
              <p className="text-sm text-text-secondary dark:text-gray-300">5分〜30分・音声ガイド付き</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 場所表示と変更ボタン */}
            <button
              onClick={() => setShowLocationSelector(true)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200 focus-ring"
              aria-label="場所を変更"
              title="場所を変更"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">
                {getLocationDisplayName(currentLocation)}
              </span>
            </button>
            
            {/* ヘルプボタン */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200 focus-ring"
              aria-label="使い方・ヘルプ"
              title="使い方・ヘルプ"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <DarkModeToggle />
            
            {showFavoritesButton && onFavoritesClick && (
              <button
                onClick={onFavoritesClick}
                className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200 focus-ring"
                aria-label="お気に入り"
                title="お気に入り"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
            
            {showHistoryButton && onHistoryClick && (
              <button
                onClick={onHistoryClick}
                className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200 focus-ring"
                aria-label="履歴"
                title="履歴"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
            
            {showCustomButton && onCustomClick && (
              <button
                onClick={onCustomClick}
                className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200 focus-ring"
                aria-label="マイ気晴らし"
                title="マイ気晴らし"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            )}
            
            <div className="relative">
              <button
                onClick={handleSettingsClick}
                className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-gray-700 text-text-secondary hover:text-text-primary transition-all duration-200 focus-ring"
                aria-label="設定"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              </svg>
              </button>
            
              {/* 設定機能の実装予定メッセージ */}
              {showMessage && (
                <div className="absolute right-0 top-full mt-2 z-50 animate-fadeIn">
                  <div className="bg-primary-500 text-text-inverse text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    <div className="absolute -top-2 right-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-primary-500"></div>
                    設定機能は今後実装予定です
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 場所選択モーダル */}
      <LocationSelector
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
      />
      
      {/* ヘルプモーダル */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </header>
  );
};

export default Header;