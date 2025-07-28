import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SituationSelector from './SituationSelector';
import { useAgeGroup } from '../../hooks/useAgeGroup';

// useAgeGroupをモック
vi.mock('../../hooks/useAgeGroup', () => ({
  useAgeGroup: vi.fn(() => ({ currentAgeGroup: 'office_worker' }))
}));

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
  
  const onSelect = (value: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting') => {
    selectCount++;
    selectedValue = value;
  };
  
  const onBack = () => {};

  beforeEach(() => {
    selectCount = 0;
    selectedValue = null;
    // デフォルトのモック値に戻す
    vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'office_worker' } as any);
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
      (navigator as Record<string, unknown>).vibrate = (pattern: number | number[]) => {
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
      (navigator as Record<string, unknown>).vibrate = originalVibrate;
    });

    it('振動APIがサポートされていない場合でも正常に動作する', () => {
      // 振動APIが存在しない環境をシミュレート
      const originalVibrate = navigator.vibrate;
      
      // vibrateを一時的にundefinedに設定
      (navigator as Record<string, unknown>).vibrate = undefined;
      
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
      (navigator as Record<string, unknown>).vibrate = originalVibrate;
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

  describe('就職活動関連状況のテスト', () => {
    it('就職活動者(job_seeker)の場合、就職・転職活動オプションが表示される', () => {
      // useAgeGroupをjob_seekerモードに設定
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'job_seeker' } as any);
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // 就職・転職活動オプションが表示される
      expect(screen.getByText('就職・転職活動')).toBeInTheDocument();
      
      // 基本オプションも表示される
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('家')).toBeInTheDocument();
      expect(screen.getByText('外出先')).toBeInTheDocument();
    });

    it('転職活動者(career_changer)の場合、就職・転職活動オプションが表示される', () => {
      // useAgeGroupをcareer_changerモードに設定
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'career_changer' } as any);
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // 就職・転職活動オプションが表示される
      expect(screen.getByText('就職・転職活動')).toBeInTheDocument();
    });

    it('job_hunting状況が選択されている場合、ハイライトされる', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'job_seeker' } as any);
      
      render(
        <SituationSelector 
          selected="job_hunting" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const jobHuntingButton = screen.getByText('就職・転職活動').closest('button');
      expect(jobHuntingButton?.className).toContain('border-primary-500');
      expect(jobHuntingButton?.className).toContain('shadow-lg');
    });

    it('就職・転職活動オプションをクリックするとonSelectが呼ばれる', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'job_seeker' } as any);
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      const jobHuntingButton = screen.getByText('就職・転職活動');
      fireEvent.click(jobHuntingButton);
      
      expect(selectCount).toBe(1);
      expect(selectedValue).toBe('job_hunting');
    });

    it('就職活動者の場合、適切なタイトルとメッセージが表示される', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'job_seeker' } as any);
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // job_seeker向けのタイトルとメッセージを確認
      expect(screen.getByText('どちらでリフレッシュしますか？ 💼')).toBeInTheDocument();
      expect(screen.getByText('就活の合間に、少し息抜きしましょう')).toBeInTheDocument();
    });

    it('転職活動者の場合、適切なタイトルとメッセージが表示される', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'career_changer' } as any);
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // career_changer向けのタイトルとメッセージを確認
      expect(screen.getByText('どちらでリフレッシュされますか？ 🌟')).toBeInTheDocument();
      expect(screen.getByText('転職活動の合間に、少し気分転換しましょう')).toBeInTheDocument();
    });

    it('job_hunting状況選択時にコンテキスト説明が表示される', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'job_seeker' } as any);
      
      render(
        <SituationSelector 
          selected="job_hunting" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // job_seekerのjob_hunting状況に対する説明文が表示される
      expect(screen.getByText('面接前の待ち時間、説明会の合間、ESの作成で疲れた時')).toBeInTheDocument();
    });

    it('通常の年齢層では就職・転職活動オプションが表示されない', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'office_worker' } as any);
      
      render(
        <SituationSelector 
          selected={null} 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // 就職・転職活動オプションは表示されない
      expect(screen.queryByText('就職・転職活動')).not.toBeInTheDocument();
      
      // 基本オプションは表示される
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('家')).toBeInTheDocument();
      expect(screen.getByText('外出先')).toBeInTheDocument();
    });
  });

  describe('年齢層に応じた状況コンテキスト説明のテスト', () => {
    it('job_seekerの場合、各状況に適切なコンテキスト説明が表示される', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'job_seeker' } as any);
      
      render(
        <SituationSelector 
          selected="workplace" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // workplace状況でのjob_seeker向け説明
      expect(screen.getByText('インターンシップの休憩時間、アルバイト先での息抜き')).toBeInTheDocument();
    });

    it('career_changerの場合、各状況に適切なコンテキスト説明が表示される', () => {
      vi.mocked(useAgeGroup).mockReturnValue({ currentAgeGroup: 'career_changer' } as any);
      
      render(
        <SituationSelector 
          selected="home" 
          onSelect={onSelect} 
          onBack={onBack} 
        />
      );
      
      // home状況でのcareer_changer向け説明
      expect(screen.getByText('求人検索の休憩中、面接準備の合間、家族に相談した後')).toBeInTheDocument();
    });
  });
});