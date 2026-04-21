import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import { TabId } from './components/layout/BottomTabBar';
import Loading from './components/common/Loading';
import { SituationId } from './types/situation';
import { useAgeGroup } from './hooks/useAgeGroup';
import { useWeather } from './hooks/useWeather';
import { useAppearance } from './hooks/useAppearance';
import { AgeGroupOnboardingModal } from './components/ageGroup/AgeGroupSelector';
import { DebugModeToggle } from './components/debug/DebugModeToggle';
import { BadgeEngine } from './services/gamification/badgeEngine';
import { MissionGenerator } from './services/gamification/missionGenerator';
import BadgeNotification from './features/badge/BadgeNotification';
import type { MoodId } from './features/home/HomeMood';

const SituationSelector = lazy(() => import('./features/situation/SituationSelector'));
const DurationSelector = lazy(() => import('./features/duration/DurationSelector'));
const SuggestionList = lazy(() => import('./features/suggestion/SuggestionList'));
const FavoritesList = lazy(() => import('./features/favorites/FavoritesList'));
const HistoryList = lazy(() => import('./features/history/HistoryList'));
const Settings = lazy(() => import('./features/settings/Settings'));
const HomeCTA = lazy(() => import('./features/home/HomeCTA'));
const HomeMood = lazy(() => import('./features/home/HomeMood'));
// const CustomSuggestionList = lazy(() => import('./features/custom/CustomSuggestionList'));

type HomeStep = 'intro' | 'situation' | 'duration' | 'suggestions';

function App() {
  const { isFirstTimeUser, isLoading: ageGroupLoading } = useAgeGroup();
  const { weather, position: geoPosition } = useWeather();
  const { appearance } = useAppearance();

  // タブ管理
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // ホーム画面内のステップ管理 — 初期ステップは外観設定(steps以外はintro)に従う
  const initialHomeStep: HomeStep = appearance.homeVariant === 'steps' ? 'situation' : 'intro';
  const [homeStep, setHomeStep] = useState<HomeStep>(initialHomeStep);
  const [situation, setSituation] = useState<SituationId | null>(null);
  const [duration, setDuration] = useState<5 | 15 | 30 | null>(null);
  const [mood, setMood] = useState<MoodId | null>(null);

  // GPS位置情報のみで場所を管理（手動選択は廃止）
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [debugMode, setDebugMode] = useState(() => {
    if (process.env.NODE_ENV === 'production') return false;
    return localStorage.getItem('kibarashi-debug-mode') === 'true';
  });

  // ゲーミフィケーション
  const [newBadge, setNewBadge] = useState<{ name: string; description: string } | null>(null);
  const todayMission = MissionGenerator.getTodayMission();
  const [, setMissionCelebration] = useState<string | null>(null);

  const checkGamification = useCallback(() => {
    const unlocked = BadgeEngine.checkNewUnlocks();
    if (unlocked.length > 0) {
      const def = BadgeEngine.getBadgeDefinitions().find(d => d.id === unlocked[0].badgeId);
      if (def) {
        setNewBadge({ name: def.name, description: def.description });
      }
    }
    if (todayMission && !todayMission.completed) {
      const completed = MissionGenerator.checkMissionCompletion(todayMission);
      if (completed) {
        setMissionCelebration('ミッション達成！お疲れさまでした');
      }
    }
  }, [todayMission]);

  useEffect(() => {
    if (!ageGroupLoading && isFirstTimeUser) {
      // setShowOnboarding(true);
    }
  }, [ageGroupLoading, isFirstTimeUser]);

  // ホームの最初に表示すべきステップ（appearance.homeVariant によって切替）
  const homeStartStep: HomeStep = appearance.homeVariant === 'steps' ? 'situation' : 'intro';

  // タブ切替
  const handleTabChange = (tab: TabId) => {
    if (tab === 'home') {
      checkGamification();
      // ホームに戻るときは状態をリセット
      setHomeStep(homeStartStep);
      setSituation(null);
      setDuration(null);
      setMood(null);
    }
    setActiveTab(tab);
  };

  // ホーム画面ナビゲーション
  const handleSituationSelect = (selected: SituationId) => {
    setSituation(selected);
    setHomeStep('duration');
  };

  const handleDurationSelect = (selected: 5 | 15 | 30) => {
    setDuration(selected);
    setHomeStep('suggestions');
  };

  const handleReset = () => {
    checkGamification();
    setSituation(null);
    setDuration(null);
    setMood(null);
    setHomeStep(homeStartStep);
  };

  const handleCustomClick = () => {
    setActiveTab('home');
    // カスタム画面は一時的にhomeタブ内で表示
    setHomeStep(homeStartStep);
  };

  // CTAクイックスタート: situation/durationが揃っていればsuggestions、無ければsituationへ
  const handleQuickStart = () => {
    const effSituation = situation ?? 'home';
    const effDuration = duration ?? 5;
    setSituation(effSituation);
    setDuration(effDuration);
    setHomeStep('suggestions');
  };

  const handleMoodSelect = (m: MoodId | null) => {
    setMood(m);
    // 気分型は状況/時間を既定値で埋めて直接提案へ
    setSituation(situation ?? 'home');
    setDuration(duration ?? 5);
    setHomeStep('suggestions');
  };

  // タブごとのコンテンツ描画
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'favorites':
        return (
          <Suspense fallback={<Loading />}>
            <FavoritesList />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<Loading />}>
            <HistoryList />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<Loading />}>
            <Settings onBack={() => handleTabChange('home')} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const renderHome = () => {
    // intro画面（CTA/気分型）では breadcrumb と白カードを出さず、バリアント自身の演出に委ねる
    if (homeStep === 'intro') {
      return (
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<Loading />}>
            {appearance.homeVariant === 'cta' && (
              <HomeCTA
                situation={situation}
                duration={duration}
                onSituationChange={setSituation}
                onDurationChange={setDuration}
                onQuickStart={handleQuickStart}
              />
            )}
            {appearance.homeVariant === 'mood' && (
              <HomeMood selected={mood} onSelect={handleMoodSelect} />
            )}
          </Suspense>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        {/* プログレスステップ */}
        {renderBreadcrumb()}

        {/* メインコンテンツ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <Suspense fallback={<Loading />}>
            {homeStep === 'situation' && (
              <SituationSelector selected={situation} onSelect={handleSituationSelect} />
            )}
            {homeStep === 'duration' && (
              <DurationSelector selected={duration} onSelect={handleDurationSelect} />
            )}
            {homeStep === 'suggestions' && situation && duration && (
              <SuggestionList situation={situation} duration={duration} debugMode={debugMode} geoPosition={geoPosition} />
            )}
          </Suspense>
        </div>

        {/* 戻るボタン */}
        {homeStep === 'suggestions' && (
          <div className="mt-4 text-center">
            <button onClick={handleReset} className="text-gray-500 hover:text-gray-700 text-sm underline">
              最初からやり直す
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderBreadcrumb = () => {
    const activeLabelStyle = { color: 'var(--kb-accent)' };
    const activeBubbleStyle = { background: 'var(--kb-accent)', color: '#fff' };
    return (
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button
          onClick={() => setHomeStep('situation')}
          className={`flex items-center space-x-1.5 ${homeStep === 'situation' ? 'text-primary-600' : 'text-gray-400'}`}
          style={homeStep === 'situation' ? activeLabelStyle : undefined}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              situation ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}
            style={situation ? activeBubbleStyle : undefined}
          >1</span>
          <span className="text-xs">場所</span>
        </button>
        <div className="w-6 h-0.5 bg-gray-300" />
        <button
          onClick={() => situation && setHomeStep('duration')}
          disabled={!situation}
          className={`flex items-center space-x-1.5 ${homeStep === 'duration' ? 'text-primary-600' : 'text-gray-400'} ${!situation && 'opacity-40'}`}
          style={homeStep === 'duration' ? activeLabelStyle : undefined}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              duration ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}
            style={duration ? activeBubbleStyle : undefined}
          >2</span>
          <span className="text-xs">時間</span>
        </button>
        <div className="w-6 h-0.5 bg-gray-300" />
        <button
          onClick={() => situation && duration && setHomeStep('suggestions')}
          disabled={!situation || !duration}
          className={`flex items-center space-x-1.5 ${homeStep === 'suggestions' ? 'text-primary-600' : 'text-gray-400'} ${(!situation || !duration) && 'opacity-40'}`}
          style={homeStep === 'suggestions' ? activeLabelStyle : undefined}
        >
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              homeStep === 'suggestions' ? 'bg-primary-500 text-white' : 'bg-gray-200'
            }`}
            style={homeStep === 'suggestions' ? activeBubbleStyle : undefined}
          >3</span>
          <span className="text-xs">提案</span>
        </button>
      </div>
    );
  };

  if (ageGroupLoading) {
    return (
      <MainLayout activeTab={activeTab} onTabChange={handleTabChange} weatherIcon={weather?.icon} weatherTemp={weather?.temperature} weatherDescription={weather?.description}>
        <div className="flex items-center justify-center h-64"><Loading /></div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCustomClick={handleCustomClick}
        weatherIcon={weather?.icon}
        weatherTemp={weather?.temperature}
        weatherDescription={weather?.description}
      >
        {renderContent()}
      </MainLayout>

      <AgeGroupOnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />
      <DebugModeToggle onToggle={setDebugMode} />
    </>
  );
}

export default App;
