/**
 * AudioContext 複数プレイヤー管理機能のテスト
 * 
 * テスト対象：
 * - 複数プレイヤーの登録・削除
 * - 排他的再生制御
 * - グローバルコントロール
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, act, screen } from '@testing-library/react';
import { AudioProvider, useAudio } from './AudioContext';
import React from 'react';

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AudioProvider>{children}</AudioProvider>
);

describe('AudioContext Multiple Player Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Player Registration', () => {
    it('複数のプレイヤーを登録できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
        result.current.registerPlayer('player-2', 'suggestion-2');
        result.current.registerPlayer('player-3', 'suggestion-3');
      });

      expect(result.current.getRegisteredPlayers()).toHaveLength(3);
      expect(result.current.getRegisteredPlayers()).toEqual([
        expect.objectContaining({ playerId: 'player-1', suggestionId: 'suggestion-1' }),
        expect.objectContaining({ playerId: 'player-2', suggestionId: 'suggestion-2' }),
        expect.objectContaining({ playerId: 'player-3', suggestionId: 'suggestion-3' })
      ]);
    });

    it('同じIDのプレイヤーは重複登録されない', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
        result.current.registerPlayer('player-1', 'suggestion-1-updated');
      });

      const players = result.current.getRegisteredPlayers();
      expect(players).toHaveLength(1);
      expect(players[0].suggestionId).toBe('suggestion-1-updated');
    });

    it('プレイヤーの登録を解除できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
        result.current.registerPlayer('player-2', 'suggestion-2');
      });

      expect(result.current.getRegisteredPlayers()).toHaveLength(2);

      act(() => {
        result.current.unregisterPlayer('player-1');
      });

      expect(result.current.getRegisteredPlayers()).toHaveLength(1);
      expect(result.current.getRegisteredPlayers()[0].playerId).toBe('player-2');
    });
  });

  describe('Exclusive Playback Control', () => {
    it('再生許可を要求できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      let canPlay = false;
      act(() => {
        canPlay = result.current.requestPlayback('player-1');
      });

      expect(canPlay).toBe(true);
      expect(result.current.activePlayerId).toBe('player-1');
    });

    it('異なるプレイヤーが再生許可を要求すると、既存のプレイヤーが停止される', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      // プレイヤー登録
      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
        result.current.registerPlayer('player-2', 'suggestion-2');
      });

      // 最初のプレイヤーが再生開始
      act(() => {
        result.current.requestPlayback('player-1');
      });

      expect(result.current.activePlayerId).toBe('player-1');

      // 二番目のプレイヤーが再生開始
      act(() => {
        result.current.requestPlayback('player-2');
      });

      expect(result.current.activePlayerId).toBe('player-2');
    });

    it('同じプレイヤーの再生許可要求は常に成功する', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      act(() => {
        result.current.requestPlayback('player-1');
      });

      let canPlay = false;
      act(() => {
        canPlay = result.current.requestPlayback('player-1');
      });

      expect(canPlay).toBe(true);
      expect(result.current.activePlayerId).toBe('player-1');
    });

    it('未登録のプレイヤーの再生許可要求は失敗する', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      let canPlay = true;
      act(() => {
        canPlay = result.current.requestPlayback('unregistered-player');
      });

      expect(canPlay).toBe(false);
      expect(result.current.activePlayerId).toBe(null);
    });
  });

  describe('Global Controls', () => {
    it('すべてのプレイヤーを一時停止できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      // Mock window.dispatchEvent
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      // プレイヤー登録
      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      // 再生要求
      act(() => {
        result.current.requestPlayback('player-1');
      });

      expect(result.current.activePlayerId).toBe('player-1');

      // 一時停止
      act(() => {
        result.current.pauseAll();
      });

      expect(result.current.activePlayerId).toBe(null);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'audio-pause-all'
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('最後に再生していたプレイヤーを再開できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      // プレイヤー登録
      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      // 再生要求
      act(() => {
        result.current.requestPlayback('player-1');
      });

      // 一時停止
      act(() => {
        result.current.pauseAll();
      });

      expect(result.current.activePlayerId).toBe(null);
      expect(result.current.lastActivePlayerId).toBe('player-1');

      // 再開
      act(() => {
        result.current.resumeLast();
      });

      expect(result.current.activePlayerId).toBe('player-1');
    });

    it('最後に再生していたプレイヤーが存在しない場合、再開は無効', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.resumeLast();
      });

      expect(result.current.activePlayerId).toBe(null);
    });
  });

  describe('Event System', () => {
    it('停止要求イベントが発行される', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      // プレイヤー登録
      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
        result.current.registerPlayer('player-2', 'suggestion-2');
      });

      // 最初のプレイヤーが再生開始
      act(() => {
        result.current.requestPlayback('player-1');
      });

      // 二番目のプレイヤーが再生開始（停止要求イベントが発行される）
      act(() => {
        result.current.requestPlayback('player-2');
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'audio-stop-request',
          detail: { playerId: 'player-1' }
        })
      );

      dispatchEventSpy.mockRestore();
    });
  });

  describe('Player Information', () => {
    it('アクティブなプレイヤー情報を取得できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      // プレイヤー登録
      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      // 再生要求
      act(() => {
        result.current.requestPlayback('player-1');
      });

      const activePlayer = result.current.getActivePlayer();
      expect(activePlayer).toEqual(
        expect.objectContaining({
          playerId: 'player-1',
          suggestionId: 'suggestion-1'
        })
      );
    });

    it('アクティブなプレイヤーがいない場合はnullを返す', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      const activePlayer = result.current.getActivePlayer();
      expect(activePlayer).toBe(null);
    });

    it('特定のプレイヤー情報を取得できる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      const player = result.current.getPlayer('player-1');
      expect(player).toEqual(
        expect.objectContaining({
          playerId: 'player-1',
          suggestionId: 'suggestion-1'
        })
      );
    });
  });

  describe('Memory Management', () => {
    it('プレイヤーの登録解除時にアクティブ状態もクリアされる', () => {
      const { result } = renderHook(() => useAudio(), {
        wrapper: TestWrapper
      });

      // プレイヤー登録
      act(() => {
        result.current.registerPlayer('player-1', 'suggestion-1');
      });

      // 再生要求
      act(() => {
        result.current.requestPlayback('player-1');
      });

      expect(result.current.activePlayerId).toBe('player-1');

      // プレイヤー登録解除
      act(() => {
        result.current.unregisterPlayer('player-1');
      });

      expect(result.current.activePlayerId).toBe(null);
      expect(result.current.getRegisteredPlayers()).toHaveLength(0);
    });
  });
});