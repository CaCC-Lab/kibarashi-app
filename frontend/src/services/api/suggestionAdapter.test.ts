/**
 * 提案型アダプターのテスト
 */

const _transformSuggestion = transformSuggestion as { _original?: typeof transformSuggestion };
import { describe, it, expect } from 'vitest';
import { suggestionAdapter } from './suggestionAdapter';
import type { Suggestion, EnhancedSuggestion } from './types';

describe('Suggestion Adapter', () => {
  const mockSuggestion: Suggestion = {
    id: 'test-1',
    title: '深呼吸でリラックス',
    description: 'ゆっくりとした深呼吸で心身をリラックスさせます',
    duration: 5,
    category: '認知的',
    steps: [
      '快適な姿勢を取る',
      '深くゆっくりと呼吸する',
      '心の変化を感じる'
    ],
    guide: '深呼吸に集中して、体の力を抜いてリラックスしましょう'
  };

  const mockEnhancedSuggestion: EnhancedSuggestion = {
    id: 'test-1',
    title: '深呼吸でリラックス',
    description: 'ゆっくりとした深呼吸で心身をリラックスさせます',
    duration: 5,
    category: '認知的',
    steps: [
      '快適な姿勢を取る',
      '深くゆっくりと呼吸する',
      '心の変化を感じる'
    ],
    guide: '深呼吸に集中して、体の力を抜いてリラックスしましょう',
    displaySteps: [
      '快適な姿勢を取る',
      '深くゆっくりと呼吸する',
      '心の変化を感じる'
    ],
    displayGuide: '深呼吸に集中して、体の力を抜いてリラックスしましょう',
    voiceGuideScript: {
      totalDuration: 300,
      segments: [
        {
          id: 'test-1-intro',
          type: 'intro',
          text: 'それでは、深呼吸でリラックスを始めましょう。',
          ssml: '<speak>それでは、<emphasis level="moderate">深呼吸でリラックス</emphasis>を始めましょう。</speak>',
          duration: 30,
          startTime: 0,
          autoPlay: true
        }
      ],
      settings: {
        pauseBetweenSegments: 1,
        detailLevel: 'standard',
        includeEncouragement: true,
        breathingCues: false
      }
    },
    accessibility: {
      hasSubtitles: true,
      keyboardNavigable: true,
      screenReaderOptimized: true
    }
  };

  describe('toEnhanced', () => {
    it('既存のSuggestionを拡張形式に変換する', () => {
      const result = suggestionAdapter.toEnhanced(mockSuggestion);

      // 既存フィールドの継承を確認
      expect(result.id).toBe(mockSuggestion.id);
      expect(result.title).toBe(mockSuggestion.title);
      expect(result.description).toBe(mockSuggestion.description);
      expect(result.duration).toBe(mockSuggestion.duration);
      expect(result.category).toBe(mockSuggestion.category);
      expect(result.steps).toEqual(mockSuggestion.steps);
      expect(result.guide).toBe(mockSuggestion.guide);

      // 拡張フィールドの生成を確認
      expect(result.displaySteps).toEqual(mockSuggestion.steps);
      expect(result.displayGuide).toBe(mockSuggestion.guide);
      expect(result.voiceGuideScript).toBeDefined();
      expect(result.accessibility).toBeDefined();
    });

    it('stepsがない場合にデフォルトのdisplayStepsを生成する', () => {
      const suggestionWithoutSteps: Suggestion = {
        ...mockSuggestion,
        steps: undefined
      };

      const result = suggestionAdapter.toEnhanced(suggestionWithoutSteps);

      expect(result.displaySteps).toHaveLength(3);
      expect(result.displaySteps[0]).toContain('快適な場所');
      expect(result.displaySteps[1]).toContain(mockSuggestion.title);
      expect(result.displaySteps[2]).toContain('効果を感じ');
    });

    it('guideがない場合にdescriptionをdisplayGuideとして使用する', () => {
      const suggestionWithoutGuide: Suggestion = {
        ...mockSuggestion,
        guide: undefined
      };

      const result = suggestionAdapter.toEnhanced(suggestionWithoutGuide);

      expect(result.displayGuide).toBe(mockSuggestion.description);
    });

    it('音声ガイドスクリプトを自動生成する', () => {
      const result = suggestionAdapter.toEnhanced(mockSuggestion);

      expect(result.voiceGuideScript.totalDuration).toBe(300); // 5分
      expect(result.voiceGuideScript.segments).toHaveLength(5); // intro + 3 main + closing
      
      const segments = result.voiceGuideScript.segments;
      expect(segments[0].type).toBe('intro');
      expect(segments[segments.length - 1].type).toBe('closing');
      
      // メインセグメントがstepsに対応
      const mainSegments = segments.filter(s => s.type === 'main');
      expect(mainSegments).toHaveLength(3);
    });
  });

  describe('toDisplay', () => {
    it('拡張提案を従来形式に変換する', () => {
      const result = suggestionAdapter.toDisplay(mockEnhancedSuggestion);

      expect(result).toEqual({
        id: mockEnhancedSuggestion.id,
        title: mockEnhancedSuggestion.title,
        description: mockEnhancedSuggestion.description,
        duration: mockEnhancedSuggestion.duration,
        category: mockEnhancedSuggestion.category,
        steps: mockEnhancedSuggestion.steps,
        guide: mockEnhancedSuggestion.guide
      });
    });

    it('stepsがない場合にdisplayStepsを使用する', () => {
      const enhancedWithoutSteps: EnhancedSuggestion = {
        ...mockEnhancedSuggestion,
        steps: undefined
      };

      const result = suggestionAdapter.toDisplay(enhancedWithoutSteps);

      expect(result.steps).toEqual(enhancedWithoutSteps.displaySteps);
    });

    it('guideがない場合にdisplayGuideを使用する', () => {
      const enhancedWithoutGuide: EnhancedSuggestion = {
        ...mockEnhancedSuggestion,
        guide: undefined
      };

      const result = suggestionAdapter.toDisplay(enhancedWithoutGuide);

      expect(result.guide).toBe(enhancedWithoutGuide.displayGuide);
    });
  });

  describe('配列変換', () => {
    it('既存提案の配列を拡張形式に一括変換する', () => {
      const suggestions = [mockSuggestion, { ...mockSuggestion, id: 'test-2' }];
      const result = suggestionAdapter.toEnhancedArray(suggestions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('test-1');
      expect(result[1].id).toBe('test-2');
      expect(result[0].voiceGuideScript).toBeDefined();
      expect(result[1].voiceGuideScript).toBeDefined();
    });

    it('拡張提案の配列を従来形式に一括変換する', () => {
      const enhanced = [mockEnhancedSuggestion, { ...mockEnhancedSuggestion, id: 'test-2' }];
      const result = suggestionAdapter.toDisplayArray(enhanced);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('test-1');
      expect(result[1].id).toBe('test-2');
      expect(result[0].voiceGuideScript).toBeUndefined();
      expect(result[1].voiceGuideScript).toBeUndefined();
    });
  });

  describe('ユーティリティメソッド', () => {
    it('音声ガイドの有無をチェックする', () => {
      expect(suggestionAdapter.hasVoiceGuide(mockEnhancedSuggestion)).toBe(true);

      const enhancedWithoutVoice: EnhancedSuggestion = {
        ...mockEnhancedSuggestion,
        voiceGuideScript: {
          ...mockEnhancedSuggestion.voiceGuideScript,
          segments: []
        }
      };
      expect(suggestionAdapter.hasVoiceGuide(enhancedWithoutVoice)).toBe(false);
    });

    it('音声ガイドの総時間を取得する（分）', () => {
      expect(suggestionAdapter.getVoiceDuration(mockEnhancedSuggestion)).toBe(5); // 300秒 = 5分

      const enhancedWithoutVoice: EnhancedSuggestion = {
        ...mockEnhancedSuggestion,
        voiceGuideScript: undefined as any
      };
      expect(suggestionAdapter.getVoiceDuration(enhancedWithoutVoice)).toBe(5); // durationを返す
    });

    it('従来UIとの互換性をチェックする', () => {
      expect(suggestionAdapter.isCompatibleWithLegacyUI(mockEnhancedSuggestion)).toBe(true);

      const incompatibleSuggestion: EnhancedSuggestion = {
        ...mockEnhancedSuggestion,
        title: '',
        description: ''
      };
      expect(suggestionAdapter.isCompatibleWithLegacyUI(incompatibleSuggestion)).toBe(false);
    });
  });

  describe('音声ガイドスクリプト生成', () => {
    it('適切な時間配分でセグメントを生成する', () => {
      const result = suggestionAdapter.toEnhanced(mockSuggestion);
      const segments = result.voiceGuideScript.segments;

      // イントロ30秒
      expect(segments[0].duration).toBe(30);
      expect(segments[0].startTime).toBe(0);

      // 締めくくり30秒
      const closing = segments[segments.length - 1];
      expect(closing.duration).toBe(30);
      expect(closing.startTime).toBe(270); // 300 - 30

      // メインセグメントの時間配分
      const mainSegments = segments.filter(s => s.type === 'main');
      const expectedStepDuration = Math.floor((300 - 60) / 3); // 80秒
      mainSegments.forEach(segment => {
        expect(segment.duration).toBe(expectedStepDuration);
      });
    });

    it('SSMLマークアップを生成する', () => {
      const result = suggestionAdapter.toEnhanced(mockSuggestion);
      const segments = result.voiceGuideScript.segments;

      segments.forEach(segment => {
        expect(segment.ssml).toMatch(/^<speak>/);
        expect(segment.ssml).toMatch(/<\/speak>$/);
        expect(segment.ssml.length).toBeGreaterThan(segment.text.length);
      });
    });
  });
});