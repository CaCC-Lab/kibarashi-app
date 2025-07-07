import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionCard from './SuggestionCard';
import type { VoiceGuideScript } from '../../services/api/types';
import { useFeature } from '../config/featureFlags';
import { useStudentABTest } from '../../hooks/useStudentABTest';

// VoiceGuidePlayerのモック
vi.mock('../audio/VoiceGuidePlayer', () => ({
  VoiceGuidePlayer: vi.fn(({ suggestionId, onError, onComplete }) => (
    <div data-testid="voice-guide-player">
      <span>Mock VoiceGuidePlayer for {suggestionId}</span>
      <button onClick={() => onError?.(new Error('Test error'))}>Trigger Error</button>
      <button onClick={() => onComplete?.()}>Trigger Complete</button>
    </div>
  ))
}));

// フィーチャーフラグのモック
vi.mock('../config/featureFlags', () => ({
  useFeature: vi.fn()
}));

// useStudentABTestフックのモック
vi.mock('../../hooks/useStudentABTest', () => ({
  useStudentABTest: vi.fn()
}));

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
    // デフォルトではフィーチャーフラグを無効にする（既存テストの互換性維持）
    vi.mocked(useFeature).mockReturnValue(false);
    
    // useStudentABTestフックのデフォルトモック（コントロール群の設定）
    vi.mocked(useStudentABTest).mockReturnValue({
      testGroup: 'A',
      isStudentOptimized: false,
      features: {
        studentPrompts: false,
        ageGroupSelector: false,
        benefitDisplay: false,
        returnToStudyTips: false,
        enhancedMetrics: false
      },
      trackMetric: vi.fn(),
      trackCompletion: vi.fn(),
      shouldRender: vi.fn((feature) => feature === 'defaultFeature'),
      resetForTesting: vi.fn()
    });
    
    vi.clearAllMocks();
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

  describe('学生向けA/Bテスト統合のテスト', () => {
    it('学生向けA/Bテストフックが統合されている', () => {
      // 処理群（B）のモック設定
      vi.mocked(useStudentABTest).mockReturnValue({
        testGroup: 'B',
        isStudentOptimized: true,
        features: {
          studentPrompts: true,
          ageGroupSelector: true,
          benefitDisplay: true,
          returnToStudyTips: true,
          enhancedMetrics: true
        },
        trackMetric: vi.fn(),
        trackCompletion: vi.fn(),
        shouldRender: vi.fn((feature) => feature === 'studentFeature'),
        resetForTesting: vi.fn()
      });

      render(
        <SuggestionCard 
          id="test-abtest-1"
          title="学生向け最適化テスト"
          description="A/Bテスト統合確認"
          duration={5}
          category="認知的"
          ageGroup="student"
          onStart={onStart}
        />
      );

      // 学生向け最適化が適用されていることを確認
      expect(screen.getByTestId('student-optimized-content')).toBeInTheDocument();
      expect(screen.getByText('学習効率を高める気晴らし')).toBeInTheDocument();
    });

    it('コントロール群（A）では標準UIが表示される', () => {
      render(
        <SuggestionCard 
          id="test-control-1"
          title="標準UI確認"
          description="コントロール群のテスト"
          duration={5}
          category="行動的"
          onStart={onStart}
        />
      );

      // 標準UIが表示されることを確認
      expect(screen.getByText('この気晴らしを始める')).toBeInTheDocument();
      expect(screen.queryByTestId('student-optimized-content')).not.toBeInTheDocument();
    });

    it('処理群（B）では学生向け最適化UIが表示される', () => {
      // 処理群（B）のモック設定
      vi.mocked(useStudentABTest).mockReturnValue({
        testGroup: 'B',
        isStudentOptimized: true,
        features: {
          studentPrompts: true,
          ageGroupSelector: true,
          benefitDisplay: true,
          returnToStudyTips: true,
          enhancedMetrics: true
        },
        trackMetric: vi.fn(),
        trackCompletion: vi.fn(),
        shouldRender: vi.fn((feature) => {
          if (feature === 'studentFeature') return true;
          if (feature === 'defaultFeature') return false;
          return false;
        }),
        resetForTesting: vi.fn()
      });

      render(
        <SuggestionCard 
          id="test-treatment-1"
          title="学生向けUI確認"
          description="処理群のテスト"
          duration={5}
          category="認知的"
          ageGroup="student"
          onStart={onStart}
        />
      );

      // デバッグ: レンダリングされたDOMを確認
      // screen.debug();

      // 学生向け最適化UIが表示されることを確認
      const studentContent = screen.queryByTestId('student-optimized-content');
      console.log('Student content found:', !!studentContent);
      
      expect(screen.getByTestId('student-optimized-content')).toBeInTheDocument();
      expect(screen.getByText(/勉強に戻る準備はできましたか/)).toBeInTheDocument();
      expect(screen.getByText(/学習効率アップ開始/)).toBeInTheDocument();
    });

    it('A/Bテストメトリクスが正しくトラッキングされる', () => {
      const trackMetricSpy = vi.fn();
      
      // メトリクストラッキング付きのモック設定
      vi.mocked(useStudentABTest).mockReturnValue({
        testGroup: 'A',
        isStudentOptimized: false,
        features: {
          studentPrompts: false,
          ageGroupSelector: false,
          benefitDisplay: false,
          returnToStudyTips: false,
          enhancedMetrics: false
        },
        trackMetric: trackMetricSpy,
        trackCompletion: vi.fn(),
        shouldRender: vi.fn((feature) => feature === 'defaultFeature'),
        resetForTesting: vi.fn()
      });
      
      render(
        <SuggestionCard 
          id="test-metrics-1"
          title="メトリクステスト"
          description="トラッキング確認"
          duration={5}
          category="行動的"
          ageGroup="adult"
          onStart={onStart}
        />
      );

      // ボタンクリック時にメトリクスがトラッキングされることを確認
      const startButton = screen.getByText('この気晴らしを始める');
      fireEvent.click(startButton);

      // メトリクストラッキングが呼ばれることを確認
      expect(trackMetricSpy).toHaveBeenCalledWith('suggestionStart', {
        suggestionId: 'test-metrics-1',
        ageGroup: 'adult',
        category: '行動的',
        duration: 5
      });
    });
  });

  describe('音声ガイド機能のテスト', () => {
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
          text: 'メインガイド',
          ssml: '<speak>メインガイド</speak>',
          duration: 240,
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

    it('音声ガイドが有効でスクリプトがある場合、VoiceGuidePlayerが表示される', () => {
      // フィーチャーフラグを有効にする
      vi.mocked(useFeature).mockReturnValue(true);

      render(
        <SuggestionCard 
          id="test-voice-1"
          title="音声ガイド付き提案"
          description="詳しい音声説明があります"
          duration={5}
          category="認知的"
          voiceGuideScript={mockVoiceGuideScript}
          onStart={onStart}
        />
      );

      // 音声ガイドセクションが表示される
      expect(screen.getByText('音声ガイド付き')).toBeInTheDocument();
      expect(screen.getByTestId('voice-guide-player')).toBeInTheDocument();
      expect(screen.getByText('Mock VoiceGuidePlayer for test-voice-1')).toBeInTheDocument();
    });

    it('音声ガイドが無効の場合、VoiceGuidePlayerが表示されない', () => {
      // フィーチャーフラグを無効にする
      vi.mocked(useFeature).mockReturnValue(false);

      render(
        <SuggestionCard 
          id="test-voice-2"
          title="通常の提案"
          description="音声ガイドなし"
          duration={5}
          category="認知的"
          voiceGuideScript={mockVoiceGuideScript}
          onStart={onStart}
        />
      );

      // 音声ガイドセクションが表示されない
      expect(screen.queryByText('音声ガイド付き')).not.toBeInTheDocument();
      expect(screen.queryByTestId('voice-guide-player')).not.toBeInTheDocument();
    });

    it('voiceGuideScriptがない場合、VoiceGuidePlayerが表示されない', () => {
      // フィーチャーフラグを有効にする
      vi.mocked(useFeature).mockReturnValue(true);

      render(
        <SuggestionCard 
          id="test-voice-3"
          title="スクリプトなし提案"
          description="音声ガイドスクリプトがありません"
          duration={5}
          category="認知的"
          onStart={onStart}
        />
      );

      // 音声ガイドセクションが表示されない
      expect(screen.queryByText('音声ガイド付き')).not.toBeInTheDocument();
      expect(screen.queryByTestId('voice-guide-player')).not.toBeInTheDocument();
    });

    it('音声ガイドのエラーハンドリングが機能する', () => {
      // フィーチャーフラグを有効にする
      vi.mocked(useFeature).mockReturnValue(true);
      
      // console.warnをモック
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <SuggestionCard 
          id="test-voice-4"
          title="エラーテスト"
          description="エラーハンドリングのテスト"
          duration={5}
          category="認知的"
          voiceGuideScript={mockVoiceGuideScript}
          onStart={onStart}
        />
      );

      // エラーを発生させる
      const errorButton = screen.getByText('Trigger Error');
      fireEvent.click(errorButton);

      // エラーが適切にログに記録される
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Voice guide error:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it('音声ガイド完了時のコールバックが機能する', () => {
      // フィーチャーフラグを有効にする
      vi.mocked(useFeature).mockReturnValue(true);
      
      // console.logをモック
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <SuggestionCard 
          id="test-voice-5"
          title="完了テスト"
          description="完了コールバックのテスト"
          duration={5}
          category="認知的"
          voiceGuideScript={mockVoiceGuideScript}
          onStart={onStart}
        />
      );

      // 完了を発生させる
      const completeButton = screen.getByText('Trigger Complete');
      fireEvent.click(completeButton);

      // 完了が適切にログに記録される
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Voice guide completed for suggestion:',
        'test-voice-5'
      );

      consoleLogSpy.mockRestore();
    });

    it('音声ガイドセクションのスタイリングが適切', () => {
      // フィーチャーフラグを有効にする
      vi.mocked(useFeature).mockReturnValue(true);

      render(
        <SuggestionCard 
          id="test-voice-6"
          title="スタイリングテスト"
          description="スタイリングの確認"
          duration={5}
          category="認知的"
          voiceGuideScript={mockVoiceGuideScript}
          onStart={onStart}
        />
      );

      // 音声ガイドセクションの存在確認
      const voiceSection = screen.getByText('音声ガイド付き').closest('div');
      expect(voiceSection).toBeInTheDocument();
      
      // 音声アイコンが表示される
      const audioIcon = voiceSection?.querySelector('svg');
      expect(audioIcon).toBeInTheDocument();
    });
  });
});