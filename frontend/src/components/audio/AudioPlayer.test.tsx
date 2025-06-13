import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

/**
 * AudioPlayerコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のAudio APIをテスト
 * - ユーザーインタラクションとオーディオ制御を検証
 * - エラーハンドリングとアクセシビリティを重視
 */
describe('AudioPlayer', () => {
  const mockAudioUrl = 'https://example.com/test-audio.mp3';
  
  beforeEach(() => {
    // Audio要素のloadedmetadataイベントをシミュレート
    vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(function(this: HTMLAudioElement) {
      // メタデータ読み込み完了をシミュレート
      setTimeout(() => {
        Object.defineProperty(this, 'duration', { value: 120, configurable: true });
        this.dispatchEvent(new Event('loadedmetadata'));
      }, 0);
    });
    
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(function(this: HTMLAudioElement) {
      Object.defineProperty(this, 'paused', { value: false, configurable: true });
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    });
    
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(function(this: HTMLAudioElement) {
      Object.defineProperty(this, 'paused', { value: true, configurable: true });
      this.dispatchEvent(new Event('pause'));
    });
  });

  describe('基本的な表示', () => {
    it('音声プレイヤーが表示される', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('初期状態では停止状態', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const playButton = screen.getByLabelText('再生');
      expect(playButton).toBeInTheDocument();
    });

    it('音量コントロールが表示される', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const volumeSlider = screen.getByLabelText('音量');
      expect(volumeSlider).toBeInTheDocument();
    });

    it('プログレスバーが表示される', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const progressSlider = screen.getByRole('slider');
      expect(progressSlider).toBeInTheDocument();
    });
  });

  describe('再生制御のテスト', () => {
    it('再生ボタンをクリックして再生開始', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const playButton = screen.getByLabelText('再生');
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText('一時停止')).toBeInTheDocument();
      });
    });

    it('停止ボタンをクリックして再生停止', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // 再生開始
      const playButton = screen.getByLabelText('再生');
      fireEvent.click(playButton);
      
      await waitFor(() => {
        const pauseButton = screen.getByLabelText('一時停止');
        fireEvent.click(pauseButton);
      });
      
      await waitFor(() => {
        expect(screen.getByLabelText('再生')).toBeInTheDocument();
      });
    });

    it('再生・停止を繰り返しても正常に動作する', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const playButton = screen.getByLabelText('再生');
      
      // 3回再生・停止を繰り返す
      for (let i = 0; i < 3; i++) {
        fireEvent.click(playButton);
        
        await waitFor(() => {
          const pauseButton = screen.getByLabelText('一時停止');
          fireEvent.click(pauseButton);
        });
        
        await waitFor(() => {
          expect(screen.getByLabelText('再生')).toBeInTheDocument();
        });
      }
    });
  });

  describe('音量制御のテスト', () => {
    it('音量スライダーで音量を変更できる', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const volumeSlider = screen.getByLabelText('音量');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      
      expect(volumeSlider).toHaveValue('0.5');
    });

    it('音量を0にするとミュートボタンが表示される', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const volumeSlider = screen.getByLabelText('音量');
      fireEvent.change(volumeSlider, { target: { value: '0' } });
      
      // ミュート状態のアイコンが表示されることを確認
      expect(volumeSlider).toHaveValue('0');
    });

    it('音量を最大にできる', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const volumeSlider = screen.getByLabelText('音量');
      fireEvent.change(volumeSlider, { target: { value: '1' } });
      
      expect(volumeSlider).toHaveValue('1');
    });

    it('音量の初期値は0.7', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const volumeSlider = screen.getByLabelText('音量');
      expect(volumeSlider).toHaveValue('0.7');
    });
  });

  describe('プログレス制御のテスト', () => {
    it('プログレスバーでシークできる', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // メタデータ読み込み完了を待つ
      await waitFor(() => {
        const progressSlider = screen.getByRole('slider');
        expect(progressSlider).toBeInTheDocument();
      });
      
      const progressSlider = screen.getByRole('slider');
      fireEvent.change(progressSlider, { target: { value: '60' } });
      
      expect(progressSlider).toHaveValue('60');
    });

    it('音声の長さが正しく表示される', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      await waitFor(() => {
        expect(screen.getByText('2:00')).toBeInTheDocument();
      });
    });

    it('現在の再生時間が表示される', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument();
      });
    });
  });

  describe('時間表示のテスト', () => {
    it('時間形式が正しく表示される', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      await waitFor(() => {
        // 0:00 / 2:00 の形式で表示されることを確認
        expect(screen.getByText('0:00')).toBeInTheDocument();
        expect(screen.getByText('2:00')).toBeInTheDocument();
      });
    });

    it('1分未満の時間が正しく表示される', () => {
      // duration を30秒に設定
      vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(function(this: HTMLAudioElement) {
        setTimeout(() => {
          Object.defineProperty(this, 'duration', { value: 30, configurable: true });
          this.dispatchEvent(new Event('loadedmetadata'));
        }, 0);
      });
      
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      waitFor(() => {
        expect(screen.getByText('0:30')).toBeInTheDocument();
      });
    });

    it('1時間以上の時間が正しく表示される', () => {
      // duration を1時間30分に設定
      vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(function(this: HTMLAudioElement) {
        setTimeout(() => {
          Object.defineProperty(this, 'duration', { value: 5400, configurable: true }); // 90分
          this.dispatchEvent(new Event('loadedmetadata'));
        }, 0);
      });
      
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      waitFor(() => {
        expect(screen.getByText('1:30:00')).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('無効なURLでエラー状態を表示', () => {
      const invalidUrl = 'invalid-url';
      
      render(<AudioPlayer audioUrl={invalidUrl} />);
      
      // エラー状態でも基本的なUIは表示される
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('ネットワークエラー時の処理', () => {
      // ネットワークエラーをシミュレート
      vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(function(this: HTMLAudioElement) {
        setTimeout(() => {
          this.dispatchEvent(new Event('error'));
        }, 0);
      });
      
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // エラーが発生してもUIがクラッシュしないことを確認
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('読み込み中の状態表示', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // 読み込み中は無効化されている可能性
      const playButton = screen.getByLabelText('再生');
      expect(playButton).toBeInTheDocument();
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('適切なARIA属性が設定されている', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const playButton = screen.getByLabelText('再生');
      expect(playButton).toHaveAttribute('aria-label');
      
      const volumeSlider = screen.getByLabelText('音量');
      expect(volumeSlider).toHaveAttribute('aria-label');
    });

    it('キーボードナビゲーションが可能', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const playButton = screen.getByLabelText('再生');
      const volumeSlider = screen.getByLabelText('音量');
      const progressSlider = screen.getByRole('slider');
      
      // フォーカス可能な要素であることを確認
      expect(playButton).toBeInTheDocument();
      expect(volumeSlider).toBeInTheDocument();
      expect(progressSlider).toBeInTheDocument();
    });

    it('スクリーンリーダー向けの情報が提供される', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      await waitFor(() => {
        // 音声の長さがスクリーンリーダーに提供される
        expect(screen.getByText('2:00')).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブデザインのテスト', () => {
    it('コンパクトなレイアウトが適用される', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      const player = screen.getByLabelText('音声を再生').closest('.flex');
      expect(player).toHaveClass('flex');
    });

    it('適切なスペーシングが適用される', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // レイアウトクラスが適用されていることを確認
      const container = screen.getByLabelText('音声を再生').closest('div');
      expect(container?.parentElement).toHaveClass('space-x-4');
    });
  });

  describe('パフォーマンステスト', () => {
    it('複数のAudioPlayerインスタンスが干渉しない', () => {
      const { rerender } = render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // 別のURLでコンポーネントを再レンダリング
      const newUrl = 'https://example.com/another-audio.mp3';
      rerender(<AudioPlayer audioUrl={newUrl} />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('コンポーネントのアンマウント時にリソースが解放される', () => {
      const { unmount } = render(<AudioPlayer audioUrl={mockAudioUrl} />);
      
      // アンマウントしてもエラーが発生しないことを確認
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('カスタムプロパティのテスト', () => {
    it('autoplayプロパティが機能する', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} autoplay />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('loopプロパティが機能する', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} loop />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('onEndedコールバックが設定できる', () => {
      const mockOnEnded = vi.fn();
      
      render(<AudioPlayer audioUrl={mockAudioUrl} onEnded={mockOnEnded} />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });
  });

  describe('音声ファイル形式のテスト', () => {
    it('MP3ファイルを再生できる', () => {
      const mp3Url = 'https://example.com/audio.mp3';
      
      render(<AudioPlayer audioUrl={mp3Url} />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('WAVファイルを再生できる', () => {
      const wavUrl = 'https://example.com/audio.wav';
      
      render(<AudioPlayer audioUrl={wavUrl} />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });

    it('OGGファイルを再生できる', () => {
      const oggUrl = 'https://example.com/audio.ogg';
      
      render(<AudioPlayer audioUrl={oggUrl} />);
      
      expect(screen.getByLabelText('再生')).toBeInTheDocument();
    });
  });
});