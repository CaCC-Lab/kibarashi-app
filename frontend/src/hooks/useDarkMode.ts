import { useState, useEffect } from 'react';

export function useDarkMode() {
  // システムの設定を取得
  const getInitialMode = () => {
    // ローカルストレージに保存された設定があるかチェック
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
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
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // システム設定変更の監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // ローカルストレージに設定がない場合のみシステム設定に従う
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode === null) {
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