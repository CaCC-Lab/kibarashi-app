import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SituationSelector from './SituationSelector';

/**
 * SituationSelectorコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーインタラクションを実際に再現
 * - 振動APIのサポート有無を考慮したテスト
 */
describe('SituationSelector', () => {
  // コールバック関数の呼び出しを追跡
  let selectCount = 0;
  let selectedValue: string | null = null;
  let backCount = 0;
  
  const onSelect = (value: 'workplace' | 'home' | 'outside') => {
    selectCount++;
    selectedValue = value;
  };
  
  const onBack = () => {
    backCount++;
  };

  beforeEach(() => {
    selectCount = 0;
    selectedValue = null;
    backCount = 0;
  });

  describe('基本的な表示のテスト', () => {
    it('すべての状況オプションを表示する', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('家')).toBeInTheDocument();
      expect(screen.getByText('外出先')).toBeInTheDocument();
      
      // 各オプションの説明も表示される
      expect(screen.getByText('オフィスや仕事場で')).toBeInTheDocument();
      expect(screen.getByText('自宅でリラックス')).toBeInTheDocument();
      expect(screen.getByText('外出中や移動中に')).toBeInTheDocument();
    });

    it('タイトルが表示される', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
    });
  });

  describe('選択状態の表示テスト', () => {
    it('職場が選択されている場合、ハイライトされる', () => {
      render(
        <SituationSelector 
          selected="workplace" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const workplaceButton = screen.getByText('職場').closest('button');
      expect(workplaceButton?.className).toContain('border-primary-500');
      expect(workplaceButton?.className).toContain('shadow-lg');
      
      // 他のボタンはハイライトされない
      const homeButton = screen.getByText('家').closest('button');
      expect(homeButton?.className).toContain('border-primary-200');
      expect(homeButton?.className).not.toContain('shadow-lg');
    });

    it('家が選択されている場合、ハイライトされる', () => {
      render(
        <SituationSelector 
          selected="home" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const homeButton = screen.getByText('家').closest('button');
      expect(homeButton?.className).toContain('border-primary-500');
      expect(homeButton?.className).toContain('shadow-lg');
    });

    it('外出先が選択されている場合、ハイライトされる', () => {
      render(
        <SituationSelector 
          selected="outside" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const outsideButton = screen.getByText('外出先').closest('button');
      expect(outsideButton?.className).toContain('border-primary-500');
      expect(outsideButton?.className).toContain('shadow-lg');
    });
  });

  describe('インタラクションのテスト', () => {
    it('職場オプションをクリックするとonSelectが呼ばれる', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const workplaceButton = screen.getByText('職場');
      fireEvent.click(workplaceButton);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe('workplace');
    });

    it('家オプションをクリックするとonSelectが呼ばれる', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const homeButton = screen.getByText('家');
      fireEvent.click(homeButton);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe('home');
    });

    it('外出先オプションをクリックするとonSelectが呼ばれる', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const outsideButton = screen.getByText('外出先');
      fireEvent.click(outsideButton);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe('outside');
    });

    it('既に選択されているオプションをクリックしても再度onSelectが呼ばれる', () => {
      render(
        <SituationSelector 
          selected="workplace" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const workplaceButton = screen.getByText('職場');
      fireEvent.click(workplaceButton);
      fireEvent.click(workplaceButton);
      
      expect(selectCount).toBe(2);
      expect(selectedValue).toBe('workplace');
    });
  });

  describe('振動フィードバックのテスト', () => {
    it('振動APIがサポートされている場合、クリック時に振動する', () => {
      // 振動APIの存在を確認
      let vibrateCallCount = 0;
      let vibrateValue: number | number[] | undefined;
      
      // 実際の振動APIを一時的に置き換え
      const originalVibrate = navigator.vibrate;
      (navigator as any).vibrate = (pattern: number | number[]) => {
        vibrateCallCount++;
        vibrateValue = pattern;
        return true;
      };
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('職場');
      fireEvent.click(button);
      
      // 振動が発生したことを確認
      expect(vibrateCallCount).toBe(1);
      expect(vibrateValue).toBe(30);
      
      // 元の状態に戻す
      (navigator as any).vibrate = originalVibrate;
    });

    it('振動APIがサポートされていない場合でも正常に動作する', () => {
      // 振動APIが存在しない環境をシミュレート
      const originalVibrate = navigator.vibrate;
      
      // vibrateを一時的にundefinedに設定
      (navigator as any).vibrate = undefined;
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('職場');
      fireEvent.click(button);
      
      // クリックは正常に処理される
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe('workplace');
      
      // 元の状態に戻す
      (navigator as any).vibrate = originalVibrate;
    });
  });

  describe('ビジュアル要素のテスト', () => {
    it('各オプションにアイコンが表示される', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // SVGアイコンの存在を確認
      const svgElements = document.querySelectorAll('svg');
      // 最低でも3つのアイコン（各オプション）が存在する
      expect(svgElements.length).toBeGreaterThanOrEqual(3);
    });

    it('ホバー時のスタイルが適用される', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('職場').closest('button');
      // ホバースタイルはTailwindによって適用されるが、実際のホバー状態をテストするのは難しい
      // 代わりに、ホバースタイルクラスが存在することを確認
      expect(button?.className).toContain('hover:');
      expect(button?.className).toContain('transition-all');
    });

    it('選択時のアニメーションクラスが適用される', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('職場').closest('button');
      expect(button?.className).toContain('transition-all');
      expect(button?.className).toContain('animate-slideIn');
    });
  });

  describe('レスポンシブデザインのテスト', () => {
    it('グリッドレイアウトが適用される', () => {
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const gridContainer = screen.getByText('職場').closest('button')?.parentElement;
      expect(gridContainer?.className).toContain('grid');
      expect(gridContainer?.className).toContain('grid-cols-1');
      expect(gridContainer?.className).toContain('md:grid-cols-3');
    });
  });
});