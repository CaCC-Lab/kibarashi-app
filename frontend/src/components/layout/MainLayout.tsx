import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  onFavoritesClick?: () => void;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  showFavoritesButton?: boolean;
  showHistoryButton?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  onFavoritesClick, 
  onHistoryClick,
  onSettingsClick,
  showFavoritesButton = true,
  showHistoryButton = true
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* アクセシビリティ: スキップリンク */}
      <a href="#main-content" className="skip-link">メインコンテンツにスキップ</a>
      
      <Header 
        onFavoritesClick={onFavoritesClick} 
        onHistoryClick={onHistoryClick}
        onSettingsClick={onSettingsClick}
        showFavoritesButton={showFavoritesButton}
        showHistoryButton={showHistoryButton}
      />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 animate-fadeIn">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;