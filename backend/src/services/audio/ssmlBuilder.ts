/**
 * SSML (Speech Synthesis Markup Language) ビルダー
 * Google Cloud Text-to-Speech用の自然な音声生成
 */

export interface SSMLBuilderOptions {
  voice?: {
    languageCode: string;
    name?: string;
    gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig?: {
    speakingRate?: number; // 0.25-4.0
    pitch?: number; // -20.0-20.0 (semitones)
    volumeGainDb?: number; // -96.0-16.0
  };
}

export class SSMLBuilder {
  private content: string = '';
  private options: SSMLBuilderOptions;

  constructor(options: SSMLBuilderOptions = {}) {
    this.options = {
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Wavenet-A',
        gender: 'FEMALE',
        ...options.voice
      },
      audioConfig: {
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
        ...options.audioConfig
      }
    };
  }

  /**
   * SSML文書を開始
   */
  start(): SSMLBuilder {
    this.content = '<speak>';
    return this;
  }

  /**
   * テキストを追加（エスケープ付き）
   */
  addText(text: string): SSMLBuilder {
    this.content += this.escapeSSML(text);
    return this;
  }

  /**
   * ポーズ（間）を追加
   */
  addPause(duration: string): SSMLBuilder {
    this.content += `<break time="${duration}"/>`;
    return this;
  }

  /**
   * 強調を追加
   */
  addEmphasis(text: string, level: 'strong' | 'moderate' | 'reduced' = 'moderate'): SSMLBuilder {
    this.content += `<emphasis level="${level}">${this.escapeSSML(text)}</emphasis>`;
    return this;
  }

  /**
   * 韻律（話速、音の高さ、音量）を調整
   */
  addProsody(text: string, options: {
    rate?: string; // x-slow, slow, medium, fast, x-fast, または %
    pitch?: string; // x-low, low, medium, high, x-high, または Hz/st
    volume?: string; // silent, x-soft, soft, medium, loud, x-loud, または dB
  }): SSMLBuilder {
    const attrs = Object.entries(options)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    this.content += `<prosody ${attrs}>${this.escapeSSML(text)}</prosody>`;
    return this;
  }

  /**
   * 段落を追加
   */
  addParagraph(text: string): SSMLBuilder {
    this.content += `<p>${this.escapeSSML(text)}</p>`;
    return this;
  }

  /**
   * 文を追加
   */
  addSentence(text: string): SSMLBuilder {
    this.content += `<s>${this.escapeSSML(text)}</s>`;
    return this;
  }

  /**
   * 発音を指定
   */
  addPhoneme(text: string, ph: string): SSMLBuilder {
    this.content += `<phoneme ph="${ph}">${this.escapeSSML(text)}</phoneme>`;
    return this;
  }

  /**
   * 音声を交代
   */
  addVoice(text: string, name: string): SSMLBuilder {
    this.content += `<voice name="${name}">${this.escapeSSML(text)}</voice>`;
    return this;
  }

  /**
   * SSML文書を終了
   */
  end(): SSMLBuilder {
    this.content += '</speak>';
    return this;
  }

  /**
   * 最終的なSSMLを取得
   */
  build(): string {
    if (!this.content.endsWith('</speak>')) {
      this.end();
    }
    return this.content;
  }

  /**
   * SSML文字のエスケープ
   */
  private escapeSSML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 音声設定を取得
   */
  getVoiceConfig() {
    return this.options;
  }

  /**
   * リセット
   */
  reset(): SSMLBuilder {
    this.content = '';
    return this;
  }
}

/**
 * 日本語音声専用の最適化されたSSMLビルダー
 */
export class JapaneseSSMLOptimizer extends SSMLBuilder {
  constructor(options: SSMLBuilderOptions = {}) {
    super({
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Wavenet-A', // 自然な女性音声
        gender: 'FEMALE',
        ...options.voice
      },
      audioConfig: {
        speakingRate: 0.9, // 少しゆっくり
        pitch: 0.0,
        volumeGainDb: 0.0,
        ...options.audioConfig
      }
    });
  }

  /**
   * 呼吸指示を追加（日本語最適化）
   */
  addBreathingCue(instruction: string, duration: string = '1s'): JapaneseSSMLOptimizer {
    this.addEmphasis(instruction, 'moderate')
      .addPause(duration);
    return this;
  }

  /**
   * カウントダウンを追加（呼吸用）
   */
  addCountdown(count: number, interval: string = '1s'): JapaneseSSMLOptimizer {
    for (let i = count; i > 0; i--) {
      this.addProsody(i.toString(), { rate: 'slow' })
        .addPause(interval);
    }
    return this;
  }

  /**
   * 励ましの言葉を追加（温かいトーンで）
   */
  addEncouragement(text: string): JapaneseSSMLOptimizer {
    this.addProsody(text, { 
      rate: 'medium', 
      pitch: 'medium',
      volume: 'medium' 
    })
    .addPause('0.5s');
    return this;
  }

  /**
   * ガイダンスの区切りを追加
   */
  addSectionBreak(message: string = 'それでは次に進みましょう'): JapaneseSSMLOptimizer {
    this.addPause('1s')
      .addProsody(message, { rate: 'medium' })
      .addPause('1.5s');
    return this;
  }

  /**
   * 瞑想・リラクゼーション用の自然なポーズパターン
   */
  addMeditationPause(type: 'short' | 'medium' | 'long' = 'medium'): JapaneseSSMLOptimizer {
    const durations = {
      short: '2s',
      medium: '4s',
      long: '8s'
    };
    this.addPause(durations[type]);
    return this;
  }

  /**
   * 時間指示を自然な日本語で追加
   */
  addTimeInstruction(seconds: number): JapaneseSSMLOptimizer {
    let timeText = '';
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      timeText = `${minutes}分`;
      if (remainingSeconds > 0) {
        timeText += `${remainingSeconds}秒`;
      }
    } else {
      timeText = `${seconds}秒`;
    }
    
    this.addText(`${timeText}間、`)
      .addPause('0.5s');
    return this;
  }
}

/**
 * 気晴らし用音声ガイド専用ビルダー
 */
export class RelaxationGuideBuilder extends JapaneseSSMLOptimizer {
  /**
   * イントロセクションを作成
   */
  createIntro(title: string, duration: number): string {
    this.start()
      .addText('それでは、')
      .addEmphasis(title, 'moderate')
      .addText('を始めましょう。')
      .addPause('1s');
    
    // 時間指示を追加
    this.addTimeInstruction(duration);
    
    this.addText('ゆっくりとリラックスして行いましょう。')
      .addPause('2s');
      
    return this.build();
  }

  /**
   * メインガイドセクションを作成
   */
  createMainGuide(steps: string[]): string {
    this.reset().start();
    
    steps.forEach((step, index) => {
      if (index > 0) {
        this.addSectionBreak();
      }
      
      this.addText(`ステップ${index + 1}です。`)
        .addPause('1s')
        .addText(step)
        .addPause('2s');
    });
    
    return this.build();
  }

  /**
   * 励ましセクションを作成
   */
  createEncouragement(): string {
    const encouragements = [
      'とても良くできています。',
      'このまま続けましょう。',
      'リラックスできていますね。',
      'あと少しです、頑張りましょう。'
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    this.reset().start();
    this.addEncouragement(randomEncouragement);
    return this.build();
  }

  /**
   * 締めくくりセクションを作成
   */
  createClosing(): string {
    return this.reset()
      .start()
      .addText('お疲れさまでした。')
      .addPause('1s')
      .addText('気持ちが少しでも軽くなったでしょうか。')
      .addPause('1s')
      .addText('またいつでも、お気軽にご利用ください。')
      .addPause('2s')
      .build();
  }
}