import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// @testing-library/jest-dom のマッチャーを拡張
expect.extend(matchers);

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルモックの設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Web Audio APIのモック
global.Audio = class Audio {
  play() { return Promise.resolve(); }
  pause() {}
  addEventListener() {}
  removeEventListener() {}
} as unknown as typeof globalThis.Audio;

// Speech Synthesis APIの実装
// モックを使用せず、実際の動作をシミュレート
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  text: string;
  lang: string = 'ja-JP';
  voice: SpeechSynthesisVoice | null = null;
  volume: number = 1;
  rate: number = 1;
  pitch: number = 1;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null = null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null = null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => unknown) | null = null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null = null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null = null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null = null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null = null;

  constructor(text?: string) {
    this.text = text || '';
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
} as unknown as typeof globalThis.SpeechSynthesisUtterance;

global.SpeechSynthesisErrorEvent = class SpeechSynthesisErrorEvent extends Event {
  error: string;

  constructor(type: string, init?: { error?: string }) {
    super(type);
    this.error = init?.error || 'unknown';
  }
} as unknown as typeof globalThis.SpeechSynthesisErrorEvent;

global.speechSynthesis = {
  speak: function(utterance: SpeechSynthesisUtterance) {
    // 音声合成をシミュレート
    if (utterance.onstart) {
      setTimeout(() => utterance.onstart!(new Event('start') as SpeechSynthesisEvent), 0);
    }
    if (utterance.onend) {
      setTimeout(() => utterance.onend!(new Event('end') as SpeechSynthesisEvent), 100);
    }
  },
  cancel: function() {
    // キャンセル処理
  },
  pause: function() {
    // 一時停止処理
  },
  resume: function() {
    // 再開処理
  },
  getVoices: function() {
    return [];
  },
  addEventListener: function() {},
  removeEventListener: function() {},
  dispatchEvent: function() { return true; },
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null,
} as unknown as SpeechSynthesis;

// Vibration APIの実装
// eslint-disable-next-line @typescript-eslint/no-unused-vars
navigator.vibrate = function(_pattern: VibratePattern) {
  // 振動をシミュレート（実際には何もしない）
  return true;
};

// IntersectionObserverのモック
global.IntersectionObserver = class IntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof globalThis.IntersectionObserver;

// matchMediaの実装
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: function(_query: string) {
    return {
      matches: false,
      media: _query,
      onchange: null,
      addListener: function() {}, // Deprecated
      removeListener: function() {}, // Deprecated
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return true; },
    };
  },
});

// URL.createObjectURLのモック
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:mock-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// LocalStorage and SessionStorage のモック
class MockStorage {
  private store: Record<string, string> = {};
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
  
  clear(): void {
    this.store = {};
  }
  
  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
  
  get length(): number {
    return Object.keys(this.store).length;
  }
}

// localStorage と sessionStorage をモック
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: new MockStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: new MockStorage(),
});

// global に localStorage を設定（一部のテストで global.localStorage を使用するため）
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;