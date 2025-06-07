import React from 'react';
import SuggestionCard from './SuggestionCard';
import { useSuggestions } from './useSuggestions';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

interface SuggestionListProps {
  situation: 'workplace' | 'home' | 'outside';
  duration: 5 | 15 | 30;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ situation, duration }) => {
  const { suggestions, loading, error, refetch } = useSuggestions(situation, duration);

  if (loading) {
    return <Loading message="気晴らし方法を探しています..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="気晴らし方法の取得に失敗しました" 
        onRetry={refetch}
      />
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">提案が見つかりませんでした</p>
        <button
          onClick={refetch}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          あなたにおすすめの気晴らし方法
        </h2>
        <p className="text-gray-600">
          {situation === 'workplace' && '職場で'}
          {situation === 'home' && '家で'}
          {situation === 'outside' && '外出先で'}
          {duration}分でできる気晴らしです
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            {...suggestion}
            onStart={() => {
              // TODO: 音声ガイド開始処理
              console.log('Start suggestion:', suggestion.id);
            }}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={refetch}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>他の提案を見る</span>
        </button>
      </div>
    </div>
  );
};

export default SuggestionList;