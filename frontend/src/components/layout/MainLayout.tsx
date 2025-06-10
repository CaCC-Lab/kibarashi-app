import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* アクセシビリティ: スキップリンク */}
      <a href="#main-content" className="skip-link">メインコンテンツにスキップ</a>
      
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 animate-fadeIn">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;