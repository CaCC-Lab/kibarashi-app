/**
 * ブラウザ内蔵のWeb Speech APIを使用した音声合成サービス
 * 完全無料で、追加の設定不要
 */

export interface BrowserTTSOptions {
  text: string;
  rate?: number;      // 速度 (0.1 - 10)
  pitch?: number;     // 音程 (0 - 2)
  volume?: number;    // 音量 (0 - 1)
  lang?: string;      // 言語
}

class BrowserTTSService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    // 音声が読み込まれるのを待つ
    if (this.synthesis.getVoices().length > 0) {
      this.voices = this.synthesis.getVoices();
    } else {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis.getVoices();
      });
    }
  }

  /**
   * 利用可能かチェック
   */
  isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * 日本語音声を取得
   */
  getJapaneseVoice(): SpeechSynthesisVoice | null {
    // 日本語の音声を探す（優先順位付き）
    const jaVoices = this.voices.filter(voice => voice.lang.includes('ja'));
    
    // Google日本語を優先
    const googleJa = jaVoices.find(voice => voice.name.includes('Google'));
    if (googleJa) return googleJa;
    
    // その他の日本語音声
    return jaVoices[0] || null;
  }

  /**
   * テキストを音声で読み上げる
   */
  speak(options: BrowserTTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('ブラウザが音声合成に対応していません'));
        return;
      }

      // 既存の音声を停止
      this.synthesis.cancel();

      // 少し待ってから開始（前の音声の完全な停止を待つ）
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(options.text);
        
        // 日本語音声を設定
        const japaneseVoice = this.getJapaneseVoice();
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }
        
        // オプション設定
        utterance.lang = options.lang || 'ja-JP';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // イベントハンドラー
        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          // interruptedエラーは無視（意図的な停止）
          if (event.error === 'interrupted') {
            resolve();
          } else {
            reject(new Error(`音声合成エラー: ${event.error}`));
          }
        };

        // 読み上げ開始
        this.synthesis.speak(utterance);
      }, 100); // 100ms待機
    });
  }

  /**
   * 音声を停止
   */
  stop() {
    this.synthesis.cancel();
  }

  /**
   * 一時停止
   */
  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * 再開
   */
  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * 再生状態を取得
   */
  get isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  get isPaused(): boolean {
    return this.synthesis.paused;
  }
}

// シングルトンインスタンス
export const browserTTS = new BrowserTTSService();