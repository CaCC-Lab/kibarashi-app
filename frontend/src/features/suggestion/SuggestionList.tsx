import React, { useState, useEffect } from 'react';
import SuggestionCard from './SuggestionCard';
import SuggestionDetail from './SuggestionDetail';
import { useSuggestions } from './useSuggestions';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import GlobalAudioControls from '../audio/GlobalAudioControls';
import ContextDisplay from '../../components/context/ContextDisplay';
import type { Suggestion } from '../../services/api/suggestions';
import { SituationId } from '../../types/situation';
import { useAgeGroup } from '../../hooks/useAgeGroup';
import { useFeature } from '../config/featureFlags';
import { useStudentABTest } from '../../hooks/useStudentABTest';
import { useJobSeekerABTest } from '../../hooks/useJobSeekerABTest';
import { useCareerChangerABTest } from '../../hooks/useCareerChangerABTest';
import { contextAPI, ContextualData } from '../../services/contextAPI';

// コンポーネントのプロパティ定義
// なぜこの構造か：ユーザーが選択した状況と時間に基づいて、最適な提案を表示するため
interface SuggestionListProps {
  situation: SituationId; // 場所：年齢層に応じた状況
  duration: 5 | 15 | 30; // 所要時間：5分、15分、30分
  location?: string; // 地理的位置（地域別の提案生成用）
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
const SuggestionList: React.FC<SuggestionListProps> = ({ situation, duration, location }) => {
  const { suggestions, loading, error, fetchSuggestions } = useSuggestions();
  const { currentAgeGroup } = useAgeGroup();
  
  // A/Bテスト統合
  const { 
    testGroup, 
    isStudentOptimized, 
    trackMetric
  } = useStudentABTest({
    onExposure: (event) => {
      console.log('[A/B Test] Exposure:', event);
    },
    onMetric: (event) => {
      console.log('[A/B Test] Metric:', event);
    }
  });
  
  // 就職活動者向けA/Bテスト
  const {
    isJobSeekerOptimized,
    trackMetric: trackJobSeekerMetric
  } = useJobSeekerABTest({
    onExposure: (event) => {
      console.log('[Job Seeker A/B Test] Exposure:', event);
    },
    onMetric: (event) => {
      console.log('[Job Seeker A/B Test] Metric:', event);
    }
  });
  
  // 転職活動者向けA/Bテスト
  const {
    isCareerChangerOptimized,
    trackMetric: trackCareerChangerMetric
  } = useCareerChangerABTest({
    onExposure: (event) => {
      console.log('[Career Changer A/B Test] Exposure:', event);
    },
    onMetric: (event) => {
      console.log('[Career Changer A/B Test] Metric:', event);
    }
  });
  
  // フィーチャーフラグ
  const isVoiceGuideEnabled = useFeature('enhancedVoiceGuide');
  
  // コンテキストデータの管理
  const [contextData, setContextData] = useState<ContextualData | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  
  // 選択された提案の状態管理
  // なぜ必要か：ユーザーが選んだ提案の詳細画面を表示するため
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  // コンテキストデータを取得
  useEffect(() => {
    const loadContextData = async () => {
      setContextLoading(true);
      try {
        // 場所が変わった場合はキャッシュをクリア
        if (location) {
          contextAPI.clearCache();
        }
        const context = await contextAPI.getCurrentContext(location);
        setContextData(context);
        console.log('Context data loaded for location:', location, context);
      } catch (error) {
        console.error('Failed to load context data:', error);
        // エラーが発生してもコンテキストなしで提案を表示
      } finally {
        setContextLoading(false);
      }
    };

    loadContextData();
  }, [location]); // location が変わるたびに実行

  // コンポーネントマウント時と条件変更時に提案を取得
  useEffect(() => {
    console.log('Fetching suggestions for:', { 
      situation, 
      duration, 
      ageGroup: currentAgeGroup,
      testGroup,
      isStudentOptimized 
    }); // デバッグログ追加
    
    // 学生最適化版の場合、学生向けコンテキストも渡す
    const studentContext = isStudentOptimized && currentAgeGroup === 'student' ? {
      concern: '勉強の合間のリフレッシュ',
      // シチュエーションに応じた学生向けコンテキスト
      subject: situation === 'workplace' ? '勉強全般' : undefined
    } : undefined;
    
    // 就職活動者最適化版の場合、就活向けコンテキストも渡す
    const jobSeekerContext = isJobSeekerOptimized && currentAgeGroup === 'job_seeker' ? {
      concern: '就職活動の合間のリフレッシュ',
      phase: situation === 'workplace' ? '面接準備' : situation === 'home' ? '書類作成' : '説明会・面接'
    } : undefined;
    
    // 転職活動者最適化版の場合、転職向けコンテキストも渡す
    const careerChangerContext = isCareerChangerOptimized && currentAgeGroup === 'career_changer' ? {
      concern: '転職活動の合間のリフレッシュ',
      phase: situation === 'workplace' ? '業務と転職活動の両立' : situation === 'home' ? '転職準備' : '面接・ネットワーキング'
    } : undefined;
    
    // コンテキストを統合
    const context = studentContext || jobSeekerContext || careerChangerContext;
    
    fetchSuggestions(situation, duration, currentAgeGroup, context, location);
  }, [situation, duration, currentAgeGroup, fetchSuggestions, isStudentOptimized, testGroup, isJobSeekerOptimized, isCareerChangerOptimized, location]);

  // 再取得関数
  const refetch = () => {
    const studentContext = isStudentOptimized && currentAgeGroup === 'student' ? {
      concern: '勉強の合間のリフレッシュ',
      subject: situation === 'workplace' ? '勉強全般' : undefined
    } : undefined;
    
    const jobSeekerContext = isJobSeekerOptimized && currentAgeGroup === 'job_seeker' ? {
      concern: '就職活動の合間のリフレッシュ',
      phase: situation === 'workplace' ? '面接準備' : situation === 'home' ? '書類作成' : '説明会・面接'
    } : undefined;
    
    const careerChangerContext = isCareerChangerOptimized && currentAgeGroup === 'career_changer' ? {
      concern: '転職活動の合間のリフレッシュ',
      phase: situation === 'workplace' ? '業務と転職活動の両立' : situation === 'home' ? '転職準備' : '面接・ネットワーキング'
    } : undefined;
    
    const context = studentContext || jobSeekerContext || careerChangerContext;
    
    fetchSuggestions(situation, duration, currentAgeGroup, context, location);
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
    console.log('No suggestions found, suggestions state:', suggestions); // デバッグログ追加
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
      {/* コンテキスト情報表示 */}
      {!contextLoading && contextData && (
        <ContextDisplay 
          weather={contextData.weather}
          seasonal={contextData.seasonal}
          className="mb-4"
        />
      )}

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
          {contextData && (
            <span className="ml-2 text-sm text-primary-600">
              今の状況に合わせた提案を含んでいます
            </span>
          )}
        </p>
      </div>

      {/* グローバル音声コントロール */}
      {isVoiceGuideEnabled && (
        <div className="mb-6">
          <GlobalAudioControls />
        </div>
      )}

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
              
              // A/Bテストメトリクス: 提案クリックを記録
              trackMetric('suggestionClick', {
                suggestionId: suggestion.id,
                suggestionTitle: suggestion.title,
                category: suggestion.category,
                duration: suggestion.duration,
                ageGroup: currentAgeGroup
              });
              
              // 就職活動者向けメトリクス
              if (currentAgeGroup === 'job_seeker') {
                trackJobSeekerMetric('suggestionClick', {
                  suggestionId: suggestion.id,
                  suggestionTitle: suggestion.title,
                  category: suggestion.category,
                  duration: suggestion.duration
                });
              }
              
              // 転職活動者向けメトリクス
              if (currentAgeGroup === 'career_changer') {
                trackCareerChangerMetric('suggestionClick', {
                  suggestionId: suggestion.id,
                  suggestionTitle: suggestion.title,
                  category: suggestion.category,
                  duration: suggestion.duration
                });
              }
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