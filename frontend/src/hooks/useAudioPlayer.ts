import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
}

export function useAudioPlayer(audioUrl?: string | null): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 音声要素の初期化
  useEffect(() => {
    if (!audioUrl) {
      // URLがない場合は既存のオーディオを削除
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // 新しいオーディオ要素を作成
    const audio = new Audio(audioUrl);
    audio.volume = volume;

    // イベントリスナーの設定
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e: Event) => {
      setIsLoading(false);
      setIsPlaying(false);
      const audioError = e.target as HTMLAudioElement;
      setError(`音声の再生に失敗しました: ${audioError.error?.message || '不明なエラー'}`);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;

    // クリーンアップ
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioUrl, volume]);

  const play = useCallback(async () => {
    if (!audioRef.current) {
      setError('音声が読み込まれていません');
      return;
    }

    try {
      setError(null);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio play error:', err);
      setError('音声の再生に失敗しました。ブラウザの設定を確認してください。');
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(duration, time));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration]);

  return {
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
  };
}