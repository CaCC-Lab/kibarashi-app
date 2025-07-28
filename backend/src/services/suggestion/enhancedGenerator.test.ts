/**
 * 拡張提案生成サービスのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateEnhancedSuggestions, toLegacySuggestion } from './enhancedGenerator';

// Gemini APIクライアントをモック
vi.mock('core-logic', () => ({
  geminiClient: {
    generateEnhancedSuggestions: vi.fn()
  }
}));

// ロガーをモック
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Enhanced Suggestion Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数をクリア
    delete process.env.GEMINI_API_KEY;
  });

  describe('generateEnhancedSuggestions', () => {
    it('Gemini APIが無効な場合、フォールバック提案を生成する', async () => {
      const suggestions = await generateEnhancedSuggestions('workplace', 5);

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toHaveProperty('voiceGuideScript');
      expect(suggestions[0]).toHaveProperty('displaySteps');
      expect(suggestions[0]).toHaveProperty('accessibility');
      
      // 後方互換性の確認
      expect(suggestions[0]).toHaveProperty('id');
      expect(suggestions[0]).toHaveProperty('title');
      expect(suggestions[0]).toHaveProperty('steps');
    });

    it('詳細度がsimpleの場合、励ましセグメントが除去される', async () => {
      const suggestions = await generateEnhancedSuggestions('home', 15, {
        detailLevel: 'simple'
      });

      suggestions.forEach(suggestion => {
        const encouragementSegments = suggestion.voiceGuideScript.segments.filter(
          segment => segment.type === 'encouragement'
        );
        expect(encouragementSegments).toHaveLength(0);
        expect(suggestion.voiceGuideScript.settings.detailLevel).toBe('simple');
      });
    });

    it('詳細度がdetailedの場合、励ましセグメントが含まれる', async () => {
      const suggestions = await generateEnhancedSuggestions('outside', 30, {
        detailLevel: 'detailed'
      });

      suggestions.forEach(suggestion => {
        expect(suggestion.voiceGuideScript.settings.detailLevel).toBe('detailed');
        expect(suggestion.voiceGuideScript.settings.includeEncouragement).toBe(true);
        expect(suggestion.voiceGuideScript.settings.pauseBetweenSegments).toBe(2);
      });
    });

    it('音声ガイドが無効の場合でも提案を生成する', async () => {
      const suggestions = await generateEnhancedSuggestions('workplace', 5, {
        includeVoiceGuide: false
      });

      expect(suggestions).toHaveLength(3);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('voiceGuideScript');
        // フォールバックでも音声ガイドが生成される
      });
    });

    it('年齢層による提案の違いを処理する', async () => {
      const studentSuggestions = await generateEnhancedSuggestions('workplace', 15, {
        ageGroup: 'student'
      });

      const elderlySuggestions = await generateEnhancedSuggestions('workplace', 15, {
        ageGroup: 'elderly'
      });

      expect(studentSuggestions).toHaveLength(3);
      expect(elderlySuggestions).toHaveLength(3);
      
      // 両方とも有効な拡張提案であることを確認
      [...studentSuggestions, ...elderlySuggestions].forEach(suggestion => {
        expect(suggestion).toHaveProperty('voiceGuideScript');
        expect(suggestion.voiceGuideScript.segments.length).toBeGreaterThan(0);
      });
    });
  });

  describe('toLegacySuggestion', () => {
    it('拡張提案を従来形式に正しく変換する', async () => {
      const enhancedSuggestions = await generateEnhancedSuggestions('home', 5);
      const enhanced = enhancedSuggestions[0];
      
      const legacy = toLegacySuggestion(enhanced);

      expect(legacy).toHaveProperty('id', enhanced.id);
      expect(legacy).toHaveProperty('title', enhanced.title);
      expect(legacy).toHaveProperty('description', enhanced.description);
      expect(legacy).toHaveProperty('duration', enhanced.duration);
      expect(legacy).toHaveProperty('category', enhanced.category);
      
      // 拡張フィールドは含まれない
      expect(legacy).not.toHaveProperty('voiceGuideScript');
      expect(legacy).not.toHaveProperty('accessibility');
      
      // 後方互換性のあるstepsとguideを確認
      expect(legacy.steps).toBeDefined();
      expect(legacy.guide).toBeDefined();
    });
  });

  describe('音声ガイドの構造', () => {
    it('各提案に適切な音声セグメントが含まれる', async () => {
      const suggestions = await generateEnhancedSuggestions('workplace', 15);
      
      suggestions.forEach(suggestion => {
        const { voiceGuideScript } = suggestion;
        
        // 基本構造の確認
        expect(voiceGuideScript).toHaveProperty('totalDuration');
        expect(voiceGuideScript).toHaveProperty('segments');
        expect(voiceGuideScript).toHaveProperty('settings');
        
        // セグメントの確認
        expect(voiceGuideScript.segments.length).toBeGreaterThan(0);
        
        // 必須セグメントの確認
        const segmentTypes = voiceGuideScript.segments.map(s => s.type);
        expect(segmentTypes).toContain('intro');
        expect(segmentTypes).toContain('closing');
        
        // 各セグメントの構造確認
        voiceGuideScript.segments.forEach(segment => {
          expect(segment).toHaveProperty('id');
          expect(segment).toHaveProperty('type');
          expect(segment).toHaveProperty('text');
          expect(segment).toHaveProperty('ssml');
          expect(segment).toHaveProperty('duration');
          expect(typeof segment.duration).toBe('number');
          expect(segment.duration).toBeGreaterThan(0);
        });
      });
    });

    it('セグメントの合計時間が指定時間と一致する', async () => {
      const duration = 15; // 15分
      const suggestions = await generateEnhancedSuggestions('home', duration);
      
      suggestions.forEach(suggestion => {
        const { voiceGuideScript } = suggestion;
        expect(voiceGuideScript.totalDuration).toBe(duration * 60); // 秒に変換
      });
    });

    it('SSMLが適切に生成される', async () => {
      const suggestions = await generateEnhancedSuggestions('outside', 5);
      
      suggestions.forEach(suggestion => {
        suggestion.voiceGuideScript.segments.forEach(segment => {
          // SSMLの基本構造を確認
          expect(segment.ssml).toMatch(/^<speak>/);
          expect(segment.ssml).toMatch(/<\/speak>$/);
          
          // テキストが空でないことを確認
          expect(segment.text.length).toBeGreaterThan(0);
          expect(segment.ssml.length).toBeGreaterThan(segment.text.length);
        });
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('すべての提案にアクセシビリティ情報が含まれる', async () => {
      const suggestions = await generateEnhancedSuggestions('workplace', 30);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.accessibility).toEqual({
          hasSubtitles: true,
          keyboardNavigable: true,
          screenReaderOptimized: true
        });
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('Gemini API呼び出し時のエラーでもフォールバックが動作する', async () => {
      // Gemini APIキーを設定してエラーを発生させる
      process.env.GEMINI_API_KEY = 'test-key';
      
      const { geminiClient } = await import('../gemini/geminiClient');
      vi.mocked(geminiClient.generateEnhancedSuggestions).mockRejectedValue(
        new Error('API Error')
      );

      const suggestions = await generateEnhancedSuggestions('workplace', 5);

      expect(suggestions).toHaveLength(3);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('voiceGuideScript');
        expect(suggestion.voiceGuideScript.segments.length).toBeGreaterThan(0);
      });
    });
  });
});