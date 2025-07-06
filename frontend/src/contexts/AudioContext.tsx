/**
 * 音声コンテキスト
 * アプリ全体で音声状態を管理
 * 
 * 設計思想：
 * - グローバルな音声設定の一元管理
 * - 複数コンポーネント間での状態共有
 * - 設定の永続化（localStorage）
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * 音声設定
 */
interface AudioSettings {
  enabled: boolean;          // 音声機能のON/OFF
  volume: number;           // 音量（0.0 - 1.0）
  playbackRate: number;     // 再生速度（0.5 - 2.0）
  autoPlay: boolean;        // 自動再生
  subtitles: boolean;       // 字幕表示
  detailLevel: 'simple' | 'standard' | 'detailed'; // 詳細度
}

/**
 * 音声再生状態
 */
interface AudioPlaybackState {
  isPlaying: boolean;
  currentSuggestionId: string | null;
  currentSegmentId: string | null;
  progress: number; // 0-100
}

/**
 * プレイヤー情報
 */
interface PlayerInfo {
  playerId: string;
  suggestionId: string;
  registeredAt: number;
}

/**
 * 音声コンテキストの型
 */
interface AudioContextType {
  // 設定
  settings: AudioSettings;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  
  // 再生状態
  playbackState: AudioPlaybackState;
  
  // 再生制御
  play: (suggestionId: string) => void;
  pause: () => void;
  stop: () => void;
  
  // 複数プレイヤー管理
  activePlayerId: string | null;
  lastActivePlayerId: string | null;
  registerPlayer: (playerId: string, suggestionId: string) => void;
  unregisterPlayer: (playerId: string) => void;
  requestPlayback: (playerId: string) => boolean;
  pauseAll: () => void;
  resumeLast: () => void;
  getRegisteredPlayers: () => PlayerInfo[];
  getActivePlayer: () => PlayerInfo | null;
  getPlayer: (playerId: string) => PlayerInfo | null;
  
  // ユーティリティ
  isAudioSupported: boolean;
  hasUserInteracted: boolean;
  requestUserInteraction: () => void;
}

/**
 * デフォルト設定
 */
const defaultSettings: AudioSettings = {
  enabled: true,
  volume: 0.8,
  playbackRate: 1.0,
  autoPlay: false,
  subtitles: true,
  detailLevel: 'standard'
};

/**
 * 初期再生状態
 */
const initialPlaybackState: AudioPlaybackState = {
  isPlaying: false,
  currentSuggestionId: null,
  currentSegmentId: null,
  progress: 0
};

/**
 * コンテキスト作成
 */
const AudioContext = createContext<AudioContextType | undefined>(undefined);

/**
 * ローカルストレージのキー
 */
const STORAGE_KEY = 'kibarashi_audio_settings';

/**
 * 音声プロバイダーコンポーネント
 * 
 * なぜContext APIか：
 * - React標準機能で追加ライブラリ不要
 * - 音声設定は頻繁に変更されない
 * - シンプルな状態管理で十分
 */
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 音声設定の状態
  const [settings, setSettings] = useState<AudioSettings>(() => {
    // ローカルストレージから復元
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
    return defaultSettings;
  });
  
  // 再生状態
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>(initialPlaybackState);
  
  // 複数プレイヤー管理の状態
  const [registeredPlayers, setRegisteredPlayers] = useState<Map<string, PlayerInfo>>(new Map());
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [lastActivePlayerId, setLastActivePlayerId] = useState<string | null>(null);
  
  // ブラウザサポート
  const [isAudioSupported] = useState(() => {
    return typeof window !== 'undefined' && 'Audio' in window;
  });
  
  // ユーザー操作フラグ（自動再生制限対策）
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  /**
   * 設定の更新と永続化
   */
  const updateSettings = useCallback((updates: Partial<AudioSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // ローカルストレージに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.warn('Failed to save audio settings:', error);
      }
      
      return newSettings;
    });
  }, []);
  
  /**
   * 再生開始
   */
  const play = useCallback((suggestionId: string) => {
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: true,
      currentSuggestionId: suggestionId,
      progress: 0
    }));
  }, []);
  
  /**
   * 一時停止
   */
  const pause = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false
    }));
  }, []);
  
  /**
   * 停止
   */
  const stop = useCallback(() => {
    setPlaybackState(initialPlaybackState);
  }, []);
  
  /**
   * プレイヤーの登録
   */
  const registerPlayer = useCallback((playerId: string, suggestionId: string) => {
    setRegisteredPlayers(prev => {
      const newMap = new Map(prev);
      newMap.set(playerId, {
        playerId,
        suggestionId,
        registeredAt: Date.now()
      });
      return newMap;
    });
  }, []);

  /**
   * プレイヤーの登録解除
   */
  const unregisterPlayer = useCallback((playerId: string) => {
    setRegisteredPlayers(prev => {
      const newMap = new Map(prev);
      newMap.delete(playerId);
      return newMap;
    });
    
    // アクティブプレイヤーが削除される場合
    if (activePlayerId === playerId) {
      setActivePlayerId(null);
    }
    
    // 最後のアクティブプレイヤーが削除される場合
    if (lastActivePlayerId === playerId) {
      setLastActivePlayerId(null);
    }
  }, [activePlayerId, lastActivePlayerId]);

  /**
   * 再生許可の要求
   */
  const requestPlayback = useCallback((playerId: string) => {
    // 現在の登録状態をチェック
    const isRegistered = registeredPlayers.has(playerId);
    if (!isRegistered) {
      return false;
    }
    
    // 異なるプレイヤーが再生中の場合、停止要求を送信
    if (activePlayerId && activePlayerId !== playerId) {
      window.dispatchEvent(new CustomEvent('audio-stop-request', {
        detail: { playerId: activePlayerId }
      }));
      setLastActivePlayerId(activePlayerId);
    }
    
    // アクティブプレイヤーを設定
    setActivePlayerId(playerId);
    
    return true;
  }, [registeredPlayers, activePlayerId]);

  /**
   * すべてのプレイヤーを一時停止
   */
  const pauseAll = useCallback(() => {
    window.dispatchEvent(new CustomEvent('audio-pause-all'));
    setLastActivePlayerId(activePlayerId);
    setActivePlayerId(null);
  }, [activePlayerId]);

  /**
   * 最後に再生していたプレイヤーを再開
   */
  const resumeLast = useCallback(() => {
    if (lastActivePlayerId && registeredPlayers.has(lastActivePlayerId)) {
      setActivePlayerId(lastActivePlayerId);
      setLastActivePlayerId(null);
    }
  }, [lastActivePlayerId, registeredPlayers]);

  /**
   * 登録されたプレイヤー一覧を取得
   */
  const getRegisteredPlayers = useCallback(() => {
    return Array.from(registeredPlayers.values());
  }, [registeredPlayers]);

  /**
   * アクティブなプレイヤー情報を取得
   */
  const getActivePlayer = useCallback(() => {
    if (activePlayerId && registeredPlayers.has(activePlayerId)) {
      return registeredPlayers.get(activePlayerId) || null;
    }
    return null;
  }, [activePlayerId, registeredPlayers]);

  /**
   * 特定のプレイヤー情報を取得
   */
  const getPlayer = useCallback((playerId: string) => {
    return registeredPlayers.get(playerId) || null;
  }, [registeredPlayers]);

  /**
   * ユーザー操作の要求
   * 自動再生がブロックされた場合の対処
   */
  const requestUserInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      // ダミーの音声を再生してユーザー操作を記録
      const audio = new Audio();
      audio.volume = 0;
      audio.play().then(() => {
        setHasUserInteracted(true);
        audio.pause();
      }).catch(() => {
        // 自動再生がブロックされた
        console.info('User interaction required for audio playback');
      });
    }
  }, [hasUserInteracted]);
  
  /**
   * ユーザー操作の検出
   */
  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true);
      // イベントリスナーを削除
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    if (!hasUserInteracted) {
      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasUserInteracted]);
  
  /**
   * グローバルキーボードショートカット
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // スペースキーで再生/一時停止
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (playbackState.isPlaying) {
          pause();
        } else if (playbackState.currentSuggestionId) {
          play(playbackState.currentSuggestionId);
        }
      }
    };
    
    if (settings.enabled) {
      document.addEventListener('keydown', handleKeyPress);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [settings.enabled, playbackState, play, pause]);
  
  /**
   * コンテキスト値
   */
  const value: AudioContextType = {
    settings,
    updateSettings,
    playbackState,
    play,
    pause,
    stop,
    activePlayerId,
    lastActivePlayerId,
    registerPlayer,
    unregisterPlayer,
    requestPlayback,
    pauseAll,
    resumeLast,
    getRegisteredPlayers,
    getActivePlayer,
    getPlayer,
    isAudioSupported,
    hasUserInteracted,
    requestUserInteraction
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

/**
 * 音声コンテキストを使用するカスタムフック
 * 
 * 使用例：
 * const { settings, updateSettings, play } = useAudio();
 */
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  
  return context;
};

/**
 * 音声設定のみを使用するフック
 */
export const useAudioSettings = () => {
  const { settings, updateSettings } = useAudio();
  return { settings, updateSettings };
};

/**
 * 音声再生状態のみを使用するフック
 */
export const useAudioPlayback = () => {
  const { playbackState, play, pause, stop } = useAudio();
  return { playbackState, play, pause, stop };
};

/**
 * 音声機能の可用性をチェックするフック
 */
export const useAudioAvailability = () => {
  const { isAudioSupported, hasUserInteracted, settings } = useAudio();
  
  return {
    isAvailable: isAudioSupported && settings.enabled,
    isReady: isAudioSupported && settings.enabled && hasUserInteracted,
    isAudioSupported,
    hasUserInteracted,
    isEnabled: settings.enabled
  };
};