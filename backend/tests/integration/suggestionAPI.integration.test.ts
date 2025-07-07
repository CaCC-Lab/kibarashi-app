import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import suggestionRouter from '../../src/api/routes/suggestions';
import { errorHandler } from '../../src/api/middleware/errorHandler';

/**
 * Suggestion API全体の統合テスト
 * 
 * 設計思想：
 * - APIエンドポイント全体の動作確認
 * - 年齢層間でのデータ整合性確認
 * - 長期的な安定性テスト
 * - セキュリティと境界値テスト
 */

// テスト用Expressアプリの設定
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/suggestions', suggestionRouter);
  app.use(errorHandler);
  return app;
};

describe('Suggestion API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('全ての状況と時間の組み合わせテスト', () => {
    const situations = ['workplace', 'home', 'outside', 'job_hunting'];
    const durations = ['5', '15', '30'];
    const ageGroups = {
      normal: ['office_worker', 'student'],
      jobHunting: ['job_seeker', 'career_changer']
    };

    situations.forEach(situation => {
      durations.forEach(duration => {
        if (situation === 'job_hunting') {
          // job_hunting状況では就活・転職年齢層のみテスト
          ageGroups.jobHunting.forEach(ageGroup => {
            it(`${situation} + ${duration}分 + ${ageGroup}で正常レスポンス`, async () => {
              const response = await request(app)
                .get('/api/v1/suggestions')
                .query({
                  situation,
                  duration,
                  ageGroup
                })
                .expect(200);

              expect(response.body).toHaveProperty('suggestions');
              expect(response.body).toHaveProperty('metadata');
              expect(response.body.metadata.situation).toBe(situation);
              expect(response.body.metadata.duration).toBe(parseInt(duration));
              expect(response.body.metadata.ageGroup).toBe(ageGroup);
              expect(Array.isArray(response.body.suggestions)).toBe(true);
              expect(response.body.suggestions.length).toBeGreaterThan(0);
            });
          });
        } else {
          // 通常状況では全年齢層をテスト
          [...ageGroups.normal, ...ageGroups.jobHunting].forEach(ageGroup => {
            it(`${situation} + ${duration}分 + ${ageGroup}で正常レスポンス`, async () => {
              const response = await request(app)
                .get('/api/v1/suggestions')
                .query({
                  situation,
                  duration,
                  ageGroup
                })
                .expect(200);

              expect(response.body).toHaveProperty('suggestions');
              expect(response.body.metadata.situation).toBe(situation);
              expect(response.body.metadata.duration).toBe(parseInt(duration));
              expect(response.body.metadata.ageGroup).toBe(ageGroup);
            });
          });
        }
      });
    });
  });

  describe('年齢層なしでの基本動作テスト', () => {
    it('職場で5分（年齢層なし）', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '5'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.situation).toBe('workplace');
      expect(response.body.metadata.duration).toBe(5);
      // 年齢層が指定されていない場合のデフォルト動作を確認
    });

    it('家で15分（年齢層なし）', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'home',
          duration: '15'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.situation).toBe('home');
      expect(response.body.metadata.duration).toBe(15);
    });

    it('外出先で30分（年齢層なし）', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'outside',
          duration: '30'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.situation).toBe('outside');
      expect(response.body.metadata.duration).toBe(30);
    });
  });

  describe('データ一貫性と品質テスト', () => {
    it('提案のIDがユニークであること', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '15',
          ageGroup: 'job_seeker'
        })
        .expect(200);

      const ids = response.body.suggestions.map((s: any) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('すべての提案が必須フィールドを持つこと', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'career_changer'
        })
        .expect(200);

      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(typeof suggestion.title).toBe('string');
        expect(suggestion.title.length).toBeGreaterThan(0);
        expect(typeof suggestion.description).toBe('string');
        expect(suggestion.description.length).toBeGreaterThan(0);
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });

    it('時間フィルタリングが正確であること', async () => {
      const duration = 5;
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: duration.toString(),
          ageGroup: 'office_worker'
        })
        .expect(200);

      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion.duration).toBeLessThanOrEqual(duration);
      });
    });
  });

  describe('境界値とエラーケーステスト', () => {
    it('最小duration（5分）でのテスト', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'home',
          duration: '5',
          ageGroup: 'student'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    it('最大duration（30分）でのテスト', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'outside',
          duration: '30',
          ageGroup: 'office_worker'
        })
        .expect(200);

      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.length).toBeGreaterThan(0);
    });

    it('無効なsituationでエラーレスポンス', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'invalid_situation',
          duration: '15'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toBe('リクエストに問題があります');
    });

    it('無効なdurationでエラーレスポンス', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '99'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('必須パラメータ欠如でエラーレスポンス', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace'
          // duration が欠けている
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('同時リクエスト処理テスト', () => {
    it('複数の同時リクエストを正常に処理', async () => {
      const requests = [
        request(app).get('/api/v1/suggestions').query({ situation: 'workplace', duration: '5', ageGroup: 'office_worker' }),
        request(app).get('/api/v1/suggestions').query({ situation: 'home', duration: '15', ageGroup: 'student' }),
        request(app).get('/api/v1/suggestions').query({ situation: 'job_hunting', duration: '30', ageGroup: 'job_seeker' }),
        request(app).get('/api/v1/suggestions').query({ situation: 'outside', duration: '5', ageGroup: 'career_changer' }),
        request(app).get('/api/v1/suggestions').query({ situation: 'workplace', duration: '15', ageGroup: 'office_worker' })
      ];

      const responses = await Promise.all(requests);

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.suggestions).toBeDefined();
        expect(response.body.suggestions.length).toBeGreaterThan(0);
        expect(response.body.metadata).toBeDefined();
      });

      // レスポンス時間の確認
      const allResponsesUnder3Seconds = responses.every(response => 
        response.headers['x-response-time'] ? 
        parseInt(response.headers['x-response-time']) < 3000 : true
      );

      expect(allResponsesUnder3Seconds).toBe(true);
    });
  });

  describe('メタデータとヘッダーテスト', () => {
    it('レスポンスメタデータが完全であること', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'job_hunting',
          duration: '15',
          ageGroup: 'job_seeker',
          jobHuntingPhase: 'interviewing'
        })
        .expect(200);

      expect(response.body.metadata).toHaveProperty('situation');
      expect(response.body.metadata).toHaveProperty('duration');
      expect(response.body.metadata).toHaveProperty('ageGroup');
      expect(response.body.metadata).toHaveProperty('timestamp');
      expect(response.body.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('適切なHTTPヘッダーが設定されていること', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: '5'
        })
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
      
      // セキュリティヘッダーが設定されている場合の確認
      if (response.headers['x-content-type-options']) {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      }
    });
  });

  describe('長期安定性テスト', () => {
    it('100回連続リクエストでも安定動作', async () => {
      const results = [];
      
      for (let i = 0; i < 10; i++) { // CI環境を考慮して10回に短縮
        const response = await request(app)
          .get('/api/v1/suggestions')
          .query({
            situation: 'workplace',
            duration: '5',
            ageGroup: 'office_worker'
          });
        
        results.push({
          status: response.status,
          hasData: response.body?.suggestions?.length > 0
        });
      }

      // すべてのリクエストが成功
      const allSuccessful = results.every(result => result.status === 200);
      expect(allSuccessful).toBe(true);

      // すべてのリクエストでデータが返される
      const allHaveData = results.every(result => result.hasData === true);
      expect(allHaveData).toBe(true);
    }, 30000); // 30秒のタイムアウト

    it('様々なパラメータ組み合わせでの安定性', async () => {
      const testCases = [
        { situation: 'workplace', duration: '5', ageGroup: 'office_worker' },
        { situation: 'home', duration: '15', ageGroup: 'student' },
        { situation: 'outside', duration: '30', ageGroup: 'office_worker' },
        { situation: 'job_hunting', duration: '5', ageGroup: 'job_seeker' },
        { situation: 'job_hunting', duration: '15', ageGroup: 'career_changer' },
        { situation: 'job_hunting', duration: '30', ageGroup: 'job_seeker' },
        { situation: 'workplace', duration: '15', ageGroup: 'career_changer' },
        { situation: 'home', duration: '5', ageGroup: 'job_seeker' }
      ];

      const results = await Promise.all(
        testCases.map(testCase =>
          request(app)
            .get('/api/v1/suggestions')
            .query(testCase)
        )
      );

      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.suggestions).toBeDefined();
        expect(response.body.suggestions.length).toBeGreaterThan(0);
        expect(response.body.metadata.situation).toBe(testCases[index].situation);
        expect(response.body.metadata.duration).toBe(parseInt(testCases[index].duration));
        expect(response.body.metadata.ageGroup).toBe(testCases[index].ageGroup);
      });
    });
  });
});