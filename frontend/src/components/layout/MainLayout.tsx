import React from 'react';
import Header from './Header';
import BottomTabBar, { TabId } from './BottomTabBar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onCustomClick?: () => void;
  currentLocation?: string;
  onLocationChange?: (location: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onCustomClick,
  currentLocation,
  onLocationChange
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <a href="#main-content" className="skip-link">メインコンテンツにスキップ</a>

      <Header
        onCustomClick={onCustomClick}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
      />

      <main id="main-content" className="flex-1 px-4 py-4 pb-20">
        {children}
      </main>

      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default MainLayout;
