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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <a href="#main-content" className="skip-link">メインコンテンツにスキップ</a>

      <Header
        onCustomClick={onCustomClick}
        weatherIcon={weatherIcon}
        weatherTemp={weatherTemp}
        weatherDescription={weatherDescription}
      />

      <main id="main-content" className="flex-1 px-4 py-4 pb-20">
        {children}
      </main>

      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default MainLayout;
