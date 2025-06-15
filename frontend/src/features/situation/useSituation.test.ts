import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSituation } from './useSituation';

/**
 * useSituationフックのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のReact状態管理を検証
 * - フックの戻り値と挙動を確認
 */
describe('useSituation', () => {
  describe('初期状態', () => {
    it('初期状態はnullである', () => {
      const { result } = renderHook(() => useSituation());
      
      expect(result.current.situation).toBeNull();
    });
  });

  describe('状態の更新', () => {
    it('workplace に設定できる', () => {
      const { result } = renderHook(() => useSituation());
      
      act(() => {
        result.current.setSituation('workplace');
      });
      
      expect(result.current.situation).toBe('workplace');
    });

    it('home に設定できる', () => {
      const { result } = renderHook(() => useSituation());
      
      act(() => {
        result.current.setSituation('home');
      });
      
      expect(result.current.situation).toBe('home');
    });

    it('outside に設定できる', () => {
      const { result } = renderHook(() => useSituation());
      
      act(() => {
        result.current.setSituation('outside');
      });
      
      expect(result.current.situation).toBe('outside');
    });
  });

  describe('型安全性', () => {
    it('正しい型の値を返す', () => {
      const { result } = renderHook(() => useSituation());
      
      // TypeScriptの型チェックが通ることを確認
      const situation: 'workplace' | 'home' | 'outside' | null = result.current.situation;
      expect(situation).toBeNull();
    });
  });

  describe('再レンダリング時の安定性', () => {
    it('再レンダリングしても値が保持される', () => {
      const { result, rerender } = renderHook(() => useSituation());
      
      act(() => {
        result.current.setSituation('workplace');
      });
      
      expect(result.current.situation).toBe('workplace');
      
      // 再レンダリング
      rerender();
      expect(result.current.situation).toBe('workplace');
    });

    it('リセット機能が動作する', () => {
      const { result } = renderHook(() => useSituation());
      
      act(() => {
        result.current.setSituation('workplace');
      });
      
      expect(result.current.situation).toBe('workplace');
      
      act(() => {
        result.current.resetSituation();
      });
      
      expect(result.current.situation).toBeNull();
    });
  });
});