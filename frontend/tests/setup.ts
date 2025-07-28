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
global.Audio = class Audio extends EventTarget {
  play(): Promise<void> { return Promise.resolve(); }
  pause(): void {}
  currentTime: number = 0;
  duration: number = 0;
  volume: number = 1;
  src: string = '';
} as unknown as typeof Audio;

// Speech Synthesis APIの実装
// モックを使用せず、実際の動作をシミュレート
type EventHandler = ((this: SpeechSynthesisUtterance, ev: Event) => void) | null;

global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string = 'ja-JP';
  voice: SpeechSynthesisVoice | null = null;
  volume: number = 1;
  rate: number = 1;
  pitch: number = 1;
  onstart: EventHandler = null;
  onend: EventHandler = null;
  onerror: EventHandler = null;
  onpause: EventHandler = null;
  onresume: EventHandler = null;
  onmark: EventHandler = null;
  onboundary: EventHandler = null;

  constructor(text?: string) {
    super();
    this.text = text || '';
  }
} as unknown as typeof SpeechSynthesisUtterance;

global.SpeechSynthesisErrorEvent = class SpeechSynthesisErrorEvent extends Event {
  error: SpeechSynthesisErrorCode;
  
  constructor(type: string, init?: { error?: SpeechSynthesisErrorCode }) {
    super(type);
    this.error = init?.error || 'canceled';
  }
} as unknown as typeof SpeechSynthesisErrorEvent;

global.speechSynthesis = {
  speak: function(utterance: SpeechSynthesisUtterance): void {
    // 音声合成をシミュレート
    if (utterance.onstart) {
      setTimeout(() => utterance.onstart?.call(utterance, new Event('start')), 0);
    }
    if (utterance.onend) {
      setTimeout(() => utterance.onend?.call(utterance, new Event('end')), 100);
    }
  },
  cancel: function(): void {
    // キャンセル処理
  },
  pause: function(): void {
    // 一時停止処理
  },
  resume: function(): void {
    // 再開処理
  },
  getVoices: function(): SpeechSynthesisVoice[] {
    return [];
  },
  addEventListener: function(): void {},
  removeEventListener: function(): void {},
  dispatchEvent: function(): boolean { return true; },
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null,
} as SpeechSynthesis;

// Vibration APIの実装
navigator.vibrate = function() {
  // 振動をシミュレート（実際には何もしない）
  return true;
};

// IntersectionObserverのモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;

// matchMediaの実装
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: function(query: string) {
    return {
      matches: false,
      media: query,
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