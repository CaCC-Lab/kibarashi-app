import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
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
} as any;

// Speech Synthesis APIの実装
// モックを使用せず、実際の動作をシミュレート
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  text: string;
  lang: string = 'ja-JP';
  voice: any = null;
  volume: number = 1;
  rate: number = 1;
  pitch: number = 1;
  onstart: any = null;
  onend: any = null;
  onerror: any = null;
  onpause: any = null;
  onresume: any = null;
  onmark: any = null;
  onboundary: any = null;

  constructor(text?: string) {
    this.text = text || '';
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
} as any;

global.SpeechSynthesisErrorEvent = class SpeechSynthesisErrorEvent extends Event {
  error: string;
  
  constructor(type: string, init?: { error?: string }) {
    super(type);
    this.error = init?.error || 'unknown';
  }
} as any;

global.speechSynthesis = {
  speak: function(utterance: any) {
    // 音声合成をシミュレート
    if (utterance.onstart) {
      setTimeout(() => utterance.onstart(new Event('start')), 0);
    }
    if (utterance.onend) {
      setTimeout(() => utterance.onend(new Event('end')), 100);
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
} as any;

// Vibration APIの実装
navigator.vibrate = function(_pattern?: number | number[]) {
  // 振動をシミュレート（実際には何もしない）
  return true;
};

// IntersectionObserverのモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

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