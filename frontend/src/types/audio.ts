/**
 * 音声ガイド関連の型定義
 */

// 音声ガイドセグメント
export interface VoiceSegment {
  id: string;
  text: string;
  duration: number; // 秒
  startTime?: number; // オプション：開始時間
  type: 'intro' | 'main' | 'transition' | 'encouragement' | 'closing';
  ssml?: string; // SSML形式のテキスト
  autoPlay?: boolean; // 自動再生設定
}

// 音声ガイドスクリプト
export interface VoiceGuideScript {
  id: string;
  title: string;
  totalDuration: number; // 総時間（秒）
  segments: VoiceSegment[];
  language: 'ja-JP' | 'en-US';
  voice?: string; // 音声の種類
  settings?: {
    autoPlay?: boolean;
    pauseLength?: number;
    fadeIn?: boolean;
    fadeOut?: boolean;
    showSubtitles?: boolean;
    allowSpeedControl?: boolean;
    pauseBetweenSegments?: number;
  };
}

// 音声ガイドの状態
export interface VoiceGuideState {
  isPlaying: boolean;
  currentSegmentIndex: number;
  currentTime: number;
  totalTime: number;
  volume: number;
  speed: number;
}

// 音声プレイヤーの設定
export interface AudioPlayerConfig {
  autoPlay: boolean;
  loop: boolean;
  volume: number;
  speed: number;
  preload: 'auto' | 'metadata' | 'none';
}

// 音声合成設定
export interface TTSConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

// 音声ガイドイベント
export type VoiceGuideEventType = 
  | 'play'
  | 'pause'
  | 'stop'
  | 'segment_start'
  | 'segment_end'
  | 'complete'
  | 'error';

export interface VoiceGuideEvent {
  type: VoiceGuideEventType;
  timestamp: number;
  segmentId?: string;
  error?: string;
}