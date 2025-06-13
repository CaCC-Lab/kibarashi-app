import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionCard from './SuggestionCard';

/**
 * SuggestionCardコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーインタラクションを実際に再現
 * - アクセシビリティも含めてテスト
 */
describe('SuggestionCard', () => {
  // コールバック関数の呼び出し回数を追跡
  let startCount = 0;
  const onStart = () => { startCount++; };

  beforeEach(() => {
    startCount = 0;
  });

  describe('基本的な表示のテスト', () => {
    it('提案の情報を正しく表示する', () => {
      render(
        <SuggestionCard 
          id="test-1"
          title="デスクストレッチ"
          description="椅子に座ったまま簡単にできるストレッチ"
          duration={5}
          category="行動的"
          onStart={onStart}
        />
      );
      
      // タイトルと説明の表示確認
      expect(screen.getByText('デスクストレッチ')).toBeInTheDocument();
      expect(screen.getByText('椅子に座ったまま簡単にできるストレッチ')).toBeInTheDocument();
      
      // 時間の表示確認（アイコンと一緒に表示される）
      expect(screen.getByText('5分')).toBeInTheDocument();
      
      // カテゴリの表示確認
      expect(screen.getByText('行動的')).toBeInTheDocument();
      
      // 開始ボタンの確認
      expect(screen.getByText('この気晴らしを始める')).toBeInTheDocument();
    });

    it('認知的カテゴリの提案を正しく表示する', () => {
      render(
        <SuggestionCard 
          id="test-2"
          title="深呼吸"
          description="リラックスのための呼吸法"
          duration={3}
          category="認知的"
          onStart={onStart}
        />
      );
      
      expect(screen.getByText('認知的')).toBeInTheDocument();
      // 青色系のスタイルが適用されていることを確認
      const categoryElement = screen.getByText('認知的').parentElement?.parentElement;
      expect(categoryElement?.className).toContain('bg-blue-50');
      expect(categoryElement?.className).toContain('border-blue-200');
    });

    it('行動的カテゴリの提案を正しく表示する', () => {
      render(
        <SuggestionCard 
          id="test-3"
          title="軽い運動"
          description="デスク周りでできる簡単な運動"
          duration={10}
          category="行動的"
          onStart={onStart}
        />
      );
      
      expect(screen.getByText('行動的')).toBeInTheDocument();
      // 緑色系のスタイルが適用されていることを確認
      const categoryElement = screen.getByText('行動的').parentElement?.parentElement;
      expect(categoryElement?.className).toContain('bg-green-50');
      expect(categoryElement?.className).toContain('border-green-200');
    });
  });

  describe('ステップ表示機能のテスト', () => {
    const steps = [
      '両手を頭の後ろで組む',
      'ゆっくりと背筋を伸ばす',
      '5秒間キープする',
      'ゆっくりと元に戻す'
    ];

    it('ステップがある場合、ステップ数を表示する', () => {
      render(
        <SuggestionCard 
          id="test-4"
          title="ストレッチ"
          description="簡単なストレッチ"
          duration={5}
          category="行動的"
          steps={steps}
          onStart={onStart}
        />
      );
      
      expect(screen.getByText('4ステップ')).toBeInTheDocument();
      expect(screen.getByText('4つの手順を見る')).toBeInTheDocument();
    });

    it('ステップの展開・折りたたみが機能する', () => {
      render(
        <SuggestionCard 
          id="test-5"
          title="ストレッチ"
          description="簡単なストレッチ"
          duration={5}
          category="行動的"
          steps={steps}
          onStart={onStart}
        />
      );
      
      // 初期状態ではステップは非表示
      expect(screen.queryByText('両手を頭の後ろで組む')).not.toBeInTheDocument();
      
      // 展開ボタンをクリック
      const expandButton = screen.getByText('4つの手順を見る');
      fireEvent.click(expandButton);
      
      // ステップが表示される
      expect(screen.getByText('両手を頭の後ろで組む')).toBeInTheDocument();
      expect(screen.getByText('ゆっくりと背筋を伸ばす')).toBeInTheDocument();
      expect(screen.getByText('5秒間キープする')).toBeInTheDocument();
      expect(screen.getByText('ゆっくりと元に戻す')).toBeInTheDocument();
      
      // ボタンテキストが変わる
      expect(screen.getByText('手順を隠す')).toBeInTheDocument();
      
      // 再度クリックで折りたたむ
      fireEvent.click(screen.getByText('手順を隠す'));
      expect(screen.queryByText('両手を頭の後ろで組む')).not.toBeInTheDocument();
    });

    it('ステップがない場合、ステップセクションを表示しない', () => {
      render(
        <SuggestionCard 
          id="test-6"
          title="瞑想"
          description="静かに目を閉じて"
          duration={5}
          category="認知的"
          onStart={onStart}
        />
      );
      
      expect(screen.queryByText(/ステップ/)).not.toBeInTheDocument();
      expect(screen.queryByText(/手順を見る/)).not.toBeInTheDocument();
    });
  });

  describe('インタラクションのテスト', () => {
    it('開始ボタンをクリックするとonStartが呼ばれる', () => {
      render(
        <SuggestionCard 
          id="test-7"
          title="テスト"
          description="説明"
          duration={5}
          category="認知的"
          onStart={onStart}
        />
      );
      
      const startButton = screen.getByText('この気晴らしを始める');
      fireEvent.click(startButton);
      
      expect(startCount).toBe(1);
    });

    it('複数回クリックすると複数回onStartが呼ばれる', () => {
      render(
        <SuggestionCard 
          id="test-8"
          title="テスト"
          description="説明"
          duration={5}
          category="認知的"
          onStart={onStart}
        />
      );
      
      const startButton = screen.getByText('この気晴らしを始める');
      fireEvent.click(startButton);
      fireEvent.click(startButton);
      fireEvent.click(startButton);
      
      expect(startCount).toBe(3);
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('適切なaria属性が設定されている', () => {
      render(
        <SuggestionCard 
          id="test-9"
          title="深呼吸エクササイズ"
          description="リラックス効果"
          duration={5}
          category="認知的"
          steps={['息を吸う', '息を止める', '息を吐く']}
          onStart={onStart}
        />
      );
      
      // 開始ボタンのaria-label
      const startButton = screen.getByRole('button', { name: '深呼吸エクササイズの気晴らしを開始' });
      expect(startButton).toBeInTheDocument();
      
      // 展開ボタンを探す（button要素として）
      const expandButton = screen.getByText('3つの手順を見る').closest('button');
      expect(expandButton).toBeInTheDocument();
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      
      if (expandButton) {
        fireEvent.click(expandButton);
        // ボタンテキストが変わったので再取得
        const expandedButton = screen.getByText('手順を隠す').closest('button');
        expect(expandedButton).toHaveAttribute('aria-expanded', 'true');
      }
    });
  });

  describe('様々な時間設定のテスト', () => {
    it('5分の提案を表示できる', () => {
      render(
        <SuggestionCard 
          id="test-10"
          title="5分の活動"
          description="短時間でリフレッシュ"
          duration={5}
          category="行動的"
          onStart={onStart}
        />
      );
      
      expect(screen.getByText('5分')).toBeInTheDocument();
    });

    it('15分の提案を表示できる', () => {
      render(
        <SuggestionCard 
          id="test-11"
          title="15分の活動"
          description="しっかりリフレッシュ"
          duration={15}
          category="行動的"
          onStart={onStart}
        />
      );
      
      expect(screen.getByText('15分')).toBeInTheDocument();
    });

    it('30分の提案を表示できる', () => {
      render(
        <SuggestionCard 
          id="test-12"
          title="30分の活動"
          description="じっくりリフレッシュ"
          duration={30}
          category="行動的"
          onStart={onStart}
        />
      );
      
      expect(screen.getByText('30分')).toBeInTheDocument();
    });
  });
});