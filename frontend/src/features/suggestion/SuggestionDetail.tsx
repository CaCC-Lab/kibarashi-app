import React, { useState, useEffect } from 'react';
import AuroraBackground from '../../components/common/AuroraBackground';
import { useHistory } from '../../hooks/useHistory';
import { SituationId } from '../../types/situation';

interface SuggestionDetailProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  guide?: string;
  category: '認知的' | '行動的';
  situation: SituationId;
  onBack: () => void;
}

const SuggestionDetail: React.FC<SuggestionDetailProps> = ({
  id,
  title,
  description,
  duration,
  guide,
  category,
  situation,
  onBack,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const { startHistory, completeHistory } = useHistory();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            if (currentHistoryId) {
              const actualDuration = duration * 60;
              completeHistory(currentHistoryId, actualDuration);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentHistoryId, duration, completeHistory]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const historyId = startHistory(
      { id, title, description, duration, category, steps: guide?.split('\n').filter((s) => s.trim()) || [] },
      situation
    );
    if (historyId) {
      setCurrentHistoryId(historyId);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (currentHistoryId && !isComplete) {
      const actualDuration = (duration * 60) - timeRemaining;
      completeHistory(currentHistoryId, actualDuration, undefined, '一時停止');
    }
  };

  const handleReset = () => {
    if (currentHistoryId && !isComplete && timeRemaining < duration * 60) {
      const actualDuration = (duration * 60) - timeRemaining;
      completeHistory(currentHistoryId, actualDuration, undefined, 'リセット');
      setCurrentHistoryId(null);
    }
    setTimeRemaining(duration * 60);
    setIsRunning(false);
    setIsComplete(false);
  };

  const totalSec = duration * 60;
  const progress = 1 - timeRemaining / totalSec;
  const ringRadius = 88;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {(isRunning || isComplete) && (
        <AuroraBackground fixed paused={!isRunning && !isComplete} veil={0.55} />
      )}

      <div className="relative z-10">
        <button
          onClick={onBack}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>戻る</span>
        </button>

        <div
          className="bg-white rounded-xl shadow-lg p-8"
          style={{
            background: isRunning || isComplete
              ? 'color-mix(in oklab, var(--kb-surface) 82%, transparent)'
              : 'var(--kb-surface, #fff)',
            backdropFilter: isRunning || isComplete ? 'blur(18px) saturate(140%)' : undefined,
            WebkitBackdropFilter: isRunning || isComplete ? 'blur(18px) saturate(140%)' : undefined,
            border: '1px solid var(--kb-line, transparent)',
          }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ color: 'var(--kb-ink)' }}>{title}</h2>
          <p className="text-gray-600 mb-8" style={{ color: 'var(--kb-ink-2)' }}>{description}</p>

          {/* Breathing orb + progress ring */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4" style={{ width: 240, height: 240 }}>
              <svg
                width="240"
                height="240"
                viewBox="0 0 240 240"
                style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
              >
                <circle
                  cx="120" cy="120" r={ringRadius}
                  stroke="color-mix(in oklab, var(--kb-ink) 10%, transparent)"
                  strokeWidth="2" fill="none"
                />
                <circle
                  cx="120" cy="120" r={ringRadius}
                  stroke={timeRemaining < 60 && !isComplete ? '#ef4444' : 'var(--kb-accent)'}
                  strokeWidth="3" fill="none" strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringCircumference * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>

              <div
                style={{
                  position: 'absolute', inset: 28, borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--kb-accent) 40%, transparent), color-mix(in oklab, var(--kb-accent) 18%, transparent))`,
                  animation: isRunning ? 'kb-breathe 6s ease-in-out infinite' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <div
                  className={
                    isComplete
                      ? 'text-5xl font-bold text-green-600'
                      : timeRemaining < 60
                        ? 'text-5xl font-bold text-red-600'
                        : 'text-5xl font-bold text-gray-800'
                  }
                  style={{
                    color: isComplete ? undefined : timeRemaining < 60 ? undefined : 'var(--kb-ink)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: 2,
                    fontWeight: 300,
                  }}
                >
                  {formatTime(timeRemaining)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--kb-ink-2)', marginTop: 4, letterSpacing: 1 }}>
                  {isComplete ? '完了' : '残り時間'}
                </div>
                {!isComplete && timeRemaining < 60 && (
                  <p className="text-sm text-red-600 mt-1 animate-pulse">まもなく終了</p>
                )}
              </div>
            </div>
            {isComplete && (
              <p className="text-green-600 font-medium animate-fadeIn">
                お疲れさまでした！気晴らしが完了しました。
              </p>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-3 mb-8">
            {!isRunning && !isComplete && (
              <button
                onClick={handleStart}
                className="bg-primary-500 hover:bg-primary-600 transform hover:-translate-y-0.5 hover:shadow-xl text-white font-medium py-4 px-10 rounded-xl text-lg shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>開始</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-4 px-10 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>一時停止</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>リセット</span>
            </button>
          </div>

          {/* Guide Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>ガイド</span>
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {guide || `この気晴らし方法を実行してください。\n\n${description}\n\nタイマーをスタートして、リラックスした気持ちで始めましょう。`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div
              className="bg-gray-200 rounded-full h-3 overflow-hidden"
              style={{ background: 'color-mix(in oklab, var(--kb-ink) 8%, transparent)' }}
            >
              <div
                className="bg-primary-500 h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${((duration * 60 - timeRemaining) / (duration * 60)) * 100}%`,
                  background: 'var(--kb-accent)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;
