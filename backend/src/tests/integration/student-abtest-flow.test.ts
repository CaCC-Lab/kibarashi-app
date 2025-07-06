import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import suggestionsRouter from '../../api/routes/suggestions';
import { errorHandler } from '../../api/middleware/errorHandler';

/**
 * 学生向けA/Bテストシステムの統合テスト
 * 
 * 設計思想：
 * - フロントエンドからバックエンドまでの完全なフローをテスト
 * - 実際のHTTPリクエストとレスポンスで検証
 * - A/Bテストグループ（A vs B）の動作差分を確認
 * - 学生向けパラメータが正しく処理されることを保証
 */
describe('学生向けA/Bテストシステム 統合テスト', () => {
  const app = express();
  let originalApiKey: string | undefined;

  // Express アプリケーションのセットアップ
  beforeAll(() => {
    app.use(express.json());
    app.use('/api/v1/suggestions', suggestionsRouter);
    app.use(errorHandler);
    
    // 環境変数の保存
    originalApiKey = process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    // 環境変数の復元
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  });

  beforeEach(() => {
    // 各テスト前にAPIキーを削除してフォールバックを使用
    delete process.env.GEMINI_API_KEY;
  });

  describe('A/Bテストグループの動作検証', () => {
    const baseParams = {
      situation: 'workplace',
      duration: 5
    };

    it('コントロール群（A）: 標準パラメータで提案を取得', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(baseParams);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      
      // メタデータの確認
      expect(response.body.metadata.situation).toBe('workplace');
      expect(response.body.metadata.duration).toBe(5);
      expect(response.body.metadata).not.toHaveProperty('ageGroup');
    });

    it('処理群（B）: 学生向けパラメータで提案を取得', async () => {
      const studentParams = {
        ...baseParams,
        ageGroup: 'student',
        studentConcern: '勉強の合間のリフレッシュ',
        studentSubject: '数学'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(studentParams);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      
      // 学生向けメタデータの確認
      expect(response.body.metadata.situation).toBe('workplace');
      expect(response.body.metadata.duration).toBe(5);
      expect(response.body.metadata.ageGroup).toBe('student');
    });
  });

  describe('学生向けパラメータの詳細テスト', () => {
    it('学生向けシナリオ1: 勉強中のリフレッシュ', async () => {
      const scenario = {
        situation: 'workplace',
        duration: 5,
        ageGroup: 'student',
        studentConcern: '長時間勉強による集中力低下',
        studentSubject: 'プログラミング'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(scenario);

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
      
      // 提案の構造確認
      response.body.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });

    it('学生向けシナリオ2: 試験前の緊張緩和', async () => {
      const scenario = {
        situation: 'home',
        duration: 15,
        ageGroup: 'student',
        studentConcern: '試験前の不安とストレス',
        studentSubject: '英語'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(scenario);

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('student');
      expect(response.body.metadata.duration).toBe(15);
    });

    it('学生向けシナリオ3: 授業間の短時間リフレッシュ', async () => {
      const scenario = {
        situation: 'outside',
        duration: 30,
        ageGroup: 'student',
        studentConcern: '授業の合間の気分転換',
        studentSubject: '物理'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(scenario);

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('student');
    });
  });

  describe('パラメータの組み合わせテスト', () => {
    it('必須パラメータのみ（A群相当）', async () => {
      const params = {
        situation: 'workplace',
        duration: 5
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      expect(response.status).toBe(200);
      expect(response.body.metadata).not.toHaveProperty('ageGroup');
    });

    it('年齢層のみ追加（部分的B群）', async () => {
      const params = {
        situation: 'home',
        duration: 15,
        ageGroup: 'student'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      expect(response.status).toBe(200);
      expect(response.body.metadata.ageGroup).toBe('student');
    });

    it('完全な学生コンテキスト（完全B群）', async () => {
      const params = {
        situation: 'outside',
        duration: 30,
        ageGroup: 'student',
        studentConcern: 'レポート作成のストレス',
        studentSubject: '統計学'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      expect(response.status).toBe(200);
      expect(response.body.metadata.ageGroup).toBe('student');
    });

    it('非学生の年齢層（対照群）', async () => {
      const params = {
        situation: 'workplace',
        duration: 5,
        ageGroup: 'adult',
        studentConcern: '無視されるべき',
        studentSubject: '無視されるべき'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      expect(response.status).toBe(200);
      expect(response.body.metadata.ageGroup).toBe('adult');
    });
  });

  describe('エラーケースと境界値テスト', () => {
    it('不正な年齢層パラメータ（グレースフルハンドリング）', async () => {
      const params = {
        situation: 'workplace',
        duration: 5,
        ageGroup: 'invalid_age_group',
        studentConcern: 'テスト用',
        studentSubject: 'テスト科目'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      // エラーではなく、正常にレスポンスを返す
      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.metadata.ageGroup).toBe('invalid_age_group');
    });

    it('非常に長い学生パラメータ', async () => {
      const longText = 'a'.repeat(1000);
      const params = {
        situation: 'home',
        duration: 15,
        ageGroup: 'student',
        studentConcern: longText,
        studentSubject: longText
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      expect(response.status).toBe(200);
      expect(response.body.suggestions).toBeDefined();
    });

    it('学生パラメータのみ（必須パラメータなし）', async () => {
      const params = {
        ageGroup: 'student',
        studentConcern: '勉強疲れ',
        studentSubject: '数学'
      };

      const response = await request(app)
        .get('/api/v1/suggestions')
        .query(params);

      // バリデーションエラーが発生するはず
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('リクエストに問題があります');
    });
  });

  describe('レスポンス形式の一貫性テスト', () => {
    it('A群とB群のレスポンス構造が一致する', async () => {
      // A群のリクエスト
      const controlResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({ situation: 'workplace', duration: 5 });

      // B群のリクエスト
      const treatmentResponse = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'workplace',
          duration: 5,
          ageGroup: 'student',
          studentConcern: 'テスト',
          studentSubject: 'テスト科目'
        });

      // 両方成功することを確認
      expect(controlResponse.status).toBe(200);
      expect(treatmentResponse.status).toBe(200);

      // レスポンス構造が同じことを確認
      expect(controlResponse.body).toHaveProperty('suggestions');
      expect(controlResponse.body).toHaveProperty('metadata');
      expect(treatmentResponse.body).toHaveProperty('suggestions');
      expect(treatmentResponse.body).toHaveProperty('metadata');

      // 提案の構造が同じことを確認
      const controlSuggestion = controlResponse.body.suggestions[0];
      const treatmentSuggestion = treatmentResponse.body.suggestions[0];

      const expectedKeys = ['id', 'title', 'description', 'duration', 'category'];
      expectedKeys.forEach(key => {
        expect(controlSuggestion).toHaveProperty(key);
        expect(treatmentSuggestion).toHaveProperty(key);
      });
    });
  });

  describe('キャッシュヘッダーテスト', () => {
    it('適切なキャッシュ無効化ヘッダーが設定される', async () => {
      const response = await request(app)
        .get('/api/v1/suggestions')
        .query({
          situation: 'home',
          duration: 15,
          ageGroup: 'student',
          studentConcern: 'キャッシュテスト'
        });

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers['pragma']).toBe('no-cache');
      expect(response.headers['expires']).toBe('0');
    });
  });

  describe('メトリクス対応テスト', () => {
    it('異なるテストグループで提案が取得できることを確認', async () => {
      const testScenarios = [
        {
          name: 'コントロール群',
          params: { situation: 'workplace', duration: 5 }
        },
        {
          name: '処理群（基本）',
          params: { situation: 'workplace', duration: 5, ageGroup: 'student' }
        },
        {
          name: '処理群（詳細）',
          params: {
            situation: 'workplace',
            duration: 5,
            ageGroup: 'student',
            studentConcern: 'メトリクステスト',
            studentSubject: 'テスト科目'
          }
        }
      ];

      for (const scenario of testScenarios) {
        const response = await request(app)
          .get('/api/v1/suggestions')
          .query(scenario.params);

        expect(response.status).toBe(200);
        expect(response.body.suggestions.length).toBeGreaterThan(0);
        
        // メタデータのタイムスタンプが含まれている
        expect(response.body.metadata.timestamp).toBeDefined();
        expect(new Date(response.body.metadata.timestamp)).toBeInstanceOf(Date);
      }
    });
  });
});