import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
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
      
      expect(result.current).toBeNull();
    });
  });

  describe('異なる初期値', () => {
    it('workplace を初期値として設定できる', () => {
      const { result } = renderHook(() => useSituation('workplace'));
      
      expect(result.current).toBe('workplace');
    });

    it('home を初期値として設定できる', () => {
      const { result } = renderHook(() => useSituation('home'));
      
      expect(result.current).toBe('home');
    });

    it('outside を初期値として設定できる', () => {
      const { result } = renderHook(() => useSituation('outside'));
      
      expect(result.current).toBe('outside');
    });
  });

  describe('型安全性', () => {
    it('正しい型の値を返す', () => {
      const { result } = renderHook(() => useSituation());
      
      // TypeScriptの型チェックが通ることを確認
      const situation: 'workplace' | 'home' | 'outside' | null = result.current;
      expect(situation).toBeNull();
    });
  });

  describe('再レンダリング時の安定性', () => {
    it('再レンダリングしても値が保持される', () => {
      const { result, rerender } = renderHook(
        ({ initial }) => useSituation(initial),
        { initialProps: { initial: 'workplace' as const } }
      );
      
      expect(result.current).toBe('workplace');
      
      // 再レンダリング
      rerender({ initial: 'workplace' as const });
      expect(result.current).toBe('workplace');
    });

    it('異なる初期値でフックを呼び出しても最初の値が保持される', () => {
      const { result, rerender } = renderHook(
        ({ initial }) => useSituation(initial),
        { initialProps: { initial: 'workplace' as const } }
      );
      
      expect(result.current).toBe('workplace');
      
      // 異なる初期値で再レンダリング（Reactの仕様により初期値は変わらない）
      rerender({ initial: 'home' as const });
      expect(result.current).toBe('workplace');
    });
  });
});