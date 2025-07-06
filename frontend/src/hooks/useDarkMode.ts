import { useState, useEffect } from 'react';

export function useDarkMode() {
  // システムの設定を取得
  const getInitialMode = () => {
    try {
      // ローカルストレージが利用可能かチェック
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        const savedMode = localStorage.getItem('theme');
        if (savedMode !== null) {
          return savedMode === 'dark';
        }
      }
    } catch (error) {
      // localStorageが利用できない場合は無視
      console.error('localStorage is not available:', error);
    }
    
    // システムのprefers-color-schemeを確認
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialMode);

  useEffect(() => {
    // HTMLにクラスを追加/削除
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // ローカルストレージに保存
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      }
    } catch (error) {
      // localStorageが利用できない場合は無視
      console.error('Failed to save dark mode preference:', error);
    }
  }, [isDarkMode]);

  // システム設定変更の監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        // ローカルストレージに設定がない場合のみシステム設定に従う
        if (typeof localStorage !== 'undefined' && localStorage !== null) {
          const savedMode = localStorage.getItem('theme');
          if (savedMode === null) {
            setIsDarkMode(e.matches);
          }
        } else {
          // localStorageが利用できない場合はシステム設定に従う
          setIsDarkMode(e.matches);
        }
      } catch (error) {
        // localStorageが利用できない場合はシステム設定に従う
        console.error('Failed to read dark mode preference:', error);
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return {
    isDarkMode,
    toggleDarkMode,
  };
}