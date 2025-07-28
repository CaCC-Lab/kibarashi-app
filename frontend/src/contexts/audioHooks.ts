/**
 * 音声関連のカスタムフック
 * AudioContext.tsxから分離してfast refreshの警告を解決
 */

import { useContext } from 'react';
import { AudioContext, AudioContextType } from './AudioContext';

/**
 * 音声コンテキストを使用するフック
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