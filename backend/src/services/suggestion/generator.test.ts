import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SuggestionGenerator } from './generator';
import { geminiClient } from '../gemini/geminiClient';

jest.mock('../gemini/geminiClient');

describe('SuggestionGenerator', () => {
  let generator: SuggestionGenerator;

  beforeEach(() => {
    generator = new SuggestionGenerator();
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('Gemini APIが成功した場合、提案を返す', async () => {
      const mockResponse = [
        {
          id: '1',
          title: 'デスクストレッチ',
          description: '椅子に座ったまま簡単にできるストレッチ',
          duration: 5,
          category: 'behavioral' as const,
          guide: '両手を頭の上で組んで、ゆっくりと伸びをしましょう'
        }
      ];

      (geminiClient.generateContent as jest.Mock).mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse)
        }
      });

      const result = await generator.generate('office', 5);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('guide');
    });

    it('Gemini APIがエラーの場合、フォールバックデータを返す', async () => {
      (geminiClient.generateContent as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const result = await generator.generate('office', 5);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBeTruthy();
      expect(result[0].duration).toBe(5);
    });

    it('異なる状況に応じた提案を生成する', async () => {
      const situations = ['office', 'home', 'outside'] as const;
      
      for (const situation of situations) {
        const result = await generator.generate(situation, 5);
        
        expect(result).toHaveLength(3);
        expect(result.every(s => s.duration === 5)).toBe(true);
      }
    });

    it('異なる時間に応じた提案を生成する', async () => {
      const durations = [5, 15, 30];
      
      for (const duration of durations) {
        const result = await generator.generate('office', duration);
        
        expect(result).toHaveLength(3);
        expect(result.every(s => s.duration === duration)).toBe(true);
      }
    });
  });
});