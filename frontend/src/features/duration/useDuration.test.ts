import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDuration } from './useDuration';

/**
 * useDurationフックのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のReact状態管理を検証
 * - フックの戻り値と挙動を確認
 */
describe('useDuration', () => {
  describe('初期状態', () => {
    it('初期状態はnullである', () => {
      const { result } = renderHook(() => useDuration());
      
      expect(result.current).toBeNull();
    });
  });

  describe('異なる初期値', () => {
    it('5分を初期値として設定できる', () => {
      const { result } = renderHook(() => useDuration(5));
      
      expect(result.current).toBe(5);
    });

    it('15分を初期値として設定できる', () => {
      const { result } = renderHook(() => useDuration(15));
      
      expect(result.current).toBe(15);
    });

    it('30分を初期値として設定できる', () => {
      const { result } = renderHook(() => useDuration(30));
      
      expect(result.current).toBe(30);
    });
  });

  describe('型安全性', () => {
    it('正しい型の値を返す', () => {
      const { result } = renderHook(() => useDuration());
      
      // TypeScriptの型チェックが通ることを確認
      const duration: 5 | 15 | 30 | null = result.current;
      expect(duration).toBeNull();
    });

    it('数値型として扱える', () => {
      const { result } = renderHook(() => useDuration(15));
      
      // 数値演算が可能
      if (result.current !== null) {
        const doubled = result.current * 2;
        expect(doubled).toBe(30);
      }
    });
  });

  describe('再レンダリング時の安定性', () => {
    it('再レンダリングしても値が保持される', () => {
      const { result, rerender } = renderHook(
        ({ initial }) => useDuration(initial),
        { initialProps: { initial: 5 as const } }
      );
      
      expect(result.current).toBe(5);
      
      // 再レンダリング
      rerender({ initial: 5 as const });
      expect(result.current).toBe(5);
    });

    it('異なる初期値でフックを呼び出しても最初の値が保持される', () => {
      const { result, rerender } = renderHook(
        ({ initial }) => useDuration(initial),
        { initialProps: { initial: 5 as const } }
      );
      
      expect(result.current).toBe(5);
      
      // 異なる初期値で再レンダリング（Reactの仕様により初期値は変わらない）
      rerender({ initial: 15 as const });
      expect(result.current).toBe(5);
    });
  });

  describe('境界値テスト', () => {
    it('nullを初期値として扱える', () => {
      const { result } = renderHook(() => useDuration(null));
      
      expect(result.current).toBeNull();
    });

    it('undefinedを渡すとnullになる', () => {
      const { result } = renderHook(() => useDuration(undefined));
      
      expect(result.current).toBeNull();
    });
  });
});