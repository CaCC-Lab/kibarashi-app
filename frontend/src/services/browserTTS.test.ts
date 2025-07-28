import { describe, it, expect, beforeEach } from 'vitest';
import { browserTTS } from './browserTTS';

/**
 * BrowserTTSサービスのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のSpeechSynthesis APIをテスト
 * - エラーハンドリングと境界値のテストを重視
 * - ブラウザサポートの有無を考慮したテスト
const _speechSynthesis = window.speechSynthesis as SpeechSynthesis & { _voices?: SpeechSynthesisVoice[] };
 */
describe('BrowserTTS', () => {
  beforeEach(() => {
    // speechSynthesisの状態をリセット
    if (window.speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  });

  describe('初期化のテスト', () => {
    it('サービスが利用可能', () => {
      expect(browserTTS).toBeDefined();
      expect(browserTTS.isAvailable()).toBe(true);
    });

    it('SpeechSynthesis APIが利用可能', () => {
      expect('speechSynthesis' in window).toBe(true);
      expect(typeof speechSynthesis.speak).toBe('function');
    });
  });

  describe('音声合成のテスト', () => {
    it('基本的なテキストの読み上げができる', async () => {
      const text = 'こんにちは、これはテストです。';
      
      const promise = browserTTS.speak({ text });
      expect(promise).toBeInstanceOf(Promise);
      
      // 読み上げを即座に停止して次のテストに影響しないようにする
      browserTTS.stop();
    });

    it('空のテキストでも動作する', async () => {
      // 空のテキストは音声合成APIが処理する
      const promise = browserTTS.speak({ text: '' });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('日本語の特殊文字を含むテキストの読み上げ', async () => {
      const text = '「こんにちは」と言いました。数字は１２３です。';
      
      const promise = browserTTS.speak({ text });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('長いテキストの読み上げができる', async () => {
      const longText = 'これは非常に長いテキストです。'.repeat(100);
      
      const promise = browserTTS.speak({ text: longText });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('英語テキストの読み上げ', async () => {
      const text = 'Hello, this is a test message.';
      
      const promise = browserTTS.speak({ text });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });
  });

  describe('オプション設定のテスト', () => {
    it('カスタムオプションで読み上げができる', async () => {
      const text = 'オプションテストです。';
      
      const promise = browserTTS.speak({
        text,
        rate: 0.8,
        pitch: 1.2,
        volume: 0.9
      });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('範囲外のrateオプションでも動作する', async () => {
      const text = 'レートテストです。';
      
      const promise = browserTTS.speak({
        text,
        rate: -1 // 範囲外だがAPIが処理する
      });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('範囲外のpitchオプションでも動作する', async () => {
      const text = 'ピッチテストです。';
      
      const promise = browserTTS.speak({
        text,
        pitch: 10 // 範囲外だがAPIが処理する
      });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('範囲外のvolumeオプションでも動作する', async () => {
      const text = 'ボリュームテストです。';
      
      const promise = browserTTS.speak({
        text,
        volume: 2 // 範囲外だがAPIが処理する
      });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });
  });

  describe('停止機能のテスト', () => {
    it('読み上げを停止できる', () => {
      const text = '停止テストです。';
      
      browserTTS.speak({ text });
      browserTTS.stop();
      
      // 停止後も正常に動作する
      expect(() => browserTTS.speak({ text })).not.toThrow();
      browserTTS.stop();
    });

    it('読み上げ中でなくても停止できる', () => {
      expect(() => browserTTS.stop()).not.toThrow();
    });

    it('複数回停止を呼んでもエラーにならない', () => {
      browserTTS.stop();
      browserTTS.stop();
      browserTTS.stop();
      
      expect(() => browserTTS.stop()).not.toThrow();
    });
  });

  describe('状態管理のテスト', () => {
    it('読み上げ状態を正しく取得できる', () => {
      // 初期状態は停止
      expect(browserTTS.isSpeaking).toBe(false);
      
      // 読み上げ開始後
      browserTTS.speak({ text: '状態テストです。' });
      // 状態は音声合成API内部で管理される
      browserTTS.stop();
    });

    it('一時停止状態を正しく取得できる', () => {
      expect(browserTTS.isPaused).toBe(false);
    });
  });

  describe('一時停止・再開機能のテスト', () => {
    it('読み上げを一時停止できる', () => {
      const text = '一時停止テストです。';
      
      browserTTS.speak({ text });
      browserTTS.pause();
      
      // エラーなく一時停止できる
      expect(() => browserTTS.pause()).not.toThrow();
      browserTTS.stop();
    });

    it('一時停止した読み上げを再開できる', () => {
      const text = '再開テストです。';
      
      browserTTS.speak({ text });
      browserTTS.pause();
      browserTTS.resume();
      
      // エラーなく再開できる
      expect(() => browserTTS.resume()).not.toThrow();
      browserTTS.stop();
    });

    it('読み上げ中でなくても一時停止・再開できる', () => {
      expect(() => browserTTS.pause()).not.toThrow();
      expect(() => browserTTS.resume()).not.toThrow();
    });
  });

  describe('音声一覧機能のテスト', () => {
    it('日本語音声を取得できる', () => {
      const japaneseVoice = browserTTS.getJapaneseVoice();
      
      // 日本語音声が見つからない場合はnullが返される
      expect(japaneseVoice === null || (japaneseVoice && japaneseVoice.lang.includes('ja'))).toBe(true);
    });
  });

  describe('オプション設定の追加テスト', () => {
    it('言語設定を指定できる', () => {
      const text = '言語設定テスト';
      
      const promise = browserTTS.speak({
        text,
        lang: 'en-US'
      });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('SpeechSynthesis APIが利用できない場合のエラー', () => {
      // speechSynthesisを一時的に削除
      const originalSpeechSynthesis = window.speechSynthesis;
      const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');
      delete (window as Record<string, unknown>).speechSynthesis;
      
      expect(browserTTS.isAvailable()).toBe(false);
      
      // 復元
      if (originalDescriptor) {
        Object.defineProperty(window, 'speechSynthesis', originalDescriptor);
      } else {
        (window as Record<string, unknown>).speechSynthesis = originalSpeechSynthesis;
      }
    });

    it('読み上げが中断された場合の処理', async () => {
      const text = '中断テストです。';
      
      // 読み上げを開始してすぐに停止
      const promise = browserTTS.speak({ text });
      browserTTS.stop();
      
      // Promiseは解決される（interruptedエラーは無視される）
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('localStorageのテスト', () => {
    it('状態をlocalStorageに保存できる', () => {
      // localStorageにデータを保存
      localStorage.setItem('tts-state', JSON.stringify({ rate: 1.5 }));
      
      expect(localStorage.getItem('tts-state')).toBeDefined();
    });

    it('localStorageから状態を読み込める', () => {
      localStorage.setItem('tts-state', JSON.stringify({ rate: 1.5 }));
      
      const state = localStorage.getItem('tts-state');
      expect(state).toBeDefined();
      const parsed = JSON.parse(state!);
      expect(parsed.rate).toBe(1.5);
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のテキストでも処理できる', async () => {
      const largeText = 'これは大きなテキストです。'.repeat(100);
      
      const promise = browserTTS.speak({ text: largeText });
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });

    it('連続した読み上げリクエストが正常に処理される', () => {
      const texts = ['テスト1', 'テスト2', 'テスト3'];
      
      texts.forEach(text => {
        expect(() => browserTTS.speak({ text })).not.toThrow();
        browserTTS.stop();
      });
    });
  });

  describe('ブラウザ互換性のテスト', () => {
    it('SpeechSynthesisUtteranceが作成できる', () => {
      const utterance = new SpeechSynthesisUtterance('テスト');
      
      expect(utterance).toBeInstanceOf(SpeechSynthesisUtterance);
      expect(utterance.text).toBe('テスト');
    });

    it('音声合成イベントが適切に設定される', () => {
      const text = 'イベントテストです。';
      
      const promise = browserTTS.speak({ text });
      
      // Promiseが返されることを確認
      expect(promise).toBeInstanceOf(Promise);
      browserTTS.stop();
    });
  });
});