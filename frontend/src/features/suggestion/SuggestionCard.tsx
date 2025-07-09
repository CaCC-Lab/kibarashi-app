import React, { useState } from 'react';
import FavoriteButton from '../../components/favorites/FavoriteButton';
import { VoiceGuidePlayer } from '../audio/VoiceGuidePlayer';
import { useFeature } from '../config/featureFlags';
import { useStudentABTest } from '../../hooks/useStudentABTest';
import { useHousewifeABTest } from '../../hooks/useHousewifeABTest';
import { useJobSeekerABTest } from '../../hooks/useJobSeekerABTest';
import { useCareerChangerABTest } from '../../hooks/useCareerChangerABTest';
import { Suggestion, VoiceGuideScript } from '../../services/api/types';

interface SuggestionCardProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: '認知的' | '行動的';
  steps?: string[];
  voiceGuideScript?: VoiceGuideScript;
  ageGroup?: string;
  onStart?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  id,
  title,
  description,
  duration,
  category,
  steps,
  voiceGuideScript,
  ageGroup,
  onStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 学生向けA/Bテストフックの統合
  const { trackMetric, shouldRender } = useStudentABTest({
    onMetric: (event) => {
      console.log('[SuggestionCard] Student A/B Test Metric:', event);
    }
  });

  // 主婦・主夫向けA/Bテストフックの統合
  const { 
    trackMetric: trackHousewifeMetric, 
    shouldRender: shouldRenderHousewife 
  } = useHousewifeABTest({
    onMetric: (event) => {
      console.log('[SuggestionCard] Housewife A/B Test Metric:', event);
    }
  });
  
  // 就職活動者向けA/Bテストフックの統合
  const {
    trackMetric: trackJobSeekerMetric,
    shouldRender: shouldRenderJobSeeker
  } = useJobSeekerABTest({
    onMetric: (event) => {
      console.log('[SuggestionCard] Job Seeker A/B Test Metric:', event);
    }
  });
  
  // 転職活動者向けA/Bテストフックの統合
  const {
    trackMetric: trackCareerChangerMetric,
    shouldRender: shouldRenderCareerChanger
  } = useCareerChangerABTest({
    onMetric: (event) => {
      console.log('[SuggestionCard] Career Changer A/B Test Metric:', event);
    }
  });
  
  // フィーチャーフラグによる音声ガイド機能の制御
  const isVoiceGuideEnabled = useFeature('enhancedVoiceGuide');
  const shouldShowVoiceGuide = isVoiceGuideEnabled && voiceGuideScript;
  
  // A/Bテストメトリクストラッキング付きのonStartハンドラー
  const handleStart = () => {
    // 学生向けA/Bテストメトリクスをトラッキング
    trackMetric('suggestionStart', {
      suggestionId: id,
      ageGroup: ageGroup || 'unknown',
      category,
      duration
    });

    // 主婦・主夫向けA/Bテストメトリクスをトラッキング
    trackHousewifeMetric('suggestionStart', {
      suggestionId: id,
      ageGroup: ageGroup || 'unknown',
      category,
      duration,
      isHousewife: ageGroup === 'housewife'
    });
    
    // 就職活動者向けA/Bテストメトリクスをトラッキング
    trackJobSeekerMetric('suggestionStart', {
      suggestionId: id,
      ageGroup: ageGroup || 'unknown',
      category,
      duration,
      isJobSeeker: ageGroup === 'job_seeker'
    });
    
    // 転職活動者向けA/Bテストメトリクスをトラッキング
    trackCareerChangerMetric('suggestionStart', {
      suggestionId: id,
      ageGroup: ageGroup || 'unknown',
      category,
      duration,
      isCareerChanger: ageGroup === 'career_changer'
    });
    
    // 元のonStartコールバックを実行
    onStart?.();
  };

  // FavoriteButton用のsuggestionオブジェクトを作成
  const suggestion: Suggestion = {
    id,
    title,
    description,
    duration,
    category,
    steps: steps || []
  };

  const categoryStyles = {
    認知的: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    行動的: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  };

  const style = categoryStyles[category] || categoryStyles['認知的']; // フォールバック

  return (
    <div 
      data-testid="suggestion-card"
      className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover-lift animate-slideIn h-full flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-1 pr-2">{title}</h3>
              <FavoriteButton suggestion={suggestion} className="flex-shrink-0" />
            </div>
            <p className="text-gray-600 dark:text-gray-100 text-sm">{description}</p>
          </div>
          <div className={`ml-4 px-3 py-1 rounded-full ${style?.bg || ''} ${style?.border || ''} border`}>
            <div className={`flex items-center space-x-1 ${style?.text || ''}`}>
              {style?.icon}
              <span className="text-sm font-medium">{category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{duration}分</span>
            </div>
            {steps && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{steps.length}ステップ</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          {steps && steps.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex items-center gap-2 text-sm transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`steps-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className={`
                  p-1 rounded-full transition-colors
                  ${isExpanded ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500'}
                `}>
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${
                      isExpanded ? 'rotate-180 text-primary-600 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <span className={`font-medium transition-colors duration-200 ${isExpanded ? 'text-primary-700 dark:text-primary-300' : 'text-text-primary dark:text-white'}`}>
                  {isExpanded ? '手順を隠す' : `${steps.length}つの手順を見る`}
                </span>
              </button>
              
              {isExpanded && (
                <ol id={`steps-${title.replace(/\s+/g, '-').toLowerCase()}`} className="mt-3 space-y-2 animate-fadeIn">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3 text-sm text-text-secondary dark:text-gray-200 animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* 音声ガイドプレイヤー */}
        {shouldShowVoiceGuide && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 013 3v3a3 3 0 01-6 0V9a3 3 0 013-3z" />
              </svg>
              <h4 className="font-medium text-gray-700 dark:text-gray-200">音声ガイド付き</h4>
            </div>
            <VoiceGuidePlayer 
              voiceGuideScript={voiceGuideScript}
              suggestionId={id}
              onError={(error) => {
                console.warn('Voice guide error:', error);
                // エラー時は静かに無視（ユーザー体験を阻害しない）
              }}
              onComplete={() => {
                // 音声ガイド完了時の処理（必要に応じて）
                console.log('Voice guide completed for suggestion:', id);
              }}
            />
          </div>
        )}

        {/* 学生向け最適化コンテンツ */}
        {shouldRender('studentFeature') && (ageGroup === 'student' || ageGroup === 'middle_school') && (
          <div data-testid="student-optimized-content" className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">学習効率を高める気晴らし</h4>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-200 mb-3">
              この活動で頭をリフレッシュして、集中力を回復しましょう。
            </p>
            <div className="text-xs text-blue-500 dark:text-blue-300">
              💡 勉強に戻る準備はできましたか？
            </div>
          </div>
        )}

        {/* 主婦・主夫向け最適化コンテンツ */}
        {shouldRenderHousewife('housewifeFeature') && ageGroup === 'housewife' && (
          <div data-testid="housewife-optimized-content" className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg border border-pink-200 dark:border-pink-700">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h4 className="font-medium text-pink-700 dark:text-pink-300">家事・育児ストレス解消の時間</h4>
            </div>
            <p className="text-sm text-pink-600 dark:text-pink-200 mb-3">
              忙しい毎日の中で、あなた自身をいたわる大切な時間です。
            </p>
            <div className="text-xs text-pink-500 dark:text-pink-300">
              🏠 あなたの頑張りを認めて、リフレッシュしましょう
            </div>
          </div>
        )}

        {/* 就職活動者向け最適化コンテンツ */}
        {shouldRenderJobSeeker('jobSeekerFeature') && ageGroup === 'job_seeker' && (
          <div data-testid="job-seeker-optimized-content" className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300">就活の合間のリフレッシュタイム</h4>
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-200 mb-3">
              面接や書類作成で疲れた心と頭をリセットしましょう。
            </p>
            <div className="text-xs text-indigo-500 dark:text-indigo-300">
              💼 次の挑戦への活力を充電する時間です
            </div>
          </div>
        )}

        {/* 転職活動者向け最適化コンテンツ */}
        {shouldRenderCareerChanger('careerChangerFeature') && ageGroup === 'career_changer' && (
          <div data-testid="career-changer-optimized-content" className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h4 className="font-medium text-purple-700 dark:text-purple-300">キャリアチェンジの不安を和らげる時間</h4>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-200 mb-3">
              新しいキャリアへの一歩を踏み出すあなたを応援します。
            </p>
            <div className="text-xs text-purple-500 dark:text-purple-300">
              🚀 経験を活かして、新たな挑戦への準備を整えましょう
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover-scale focus-ring"
          aria-label={`${title}の気晴らしを開始`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {shouldRender('studentFeature') && (ageGroup === 'student' || ageGroup === 'middle_school') && '学習効率アップ開始'}
            {shouldRenderHousewife('housewifeFeature') && ageGroup === 'housewife' && 'ストレス解消を始める'}
            {shouldRenderJobSeeker('jobSeekerFeature') && ageGroup === 'job_seeker' && '就活疲れをリフレッシュ'}
            {shouldRenderCareerChanger('careerChangerFeature') && ageGroup === 'career_changer' && '転職ストレスを解消'}
            {(!shouldRender('studentFeature') || (ageGroup !== 'student' && ageGroup !== 'middle_school')) && 
             (!shouldRenderHousewife('housewifeFeature') || ageGroup !== 'housewife') && 
             (!shouldRenderJobSeeker('jobSeekerFeature') || ageGroup !== 'job_seeker') &&
             (!shouldRenderCareerChanger('careerChangerFeature') || ageGroup !== 'career_changer') &&
             'この気晴らしを始める'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;