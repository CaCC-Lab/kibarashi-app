import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioUrl: string | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
}

export interface AudioPlayerHandle {
  stop: () => void;
  pause: () => void;
  play: () => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ 
  audioUrl, 
  autoPlay = false,
  onEnded,
  className = ''
}, ref) => {
  const {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    error,
    play,
    pause,
    stop,
    setVolume,
    seek,
  } = useAudioPlayer(audioUrl);

  // refを通じてメソッドを公開
  useImperativeHandle(ref, () => ({
    stop,
    pause,
    play
  }), [stop, pause, play]);

  // 自動再生
  useEffect(() => {
    if (autoPlay && audioUrl && !isLoading && !isPlaying) {
      play();
    }
  }, [autoPlay, audioUrl, isLoading, isPlaying, play]);

  // 再生終了時のコールバック
  useEffect(() => {
    if (!isPlaying && currentTime === 0 && duration > 0 && onEnded) {
      onEnded();
    }
  }, [isPlaying, currentTime, duration, onEnded]);

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // プログレスバーの計算
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    return null;
  }

  return (
    <div className={`bg-surface-secondary rounded-lg p-4 shadow-sm border border-primary-100 ${className}`}>
      {error && (
        <div className="text-secondary-600 text-sm mb-2 bg-secondary-50 border border-secondary-200 rounded px-3 py-2">{error}</div>
      )}

      <div className="flex items-center space-x-4">
        {/* 再生/一時停止ボタン */}
        <button
          onClick={isPlaying ? pause : play}
          disabled={isLoading}
          className="flex-shrink-0 w-12 h-12 bg-primary-500 text-text-inverse rounded-full flex items-center justify-center hover:bg-primary-600 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring shadow-md hover:shadow-lg"
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          {isLoading ? (
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* 停止ボタン */}
        <button
          onClick={stop}
          disabled={!isPlaying && currentTime === 0}
          className="flex-shrink-0 w-10 h-10 bg-text-muted text-text-inverse rounded-full flex items-center justify-center hover:bg-text-secondary hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring shadow-sm hover:shadow-md"
          aria-label="停止"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>

        {/* プログレスバーとタイム表示 */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-2 bg-primary-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute left-0 top-0 h-full bg-primary-500 transition-all duration-100 shadow-sm"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="シークバー"
            />
          </div>
        </div>

        {/* ボリュームコントロール */}
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20"
            aria-label="音量"
          />
        </div>
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;