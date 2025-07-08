import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
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

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  onFavoritesClick, 
  onHistoryClick,
  onSettingsClick,
  onCustomClick,
  showFavoritesButton = true,
  showHistoryButton = true,
  showCustomButton = true,
  currentLocation,
  onLocationChange
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* アクセシビリティ: スキップリンク */}
      <a href="#main-content" className="skip-link">メインコンテンツにスキップ</a>
      
      <Header 
        onFavoritesClick={onFavoritesClick} 
        onHistoryClick={onHistoryClick}
        onSettingsClick={onSettingsClick}
        onCustomClick={onCustomClick}
        showFavoritesButton={showFavoritesButton}
        showHistoryButton={showHistoryButton}
        showCustomButton={showCustomButton}
        currentLocation={currentLocation}
        onLocationChange={onLocationChange}
      />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 animate-fadeIn">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;