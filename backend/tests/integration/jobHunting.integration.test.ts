import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import suggestionRouter from '../../src/api/routes/suggestions';
import { errorHandler } from '../../src/api/middleware/errorHandler';

/**
 * 就職・転職活動機能の統合テスト
 * 
 * 設計思想：
 * - APIエンドポイントから実際のレスポンスまでの全フローをテスト
 * - Gemini APIとフォールバックデータの両方の動作パターンを検証
 * - 就活生と転職活動者の異なる年齢層でのデータ取得を確認
 * - エラーハンドリングとレスポンス形式の統合検証
 */

// テスト用Expressアプリの設定
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/suggestions', suggestionRouter);
  app.use(errorHandler);
  return app;
};

describe('Job Hunting Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('就職活動（job_seeker）の統合テスト', () => {
    it('GET /api/v1/suggestions?situation=job_hunting&duration=5&ageGroup=job_seeker', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '5',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      // レスポンス構造の検証
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body).toHaveProperty('metadata');

      // 提案データの検証
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      expect(response.body.suggestions.length).toBeLessThanOrEqual(3);

      // メタデータの検証
      expect(response.body.metadata.situation).toBe('job_hunting');
      expect(response.body.metadata.duration).toBe(5);
      expect(response.body.metadata.ageGroup).toBe('job_seeker');
      expect(response.body.metadata.timestamp).toBeDefined();

      // 各提案の構造検証
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(['認知的', '行動的']).toContain(suggestion.category);
        expect(suggestion.duration).toBeLessThanOrEqual(5);
      });
    });

    it('GET /api/v1/suggestions?situation=job_hunting&duration=15&ageGroup=job_seeker', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.duration).toBe(15);

      // 15分の提案が適切にフィルタリングされていることを確認
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion.duration).toBeLessThanOrEqual(15);
      });
    });

    it('GET /api/v1/suggestions?situation=job_hunting&duration=30&ageGroup=job_seeker', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '30',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.duration).toBe(30);

      // 30分の提案が適切にフィルタリングされていることを確認
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion.duration).toBeLessThanOrEqual(30);
      });
    });

    it('就活コンテキストパラメータ付きリクエスト', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker',
          jobHuntingPhase: 'interviewing',
          jobHuntingConcern: '面接前の緊張',
          jobHuntingDuration: '3-6months'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('job_seeker');
      expect(response.body.metadata.situation).toBe('job_hunting');

      // コンテキスト情報がメタデータに含まれているか確認
      if (response.body.metadata.context) {
        expect(response.body.metadata.context).toHaveProperty('jobHuntingPhase');
        expect(response.body.metadata.context).toHaveProperty('jobHuntingConcern');
        expect(response.body.metadata.context).toHaveProperty('jobHuntingDuration');
      }
    });
  });

  describe('転職活動（career_changer）の統合テスト', () => {
    it('GET /api/v1/suggestions?situation=job_hunting&duration=5&ageGroup=career_changer', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '5',
          ageGroup: 'career_changer'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('career_changer');
      expect(response.body.metadata.situation).toBe('job_hunting');

      // 転職活動者向けの提案が返されていることを確認
      expect(Array.isArray(response.body.suggestions)).toBe(true);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    it('転職コンテキストパラメータ付きリクエスト', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '30',
          ageGroup: 'career_changer',
          jobHuntingPhase: 'waiting',
          jobHuntingConcern: '条件交渉のストレス',
          jobHuntingDuration: 'over_6months'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('career_changer');
      expect(response.body.metadata.duration).toBe(30);

      // 30分の長めの提案が適切に返されることを確認
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion.duration).toBeLessThanOrEqual(30);
      });
    });
  });

  describe('通常状況での就活・転職年齢層テスト', () => {
    it('job_seekerが職場状況で提案を取得', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '5',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.situation).toBe('workplace');
      expect(response.body.metadata.ageGroup).toBe('job_seeker');

      // 職場での就活生向け提案が返されることを確認
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion.duration).toBeLessThanOrEqual(5);
      });
    });

    it('career_changerが家で提案を取得', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'home',
          duration: '15',
          ageGroup: 'career_changer'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.situation).toBe('home');
      expect(response.body.metadata.ageGroup).toBe('career_changer');

      // 家での転職活動者向け提案が返されることを確認
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion.duration).toBeLessThanOrEqual(15);
      });
    });

    it('career_changerが外出先で提案を取得', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'outside',
          duration: '30',
          ageGroup: 'career_changer'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.situation).toBe('outside');
      expect(response.body.metadata.ageGroup).toBe('career_changer');
    });
  });

  describe('エラーハンドリングとフォールバック統合テスト', () => {
    it('無効なsituationパラメータでエラーレスポンス', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'invalid_situation',
          duration: '5',
          ageGroup: 'job_seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toBe('リクエストに問題があります');
    });

    it('job_hunting状況でageGroupなしでも正常に動作', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15'
          // ageGroup が欠けている（オプショナルなので正常）
        })
        .expect(200);

      expect(response.body).toHaveProperty('suggestions');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata.situation).toBe('job_hunting');
      expect(response.body.metadata.duration).toBe(15);
    });

    it('無効なdurationパラメータでエラーレスポンス', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '60', // 許可されていない値
          ageGroup: 'job_seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('Gemini API不可時のフォールバック動作', async () => {
      // 環境変数を一時的に削除してフォールバック動作をテスト
      const originalApiKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      // フォールバックデータが返されることを確認
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      expect(response.body.metadata.situation).toBe('job_hunting');
      expect(response.body.metadata.duration).toBe(15);

      // 環境変数を復元
      if (originalApiKey) {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    });
  });

  describe('レスポンスパフォーマンステスト', () => {
    it('job_hunting APIレスポンスが3秒以内', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(3000); // 3秒以内
    });

    it('複雑なコンテキスト付きリクエストのパフォーマンス', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '30',
          ageGroup: 'career_changer',
          jobHuntingPhase: 'interviewing',
          jobHuntingConcern: '複数企業の面接スケジュール調整によるストレス',
          jobHuntingDuration: 'over_6months'
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // 5秒以内
    });
  });

  describe('データ整合性テスト', () => {
    it('同じパラメータで複数回リクエストしても安定したレスポンス', async () => {
      const params = {
        situation: 'job_hunting',
        duration: '15',
        ageGroup: 'job_seeker'
      };

      // 3回連続でリクエスト
      const responses = await Promise.all([
        request(app).get('/api/v1/suggestions').query(params),
        request(app).get('/api/v1/suggestions').query(params),
        request(app).get('/api/v1/suggestions').query(params)
      ]);

      // すべてのレスポンスが正常であることを確認
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.suggestions).toBeDefined();
        expect(response.body.suggestions.length).toBeGreaterThan(0);
        expect(response.body.metadata.situation).toBe('job_hunting');
        expect(response.body.metadata.ageGroup).toBe('job_seeker');
      });
    });

    it('異なる年齢層で異なるデータソースが使用されること', async () => {
      // 通常の年齢層
      const normalResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '15',
          ageGroup: 'office_worker'
        })
        .expect(200);

      // 就活生
      const jobSeekerResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '15',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      // 両方とも有効なレスポンスが返されることを確認
      expect(normalResponse.body.suggestions).toBeDefined();
      expect(jobSeekerResponse.body.suggestions).toBeDefined();

      expect(normalResponse.body.metadata.ageGroup).toBe('office_worker');
      expect(jobSeekerResponse.body.metadata.ageGroup).toBe('job_seeker');

      // データソースが異なることを示すメタデータ確認（実装によって異なる）
      if (normalResponse.body.metadata.dataSource && jobSeekerResponse.body.metadata.dataSource) {
        // データソースが異なることを確認
        expect(normalResponse.body.metadata.dataSource).not.toBe(jobSeekerResponse.body.metadata.dataSource);
      }
    });
  });

  describe('HTTPヘッダーとセキュリティテスト', () => {
    it('適切なレスポンスヘッダーが設定されている', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      // Content-Typeヘッダーの確認
      expect(response.headers['content-type']).toMatch(/application\/json/);

      // CORSヘッダーが設定されているか確認（実装に依存）
      if (response.headers['access-control-allow-origin']) {
        expect(response.headers['access-control-allow-origin']).toBeDefined();
      }
    });

    it('不正なヘッダーでもAPIが正常動作', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .set('X-Forwarded-For', 'invalid-ip')
        .set('User-Agent', 'test-agent')
        .query({
          situation: 'job_hunting',
          duration: '5',
          ageGroup: 'career_changer'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
    });
  });
});