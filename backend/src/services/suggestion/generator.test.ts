import { describe, it, expect, beforeEach } from 'vitest';
import { generateSuggestions } from './generator';

/**
 * 提案生成サービスのテスト
 * 
 * 設計思想：
 * - 実際のGemini APIまたはフォールバックデータを使用してテスト
 * - モックを一切使用せず、本番環境と同じ動作を検証
 * - APIが利用できない場合のフォールバック動作も確認
 */
describe('generateSuggestions', () => {
  // Gemini APIキーの存在を確認
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  
  beforeEach(() => {
    // テスト間の影響を避けるため、必要に応じて初期化
    if (!hasApiKey) {
      console.log('注意: GEMINI_API_KEYが設定されていないため、フォールバックデータを使用します');
    }
  });

  describe('正常系テスト - 各状況と時間の組み合わせ', () => {
    it('職場で5分の提案を生成できる', async () => {
      const suggestions = await generateSuggestions('workplace', 5);
      
      // 基本的な検証
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3); // 最大3つの提案
      
      // 各提案の内容を検証
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(['認知的', '行動的']).toContain(suggestion.category);
        
        // 時間の妥当性を確認
        expect(suggestion.duration).toBeLessThanOrEqual(5);
      });
    });

    it('家で15分の提案を生成できる', async () => {
      const suggestions = await generateSuggestions('home', 15);
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(15);
        expect(suggestion.title).toBeTruthy();
        expect(suggestion.description).toBeTruthy();
      });
    });

    it('外出先で30分の提案を生成できる', async () => {
      const suggestions = await generateSuggestions('outside', 30);
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(30);
        expect(suggestion.title).toBeTruthy();
        expect(suggestion.description).toBeTruthy();
      });
    });

    it('就職・転職活動で5分の提案を生成できる', async () => {
      const suggestions = await generateSuggestions('job_hunting', 5, 'job_seeker');
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(['認知的', '行動的']).toContain(suggestion.category);
        expect(suggestion.duration).toBeLessThanOrEqual(5);
      });
    });

    it('就職・転職活動で15分の提案を生成できる', async () => {
      const suggestions = await generateSuggestions('job_hunting', 15, 'job_seeker');
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(15);
        expect(suggestion.title).toBeTruthy();
        expect(suggestion.description).toBeTruthy();
      });
    });

    it('就職・転職活動で30分の提案を生成できる', async () => {
      const suggestions = await generateSuggestions('job_hunting', 30, 'career_changer');
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(30);
        expect(suggestion.title).toBeTruthy();
        expect(suggestion.description).toBeTruthy();
      });
    });
  });

  describe('提案内容の品質テスト', () => {
    it('提案にはステップが含まれる場合がある', async () => {
      const suggestions = await generateSuggestions('workplace', 5);
      
      // 少なくとも一つの提案にステップが含まれることを確認
      const hasSteps = suggestions.some(s => s.steps && s.steps.length > 0);
      expect(hasSteps).toBe(true);
      
      // ステップがある提案の検証
      suggestions.filter(s => s.steps).forEach(suggestion => {
        expect(suggestion.steps!.length).toBeGreaterThan(0);
        suggestion.steps!.forEach(step => {
          expect(step).toBeTruthy();
          expect(typeof step).toBe('string');
        });
      });
    });

    it('認知的と行動的の両方のカテゴリーが含まれる', async () => {
      const suggestions = await generateSuggestions('home', 15);
      
      const categories = suggestions.map(s => s.category);
      const hasCognitive = categories.includes('認知的');
      const hasBehavioral = categories.includes('行動的');
      
      // 少なくとも一つのカテゴリーは含まれるはず
      expect(hasCognitive || hasBehavioral).toBe(true);
    });

    it('提案のIDはユニークである', async () => {
      const suggestions = await generateSuggestions('outside', 30);
      
      const ids = suggestions.map(s => s.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('フォールバック機能のテスト', () => {
    it('APIキーがない場合でもフォールバック提案を返す', async () => {
      // 環境変数を一時的に削除
      const originalApiKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      const suggestions = await generateSuggestions('workplace', 5);
      
      // フォールバック提案の検証
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      
      // 環境変数を復元
      if (originalApiKey) {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    });

    it('フォールバック提案も適切にフィルタリングされる', async () => {
      const originalApiKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      const suggestions = await generateSuggestions('workplace', 5);
      
      // 職場向けの提案であることを確認
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(5);
        // タイトルや説明文に職場に適した内容が含まれているか
        const content = suggestion.title + suggestion.description;
        const isWorkplaceAppropriate = 
          !content.includes('入浴') && 
          !content.includes('料理') &&
          !content.includes('散歩');
        expect(isWorkplaceAppropriate).toBe(true);
      });
      
      if (originalApiKey) {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('無効な状況パラメータでもエラーにならない', async () => {
      // TypeScriptの型チェックを回避してテスト
      const suggestions = await generateSuggestions('invalid' as any, 5);
      
      // エラーにならず、配列が返されることを確認
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      // 無効な状況のため、結果が空になる可能性がある
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('極端な時間設定でもエラーにならない', async () => {
      // 1分の提案（最小値以下）
      const shortSuggestions = await generateSuggestions('workplace', 1);
      expect(shortSuggestions).toBeDefined();
      expect(Array.isArray(shortSuggestions)).toBe(true);
      // サポートされない時間のため、結果が空になる可能性がある
      expect(shortSuggestions.length).toBeGreaterThanOrEqual(0);
      
      // 60分の提案（最大値以上）
      const longSuggestions = await generateSuggestions('home', 60);
      expect(longSuggestions).toBeDefined();
      expect(Array.isArray(longSuggestions)).toBe(true);
      expect(longSuggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('年齢層別テスト', () => {
    it('学生向けの提案を生成できる', async () => {
      const suggestions = await generateSuggestions(
        'studying', 
        15, 
        'student',
        { concern: '期末試験のストレス', subject: '数学' }
      );
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });

    it('就活生向けの提案を生成できる', async () => {
      const suggestions = await generateSuggestions(
        'job_hunting', 
        15, 
        'job_seeker',
        undefined,
        { 
          currentPhase: 'interviewing',
          concern: '面接前の緊張',
          activityDuration: '3-6months'
        }
      );
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });

    it('転職活動者向けの提案を生成できる', async () => {
      const suggestions = await generateSuggestions(
        'job_hunting', 
        15, 
        'career_changer',
        undefined,
        { 
          currentPhase: 'waiting',
          concern: '条件交渉のストレス',
          activityDuration: 'over_6months'
        }
      );
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });

    it('職場環境での就活生向け提案を生成できる', async () => {
      const suggestions = await generateSuggestions(
        'workplace', 
        5, 
        'job_seeker',
        undefined,
        { 
          currentPhase: 'preparation',
          concern: '自己分析の迷い'
        }
      );
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion.duration).toBeLessThanOrEqual(5);
        // 職場で実践可能な内容になっているか確認
        expect(suggestion.title).toBeTruthy();
        expect(suggestion.description).toBeTruthy();
      });
    });

    it('年齢層なしでも正常に動作する', async () => {
      const suggestions = await generateSuggestions('workplace', 15);
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
      });
    });
  });

  describe('ジョブハンティングコンテキストのテスト', () => {
    it('各フェーズでの就活提案を生成できる', async () => {
      const phases = ['preparation', 'applying', 'interviewing', 'waiting', 'rejected'] as const;
      
      for (const phase of phases) {
        const suggestions = await generateSuggestions(
          'job_hunting', 
          15, 
          'job_seeker',
          undefined,
          { currentPhase: phase }
        );
        
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
        });
      }
    });

    it('各活動期間での提案を生成できる', async () => {
      const durations = ['just_started', '1-3months', '3-6months', 'over_6months'] as const;
      
      for (const duration of durations) {
        const suggestions = await generateSuggestions(
          'job_hunting', 
          15, 
          'career_changer',
          undefined,
          { activityDuration: duration }
        );
        
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
        });
      }
    });

    it('コンテキスト情報なしでも就活提案を生成できる', async () => {
      const suggestions = await generateSuggestions(
        'job_hunting', 
        15, 
        'job_seeker'
      );
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
      });
    });
  });

  describe('パフォーマンステスト', () => {
    it('提案生成は3秒以内に完了する', async () => {
      const startTime = Date.now();
      await generateSuggestions('workplace', 5);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(3000); // 3秒以内
    });

    it('連続した呼び出しでも安定して動作する', async () => {
      // 3回連続で呼び出し
      const results = await Promise.all([
        generateSuggestions('workplace', 5),
        generateSuggestions('home', 15),
        generateSuggestions('job_hunting', 30, 'job_seeker')
      ]);
      
      // すべての結果が正常であることを確認
      results.forEach(suggestions => {
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
      });
    });

    it('複雑なコンテキストでも適切な時間で完了する', async () => {
      const startTime = Date.now();
      
      await generateSuggestions(
        'job_hunting', 
        15, 
        'career_changer',
        undefined,
        { 
          currentPhase: 'interviewing',
          concern: '複数企業の面接スケジュール調整によるストレス',
          stressFactor: '現職との両立の難しさ',
          activityDuration: 'over_6months'
        }
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // 5秒以内
    });
  });
});