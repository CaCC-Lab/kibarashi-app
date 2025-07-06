/**
 * 音声コンテキストのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, act, screen } from '@testing-library/react';
import { AudioProvider, useAudio, useAudioSettings, useAudioPlayback, useAudioAvailability } from './AudioContext';
import React from 'react';

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Audio APIのモック
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    volume: 0,
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
});

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AudioProvider>{children}</AudioProvider>
);

describe('AudioContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('AudioProvider', () => {
    it('プロバイダーが正常にレンダリングされる', () => {
      render(
        <AudioProvider>
          <div>Test Content</div>
        </AudioProvider>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('デフォルト設定で初期化される', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      expect(result.current.settings).toEqual({
        enabled: true,
        volume: 0.8,
        playbackRate: 1.0,
        autoPlay: false,
        subtitles: true,
        detailLevel: 'standard'
      });
    });

    it('localStorageから設定を復元する', () => {
      const savedSettings = {
        enabled: false,
        volume: 0.5,
        detailLevel: 'detailed'
      };
      
      localStorageMock.setItem('kibarashi_audio_settings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      expect(result.current.settings.enabled).toBe(false);
      expect(result.current.settings.volume).toBe(0.5);
      expect(result.current.settings.detailLevel).toBe('detailed');
    });
  });

  describe('useAudio hook', () => {
    it('プロバイダー外で使用するとエラーを投げる', () => {
      expect(() => {
        renderHook(() => useAudio());
      }).toThrow('useAudio must be used within AudioProvider');
    });

    it('設定更新が正常に動作する', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateSettings({ volume: 0.6 });
      });

      expect(result.current.settings.volume).toBe(0.6);
    });

    it('設定更新時にlocalStorageに保存される', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.updateSettings({ enabled: false });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kibarashi_audio_settings',
        expect.stringContaining('"enabled":false')
      );
    });
  });

  describe('Audio playback control', () => {
    it('再生開始が正常に動作する', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.play('test-suggestion-1');
      });

      expect(result.current.playbackState.isPlaying).toBe(true);
      expect(result.current.playbackState.currentSuggestionId).toBe('test-suggestion-1');
    });

    it('一時停止が正常に動作する', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.play('test-suggestion-1');
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.playbackState.isPlaying).toBe(false);
      expect(result.current.playbackState.currentSuggestionId).toBe('test-suggestion-1');
    });

    it('停止が正常に動作する', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.play('test-suggestion-1');
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.playbackState.isPlaying).toBe(false);
      expect(result.current.playbackState.currentSuggestionId).toBe(null);
      expect(result.current.playbackState.progress).toBe(0);
    });
  });

  describe('useAudioSettings hook', () => {
    it('設定のみを返す', () => {
      const { result } = renderHook(() => useAudioSettings(), {
        wrapper: TestWrapper
      });

      expect(result.current.settings).toBeDefined();
      expect(result.current.updateSettings).toBeDefined();
      expect(Object.keys(result.current)).toEqual(['settings', 'updateSettings']);
    });
  });

  describe('useAudioPlayback hook', () => {
    it('再生状態と制御のみを返す', () => {
      const { result } = renderHook(() => useAudioPlayback(), {
        wrapper: TestWrapper
      });

      expect(result.current.playbackState).toBeDefined();
      expect(result.current.play).toBeDefined();
      expect(result.current.pause).toBeDefined();
      expect(result.current.stop).toBeDefined();
      expect(Object.keys(result.current)).toEqual(['playbackState', 'play', 'pause', 'stop']);
    });
  });

  describe('useAudioAvailability hook', () => {
    it('音声機能の可用性を正しく返す', () => {
      const { result } = renderHook(() => useAudioAvailability(), {
        wrapper: TestWrapper
      });

      expect(result.current.isAudioSupported).toBe(true);
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.isAvailable).toBe(true);
      expect(result.current.hasUserInteracted).toBe(false);
      expect(result.current.isReady).toBe(false); // hasUserInteracted が false なので
    });

    it('音声無効時は利用不可を返す', () => {
      const { result } = renderHook(() => {
        const audio = useAudio();
        return { audio, availability: useAudioAvailability() };
      }, {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.audio.updateSettings({ enabled: false });
      });

      expect(result.current.availability.isEnabled).toBe(false);
      expect(result.current.availability.isAvailable).toBe(false);
      expect(result.current.availability.isReady).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('localStorage書き込み失敗時も動作する', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      expect(() => {
        act(() => {
          result.current.updateSettings({ volume: 0.5 });
        });
      }).not.toThrow();

      // 設定は更新される（localStorage保存は失敗するが）
      expect(result.current.settings.volume).toBe(0.5);
    });

    it('localStorage読み込み失敗時はデフォルト設定を使用', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      expect(result.current.settings).toEqual({
        enabled: true,
        volume: 0.8,
        playbackRate: 1.0,
        autoPlay: false,
        subtitles: true,
        detailLevel: 'standard'
      });
    });
  });
});