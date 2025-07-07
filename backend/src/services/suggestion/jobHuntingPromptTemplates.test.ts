import { describe, it, expect } from 'vitest';
import { 
  createJobSeekerPrompt, 
  createCareerChangerPrompt, 
  JobHuntingPromptInput 
} from './jobHuntingPromptTemplates';

/**
 * 就活・転職活動者向けプロンプトテンプレートのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際の関数の動作を検証
 * - 就活生と転職活動者の異なるニーズに対応した内容生成を確認
 * - プロンプトの品質とコンテキストの適切性を検証
 */
describe('jobHuntingPromptTemplates', () => {
  
  describe('createJobSeekerPrompt', () => {
    it('基本的な就活生向けプロンプトを生成する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 15,
        situation: 'home'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      // 就活生向けの基本要素が含まれていることを確認
      expect(prompt).toContain('就職活動中の若者（20-24歳）');
      expect(prompt).toContain('キャリアカウンセラー');
      expect(prompt).toContain('15分');
      expect(prompt).toContain('自宅');
      expect(prompt).toContain('JSON形式で3つの提案');
    });
    
    it('準備段階のフェーズ固有のガイダンスを含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: 'preparation',
        time: 10,
        situation: 'home'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('準備段階（自己分析・業界研究）');
      expect(prompt).toContain('自己分析の迷いや不安');
    });
    
    it('面接段階のフェーズ固有のガイダンスを含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: 'interviewing',
        time: 5,
        situation: 'outside'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('面接段階');
      expect(prompt).toContain('面接前の緊張緩和');
      expect(prompt).toContain('呼吸法やリラックス法');
    });
    
    it('不採用後のフェーズ固有のガイダンスを含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: 'rejected',
        time: 30,
        situation: 'home'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('不採用後');
      expect(prompt).toContain('自己肯定感の回復');
      expect(prompt).toContain('感情を受け入れる');
    });
    
    it('特定の悩みとストレス要因を含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 15,
        situation: 'workplace',
        concern: '面接での話し方が分からない',
        stressFactor: 'ES締切のプレッシャー'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('面接での話し方が分からない');
      expect(prompt).toContain('ES締切のプレッシャー');
    });
    
    it('活動期間の長期化に応じた配慮を含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 20,
        situation: 'home',
        activityDuration: 'over_6months'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('6ヶ月以上');
      expect(prompt).toContain('長期化による焦り');
    });
    
    it('職場での状況要件を適切に反映する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 5,
        situation: 'workplace'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('職場（現職の休憩時間）');
      expect(prompt).toContain('職場で目立たず実践でき');
    });
  });
  
  describe('createCareerChangerPrompt', () => {
    it('基本的な転職活動者向けプロンプトを生成する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        time: 15,
        situation: 'home'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      // 転職活動者向けの基本要素が含まれていることを確認
      expect(prompt).toContain('転職活動中の方（25-49歳）');
      expect(prompt).toContain('キャリアアドバイザー');
      expect(prompt).toContain('現職との両立');
      expect(prompt).toContain('15分');
      expect(prompt).toContain('自宅');
      expect(prompt).toContain('JSON形式で3つの提案');
    });
    
    it('転職特有の準備段階ガイダンスを含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        currentPhase: 'preparation',
        time: 10,
        situation: 'workplace'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('準備段階（キャリアの棚卸し）');
      expect(prompt).toContain('キャリアの価値を再認識');
    });
    
    it('面接段階でのプロフェッショナル配慮を含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        currentPhase: 'interviewing',
        time: 5,
        situation: 'outside'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('プレゼンスキルを高める');
      expect(prompt).toContain('経験者としての自信');
    });
    
    it('結果待ち・交渉段階のストレス配慮を含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        currentPhase: 'waiting',
        time: 20,
        situation: 'home'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('結果待ち・交渉段階');
      expect(prompt).toContain('条件交渉のストレス');
      expect(prompt).toContain('家族との関係性');
    });
    
    it('40代後半向けの特別な配慮メッセージを含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        time: 15,
        situation: 'home'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('40代後半の方には');
      expect(prompt).toContain('培ってこられた知見や判断力');
      expect(prompt).toContain('何物にも代えがたい財産');
    });
    
    it('ビジネスパーソン向けの要件を適切に反映する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        time: 10,
        situation: 'workplace'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('ビジネスパーソンとして違和感のない');
      expect(prompt).toContain('ワークライフバランスを意識');
      expect(prompt).toContain('プロフェッショナルな励まし');
    });
    
    it('長期化した転職活動への配慮を含む', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        time: 30,
        situation: 'home',
        activityDuration: 'over_6months'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('6ヶ月以上');
      expect(prompt).toContain('長期化による焦り');
    });
  });
  
  describe('状況別の要件テスト', () => {
    it('通勤中の状況要件を正しく反映する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 15,
        situation: 'commuting'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('通勤・移動中');
      expect(prompt).toContain('電車やバスの中でも静かに実践');
    });
    
    it('面接会場での状況要件を正しく反映する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 5,
        situation: 'interview_venue'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('面接会場付近');
      expect(prompt).toContain('面接直前でも落ち着いて実践');
      expect(prompt).toContain('身だしなみを乱さない');
    });
  });
  
  describe('プロンプトの品質と構造テスト', () => {
    it('就活生プロンプトに必要な全ての要素が含まれている', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: 'applying',
        time: 15,
        situation: 'home',
        concern: 'ESの書き方',
        stressFactor: '締切プレッシャー',
        activityDuration: '3-6months'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      // ペルソナ設定
      expect(prompt).toContain('キャリアカウンセラー');
      
      // 状況説明
      expect(prompt).toContain('応募段階');
      expect(prompt).toContain('ESの書き方');
      expect(prompt).toContain('締切プレッシャー');
      expect(prompt).toContain('3-6ヶ月');
      
      // 要件説明
      expect(prompt).toContain('15分で完了');
      expect(prompt).toContain('認知的気晴らしと行動的気晴らし');
      
      // 出力形式指定
      expect(prompt).toContain('タイトル');
      expect(prompt).toContain('説明');
      expect(prompt).toContain('カテゴリ');
      expect(prompt).toContain('手順');
      expect(prompt).toContain('ガイド');
      expect(prompt).toContain('科学的根拠');
    });
    
    it('転職活動者プロンプトにプロフェッショナル要素が含まれている', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        currentPhase: 'interviewing',
        time: 10,
        situation: 'workplace'
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('25-49歳');
      expect(prompt).toContain('プロフェッショナル');
      expect(prompt).toContain('ビジネス効果');
      expect(prompt).toContain('専門的かつ前向き');
    });
    
    it('異なる活動タイプで異なるトーンのプロンプトが生成される', () => {
      const jobSeekerInput: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 15,
        situation: 'home'
      };
      
      const careerChangerInput: JobHuntingPromptInput = {
        activityType: 'career_change',
        time: 15,
        situation: 'home'
      };
      
      const jobSeekerPrompt = createJobSeekerPrompt(jobSeekerInput);
      const careerChangerPrompt = createCareerChangerPrompt(careerChangerInput);
      
      // 就活生向けは優しいトーン
      expect(jobSeekerPrompt).toContain('応援しています');
      expect(jobSeekerPrompt).toContain('一息つきませんか');
      expect(jobSeekerPrompt).toContain('あなたのペースで');
      
      // 転職活動者向けはプロフェッショナルなトーン
      expect(careerChangerPrompt).toContain('実践的で共感的');
      expect(careerChangerPrompt).toContain('ビジネスパーソン');
      expect(careerChangerPrompt).toContain('プロフェッショナルな励まし');
    });
  });
  
  describe('エッジケースのテスト', () => {
    it('未定義のフェーズでもデフォルトガイダンスを提供する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: undefined,
        time: 10,
        situation: 'home'
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toContain('就職・転職活動中');
      expect(prompt).toContain('活動全般のストレス軽減');
    });
    
    it('未定義の状況でもデフォルト要件を提供する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'career_change',
        time: 15,
        situation: 'unknown_situation' as any
      };
      
      const prompt = createCareerChangerPrompt(input);
      
      expect(prompt).toContain('場所を選ばず実践できる');
    });
    
    it('空の悩みとストレス要因でも正常に動作する', () => {
      const input: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        time: 20,
        situation: 'outside',
        concern: '',
        stressFactor: ''
      };
      
      const prompt = createJobSeekerPrompt(input);
      
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('20分');
    });
  });
});