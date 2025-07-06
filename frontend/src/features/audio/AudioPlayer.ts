/**
 * 音声再生管理クラス
 * HTML5 Audio APIを使用した基本的な音声再生機能
 * 
 * 設計思想：
 * - シンプルで信頼性の高い実装
 * - メモリ効率を考慮
 * - エラーに対する耐性
 */

import type { VoiceSegment } from '../../services/api/types';

/**
 * 音声再生状態
 */
export type AudioPlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/**
 * 再生イベント
 */
export interface AudioPlayerEvents {
  onStateChange?: (state: AudioPlayerState) => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onSegmentEnd?: (segment: VoiceSegment) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * 音声プレイヤークラス
 * 
 * なぜクラスベースか：
 * - 状態管理が複雑
 * - インスタンスごとの独立性が必要
 * - イベント管理の簡潔性
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private state: AudioPlayerState = 'idle';
  private currentSegment: VoiceSegment | null = null;
  private events: AudioPlayerEvents = {};
  private fadeInterval: number | null = null;
  
  constructor(events?: AudioPlayerEvents) {
    if (events) {
      this.events = events;
    }
  }
  
  /**
   * 状態の更新と通知
   */
  private setState(newState: AudioPlayerState): void {
    this.state = newState;
    this.events.onStateChange?.(newState);
  }
  
  /**
   * 音声セグメントの読み込み
   * 
   * @param source - 音声のURL、Blob、またはBase64データ
   * @param segment - 再生するセグメント情報
   */
  async load(source: string | Blob, segment: VoiceSegment): Promise<void> {
    try {
      this.setState('loading');
      
      // 既存のオーディオをクリーンアップ
      this.cleanup();
      
      // 新しいAudio要素を作成
      this.audio = new Audio();
      this.currentSegment = segment;
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // ソースの設定
      if (source instanceof Blob) {
        const url = URL.createObjectURL(source);
        this.audio.src = url;
        
        // メモリリークを防ぐため、読み込み後にURLを解放
        this.audio.addEventListener('loadeddata', () => {
          URL.revokeObjectURL(url);
        }, { once: true });
      } else {
        this.audio.src = source;
      }
      
      // プリロード設定
      this.audio.preload = 'auto';
      
      // 読み込み開始
      await this.audio.load();
      
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }
  
  /**
   * 再生開始
   */
  async play(): Promise<void> {
    if (!this.audio) {
      throw new Error('No audio loaded');
    }
    
    try {
      await this.audio.play();
      this.setState('playing');
    } catch (error) {
      // ユーザー操作なしでの自動再生がブロックされた場合
      if ((error as any).name === 'NotAllowedError') {
        console.warn('Autoplay blocked. User interaction required.');
        this.setState('paused');
      } else {
        this.handleError(error as Error);
      }
      throw error;
    }
  }
  
  /**
   * 一時停止
   */
  pause(): void {
    if (this.audio && this.state === 'playing') {
      this.audio.pause();
      this.setState('paused');
    }
  }
  
  /**
   * 停止（リセット）
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.setState('idle');
      this.cleanup();
    }
  }
  
  /**
   * 音量設定（0.0 - 1.0）
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * 再生速度設定（0.5 - 2.0）
   */
  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }
  
  /**
   * シーク（秒単位）
   */
  seek(time: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
  }
  
  /**
   * フェードイン
   * 
   * なぜフェードが必要か：
   * - 急な音声開始によるストレスを軽減
   * - より自然な音声体験
   */
  async fadeIn(duration: number = 1000): Promise<void> {
    if (!this.audio) return;
    
    this.audio.volume = 0;
    await this.play();
    
    const startVolume = 0;
    const targetVolume = 1;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    
    let currentStep = 0;
    
    this.fadeInterval = window.setInterval(() => {
      if (!this.audio || currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        return;
      }
      
      currentStep++;
      this.audio.volume = Math.min(startVolume + (volumeStep * currentStep), 1);
    }, stepDuration);
  }
  
  /**
   * フェードアウト
   */
  async fadeOut(duration: number = 1000): Promise<void> {
    if (!this.audio) return;
    
    const startVolume = this.audio.volume;
    const targetVolume = 0;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = (targetVolume - startVolume) / steps;
    
    let currentStep = 0;
    
    return new Promise((resolve) => {
      this.fadeInterval = window.setInterval(() => {
        if (!this.audio || currentStep >= steps) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          this.pause();
          resolve();
          return;
        }
        
        currentStep++;
        this.audio.volume = Math.max(startVolume + (volumeStep * currentStep), 0);
      }, stepDuration);
    });
  }
  
  /**
   * 現在の再生情報を取得
   */
  getPlaybackInfo(): {
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
    state: AudioPlayerState;
  } | null {
    if (!this.audio) return null;
    
    return {
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      volume: this.audio.volume,
      playbackRate: this.audio.playbackRate,
      state: this.state
    };
  }
  
  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (!this.audio) return;
    
    // 読み込み完了
    this.audio.addEventListener('canplaythrough', () => {
      if (this.state === 'loading') {
        this.setState('idle');
      }
    });
    
    // 再生開始
    this.audio.addEventListener('play', () => {
      this.setState('playing');
    });
    
    // 一時停止
    this.audio.addEventListener('pause', () => {
      if (this.state === 'playing') {
        this.setState('paused');
      }
    });
    
    // 再生終了
    this.audio.addEventListener('ended', () => {
      this.setState('idle');
      if (this.currentSegment) {
        this.events.onSegmentEnd?.(this.currentSegment);
      }
      this.events.onComplete?.();
    });
    
    // エラー
    this.audio.addEventListener('error', (e) => {
      const error = new Error(`Audio playback error: ${(e as any).message || 'Unknown error'}`);
      this.handleError(error);
    });
    
    // 進捗更新
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && this.state === 'playing') {
        this.events.onProgress?.(this.audio.currentTime, this.audio.duration || 0);
      }
    });
  }
  
  /**
   * エラーハンドリング
   */
  private handleError(error: Error): void {
    console.error('AudioPlayer error:', error);
    this.setState('error');
    this.events.onError?.(error);
  }
  
  /**
   * リソースのクリーンアップ
   */
  private cleanup(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    if (this.audio) {
      // イベントリスナーを削除（メモリリーク防止）
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    
    this.currentSegment = null;
  }
  
  /**
   * デストラクター
   */
  destroy(): void {
    this.stop();
    this.cleanup();
    this.events = {};
  }
}

/**
 * Web Audio APIを使用した高度な音声処理（将来の拡張用）
 */
export class AdvancedAudioPlayer extends AudioPlayer {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  
  // TODO: Web Audio APIを使用した高度な機能の実装
  // - リアルタイムエフェクト
  // - 空間音響
  // - 高度な音声分析
}