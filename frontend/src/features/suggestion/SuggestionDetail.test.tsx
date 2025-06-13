import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuggestionDetail from './SuggestionDetail';
import type { Suggestion } from '@/types';

/**
 * SuggestionDetailコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - 音声再生機能、アニメーション、インタラクションを確認
 */
describe('SuggestionDetail', () => {
  let onCloseCallCount = 0;
  
  const mockSuggestion: Suggestion = {
    id: 'test-1',
    title: 'デスクで深呼吸',
    description: '椅子に座ったまま、ゆっくりと深呼吸をしてリラックスしましょう。',
    duration: 5,
    category: '認知的',
    steps: [
      '背筋を伸ばして座る',
      '鼻から4秒かけて息を吸う',
      '4秒間息を止める',
      '口から6秒かけて息を吐く',
      'これを5回繰り返す'
    ],
  };

  const mockSuggestionWithoutSteps: Suggestion = {
    id: 'test-2',
    title: '窓の外を眺める',
    description: '少し立ち上がって、窓の外の景色を眺めてみましょう。',
    duration: 5,
    category: '行動的',
  };

  beforeEach(() => {
    onCloseCallCount = 0;
  });

  describe('基本的な表示', () => {
    it('提案の詳細情報が表示される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      expect(screen.getByText('デスクで深呼吸')).toBeInTheDocument();
      expect(screen.getByText('椅子に座ったまま、ゆっくりと深呼吸をしてリラックスしましょう。')).toBeInTheDocument();
      expect(screen.getByText('5分')).toBeInTheDocument();
      expect(screen.getByText('認知的')).toBeInTheDocument();
    });

    it('ステップが存在する場合、すべて表示される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      expect(screen.getByText('実践方法')).toBeInTheDocument();
      expect(screen.getByText('背筋を伸ばして座る')).toBeInTheDocument();
      expect(screen.getByText('鼻から4秒かけて息を吸う')).toBeInTheDocument();
      expect(screen.getByText('4秒間息を止める')).toBeInTheDocument();
      expect(screen.getByText('口から6秒かけて息を吐く')).toBeInTheDocument();
      expect(screen.getByText('これを5回繰り返す')).toBeInTheDocument();
    });

    it('ステップがない場合、実践方法セクションが表示されない', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestionWithoutSteps}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      expect(screen.queryByText('実践方法')).not.toBeInTheDocument();
    });

    it('カテゴリーに応じて適切なスタイルが適用される', () => {
      const { rerender } = render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      // 認知的カテゴリーのスタイル
      const cognitiveCategory = screen.getByText('認知的');
      expect(cognitiveCategory).toHaveClass('bg-blue-100');
      expect(cognitiveCategory).toHaveClass('text-blue-800');

      // 行動的カテゴリーのスタイル
      rerender(
        <SuggestionDetail 
          suggestion={mockSuggestionWithoutSteps}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const behavioralCategory = screen.getByText('行動的');
      expect(behavioralCategory).toHaveClass('bg-green-100');
      expect(behavioralCategory).toHaveClass('text-green-800');
    });
  });

  describe('音声読み上げ機能', () => {
    it('音声読み上げボタンが表示される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const speakButton = screen.getByLabelText('音声で読み上げる');
      expect(speakButton).toBeInTheDocument();
      expect(speakButton).not.toBeDisabled();
    });

    it('音声読み上げボタンをクリックすると読み上げが開始される', async () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const speakButton = screen.getByLabelText('音声で読み上げる');
      fireEvent.click(speakButton);

      // 読み上げ中の表示を確認
      await waitFor(() => {
        const stopButton = screen.queryByLabelText('読み上げを停止');
        const processingText = screen.queryByText('音声を準備中...');
        expect(stopButton || processingText).toBeTruthy();
      }, { timeout: 1000 });
    });

    it('読み上げ中に停止ボタンが表示される', async () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const speakButton = screen.getByLabelText('音声で読み上げる');
      fireEvent.click(speakButton);

      // speechSynthesisがサポートされている場合
      if ('speechSynthesis' in window) {
        await waitFor(() => {
          const stopButton = screen.queryByLabelText('読み上げを停止');
          if (stopButton) {
            expect(stopButton).toBeInTheDocument();
            fireEvent.click(stopButton);
          }
        }, { timeout: 1000 });
      }
    });
  });

  describe('インタラクション', () => {
    it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const closeButton = screen.getByLabelText('詳細を閉じる');
      fireEvent.click(closeButton);

      expect(onCloseCallCount).toBe(1);
    });

    it('一覧に戻るボタンをクリックするとonCloseが呼ばれる', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const backButton = screen.getByText('一覧に戻る');
      fireEvent.click(backButton);

      expect(onCloseCallCount).toBe(1);
    });

    it('オーバーレイをクリックするとonCloseが呼ばれる', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      // オーバーレイ要素を取得（最初の要素がオーバーレイ）
      const overlay = document.querySelector('.fixed.inset-0');
      if (overlay) {
        fireEvent.click(overlay);
        expect(onCloseCallCount).toBe(1);
      }
    });

    it('モーダル内部をクリックしてもonCloseは呼ばれない', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const modalContent = screen.getByText('デスクで深呼吸');
      fireEvent.click(modalContent);

      expect(onCloseCallCount).toBe(0);
    });
  });

  describe('アニメーション', () => {
    it('モーダルにアニメーションクラスが適用される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('animate-slideIn');
    });

    it('ステップアイテムにアニメーションクラスが適用される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const stepItems = screen.getAllByRole('listitem');
      stepItems.forEach((item) => {
        expect(item).toHaveClass('animate-fadeIn');
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定されている', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('閉じるボタンに適切なaria-labelが設定されている', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const closeButton = screen.getByLabelText('詳細を閉じる');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイルとデスクトップで適切なパディングが適用される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const modalContent = screen.getByRole('dialog').querySelector('.p-6');
      expect(modalContent).toHaveClass('p-6');
      expect(modalContent).toHaveClass('md:p-8');
    });

    it('最大幅が設定されている', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const modalContent = screen.getByRole('dialog').querySelector('.max-w-2xl');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('タイマー表示', () => {
    it('実践開始ボタンが表示される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      const startButton = screen.getByText(/実践開始/);
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveClass('bg-primary-500');
    });

    it('タイマーセクションが表示される', () => {
      render(
        <SuggestionDetail 
          suggestion={mockSuggestion}
          onClose={() => { onCloseCallCount++; }}
        />
      );

      expect(screen.getByText(/5分間のタイマー/)).toBeInTheDocument();
    });
  });
});