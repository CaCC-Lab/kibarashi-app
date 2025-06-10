import React, { useState, useEffect } from 'react';
import AudioPlayer from '../../components/audio/AudioPlayer';
import { ttsService } from '../../services/api/tts';

interface SuggestionDetailProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  guide: string;
  onBack: () => void;
}

const SuggestionDetail: React.FC<SuggestionDetailProps> = ({
  title,
  description,
  duration,
  guide,
  onBack,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  // コンポーネントがアンマウントされたときに音声URLを解放
  useEffect(() => {
    return () => {
      if (audioUrl) {
        ttsService.revokeAudioUrl(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setIsRunning(true);
    
    // 音声ガイドが有効な場合、音声を生成
    if (showAudioPlayer && !audioUrl) {
      await generateAudio();
    }
  };

  const generateAudio = async () => {
    setIsLoadingAudio(true);
    setAudioError(null);
    
    try {
      const audioBlob = await ttsService.synthesizeSpeech({
        text: guide,
        voiceSettings: {
          gender: 'FEMALE',
          speed: 1.0,
        }
      });
      
      const url = ttsService.createAudioUrl(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Audio generation failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('TTS_DISABLED')) {
          setAudioError('音声機能は現在無効になっています');
        } else if (error.message.includes('timeout')) {
          setAudioError('音声生成がタイムアウトしました。しばらくしてから再度お試しください');
        } else {
          setAudioError('音声の生成に失敗しました。ネットワーク接続を確認してください');
        }
      } else {
        setAudioError('音声の生成に失敗しました');
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeRemaining(duration * 60);
    setIsRunning(false);
    setIsComplete(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>戻る</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-8">{description}</p>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-4 ${
            isComplete ? 'text-green-600' : 
            timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'
          }`}>
            {formatTime(timeRemaining)}
          </div>
          {isComplete && (
            <p className="text-green-600 font-medium">
              お疲れさまでした！気晴らしが完了しました。
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          {!isRunning && !isComplete && (
            <button
              onClick={handleStart}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>一時停止</span>
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
          <p className="text-gray-700 whitespace-pre-line">{guide}</p>
          
          {/* 音声ガイドオプション */}
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAudioPlayer}
                onChange={(e) => setShowAudioPlayer(e.target.checked)}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">音声ガイドを使用する</span>
            </label>
            
            {showAudioPlayer && (
              <div className="mt-3">
                {isLoadingAudio ? (
                  <div className="text-sm text-gray-600">
                    <span className="animate-pulse">音声を生成中...</span>
                  </div>
                ) : audioError ? (
                  <div className="text-sm text-red-600">{audioError}</div>
                ) : audioUrl ? (
                  <AudioPlayer
                    audioUrl={audioUrl}
                    autoPlay={isRunning}
                    className="mt-2"
                  />
                ) : (
                  <div className="text-sm text-gray-600">
                    「開始」ボタンを押すと音声ガイドが開始されます
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-primary-500 h-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((duration * 60 - timeRemaining) / (duration * 60)) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;