import React from 'react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="mb-6">
      <label className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">ダークモード</span>
        <button
          onClick={toggleDarkMode}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}
            transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </label>
    </div>
  );
};