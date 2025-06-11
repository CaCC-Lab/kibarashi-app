import React, { useState, useEffect, useRef } from 'react';
import AudioPlayer, { AudioPlayerHandle } from '../../components/audio/AudioPlayer';
import { ttsService } from '../../services/api/tts';
import { browserTTS } from '../../services/browserTTS';

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
  const [showAudioPlayer, setShowAudioPlayer] = useState(false); // デフォルトで音声ガイドはオフ
  const [useBrowserTTS, setUseBrowserTTS] = useState(false); // デフォルトでGemini TTSを使用
  const [isSpeaking, setIsSpeaking] = useState(false); // 音声再生中かどうか
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false); // 音声生成中かどうか
  const audioPlayerRef = useRef<AudioPlayerHandle | null>(null); // AudioPlayerの参照

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
      // ブラウザTTSも停止
      if (useBrowserTTS && isSpeaking) {
        browserTTS.stop();
      }
    };
  }, [audioUrl, useBrowserTTS, isSpeaking]);

  // 音声URLが設定され、タイマーが実行中の場合は自動再生
  useEffect(() => {
    if (audioUrl && isRunning && audioPlayerRef.current && !useBrowserTTS) {
      console.log('Auto-playing audio after URL is set');
      audioPlayerRef.current.play();
    }
  }, [audioUrl, isRunning, useBrowserTTS]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    // 音声ガイドが有効な場合、音声を生成
    if (showAudioPlayer && !audioUrl) {
      await generateAudio();
    }
    
    // 音声生成が完了してから、またはエラーがあってもタイマーを開始
    setIsRunning(true);
  };

  const generateAudio = async () => {
    // 既に音声生成中の場合は何もしない
    if (isGeneratingAudio) {
      console.log('Audio generation already in progress');
      return;
    }

    setIsGeneratingAudio(true);
    setIsLoadingAudio(true);
    setAudioError(null);
    
    try {
      // guideが存在しない場合のフォールバック
      const textToSpeak = guide || `${title}を始めましょう。${description}`;
      console.log('Generating audio for text:', textToSpeak);
      
      if (useBrowserTTS && browserTTS.isAvailable()) {
        // ブラウザ内蔵のTTSを使用（無料）
        setIsSpeaking(true);
        try {
          await browserTTS.speak({
            text: textToSpeak,
            rate: 0.9,  // 少しゆっくり
            pitch: 1.0,
            volume: 1.0,
          });
        } finally {
          setIsSpeaking(false);
        }
        setAudioError(null);
      } else {
        // サーバーサイドTTSを使用（Gemini）
        const audioBlob = await ttsService.synthesizeSpeech({
          text: textToSpeak,
          voiceSettings: {
            gender: 'FEMALE',
            speed: 1.0,
          }
        });
        
        const url = ttsService.createAudioUrl(audioBlob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      if (error instanceof Error) {
        console.error('TTS Error:', error.message);
        if (error.message.includes('503') || error.message.includes('TTS_DISABLED')) {
          // Gemini TTSが利用できない場合は自動的にブラウザTTSにフォールバック
          setUseBrowserTTS(true);
          setAudioError('Gemini音声は利用できません。ブラウザ音声に切り替えました');
          // ブラウザTTSで再試行
          setTimeout(() => generateAudio(), 100);
        } else if (error.message.includes('500') || error.message.includes('TTS_GENERATION_FAILED')) {
          setAudioError('音声生成に失敗しました。もう一度お試しください');
        } else if (error.message.includes('timeout')) {
          setAudioError('音声生成がタイムアウトしました。もう一度お試しください');
        } else {
          setAudioError('音声の生成に失敗しました');
        }
      } else {
        setAudioError('音声の生成に失敗しました');
      }
    } finally {
      setIsLoadingAudio(false);
      setIsGeneratingAudio(false);
    }
  };

  const handlePause = () => {
    console.log('handlePause called', { useBrowserTTS, isSpeaking, audioPlayerRef: audioPlayerRef.current });
    setIsRunning(false);
    if (useBrowserTTS && isSpeaking) {
      browserTTS.stop();
      setIsSpeaking(false);
    } else if (audioPlayerRef.current) {
      // Gemini TTSの音声を停止
      console.log('Stopping Gemini TTS audio');
      audioPlayerRef.current.stop();
    }
  };

  const handleReset = () => {
    setTimeRemaining(duration * 60);
    setIsRunning(false);
    setIsComplete(false);
    if (useBrowserTTS && isSpeaking) {
      browserTTS.stop();
      setIsSpeaking(false);
    } else if (audioPlayerRef.current) {
      // Gemini TTSの音声を停止
      audioPlayerRef.current.stop();
    }
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
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke={isComplete ? '#10b981' : timeRemaining < 60 ? '#ef4444' : '#0ea5e9'}
                strokeWidth="8"
                fill="none"
                strokeDasharray="553"
                strokeDashoffset={553 - (553 * (1 - timeRemaining / (duration * 60)))}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${
                isComplete ? 'text-green-600' : 
                timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              {!isComplete && timeRemaining < 60 && (
                <p className="text-sm text-red-600 mt-1 animate-pulse">
                  まもなく終了
                </p>
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
              disabled={isLoadingAudio}
              className={`
                ${isLoadingAudio 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-500 hover:bg-primary-600 transform hover:-translate-y-0.5 hover:shadow-xl'
                }
                text-white font-medium py-4 px-10 rounded-xl text-lg
                shadow-lg transition-all duration-200 flex items-center space-x-2
              `}
            >
              {isLoadingAudio ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>音声準備中...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>開始</span>
                </>
              )}
            </button>
          )}
          
          {isRunning && (
            <button
              onClick={handlePause}
              className="
                bg-yellow-500 hover:bg-yellow-600 text-white 
                font-medium py-4 px-10 rounded-xl text-lg
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                transition-all duration-200 flex items-center space-x-2
              "
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
            className="
              bg-gray-200 hover:bg-gray-300 text-gray-700
              font-medium py-3 px-6 rounded-lg
              transition-colors duration-200 flex items-center space-x-2
            "
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
              {!useBrowserTTS && (
                <span className="ml-2 text-xs text-primary-600 font-medium">Gemini音声</span>
              )}
              {useBrowserTTS && (
                <span className="ml-2 text-xs text-yellow-600 font-medium">ブラウザ音声</span>
              )}
            </label>
            
            {showAudioPlayer && (
              <div className="mt-3">
                
                {isLoadingAudio ? (
                  <div className="text-sm text-gray-600">
                    <span className="animate-pulse">音声を準備中...</span>
                  </div>
                ) : audioError ? (
                  <div className="text-sm text-yellow-600">
                    {audioError}
                  </div>
                ) : audioUrl ? (
                  <AudioPlayer
                    ref={audioPlayerRef}
                    audioUrl={audioUrl}
                    autoPlay={false}
                    className="mt-2"
                  />
                ) : (
                  <div className="text-sm text-gray-600">
                    {isSpeaking ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-pulse w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                        </svg>
                        音声再生中... (一時停止ボタンで停止できます)
                      </span>
                    ) : useBrowserTTS ? (
                      browserTTS.isAvailable() 
                        ? '「開始」ボタンを押すと音声ガイドが開始されます（ブラウザ音声）'
                        : 'お使いのブラウザは音声合成に対応していません'
                    ) : (
                      '「開始」ボタンを押すと音声ガイドが開始されます'
                    )}
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