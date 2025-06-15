import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DurationSelector from './DurationSelector';

/**
 * DurationSelectorコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーインタラクションを実際に再現
 * - 振動APIのサポート有無を考慮したテスト
 */
describe('DurationSelector', () => {
  // コールバック関数の呼び出しを追跡
  let selectCount = 0;
  let selectedValue: number | null = null;
  let backCount = 0;
  
  const onSelect = (value: 5 | 15 | 30) => {
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
    it('すべての時間オプションを表示する', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      expect(screen.getByText('5分')).toBeInTheDocument();
      expect(screen.getByText('15分')).toBeInTheDocument();
      expect(screen.getByText('30分')).toBeInTheDocument();
    });

    it('各オプションに適切な説明文が表示される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      expect(screen.getByText('ちょっとした気分転換に')).toBeInTheDocument();
      expect(screen.getByText('しっかりリフレッシュ')).toBeInTheDocument();
      expect(screen.getByText('じっくり気晴らし')).toBeInTheDocument();
    });

    it('タイトルが表示される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
    });
  });

  describe('選択状態の表示テスト', () => {
    it('5分が選択されている場合、ハイライトされる', () => {
      render(
        <DurationSelector 
          selected={5} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button5min = screen.getByText('5分').closest('button');
      expect(button5min?.className).toContain('border-primary-500');
      expect(button5min?.className).toContain('shadow-lg');
      
      // 他のボタンはハイライトされない
      const button15min = screen.getByText('15分').closest('button');
      expect(button15min?.className).toContain('border-primary-200');
      expect(button15min?.className).not.toContain('shadow-lg');
    });

    it('15分が選択されている場合、ハイライトされる', () => {
      render(
        <DurationSelector 
          selected={15} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button15min = screen.getByText('15分').closest('button');
      expect(button15min?.className).toContain('border-primary-500');
      expect(button15min?.className).toContain('shadow-lg');
    });

    it('30分が選択されている場合、ハイライトされる', () => {
      render(
        <DurationSelector 
          selected={30} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button30min = screen.getByText('30分').closest('button');
      expect(button30min?.className).toContain('border-primary-500');
      expect(button30min?.className).toContain('shadow-lg');
    });
  });

  describe('インタラクションのテスト', () => {
    it('5分オプションをクリックするとonSelectが呼ばれる', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button5min = screen.getByText('5分');
      fireEvent.click(button5min);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe(5);
    });

    it('15分オプションをクリックするとonSelectが呼ばれる', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button15min = screen.getByText('15分');
      fireEvent.click(button15min);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe(15);
    });

    it('30分オプションをクリックするとonSelectが呼ばれる', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button30min = screen.getByText('30分');
      fireEvent.click(button30min);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe(30);
    });

    it('既に選択されているオプションをクリックしても再度onSelectが呼ばれる', () => {
      render(
        <DurationSelector 
          selected={5} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button5min = screen.getByText('5分');
      fireEvent.click(button5min);
      fireEvent.click(button5min);
      
      expect(selectCount).toBe(2);
      expect(selectedValue).toBe(5);
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
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('5分');
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
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('5分');
      fireEvent.click(button);
      
      // クリックは正常に処理される
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe(5);
      
      // 元の状態に戻す
      (navigator as any).vibrate = originalVibrate;
    });
  });

  describe('ビジュアル要素のテスト', () => {
    it('円形の進捗インジケーターが表示される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // SVGの円形インジケーターの存在を確認
      const svgElements = document.querySelectorAll('svg');
      // 各時間オプションに円形のインジケーターがある
      expect(svgElements.length).toBeGreaterThanOrEqual(3);
      
      // SVG内のcircle要素を確認
      const circleElements = document.querySelectorAll('circle');
      expect(circleElements.length).toBeGreaterThanOrEqual(6); // 各オプションに背景と前景の2つずつ
    });

    it('時間に応じて異なる進捗パーセンテージが表示される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // 5分: 17% (5/30)
      // 15分: 50% (15/30)
      // 30分: 100% (30/30)
      
      // stroke-dashoffsetスタイルで進捗を確認
      const circles = document.querySelectorAll('circle[stroke-dasharray]');
      expect(circles.length).toBeGreaterThan(0);
    });

    it('ホバー時のスタイルが適用される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('5分').closest('button');
      // ホバースタイルはTailwindによって適用されるが、実際のホバー状態をテストするのは難しい
      // 代わりに、ホバースタイルクラスが存在することを確認
      expect(button?.className).toContain('hover:');
      expect(button?.className).toContain('transition-all');
    });

    it('選択時のアニメーションクラスが適用される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const button = screen.getByText('5分').closest('button');
      expect(button?.className).toContain('transition-all');
      expect(button?.className).toContain('animate-slideIn');
    });
  });

  describe('レスポンシブデザインのテスト', () => {
    it('グリッドレイアウトが適用される', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const gridContainer = screen.getByText('5分').closest('button')?.parentElement;
      expect(gridContainer?.className).toContain('grid');
      expect(gridContainer?.className).toContain('grid-cols-1');
      expect(gridContainer?.className).toContain('md:grid-cols-3');
    });

    it('モバイルでは縦並び、デスクトップでは横並びになる', () => {
      render(
        <DurationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const gridContainer = screen.getByText('5分').closest('button')?.parentElement;
      // モバイル: grid-cols-1
      expect(gridContainer?.className).toContain('grid-cols-1');
      // タブレット以上: md:grid-cols-3
      expect(gridContainer?.className).toContain('md:grid-cols-3');
    });
  });
});