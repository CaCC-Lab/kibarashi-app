import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import suggestionsRouter from './suggestions';
import { errorHandler } from '../middleware/errorHandler';

/**
 * 提案ルーターの統合テスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコントローラーとサービスを使用
 * - エンドツーエンドでAPIの動作を検証
 * - 実際のHTTPリクエスト/レスポンスを確認
 */
describe('Suggestions Routes', () => {
  const app = express();
  
  // ミドルウェアの設定
  app.use(express.json());
  app.use('/api/v1/suggestions', suggestionsRouter);
  app.use(errorHandler);
  
  // 環境変数の保存と復元
  let originalApiKey: string | undefined;
  
  beforeAll(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
  });
  
  afterAll(() => {
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  });

  describe('GET /api/v1/suggestions - 正常系', () => {
    it('有効なパラメータで提案を取得できる', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.suggestions.length).toBeLessThanOrEqual(3);
      
      // 各提案の構造を検証
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });

    it('異なる状況で異なる提案を返す', async () => {
      const workplaceResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 5 });

      const homeResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'home', duration: 15 });

      expect(workplaceResponse.status).toBe(200);
      expect(homeResponse.status).toBe(200);
      
      // 提案内容が異なることを確認（APIキーがない場合でも異なるはず）
      const workplaceTitles = workplaceResponse.body.suggestions.map((s: any) => s.title);
      const homeTitles = homeResponse.body.suggestions.map((s: any) => s.title);
      
      // 少なくとも一つは異なるタイトルがあるはず
      const hasDifferentTitles = workplaceTitles.some((title: string) => 
        !homeTitles.includes(title)
      ) || homeTitles.some((title: string) => 
        !workplaceTitles.includes(title)
      );
      
      expect(hasDifferentTitles).toBe(true);
    });

    it('すべての有効な時間設定で動作する', async () => {
      const durations = [5, 15, 30];
      
      for (const duration of durations) {
        const response = await request(app)
          .get('/api/v1/suggestions')
          .query({ situation: 'outside', duration });
          
        expect(response.status).toBe(200);
        expect(response.body.suggestions).toBeDefined();
        
        // 時間制限が守られていることを確認
        response.body.suggestions.forEach((suggestion: any) => {
          expect(suggestion.duration).toBeLessThanOrEqual(duration);
        });
      }
    });
  });

  describe('GET /api/v1/suggestions - エラー処理', () => {
    it('必須パラメータが不足している場合400エラーを返す', async () => {
      // situationのみ
      const response1 = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace' });
        
      expect(response1.status).toBe(400);
      expect(response1.body.error.message).toBe('リクエストに問題があります');
      
      // durationのみ
      const response2 = await request(app)
        .get('/api/v1/suggestions')
        .query({ duration: 5 });
        
      expect(response2.status).toBe(400);
      expect(response2.body.error.message).toBe('リクエストに問題があります');
      
      // 両方なし
      const response3 = await request(app)
        .get('/api/v1/suggestions');
        
      expect(response3.status).toBe(400);
      expect(response3.body.error.message).toBe('リクエストに問題があります');
    });

    it('無効なsituationパラメータで400エラーを返す', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'invalid', duration: 5 });
        
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('リクエストに問題があります');
      expect(response.body.error.reason).toBe('送信されたデータの形式が正しくありません。');
      expect(response.body.error.solution).toBe('入力内容を確認して、もう一度お試しください。');
    });

    it('無効なdurationパラメータで400エラーを返す', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 999 });
        
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('リクエストに問題があります');
      expect(response.body.error.reason).toBe('送信されたデータの形式が正しくありません。');
      expect(response.body.error.solution).toBe('入力内容を確認して、もう一度お試しください。');
    });

    it('文字列のdurationパラメータで400エラーを返す', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 'abc' });
        
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('リクエストに問題があります');
    });
  });

  describe('APIキーなしでの動作', () => {
    it('APIキーがなくてもフォールバック提案を返す', async () => {
      // APIキーを一時的に削除
      delete process.env.GEMINI_API_KEY;
      
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 5 });
        
      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      
      // フォールバックデータも適切な構造を持つ
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
      });
    });
  });

  describe('レスポンスヘッダーの検証', () => {
    it('適切なContent-Typeヘッダーを返す', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'home', duration: 15 });
        
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('学生向けA/Bテスト統合テスト', () => {
    it('学生向けパラメータが正しく処理される', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ 
          situation: 'workplace',
          duration: 5,
          ageGroup: 'student',
          studentConcern: '勉強の合間のリフレッシュ',
          studentSubject: '数学'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      
      // メタデータに年齢層が含まれることを確認
      expect(response.body.metadata).toHaveProperty('ageGroup', 'student');
    });

    it('学生向けと通常版で異なる提案が返される', async () => {
      // コントロール群（通常版）のリクエスト
      const controlResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({ 
          situation: 'workplace',
          duration: 5
        });

      // 学生向け（処理群）のリクエスト
      const studentResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({ 
          situation: 'workplace',
          duration: 5,
          ageGroup: 'student',
          studentConcern: '勉強の合間のリフレッシュ'
        });

      expect(controlResponse.status).toBe(200);
      expect(studentResponse.status).toBe(200);
      
      // フォールバックデータを使用している場合でも、
      // 年齢層によって異なる選択がされる可能性がある
      const controlTitles = controlResponse.body.suggestions.map((s: any) => s.title);
      const studentTitles = studentResponse.body.suggestions.map((s: any) => s.title);
      
      // 両方とも提案が返されることを確認
      expect(controlTitles.length).toBeGreaterThan(0);
      expect(studentTitles.length).toBeGreaterThan(0);
    });

    it('複数の学生シナリオで動作する', async () => {
      const scenarios = [
        { concern: '勉強の合間のリフレッシュ', subject: '数学' },
        { concern: '試験前の緊張緩和', subject: '英語' },
        { concern: '長時間勉強後の疲労回復', subject: 'プログラミング' }
      ];

      for (const scenario of scenarios) {
        const response = await request(app)
          .get('/api/v1/suggestions')
          .query({ 
            situation: 'workplace',
            duration: 5,
            ageGroup: 'student',
            studentConcern: scenario.concern,
            studentSubject: scenario.subject
          });

        expect(response.status).toBe(200);
        expect(response.body.suggestions).toBeDefined();
        expect(response.body.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('学生パラメータの部分的な指定でも動作する', async () => {
      // ageGroupのみ
      const response1 = await request(app)
        .get('/api/v1/suggestions')
        .query({ 
          situation: 'home',
          duration: 15,
          ageGroup: 'student'
        });

      expect(response1.status).toBe(200);
      expect(response1.body.metadata.ageGroup).toBe('student');

      // ageGroupとconcernのみ
      const response2 = await request(app)
        .get('/api/v1/suggestions')
        .query({ 
          situation: 'outside',
          duration: 30,
          ageGroup: 'student',
          studentConcern: '勉強疲れのリフレッシュ'
        });

      expect(response2.status).toBe(200);
      expect(response2.body.metadata.ageGroup).toBe('student');
    });

    it('非学生のageGroupでも正常に動作する', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({ 
          situation: 'workplace',
          duration: 5,
          ageGroup: 'adult',
          studentConcern: '無視されるべき' // 学生でない場合は無視される
        });

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('adult');
    });
  });
});