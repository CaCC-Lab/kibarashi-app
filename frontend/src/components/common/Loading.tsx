import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = '読み込み中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fadeIn" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
      <span className="sr-only">コンテンツを読み込んでいます</span>
    </div>
  );
};

export default Loading;