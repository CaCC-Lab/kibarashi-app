/**
 * 音声ガイドプレイヤーコンポーネント
 * セグメント分割された音声を順次再生
 * 
 * 設計思想：
 * - シンプルで直感的なUI
 * - 3タップ以内で音声開始
 * - エラーに対する静かな失敗
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AudioPlayer, AudioPlayerState } from './AudioPlayer';
import type { VoiceGuideScript, VoiceSegment } from '../../services/api/types';
import { useFeature } from '../config/featureFlags';
import { useAudio } from '../../contexts/AudioContext';

/**
 * 音声ガイドプレイヤーのプロパティ
 */
interface VoiceGuidePlayerProps {
  voiceGuideScript: VoiceGuideScript;
  suggestionId: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * 再生コントロールアイコン
 */
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

/**
 * 音声ガイドプレイヤーコンポーネント
 * 
 * なぜこの実装か：
 * - 最小限のUIで直感的操作
 * - プログレスバーで進捗を可視化
 * - エラー時は静かに失敗（音声なしで継続）
 */
export const VoiceGuidePlayer: React.FC<VoiceGuidePlayerProps> = ({
  voiceGuideScript,
  suggestionId,
  onComplete,
  onError,
  className = ''
}) => {
  // フィーチャーフラグ
  const isVoiceEnabled = useFeature('enhancedVoiceGuide');
  const hasSubtitles = useFeature('subtitles');
  const hasSpeedControl = useFeature('voiceSpeedControl');
  
  // 音声コンテキスト
  const { 
    registerPlayer, 
    unregisterPlayer, 
    requestPlayback, 
    activePlayerId,
    settings 
  } = useAudio();
  
  // 状態管理
  const [playerState, setPlayerState] = useState<AudioPlayerState>('idle');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(settings.volume);
  const [playbackRate, setPlaybackRate] = useState(settings.playbackRate);
  const [showControls, setShowControls] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  // Refs
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  // TODO: プログレスバーの実装時に使用
  // const progressIntervalRef = useRef<number | null>(null);
  
  // プレイヤーID
  const playerId = `voice-guide-${suggestionId}`;
  
  // アクティブ状態
  const isActive = activePlayerId === playerId;
  
  // 現在のセグメント
  const currentSegment = voiceGuideScript.segments[currentSegmentIndex];
  
  // 音声ガイドが無効な場合は何も表示しない
  if (!isVoiceEnabled || !voiceGuideScript.segments.length) {
    return null;
  }
  
  /**
   * プレイヤー登録
   */
  useEffect(() => {
    registerPlayer(playerId, suggestionId);
    
    return () => {
      unregisterPlayer(playerId);
    };
  }, [playerId, suggestionId, registerPlayer, unregisterPlayer]);

  /**
   * グローバル音声イベントリスナー
   */
  useEffect(() => {
    const handleStopRequest = (event: CustomEvent) => {
      if (event.detail.playerId === playerId) {
        audioPlayerRef.current?.pause();
        setPlayerState('paused');
      }
    };

    const handlePauseAll = () => {
      audioPlayerRef.current?.pause();
      setPlayerState('paused');
    };

    window.addEventListener('audio-stop-request', handleStopRequest as EventListener);
    window.addEventListener('audio-pause-all', handlePauseAll);

    return () => {
      window.removeEventListener('audio-stop-request', handleStopRequest as EventListener);
      window.removeEventListener('audio-pause-all', handlePauseAll);
    };
  }, [playerId]);

  /**
   * 音声プレイヤーの初期化
   */
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer({
      onStateChange: setPlayerState,
      onProgress: (current, total) => {
        if (total > 0) {
          setProgress((current / total) * 100);
        }
      },
      onSegmentEnd: handleSegmentEnd,
      onError: handleError,
      onComplete: handleComplete
    });
    
    return () => {
      audioPlayerRef.current?.destroy();
    };
  }, []);
  
  /**
   * セグメントの読み込みと再生
   */
  const loadAndPlaySegment = useCallback(async (segment: VoiceSegment) => {
    if (!audioPlayerRef.current) return;
    
    try {
      // TODO: 実際の音声データ取得処理
      // 現在はモックデータを使用
      const audioUrl = `/api/v1/tts?text=${encodeURIComponent(segment.text)}`;
      
      await audioPlayerRef.current.load(audioUrl, segment);
      audioPlayerRef.current.setVolume(volume);
      audioPlayerRef.current.setPlaybackRate(playbackRate);
      
      // 字幕の更新
      if (hasSubtitles) {
        setCurrentSubtitle(segment.text);
      }
      
      // 自動再生が有効な場合
      if (segment.autoPlay) {
        await audioPlayerRef.current.fadeIn(500);
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, [volume, playbackRate, hasSubtitles]);
  
  /**
   * 再生/一時停止の切り替え
   */
  const togglePlayPause = useCallback(async () => {
    if (!audioPlayerRef.current) return;
    
    if (playerState === 'playing') {
      audioPlayerRef.current.pause();
    } else if (playerState === 'paused') {
      // 再生許可を要求
      const canPlay = requestPlayback(playerId);
      if (canPlay) {
        await audioPlayerRef.current.play();
      }
    } else {
      // 初回再生 - 再生許可を要求
      const canPlay = requestPlayback(playerId);
      if (canPlay) {
        await loadAndPlaySegment(currentSegment);
      }
    }
  }, [playerState, currentSegment, loadAndPlaySegment, requestPlayback, playerId]);
  
  /**
   * セグメント終了時の処理
   */
  const handleSegmentEnd = useCallback(() => {
    // 次のセグメントがある場合
    if (currentSegmentIndex < voiceGuideScript.segments.length - 1) {
      const pauseDuration = voiceGuideScript.settings.pauseBetweenSegments * 1000;
      
      setTimeout(() => {
        setCurrentSegmentIndex(prev => prev + 1);
      }, pauseDuration);
    }
  }, [currentSegmentIndex, voiceGuideScript]);
  
  /**
   * エラーハンドリング
   */
  const handleError = useCallback((error: Error) => {
    console.error('Voice guide playback error:', error);
    onError?.(error);
    
    // エラー時は静かに失敗（UIには表示しない）
    // 次のセグメントに進む
    if (currentSegmentIndex < voiceGuideScript.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    }
  }, [currentSegmentIndex, voiceGuideScript, onError]);
  
  /**
   * 完了時の処理
   */
  const handleComplete = useCallback(() => {
    setCurrentSubtitle('');
    onComplete?.();
  }, [onComplete]);
  
  /**
   * セグメント変更時の自動再生
   */
  useEffect(() => {
    if (currentSegmentIndex > 0 && playerState !== 'idle') {
      loadAndPlaySegment(voiceGuideScript.segments[currentSegmentIndex]);
    }
  }, [currentSegmentIndex]);
  
  /**
   * 音量変更
   */
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioPlayerRef.current?.setVolume(newVolume);
  }, []);
  
  /**
   * 再生速度変更
   */
  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    audioPlayerRef.current?.setPlaybackRate(rate);
  }, []);
  
  /**
   * プログレスバーのクリック
   */
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = (audioPlayerRef.current?.getPlaybackInfo()?.duration || 0) * percentage;
    audioPlayerRef.current?.seek(newTime);
  }, []);
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${className}`}>
      {/* メインコントロール */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={togglePlayPause}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={playerState === 'playing' ? '一時停止' : '再生'}
        >
          {playerState === 'playing' ? <PauseIcon /> : <PlayIcon />}
        </button>
        
        <div className="flex-1 mx-4">
          <div className="text-sm text-gray-600 mb-1">
            {currentSegment.type === 'intro' && '導入'}
            {currentSegment.type === 'main' && 'メインガイド'}
            {currentSegment.type === 'closing' && '締めくくり'}
          </div>
          
          {/* プログレスバー */}
          <div 
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* 詳細コントロールの表示/非表示 */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="詳細設定"
        >
          <VolumeIcon />
        </button>
      </div>
      
      {/* 字幕表示 */}
      {hasSubtitles && currentSubtitle && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
          {currentSubtitle}
        </div>
      )}
      
      {/* 詳細コントロール */}
      {showControls && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {/* 音量調整 */}
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 w-16">音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 ml-2"
              aria-label="音量調整"
            />
            <span className="text-sm text-gray-600 ml-2 w-10">
              {Math.round(volume * 100)}%
            </span>
          </div>
          
          {/* 再生速度調整 */}
          {hasSpeedControl && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-16">速度</span>
              <div className="flex gap-2 ml-2">
                {[0.75, 1.0, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`px-2 py-1 text-sm rounded ${
                      playbackRate === rate 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* エラー時のフォールバック（表示しない） */}
      {playerState === 'error' && (
        <div className="hidden">
          音声ガイドの再生に問題が発生しましたが、テキストガイドは引き続きご利用いただけます。
        </div>
      )}
    </div>
  );
};