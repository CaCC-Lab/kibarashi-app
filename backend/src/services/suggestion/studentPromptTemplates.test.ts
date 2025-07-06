// CLAUDE-GENERATED: TDD - 学生向けプロンプトテンプレートのテスト
// パターン: Red-Green-Refactor

import { describe, it, expect } from 'vitest';
import { 
  STUDENT_PROMPT_TEMPLATES, 
  STUDENT_AB_TEST_METRICS,
  createStudentPrompt
} from './studentPromptTemplates';

describe('Student Prompt Templates', () => {
  describe('Template Structure', () => {
    it('should have templates for all student situations', () => {
      expect(STUDENT_PROMPT_TEMPLATES).toHaveProperty('studying');
      expect(STUDENT_PROMPT_TEMPLATES).toHaveProperty('school');
      expect(STUDENT_PROMPT_TEMPLATES).toHaveProperty('commuting');
    });

    it('should have proper benefit structure for studying examples', () => {
      const studyingExamples = STUDENT_PROMPT_TEMPLATES.studying.examples;
      expect(studyingExamples.length).toBeGreaterThan(0);
      
      studyingExamples.forEach(example => {
        expect(example).toHaveProperty('benefit');
        expect(example.benefit).toHaveProperty('immediate');
        expect(example.benefit).toHaveProperty('shortTerm');
        expect(example.benefit).toHaveProperty('motivation');
        expect(example).toHaveProperty('returnToStudyTip');
      });
    });

    it('should have actionable steps in each example', () => {
      Object.values(STUDENT_PROMPT_TEMPLATES).forEach(situation => {
        situation.examples.forEach(example => {
          expect(example.steps).toBeDefined();
          expect(Array.isArray(example.steps)).toBe(true);
          expect(example.steps.length).toBeGreaterThanOrEqual(3);
          expect(example.steps.length).toBeLessThanOrEqual(5);
        });
      });
    });
  });

  describe('A/B Test Metrics', () => {
    it('should define all metric categories', () => {
      expect(STUDENT_AB_TEST_METRICS).toHaveProperty('engagement');
      expect(STUDENT_AB_TEST_METRICS).toHaveProperty('satisfaction');
      expect(STUDENT_AB_TEST_METRICS).toHaveProperty('studyImpact');
      expect(STUDENT_AB_TEST_METRICS).toHaveProperty('sharing');
    });

    it('should have measurable metrics in each category', () => {
      Object.values(STUDENT_AB_TEST_METRICS).forEach(category => {
        const metricKeys = Object.keys(category);
        expect(metricKeys.length).toBeGreaterThan(0);
        
        metricKeys.forEach(key => {
          expect(typeof category[key]).toBe('string');
          expect(category[key].length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('createStudentPrompt function', () => {
    it('should generate a prompt with specific student concerns', () => {
      const input = {
        concern: '試験勉強に集中できない',
        subject: '数学',
        time: 10,
        situation: 'studying' as const
      };
      const prompt = createStudentPrompt(input);
      
      expect(prompt).toContain('学生向けの気晴らし');
      expect(prompt).toContain('試験勉強に集中できない');
      expect(prompt).toContain('benefit');
      expect(prompt).toContain('returnToStudyTip');
    });

    it('should handle empty inputs gracefully', () => {
      const input = { 
        concern: '', 
        subject: '', 
        time: 5,
        situation: 'studying' as const
      };
      const prompt = createStudentPrompt(input);
      
      // フォールバック用の汎用的な学生向けプロンプトが生成されることを確認
      expect(prompt).toContain('学生生活全般のストレス');
      expect(prompt).not.toContain('concern:');
    });

    it('should include situation-specific context', () => {
      const situations = ['studying', 'school', 'commuting'] as const;
      
      situations.forEach(situation => {
        const prompt = createStudentPrompt({
          concern: 'ストレスを感じる',
          subject: '',
          time: 5,
          situation
        });
        
        if (situation === 'studying') {
          expect(prompt).toContain('勉強中');
        } else if (situation === 'school') {
          expect(prompt).toContain('学校');
        } else if (situation === 'commuting') {
          expect(prompt).toContain('通学中');
        }
      });
    });

    it('should request JSON format with benefit fields', () => {
      const prompt = createStudentPrompt({
        concern: 'テスト不安',
        subject: '英語',
        time: 15,
        situation: 'studying'
      });
      
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('"benefit"');
      expect(prompt).toContain('"immediate"');
      expect(prompt).toContain('"shortTerm"');
      expect(prompt).toContain('"motivation"');
    });
  });

  describe('Content Quality', () => {
    it('should have student-friendly language in descriptions', () => {
      Object.values(STUDENT_PROMPT_TEMPLATES).forEach(situation => {
        situation.examples.forEach(example => {
          // Check for overly formal language
          expect(example.description).not.toMatch(/貴方|御|致します/);
          // Check for student-relatable terms
          expect(example.description).toMatch(/リフレッシュ|スッキリ|チャレンジ|楽しい/);
        });
      });
    });

    it('should include evidence-based benefits', () => {
      Object.values(STUDENT_PROMPT_TEMPLATES).forEach(situation => {
        situation.examples.forEach(example => {
          // Check for quantifiable benefits
          expect(example.benefit.shortTerm).toMatch(/\d+%|倍|向上|アップ/);
        });
      });
    });

    it('should provide practical return-to-study tips', () => {
      Object.values(STUDENT_PROMPT_TEMPLATES).forEach(situation => {
        situation.examples.forEach(example => {
          expect(example.returnToStudyTip).toBeDefined();
          expect(example.returnToStudyTip.length).toBeGreaterThan(10);
          // Tips should be actionable
          expect(example.returnToStudyTip).toMatch(/する|しよう|してから|決める/);
        });
      });
    });
  });
});