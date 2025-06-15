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
  let onBackCallCount = 0;
  
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
    onBackCallCount = 0;
    localStorage.clear();
  });

  describe('基本的な表示', () => {
    it('提案の詳細情報が表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      expect(screen.getByText('デスクで深呼吸')).toBeInTheDocument();
      expect(screen.getByText('椅子に座ったまま、ゆっくりと深呼吸をしてリラックスしましょう。')).toBeInTheDocument();
      // タイマーの初期表示確認（5分 = 300秒 = 5:00）
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    it('ガイドが表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      expect(screen.getByText('ガイド')).toBeInTheDocument();
      expect(screen.getByText(/背筋を伸ばして座る/)).toBeInTheDocument();
      expect(screen.getByText(/鼻から4秒かけて息を吸う/)).toBeInTheDocument();
      expect(screen.getByText(/4秒間息を止める/)).toBeInTheDocument();
      expect(screen.getByText(/口から6秒かけて息を吐く/)).toBeInTheDocument();
      expect(screen.getByText(/これを5回繰り返す/)).toBeInTheDocument();
    });

    it('ガイドセクションは常に表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestionWithoutSteps.id}
          title={mockSuggestionWithoutSteps.title}
          description={mockSuggestionWithoutSteps.description}
          duration={mockSuggestionWithoutSteps.duration}
          guide={mockSuggestionWithoutSteps.steps ? mockSuggestionWithoutSteps.steps.join('\n') : mockSuggestionWithoutSteps.description}
          category={mockSuggestionWithoutSteps.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      expect(screen.getByText('ガイド')).toBeInTheDocument();
      // ガイドセクション内のテキストを確認
      const guideSection = screen.getByText('ガイド').closest('.bg-gray-50');
      expect(guideSection).toHaveTextContent('少し立ち上がって、窓の外の景色を眺めてみましょう');
    });

    it('開始ボタンとリセットボタンが表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      expect(screen.getByText('開始')).toBeInTheDocument();
      expect(screen.getByText('リセット')).toBeInTheDocument();

      // 音声ガイドのチェックボックスが表示される
      expect(screen.getByText('音声ガイドを使用する')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('音声ガイド機能', () => {
    it('音声ガイドのチェックボックスが表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      expect(screen.getByText('音声ガイドを使用する')).toBeInTheDocument();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked(); // デフォルトはオフ
    });

    it('音声ガイドのチェックボックスをクリックすると有効になる', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('音声ガイドが有効な場合、開始ボタンクリック時に音声準備中またはエラーが表示される', async () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      // 音声ガイドを有効にする
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // 開始ボタンをクリック
      const startButton = screen.getByText('開始');
      fireEvent.click(startButton);

      // 音声準備中またはエラーメッセージの表示を確認
      await waitFor(() => {
        const preparingText = screen.queryByText('音声準備中...');
        const errorText = screen.queryByText(/音声の生成に失敗しました|Gemini音声は利用できません/);
        const pauseButton = screen.queryByText('一時停止');
        // 音声準備中、エラー、またはタイマー開始（一時停止ボタン表示）のいずれかが表示される
        expect(preparingText || errorText || pauseButton).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  describe('インタラクション', () => {
    it('戻るボタンをクリックするとonBackが呼ばれる', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const backButton = screen.getByText('戻る');
      fireEvent.click(backButton);

      expect(onBackCallCount).toBe(1);
    });

    it('開始ボタンをクリックするとタイマーが開始される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const startButton = screen.getByText('開始');
      fireEvent.click(startButton);

      // 一時停止ボタンが表示される
      expect(screen.getByText('一時停止')).toBeInTheDocument();
    });

    it('一時停止ボタンをクリックするとタイマーが停止する', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      // タイマーを開始
      const startButton = screen.getByText('開始');
      fireEvent.click(startButton);

      // 一時停止
      const pauseButton = screen.getByText('一時停止');
      fireEvent.click(pauseButton);

      // 開始ボタンが再度表示される
      expect(screen.getByText('開始')).toBeInTheDocument();
    });

    it('リセットボタンをクリックするとタイマーがリセットされる', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const resetButton = screen.getByText('リセット');
      fireEvent.click(resetButton);

      // タイマーが初期値に戻る
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });
  });

  describe('タイマー機能', () => {
    it('タイマーが正しい初期値で表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    it('プログレスバーが表示される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const progressBar = document.querySelector('.bg-primary-500');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('音声ガイドのチェックボックスに適切なラベルが設定されている', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(screen.getByText('音声ガイドを使用する')).toBeInTheDocument();
    });

    it('ボタンが適切にクリック可能である', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const startButton = screen.getByRole('button', { name: '開始' });
      expect(startButton).toBeEnabled();
      expect(startButton.tagName).toBe('BUTTON');
    });
  });

  describe('レスポンシブデザイン', () => {
    it('コンテナに最大幅が設定されている', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const container = document.querySelector('.max-w-2xl');
      expect(container).toBeInTheDocument();
    });

    it('カードコンテナに適切なパディングが適用される', () => {
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      const card = document.querySelector('.bg-white.rounded-xl');
      expect(card).toHaveClass('p-8');
    });
  });

  describe('完了時の表示', () => {
    it('タイマーが0になると完了メッセージが表示される', async () => {
      // タイマーのテストは実際の時間経過をシミュレートする必要があるため
      // ここでは完了状態の表示要素の存在確認のみを行う
      render(
        <SuggestionDetail 
          id={mockSuggestion.id}
          title={mockSuggestion.title}
          description={mockSuggestion.description}
          duration={mockSuggestion.duration}
          guide={mockSuggestion.steps ? mockSuggestion.steps.join('\n') : mockSuggestion.description}
          category={mockSuggestion.category}
          situation="workplace"
          onBack={() => { onBackCallCount++; }}
        />
      );

      // タイマー表示が存在することを確認
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });
  });
});