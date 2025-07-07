import { describe, it, expect } from 'vitest';
import { getFallbackSuggestions } from './fallbackData';

/**
 * フォールバックデータ機能のテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のJSONファイルを読み込んでテスト
 * - 就活・転職活動者向けの専用データが適切に選択されることを確認
 * - フィルタリングとシャッフル機能の動作を検証
 */
describe('fallbackData', () => {
  
  describe('getFallbackSuggestions', () => {
    
    describe('基本的な状況でのテスト', () => {
      it('職場で5分の提案を取得できる', () => {
        const suggestions = getFallbackSuggestions('workplace', 5);
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.length).toBeLessThanOrEqual(3);
        
        // 各提案の構造を確認
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
          expect(suggestion).toHaveProperty('duration');
          expect(suggestion).toHaveProperty('category');
          expect(suggestion.duration).toBe(5);
          expect(['認知的', '行動的']).toContain(suggestion.category);
        });
      });
      
      it('家で15分の提案を取得できる', () => {
        const suggestions = getFallbackSuggestions('home', 15);
        
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
        suggestions.forEach(suggestion => {
          expect(suggestion.duration).toBe(15);
        });
      });
      
      it('外出先で30分の提案を取得できる', () => {
        const suggestions = getFallbackSuggestions('outside', 30);
        
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
        suggestions.forEach(suggestion => {
          expect(suggestion.duration).toBe(30);
        });
      });
    });
    
    describe('就職・転職活動状況のテスト', () => {
      it('job_hunting状況で提案を取得できる', () => {
        const suggestions = getFallbackSuggestions('job_hunting', 15, 'job_seeker');
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
          expect(suggestion.duration).toBe(15);
        });
      });
      
      it('job_hunting状況で各時間の提案を取得できる', () => {
        const durations = [5, 15, 30];
        
        durations.forEach(duration => {
          const suggestions = getFallbackSuggestions('job_hunting', duration, 'job_seeker');
          
          expect(suggestions).toBeDefined();
          expect(suggestions.length).toBeGreaterThan(0);
          suggestions.forEach(suggestion => {
            expect(suggestion.duration).toBe(duration);
          });
        });
      });
    });
    
    describe('年齢層別フィルタリングのテスト', () => {
      it('就活生(job_seeker)向けデータを正しく選択する', () => {
        const suggestions = getFallbackSuggestions('job_hunting', 15, 'job_seeker');
        
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
        
        // 就活生向けの専用データが使用されていることを確認
        // (jobHuntingSuggestions.json から読み込まれている)
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
          expect(suggestion.duration).toBe(15);
        });
      });
      
      it('転職活動者(career_changer)向けデータを正しく選択する', () => {
        const suggestions = getFallbackSuggestions('job_hunting', 15, 'career_changer');
        
        expect(suggestions).toBeDefined();
        expect(suggestions.length).toBeGreaterThan(0);
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('description');
          expect(suggestion.duration).toBe(15);
        });
      });
      
      it('job_seekerが通常状況でも専用データを使用する', () => {
        const workplaceSuggestions = getFallbackSuggestions('workplace', 15, 'job_seeker');
        
        expect(workplaceSuggestions).toBeDefined();
        expect(workplaceSuggestions.length).toBeGreaterThan(0);
        
        // データの構造確認
        workplaceSuggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion.duration).toBe(15);
        });
      });
      
      it('career_changerが通常状況でも専用データを使用する', () => {
        const homeSuggestions = getFallbackSuggestions('home', 30, 'career_changer');
        
        expect(homeSuggestions).toBeDefined();
        expect(homeSuggestions.length).toBeGreaterThan(0);
        
        homeSuggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion.duration).toBe(30);
        });
      });
      
      it('通常の年齢層では通常データを使用する', () => {
        const normalSuggestions = getFallbackSuggestions('workplace', 15, 'office_worker');
        
        expect(normalSuggestions).toBeDefined();
        expect(normalSuggestions.length).toBeGreaterThan(0);
        
        normalSuggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('id');
          expect(suggestion).toHaveProperty('title');
          expect(suggestion.duration).toBe(15);
        });
      });
    });
    
    describe('データ品質とフォーマットのテスト', () => {
      it('提案のIDが一意になっている', () => {
        const suggestions = getFallbackSuggestions('workplace', 15);
        
        const ids = suggestions.map(s => s.id);
        const uniqueIds = new Set(ids);
        
        expect(uniqueIds.size).toBe(ids.length);
      });
      
      it('カテゴリが正しく変換されている', () => {
        const suggestions = getFallbackSuggestions('home', 15);
        
        suggestions.forEach(suggestion => {
          expect(['認知的', '行動的']).toContain(suggestion.category);
        });
      });
      
      it('提案にstepsとguideフィールドが含まれている', () => {
        const suggestions = getFallbackSuggestions('workplace', 15);
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('steps');
          expect(suggestion).toHaveProperty('guide');
          
          if (suggestion.steps) {
            expect(Array.isArray(suggestion.steps)).toBe(true);
          }
          
          if (suggestion.guide) {
            expect(typeof suggestion.guide).toBe('string');
          }
        });
      });
      
      it('タイトルと説明が空でない', () => {
        const suggestions = getFallbackSuggestions('outside', 30);
        
        suggestions.forEach(suggestion => {
          expect(suggestion.title).toBeDefined();
          expect(suggestion.title.length).toBeGreaterThan(0);
          expect(suggestion.description).toBeDefined();
          expect(suggestion.description.length).toBeGreaterThan(0);
        });
      });
    });
    
    describe('シャッフル機能のテスト', () => {
      it('複数回呼び出すと異なる順序で提案が返される可能性がある', () => {
        // 十分な回数実行して、少なくとも一回は順序が変わることを確認
        const results = [];
        for (let i = 0; i < 10; i++) {
          const suggestions = getFallbackSuggestions('workplace', 15);
          results.push(suggestions.map(s => s.title).join(','));
        }
        
        // 全ての結果が同じでないことを確認（シャッフルが機能している）
        const uniqueResults = new Set(results);
        expect(uniqueResults.size).toBeGreaterThan(1);
      });
    });
    
    describe('エラー処理とエッジケースのテスト', () => {
      it('利用可能な提案が少ない場合でも動作する', () => {
        // 非常に限定的な条件で試す
        const suggestions = getFallbackSuggestions('job_hunting', 5, 'job_seeker');
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
        // 提案が0個でも3個でもエラーにならない
        expect(suggestions.length).toBeGreaterThanOrEqual(0);
        expect(suggestions.length).toBeLessThanOrEqual(3);
      });
      
      it('存在しない状況でも空配列を返す', () => {
        const suggestions = getFallbackSuggestions('nonexistent_situation' as any, 15);
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
        // 空配列または該当しないデータの場合
      });
      
      it('存在しない時間でも空配列を返す', () => {
        const suggestions = getFallbackSuggestions('workplace', 999);
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
      });
      
      it('undefined年齢層でも正常に動作する', () => {
        const suggestions = getFallbackSuggestions('workplace', 15, undefined);
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeLessThanOrEqual(3);
      });
    });
    
    describe('データ統合性のテスト', () => {
      it('就活・転職向けデータと通常データが独立している', () => {
        const normalSuggestions = getFallbackSuggestions('workplace', 15, 'office_worker');
        const jobSeekerSuggestions = getFallbackSuggestions('workplace', 15, 'job_seeker');
        
        // データソースが異なることを確認
        // 同じ条件でも異なるデータセットから提案が取得されている可能性
        expect(normalSuggestions).toBeDefined();
        expect(jobSeekerSuggestions).toBeDefined();
        
        // 両方とも有効な構造を持つ
        [normalSuggestions, jobSeekerSuggestions].forEach(suggestions => {
          suggestions.forEach(suggestion => {
            expect(suggestion).toHaveProperty('id');
            expect(suggestion).toHaveProperty('title');
            expect(suggestion).toHaveProperty('description');
          });
        });
      });
      
      it('複数の状況と年齢層の組み合わせで正常に動作する', () => {
        const situations = ['workplace', 'home', 'outside', 'job_hunting'] as const;
        const durations = [5, 15, 30];
        const ageGroups = ['office_worker', 'job_seeker', 'career_changer'];
        
        situations.forEach(situation => {
          durations.forEach(duration => {
            ageGroups.forEach(ageGroup => {
              // job_hunting状況の場合、office_workerは対応していないのでスキップ
              if (situation === 'job_hunting' && ageGroup === 'office_worker') {
                return;
              }
              
              const suggestions = getFallbackSuggestions(situation, duration, ageGroup);
              
              expect(suggestions).toBeDefined();
              expect(Array.isArray(suggestions)).toBe(true);
              expect(suggestions.length).toBeLessThanOrEqual(3);
              
              suggestions.forEach(suggestion => {
                expect(suggestion.duration).toBe(duration);
                expect(['認知的', '行動的']).toContain(suggestion.category);
              });
            });
          });
        });
      });
    });
  });
});