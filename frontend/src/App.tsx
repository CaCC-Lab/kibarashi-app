import { useState, lazy, Suspense } from 'react';
import MainLayout from './components/layout/MainLayout';
import Loading from './components/common/Loading';

// コンポーネントの遅延読み込み
const SituationSelector = lazy(() => import('./features/situation/SituationSelector'));
const DurationSelector = lazy(() => import('./features/duration/DurationSelector'));
const SuggestionList = lazy(() => import('./features/suggestion/SuggestionList'));

type Step = 'situation' | 'duration' | 'suggestions';
type Situation = 'workplace' | 'home' | 'outside' | null;
type Duration = 5 | 15 | 30 | null;

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('situation');
  const [situation, setSituation] = useState<Situation>(null);
  const [duration, setDuration] = useState<Duration>(null);

  const handleSituationSelect = (selected: 'workplace' | 'home' | 'outside') => {
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

  const renderStep = () => {
    switch (currentStep) {
      case 'situation':
        return <SituationSelector selected={situation} onSelect={handleSituationSelect} />;
      case 'duration':
        return <DurationSelector selected={duration} onSelect={handleDurationSelect} />;
      case 'suggestions':
        if (situation && duration) {
          return <SuggestionList situation={situation} duration={duration} />;
        }
        return null;
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {renderBreadcrumb()}
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <Suspense fallback={<Loading />}>
            {renderStep()}
          </Suspense>
        </div>

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
      </div>
    </MainLayout>
  );
}

export default App;