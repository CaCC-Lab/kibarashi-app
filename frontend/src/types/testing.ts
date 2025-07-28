/**
 * テスト用の型定義
 */

import { vi } from 'vitest';

// Vitestのモック関数型
export type MockFunction = ReturnType<typeof vi.fn>;

// コンソールスパイの型
export interface ConsoleSpy {
  log: MockFunction;
  warn: MockFunction;
  error: MockFunction;
  info: MockFunction;
}