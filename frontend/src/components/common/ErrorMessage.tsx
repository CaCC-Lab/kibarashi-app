import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  title?: string;
  suggestion?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry,
  title = 'エラーが発生しました',
  suggestion
}) => {
  const getSuggestion = () => {
    if (suggestion) return suggestion;
    
    if (message.includes('ネットワーク') || message.includes('network')) {
      return 'インターネット接続を確認してください';
    }
    if (message.includes('取得に失敗')) {
      return 'しばらく待ってから再度お試しください';
    }
    if (message.includes('タイムアウト')) {
      return '接続が不安定な可能性があります。時間をおいて再度お試しください';
    }
    return '問題が続く場合は、ページを再読み込みしてください';
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-lg font-bold">!</span>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-red-800 mb-1">
            {title}
          </h4>
          <p className="text-sm text-red-700">{message}</p>
          <p className="text-sm text-red-600 mt-2">
            💡 {getSuggestion()}
          </p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-3 text-sm text-red-700 underline hover:text-red-800 transition-colors"
            >
              もう一度試す
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;