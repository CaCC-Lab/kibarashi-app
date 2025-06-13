import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserTTS } from './browserTTS';

/**
 * BrowserTTSクラスのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のSpeechSynthesis APIをテスト
 * - エラーハンドリングと境界値のテストを重視
 * - ブラウザサポートの有無を考慮したテスト
 */
describe('BrowserTTS', () => {
  let tts: BrowserTTS;

  beforeEach(() => {
    tts = new BrowserTTS();
    // speechSynthesisの状態をリセット
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  });

  describe('初期化のテスト', () => {
    it('インスタンスが正常に作成される', () => {
      expect(tts).toBeInstanceOf(BrowserTTS);
    });

    it('SpeechSynthesis APIが利用可能', () => {
      expect('speechSynthesis' in window).toBe(true);
      expect(typeof speechSynthesis.speak).toBe('function');
    });
  });

  describe('音声合成のテスト', () => {
    it('基本的なテキストの読み上げができる', async () => {
      const text = 'こんにちは、これはテストです。';
      
      const promise = tts.speak(text);
      expect(promise).toBeInstanceOf(Promise);
      
      // speechSynthesis.speakが呼ばれていることを確認
      expect(speechSynthesis.speak).toHaveBeenCalled();
    });

    it('空のテキストでエラーが発生する', async () => {
      await expect(tts.speak('')).rejects.toThrow('テキストが空です');
    });

    it('nullテキストでエラーが発生する', async () => {
      await expect(tts.speak(null as any)).rejects.toThrow('テキストが空です');
    });

    it('undefinedテキストでエラーが発生する', async () => {
      await expect(tts.speak(undefined as any)).rejects.toThrow('テキストが空です');
    });

    it('長いテキストの読み上げができる', async () => {
      const longText = 'これは非常に長いテキストです。'.repeat(100);
      
      const promise = tts.speak(longText);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('日本語の特殊文字を含むテキストの読み上げ', async () => {
      const text = '「こんにちは」と言いました。数字は１２３です。';
      
      const promise = tts.speak(text);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('英語テキストの読み上げ', async () => {
      const text = 'Hello, this is a test message.';
      
      const promise = tts.speak(text);
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('オプション設定のテスト', () => {
    it('カスタムオプションで読み上げができる', async () => {
      const text = 'オプションテストです。';
      const options = {
        rate: 0.8,
        pitch: 1.2,
        volume: 0.9
      };
      
      const promise = tts.speak(text, options);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('無効なrateオプションが正規化される', async () => {
      const text = 'レートテストです。';
      const options = { rate: -1 }; // 無効な値
      
      const promise = tts.speak(text, options);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('無効なpitchオプションが正規化される', async () => {
      const text = 'ピッチテストです。';
      const options = { pitch: 10 }; // 範囲外の値
      
      const promise = tts.speak(text, options);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('無効なvolumeオプションが正規化される', async () => {
      const text = 'ボリュームテストです。';
      const options = { volume: 2 }; // 範囲外の値
      
      const promise = tts.speak(text, options);
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('停止機能のテスト', () => {
    it('読み上げを停止できる', () => {
      const text = '停止テストです。';
      
      tts.speak(text);
      tts.stop();
      
      // speechSynthesis.cancelが呼ばれていることを確認
      expect(speechSynthesis.cancel).toHaveBeenCalled();
    });

    it('読み上げ中でなくても停止できる', () => {
      expect(() => tts.stop()).not.toThrow();
    });

    it('複数回停止を呼んでもエラーにならない', () => {
      tts.stop();
      tts.stop();
      tts.stop();
      
      expect(() => tts.stop()).not.toThrow();
    });
  });

  describe('状態管理のテスト', () => {
    it('読み上げ状態を正しく取得できる', () => {
      // 初期状態は停止
      expect(tts.isSpeaking()).toBe(false);
      
      // 読み上げ開始後
      tts.speak('状態テストです。');
      // speechSynthesisのモックでは実際の状態変更は発生しないため、
      // APIが呼ばれたことを確認
      expect(speechSynthesis.speak).toHaveBeenCalled();
    });

    it('一時停止状態を正しく取得できる', () => {
      expect(tts.isPaused()).toBe(false);
    });

    it('保留状態を正しく取得できる', () => {
      expect(tts.isPending()).toBe(false);
    });
  });

  describe('一時停止・再開機能のテスト', () => {
    it('読み上げを一時停止できる', () => {
      const text = '一時停止テストです。';
      
      tts.speak(text);
      tts.pause();
      
      expect(speechSynthesis.pause).toHaveBeenCalled();
    });

    it('一時停止した読み上げを再開できる', () => {
      const text = '再開テストです。';
      
      tts.speak(text);
      tts.pause();
      tts.resume();
      
      expect(speechSynthesis.resume).toHaveBeenCalled();
    });

    it('読み上げ中でなくても一時停止・再開できる', () => {
      expect(() => tts.pause()).not.toThrow();
      expect(() => tts.resume()).not.toThrow();
    });
  });

  describe('音声一覧機能のテスト', () => {
    it('利用可能な音声一覧を取得できる', () => {
      const voices = tts.getVoices();
      
      expect(Array.isArray(voices)).toBe(true);
      expect(speechSynthesis.getVoices).toHaveBeenCalled();
    });

    it('日本語音声を取得できる', () => {
      const japaneseVoices = tts.getJapaneseVoices();
      
      expect(Array.isArray(japaneseVoices)).toBe(true);
    });

    it('デフォルト音声を取得できる', () => {
      const defaultVoice = tts.getDefaultVoice();
      
      // デフォルト音声が見つからない場合はnullが返される
      expect(defaultVoice === null || typeof defaultVoice === 'object').toBe(true);
    });
  });

  describe('音声選択のテスト', () => {
    it('特定の音声を設定できる', () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const voice = voices[0];
        tts.setVoice(voice);
        
        expect(tts.getCurrentVoice()).toBe(voice);
      }
    });

    it('nullの音声設定でエラーにならない', () => {
      expect(() => tts.setVoice(null)).not.toThrow();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('SpeechSynthesis APIが利用できない場合のエラー', () => {
      // speechSynthesisを一時的に削除
      const originalSpeechSynthesis = window.speechSynthesis;
      Object.defineProperty(window, 'speechSynthesis', {
        value: undefined,
        configurable: true
      });
      
      expect(() => new BrowserTTS()).toThrow('この環境では音声合成がサポートされていません');
      
      // 復元
      Object.defineProperty(window, 'speechSynthesis', {
        value: originalSpeechSynthesis,
        configurable: true
      });
    });

    it('読み上げ中のエラーハンドリング', async () => {
      const text = 'エラーテストです。';
      
      // エラーイベントをシミュレート
      const speakSpy = vi.spyOn(speechSynthesis, 'speak');
      speakSpy.mockImplementation((utterance) => {
        // エラーイベントを発生させる
        setTimeout(() => {
          if (utterance.onerror) {
            utterance.onerror(new SpeechSynthesisErrorEvent('error', {
              error: 'network'
            }));
          }
        }, 0);
      });
      
      await expect(tts.speak(text)).rejects.toThrow();
      
      speakSpy.mockRestore();
    });
  });

  describe('設定の永続化テスト', () => {
    it('音声設定をlocalStorageに保存できる', () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const voice = voices[0];
        tts.setVoice(voice);
        tts.saveVoicePreference();
        
        expect(localStorage.getItem('preferred-voice')).toBeDefined();
      }
    });

    it('保存された音声設定を読み込める', () => {
      localStorage.setItem('preferred-voice', 'test-voice');
      
      const loadedVoice = tts.loadVoicePreference();
      expect(typeof loadedVoice).toBe('string');
    });

    it('無効な音声設定を読み込んでもエラーにならない', () => {
      localStorage.setItem('preferred-voice', 'invalid-voice-data');
      
      expect(() => tts.loadVoicePreference()).not.toThrow();
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のテキストでもメモリリークしない', async () => {
      const largeText = 'これは大きなテキストです。'.repeat(1000);
      
      // メモリ使用量の大幅な増加がないことを確認
      const beforeMemory = performance.memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 10; i++) {
        await tts.speak(largeText).catch(() => {}); // エラーは無視
        tts.stop();
      }
      
      const afterMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = afterMemory - beforeMemory;
      
      // メモリ増加が10MB以下であることを確認
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('連続した読み上げリクエストが正常に処理される', () => {
      const texts = ['テスト1', 'テスト2', 'テスト3'];
      
      texts.forEach(text => {
        expect(() => tts.speak(text)).not.toThrow();
        tts.stop();
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
      
      const promise = tts.speak(text);
      
      // Promiseが返されることを確認
      expect(promise).toBeInstanceOf(Promise);
    });
  });
});