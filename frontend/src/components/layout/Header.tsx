import React, { useState } from 'react';
import LocationSelector from '../location/LocationSelector';
import HelpModal from '../help/HelpModal';
import BadgeModal from '../../features/badge/BadgeModal';
import JourneyModal from '../../features/journey/JourneyModal';

interface HeaderProps {
  onCustomClick?: () => void;
  currentLocation?: string;
  onLocationChange?: (location: string) => void;
  weatherIcon?: string;
  weatherTemp?: number;
  weatherDescription?: string;
}

const Header: React.FC<HeaderProps> = ({
  onCustomClick,
  currentLocation = 'Tokyo',
  onLocationChange,
  weatherIcon,
  weatherTemp,
  weatherDescription,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  const handleLocationChange = (location: string) => {
    if (onLocationChange) onLocationChange(location);
  };

  const getLocationDisplayName = (location: string) => {
    const locationMap: Record<string, string> = {
      'Tokyo': '東京', 'Osaka': '大阪', 'Kyoto': '京都', 'Yokohama': '横浜',
      'Nagoya': '名古屋', 'Sapporo': '札幌', 'Fukuoka': '福岡', 'Sendai': '仙台',
      'Hiroshima': '広島', 'Kobe': '神戸'
    };
    return locationMap[location] || location;
  };

  const menuItems = [
    { icon: '📍', label: `場所: ${getLocationDisplayName(currentLocation)}`, onClick: () => { setMenuOpen(false); setShowLocationSelector(true); } },
    { icon: '🏅', label: '実績バッジ', onClick: () => { setMenuOpen(false); setShowBadgeModal(true); } },
    { icon: '📊', label: '回復ジャーニー', onClick: () => { setMenuOpen(false); setShowJourneyModal(true); } },
    { icon: '✏️', label: 'マイ気晴らし', onClick: () => { setMenuOpen(false); onCustomClick?.(); } },
    { icon: '❓', label: 'ヘルプ', onClick: () => { setMenuOpen(false); setShowHelpModal(true); } },
  ];

  return (
    <>
      <header
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-primary-100 dark:border-gray-700 transition-colors"
        style={{ paddingTop: 'var(--safe-area-top)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          {/* ロゴ + 天気 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-text-inverse font-bold text-sm">気</span>
            </div>
            <h1 className="text-lg font-bold text-text-primary dark:text-text-inverse">気晴らし</h1>
            {weatherIcon && weatherTemp !== undefined && (
              <span className="text-sm text-gray-500 dark:text-gray-400" title={weatherDescription}>
                {weatherIcon} {weatherTemp}°
              </span>
            )}
          </div>

          {/* 右側: ハンバーガー */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary focus-ring rounded-lg"
              aria-label="メニュー"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ハンバーガーメニュー（オーバーレイ） */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-xl z-50 animate-slideIn"
               style={{ paddingTop: 'calc(var(--safe-area-top) + 56px)' }}>
            <nav className="py-2">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.onClick}
                  className="w-full flex items-center space-x-3 px-5 py-3.5 text-left text-text-primary dark:text-text-inverse hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* モーダル類 */}
      <LocationSelector
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
      />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <BadgeModal isOpen={showBadgeModal} onClose={() => setShowBadgeModal(false)} />
      <JourneyModal isOpen={showJourneyModal} onClose={() => setShowJourneyModal(false)} />
    </>
  );
};

export default Header;
