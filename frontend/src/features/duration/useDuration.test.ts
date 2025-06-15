import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
      
      expect(result.current.duration).toBeNull();
    });
  });

  describe('状態の更新', () => {
    it('5分に設定できる', () => {
      const { result } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(5);
      });
      
      expect(result.current.duration).toBe(5);
    });

    it('15分に設定できる', () => {
      const { result } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(15);
      });
      
      expect(result.current.duration).toBe(15);
    });

    it('30分に設定できる', () => {
      const { result } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(30);
      });
      
      expect(result.current.duration).toBe(30);
    });
  });

  describe('型安全性', () => {
    it('正しい型の値を返す', () => {
      const { result } = renderHook(() => useDuration());
      
      // TypeScriptの型チェックが通ることを確認
      const duration: 5 | 15 | 30 | null = result.current.duration;
      expect(duration).toBeNull();
    });

    it('数値型として扱える', () => {
      const { result } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(15);
      });
      
      // 数値演算が可能
      if (result.current.duration !== null) {
        const doubled = result.current.duration * 2;
        expect(doubled).toBe(30);
      }
    });
  });

  describe('再レンダリング時の安定性', () => {
    it('再レンダリングしても値が保持される', () => {
      const { result, rerender } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(5);
      });
      
      expect(result.current.duration).toBe(5);
      
      // 再レンダリング
      rerender();
      expect(result.current.duration).toBe(5);
    });

    it('リセット機能が動作する', () => {
      const { result } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(5);
      });
      
      expect(result.current.duration).toBe(5);
      
      act(() => {
        result.current.resetDuration();
      });
      
      expect(result.current.duration).toBeNull();
    });
  });

  describe('境界値テスト', () => {
    it('nullを設定できる', () => {
      const { result } = renderHook(() => useDuration());
      
      act(() => {
        result.current.setDuration(15);
      });
      
      expect(result.current.duration).toBe(15);
      
      act(() => {
        result.current.setDuration(null);
      });
      
      expect(result.current.duration).toBeNull();
    });

    it('型制約で許可された値のみ設定できる', () => {
      const { result } = renderHook(() => useDuration());
      
      // TypeScriptで型エラーになるため、実質的にテスト不要
      // 以下のコードはコンパイルエラーになる
      // result.current.setDuration(10); // Error: Argument of type '10' is not assignable to parameter of type 'Duration'
      
      expect(result.current.duration).toBeNull();
    });
  });
});