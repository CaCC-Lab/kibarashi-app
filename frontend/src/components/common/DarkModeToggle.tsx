import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full 
        transition-all duration-200 focus:outline-none focus-ring hover:scale-105
        ${isDarkMode ? 'bg-primary-500 shadow-lg' : 'bg-surface-tertiary border border-primary-200'}
        ${className}
      `}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={`ダークモードを${isDarkMode ? 'オフ' : 'オン'}にする`}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full transition-all duration-200 shadow-sm
          ${isDarkMode ? 'bg-text-inverse translate-x-6' : 'bg-primary-500 translate-x-1'}
        `}
      />
      
      {/* アイコン表示 */}
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isDarkMode ? (
          <svg className="w-3 h-3 text-text-inverse ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-primary-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    </button>
  );
};

export default DarkModeToggle;