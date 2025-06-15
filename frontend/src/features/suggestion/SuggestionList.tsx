import React, { useState, useEffect } from 'react';
import SuggestionCard from './SuggestionCard';
import SuggestionDetail from './SuggestionDetail';
import { useSuggestions } from './useSuggestions';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import type { Suggestion } from '../../services/api/suggestions';

// コンポーネントのプロパティ定義
// なぜこの構造か：ユーザーが選択した状況と時間に基づいて、最適な提案を表示するため
interface SuggestionListProps {
  situation: 'workplace' | 'home' | 'outside'; // 場所：職場、家、外出先
  duration: 5 | 15 | 30; // 所要時間：5分、15分、30分
}

/**
 * 気晴らし提案リストコンポーネント
 * 
 * 設計思想：
 * 1. 状態管理の明確化：ローディング、エラー、成功の3状態を明確に分離
 * 2. 選択と詳細表示の切り替え：ユーザーが提案を選んだら詳細を表示
 * 3. エラー時のリトライ機能：失敗してもユーザーが簡単に再試行できる
 * 
 * なぜこの設計か：
 * - ストレスを抱えたユーザーが、すぐに気晴らし方法にアクセスできる
 * - 選択肢を一覧で表示し、興味を持ったものの詳細を確認できる
 * - ネットワークエラー等で失敗しても、ユーザーがあきらめずに済む
 */
const SuggestionList: React.FC<SuggestionListProps> = ({ situation, duration }) => {
  const { suggestions, loading, error, fetchSuggestions } = useSuggestions();
  
  // 選択された提案の状態管理
  // なぜ必要か：ユーザーが選んだ提案の詳細画面を表示するため
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  // コンポーネントマウント時と条件変更時に提案を取得
  useEffect(() => {
    fetchSuggestions(situation, duration);
  }, [situation, duration, fetchSuggestions]);

  // 再取得関数
  const refetch = () => {
    fetchSuggestions(situation, duration);
  };

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
        <p className="text-text-secondary">提案が見つかりませんでした</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 focus-ring"
        >
          再試行
        </button>
      </div>
    );
  }

  // ステップ3: 提案詳細表示
  // なぜこの機能が必要か：
  // - ユーザーはまず一覧から興味を持った提案を選び、詳細を確認したい
  // - 詳細画面では具体的な手順や音声ガイドを提供
  // - 一覧に戻る機能も必須（選び直したい場合があるため）
  if (selectedSuggestion) {
    return (
      <SuggestionDetail
        {...selectedSuggestion}
        situation={situation}
        onBack={() => {
          // 詳細から一覧に戻る
          // nullをセットすることで、選択状態をクリアし、一覧表示に戻る
          setSelectedSuggestion(null);
        }}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          あなたにおすすめの気晴らし方法
        </h2>
        <p className="text-text-secondary">
          {/* ユーザーが選択した条件を明確に表示 */}
          {situation === 'workplace' && '職場で'}
          {situation === 'home' && '家で'}
          {situation === 'outside' && '外出先で'}
          {duration}分でできる気晴らしです
        </p>
      </div>

      {/* 提案カードのグリッド表示 */}
      {/* なぜグリッドか：3つの提案を均等に並べ、比較しやすくするため */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            {...suggestion}
            onStart={() => {
              // ユーザーが「始める」ボタンをクリックした時の処理
              // 選択された提案をstateに保存し、詳細表示へ遷移
              setSelectedSuggestion(suggestion);
            }}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={refetch}
          className="inline-flex items-center space-x-2 px-4 py-2 text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 focus-ring hover:scale-105"
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