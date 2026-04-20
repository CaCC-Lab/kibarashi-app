import React from 'react';
import Header from './Header';
import BottomTabBar, { TabId } from './BottomTabBar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onCustomClick?: () => void;
  weatherIcon?: string;
  weatherTemp?: number;
  weatherDescription?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onCustomClick,
  weatherIcon,
  weatherTemp,
  weatherDescription,
}) => {
  return (
    <div className="h-dvh flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <a href="#main-content" className="skip-link">メインコンテンツにスキップ</a>

      <Header
        onCustomClick={onCustomClick}
        weatherIcon={weatherIcon}
        weatherTemp={weatherTemp}
        weatherDescription={weatherDescription}
      />

      <main id="main-content" className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-20 kb-no-scrollbar">
        {children}
      </main>

      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default MainLayout;
