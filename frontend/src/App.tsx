import { useState, lazy, Suspense, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Loading from './components/common/Loading';
import { SituationId } from './types/situation';
import { useAgeGroup } from './hooks/useAgeGroup';
import { AgeGroupOnboardingModal } from './components/ageGroup/AgeGroupSelector';
import { DebugModeToggle } from './components/debug/DebugModeToggle';

// コンポーネントの遅延読み込み
const SituationSelector = lazy(() => import('./features/situation/SituationSelector'));
const DurationSelector = lazy(() => import('./features/duration/DurationSelector'));
const SuggestionList = lazy(() => import('./features/suggestion/SuggestionList'));
const FavoritesList = lazy(() => import('./features/favorites/FavoritesList'));
const HistoryList = lazy(() => import('./features/history/HistoryList'));
const Settings = lazy(() => import('./features/settings/Settings'));
const CustomSuggestionList = lazy(() => import('./features/custom/CustomSuggestionList'));

type Step = 'situation' | 'duration' | 'suggestions' | 'favorites' | 'history' | 'settings' | 'custom';
type Duration = 5 | 15 | 30 | null;

function App() {
  const { isFirstTimeUser, isLoading: ageGroupLoading } = useAgeGroup();
  const [currentStep, setCurrentStep] = useState<Step>('situation');
  const [situation, setSituation] = useState<SituationId | null>(null);
  const [duration, setDuration] = useState<Duration>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('Tokyo');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [debugMode, setDebugMode] = useState(() => {
    if (process.env.NODE_ENV === 'production') return false;
    return localStorage.getItem('kibarashi-debug-mode') === 'true';
  });

  // 初回ユーザーの場合、オンボーディングモーダルを表示
  useEffect(() => {
    if (!ageGroupLoading && isFirstTimeUser) {
      // 一時的に無効化して表示問題をテスト
      // setShowOnboarding(true);
    }
  }, [ageGroupLoading, isFirstTimeUser]);

  const handleSituationSelect = (selected: SituationId) => {
    setSituation(selected);
    setCurrentStep('duration');
  };

  const handleDurationSelect = (selected: 5 | 15 | 30) => {
    setDuration(selected);
    setCurrentStep('suggestions');
  };

  const handleReset = () => {
    setSituation(null);
    setDuration(null);
    setCurrentStep('situation');
  };

  const handleFavoritesClick = () => {
    setCurrentStep('favorites');
  };

  const handleHistoryClick = () => {
    setCurrentStep('history');
  };

  const handleSettingsClick = () => {
    setCurrentStep('settings');
  };

  const handleCustomClick = () => {
    setCurrentStep('custom');
  };

  const handleBackToMain = () => {
    setCurrentStep('situation');
  };

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'situation':
        return <SituationSelector selected={situation} onSelect={handleSituationSelect} />;
      case 'duration':
        return <DurationSelector selected={duration} onSelect={handleDurationSelect} />;
      case 'suggestions':
        if (situation && duration) {
          return <SuggestionList 
            situation={situation} 
            duration={duration} 
            location={currentLocation} 
            debugMode={debugMode}
          />;
        }
        return null;
      case 'favorites':
        return <FavoritesList />;
      case 'history':
        return <HistoryList />;
      case 'settings':
        return <Settings onBack={handleBackToMain} />;
      case 'custom':
        return <CustomSuggestionList />;
      default:
        return null;
    }
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <button
        onClick={() => setCurrentStep('situation')}
        className={`flex items-center space-x-2 ${
          currentStep === 'situation' ? 'text-primary-600' : 'text-gray-500'
        }`}
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          situation ? 'bg-primary-500 text-white' : 'bg-gray-200'
        }`}>
          1
        </span>
        <span className="hidden sm:inline">場所</span>
      </button>
      
      <div className="w-8 h-0.5 bg-gray-300" />
      
      <button
        onClick={() => situation && setCurrentStep('duration')}
        disabled={!situation}
        className={`flex items-center space-x-2 ${
          currentStep === 'duration' ? 'text-primary-600' : 'text-gray-500'
        } ${!situation && 'cursor-not-allowed opacity-50'}`}
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          duration ? 'bg-primary-500 text-white' : 'bg-gray-200'
        }`}>
          2
        </span>
        <span className="hidden sm:inline">時間</span>
      </button>
      
      <div className="w-8 h-0.5 bg-gray-300" />
      
      <button
        onClick={() => situation && duration && setCurrentStep('suggestions')}
        disabled={!situation || !duration}
        className={`flex items-center space-x-2 ${
          currentStep === 'suggestions' ? 'text-primary-600' : 'text-gray-500'
        } ${(!situation || !duration) && 'cursor-not-allowed opacity-50'}`}
      >
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep === 'suggestions' ? 'bg-primary-500 text-white' : 'bg-gray-200'
        }`}>
          3
        </span>
        <span className="hidden sm:inline">提案</span>
      </button>
    </div>
  );

  // 年齢層のローディング中は全体をローディング表示
  if (ageGroupLoading) {
    return (
      <MainLayout 
        onFavoritesClick={handleFavoritesClick} 
        onHistoryClick={handleHistoryClick} 
        onSettingsClick={handleSettingsClick} 
        onCustomClick={handleCustomClick}
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <Loading />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout 
        onFavoritesClick={handleFavoritesClick} 
        onHistoryClick={handleHistoryClick} 
        onSettingsClick={handleSettingsClick} 
        onCustomClick={handleCustomClick}
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
      >
        <div className="max-w-4xl mx-auto">
          {currentStep !== 'favorites' && currentStep !== 'history' && currentStep !== 'settings' && currentStep !== 'custom' && renderBreadcrumb()}
          
          {currentStep === 'history' || currentStep === 'settings' || currentStep === 'custom' ? (
            <Suspense fallback={<Loading />}>
              {renderStep()}
            </Suspense>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <Suspense fallback={<Loading />}>
                {renderStep()}
              </Suspense>
            </div>
          )}

          {currentStep === 'suggestions' && (
            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                最初からやり直す
              </button>
            </div>
          )}
          
          {(currentStep === 'favorites' || currentStep === 'history' || currentStep === 'settings' || currentStep === 'custom') && (
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToMain}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                気晴らし選択に戻る
              </button>
            </div>
          )}
        </div>
      </MainLayout>
      
      {/* 年齢層選択オンボーディングモーダル */}
      <AgeGroupOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      {/* デバッグモードトグル（開発環境のみ） */}
      <DebugModeToggle 
        onToggle={setDebugMode}
      />
    </>
  );
}

export default App;