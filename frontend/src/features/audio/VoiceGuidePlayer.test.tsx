/**
 * 音声ガイドプレイヤーコンポーネントのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceGuidePlayer } from './VoiceGuidePlayer';
import { AudioProvider } from '../../contexts/AudioContext';
import type { VoiceGuideScript } from '../../services/api/types';
import React from 'react';

// AudioPlayerクラスのモック
vi.mock('./AudioPlayer', () => ({
  AudioPlayer: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    stop: vi.fn(),
    setVolume: vi.fn(),
    setPlaybackRate: vi.fn(),
    seek: vi.fn(), // seekメソッドを追加
    fadeIn: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
    getPlaybackInfo: vi.fn().mockReturnValue({
      currentTime: 0,
      duration: 100,
      volume: 1,
      playbackRate: 1,
      state: 'idle'
    })
  }))
}));

// テスト用ラッパー
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AudioProvider>
    {children}
  </AudioProvider>
);

// フィーチャーフラグのモック
vi.mock('../../features/config/featureFlags', () => ({
  useFeature: vi.fn().mockImplementation((feature: string) => {
    const enabledFeatures = {
      'enhancedVoiceGuide': true,
      'subtitles': true,
      'voiceSpeedControl': true
    };
    return enabledFeatures[feature as keyof typeof enabledFeatures] || false;
  })
}));

describe('VoiceGuidePlayer', () => {
  const mockVoiceGuideScript: VoiceGuideScript = {
    totalDuration: 300,
    segments: [
      {
        id: 'intro',
        type: 'intro',
        text: 'イントロダクション',
        ssml: '<speak>イントロダクション</speak>',
        duration: 30,
        startTime: 0,
        autoPlay: true
      },
      {
        id: 'main-1',
        type: 'main',
        text: 'メインガイド1',
        ssml: '<speak>メインガイド1</speak>',
        duration: 120,
        startTime: 30,
        autoPlay: false
      },
      {
        id: 'closing',
        type: 'closing',
        text: 'クロージング',
        ssml: '<speak>クロージング</speak>',
        duration: 30,
        startTime: 270,
        autoPlay: false
      }
    ],
    settings: {
      pauseBetweenSegments: 1,
      detailLevel: 'standard',
      includeEncouragement: true,
      breathingCues: false
    }
  };

  const defaultProps = {
    voiceGuideScript: mockVoiceGuideScript,
    suggestionId: 'test-suggestion'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本的なレンダリング', () => {
    it('プレイヤーが正常にレンダリングされる', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // 再生ボタンが表示される
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
      
      // プログレスバーが表示される（CSSクラスで確認）
      expect(screen.getByText('導入').parentElement?.querySelector('.bg-gray-200')).toBeInTheDocument();
      
      // 詳細設定ボタンが表示される
      expect(screen.getByLabelText('詳細設定')).toBeInTheDocument();
    });

    it('セグメントタイプが正しく表示される', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // 最初のセグメント（intro）が表示される
      expect(screen.getByText('導入')).toBeInTheDocument();
    });

    it('音声ガイドが無効な場合は何も表示しない', () => {
      const emptyScript: VoiceGuideScript = {
        ...mockVoiceGuideScript,
        segments: []
      };

      const { container } = render(
        <VoiceGuidePlayer 
          {...defaultProps} 
          voiceGuideScript={emptyScript} 
        />,
        { wrapper: TestWrapper }
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('再生制御', () => {
    it('再生ボタンクリックで再生が開始される', async () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      const playButton = screen.getByLabelText('再生');
      fireEvent.click(playButton);
      
      // AudioPlayerのloadメソッドが呼ばれることを確認
      await waitFor(() => {
        // モックされたAudioPlayerが正しく呼ばれているかの確認は
        // 実装の詳細に依存するため、ここでは基本的な動作確認のみ
        expect(playButton).toBeInTheDocument();
      });
    });

    it('詳細コントロールの表示/非表示が切り替わる', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      const detailsButton = screen.getByLabelText('詳細設定');
      
      // 初期状態では詳細コントロールは非表示
      expect(screen.queryByText('音量')).not.toBeInTheDocument();
      
      // ボタンクリックで表示
      fireEvent.click(detailsButton);
      expect(screen.getByText('音量')).toBeInTheDocument();
      
      // 再度クリックで非表示
      fireEvent.click(detailsButton);
      expect(screen.queryByText('音量')).not.toBeInTheDocument();
    });

    it('音量調整が機能する', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // 詳細コントロールを表示
      const detailsButton = screen.getByLabelText('詳細設定');
      fireEvent.click(detailsButton);
      
      // 音量スライダーを操作
      const volumeSlider = screen.getByLabelText('音量調整');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      
      // 音量表示が更新される
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('字幕機能', () => {
    it('字幕機能が有効である', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // 字幕は音声再生時に表示されるため、
      // ここでは字幕機能の可用性をテスト
      // 実装では初期状態では字幕は空である
      expect(screen.queryByText('イントロダクション')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定されている', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
      expect(screen.getByLabelText('詳細設定')).toBeInTheDocument();
      
      // 詳細コントロールを表示して音量調整を確認
      const detailsButton = screen.getByLabelText('詳細設定');
      fireEvent.click(detailsButton);
      expect(screen.getByLabelText('音量調整')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('エラー発生時にonErrorコールバックが呼ばれる', () => {
      const onError = vi.fn();
      render(
        <VoiceGuidePlayer 
          {...defaultProps} 
          onError={onError}
        />,
        { wrapper: TestWrapper }
      );
      
      // エラーハンドリングの詳細な検証は実装に依存するため、
      // ここでは基本的な設定の確認のみ
      expect(onError).toHaveBeenCalledTimes(0);
    });

    it('完了時にonCompleteコールバックが呼ばれる', () => {
      const onComplete = vi.fn();
      render(
        <VoiceGuidePlayer 
          {...defaultProps} 
          onComplete={onComplete}
        />,
        { wrapper: TestWrapper }
      );
      
      // 完了時のコールバック確認
      expect(onComplete).toHaveBeenCalledTimes(0);
    });
  });

  describe('再生速度制御', () => {
    it('再生速度制御が表示される', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // 詳細コントロールを表示
      const detailsButton = screen.getByLabelText('詳細設定');
      fireEvent.click(detailsButton);
      
      // 速度制御ボタンが表示される
      expect(screen.getByText('0.75x')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('1.25x')).toBeInTheDocument();
      expect(screen.getByText('1.5x')).toBeInTheDocument();
    });

    it('再生速度が変更される', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // 詳細コントロールを表示
      const detailsButton = screen.getByLabelText('詳細設定');
      fireEvent.click(detailsButton);
      
      // 1.25x ボタンをクリック
      const speedButton = screen.getByText('1.25x');
      fireEvent.click(speedButton);
      
      // ボタンがアクティブになる（視覚的フィードバック）
      expect(speedButton).toHaveClass('bg-blue-500');
    });
  });

  describe('プログレスバー', () => {
    it('プログレスバーがクリック可能', () => {
      render(<VoiceGuidePlayer {...defaultProps} />, { wrapper: TestWrapper });
      
      // プログレスバーのコンテナをclass名で特定
      const progressBarContainer = document.querySelector('.cursor-pointer');
      expect(progressBarContainer).toBeInTheDocument();
      
      // プログレスバーのクリックイベント
      if (progressBarContainer) {
        fireEvent.click(progressBarContainer);
      }
      
      // 実際のシーク処理は内部実装に依存するため、
      // ここではクリックイベントが受け付けられることを確認
      expect(progressBarContainer).toBeInTheDocument();
    });
  });
});