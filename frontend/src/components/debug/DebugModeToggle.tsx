import React from 'react';

interface DebugModeToggleProps {
  onToggle: (enabled: boolean) => void;
  className?: string;
}

/**
 * デバッグモード切り替えコンポーネント
 * 
 * 設計思想：
 * - 開発時の詳細情報表示を制御
 * - プロダクションでは非表示
 * - ローカルストレージに設定を保存
 */
export const DebugModeToggle: React.FC<DebugModeToggleProps> = ({ onToggle, className = '' }) => {
  const [debugMode, setDebugMode] = React.useState(() => {
    // 開発環境でのみ有効化可能
    if (process.env.NODE_ENV === 'production') return false;
    
    // ローカルストレージから設定を読み込み
    const stored = localStorage.getItem('kibarashi-debug-mode');
    return stored === 'true';
  });

  // 本番環境では表示しない
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleToggle = () => {
    const newValue = !debugMode;
    setDebugMode(newValue);
    localStorage.setItem('kibarashi-debug-mode', String(newValue));
    onToggle(newValue);
  };

  return (
    <div className={`fixed bottom-4 right-4 ${className}`}>
      <button
        onClick={handleToggle}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg
          transition-all duration-200 backdrop-blur-sm
          ${debugMode 
            ? 'bg-red-500/90 hover:bg-red-600/90 text-white' 
            : 'bg-gray-700/90 hover:bg-gray-800/90 text-gray-300'}
        `}
        title={debugMode ? 'デバッグモードを無効化' : 'デバッグモードを有効化'}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {debugMode ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          )}
        </svg>
        <span className="text-sm font-medium">
          {debugMode ? 'Debug ON' : 'Debug OFF'}
        </span>
      </button>
    </div>
  );
};

export default DebugModeToggle;