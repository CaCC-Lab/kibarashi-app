import { describe, it, expect, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { getSuggestions } from './suggestionController';

/**
 * suggestionController のテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のサービスを呼び出してテスト
 * - エラーケースも実際のバリデーションエラーを通じて検証
 * - 本番環境に近い形でのテストを実現
 */
describe('suggestionController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: any;
  let nextCallCount: number;
  let nextCalledWith: any;

  beforeEach(() => {
    // リクエストオブジェクトの準備
    mockRequest = {
      query: {}
    };
    
    // レスポンスオブジェクトの準備
    responseJson = undefined;
    mockResponse = {
      json: (data: any) => {
        responseJson = data;
        return mockResponse as Response;
      },
      status: (_code: number) => {
        return mockResponse as Response;
      },
      set: (_headers: any) => {
        // HTTPヘッダーの設定をモック
        return mockResponse as Response;
      }
    };
    
    // NextFunctionの準備
    nextCallCount = 0;
    nextCalledWith = undefined;
    mockNext = (error?: any) => {
      nextCallCount++;
      nextCalledWith = error;
      if (error) {
        console.error('Next called with error:', error);
      }
    };
  });

  describe('正常系テスト', () => {
    it('職場で5分の提案を取得できる', async () => {
      // 実際のリクエストパラメータを設定
      mockRequest.query = {
        situation: 'workplace',
        duration: '5'
      };
      
      // 実際のサービスを呼び出す
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // レスポンスの検証
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(Array.isArray(responseJson.suggestions)).toBe(true);
      expect(responseJson.suggestions.length).toBeGreaterThan(0);
      
      // メタデータの検証
      expect(responseJson.metadata).toBeDefined();
      expect(responseJson.metadata.situation).toBe('workplace');
      expect(responseJson.metadata.duration).toBe(5);
      expect(responseJson.metadata.timestamp).toBeDefined();
      
      // 提案の内容を検証
      const suggestion = responseJson.suggestions[0];
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('title');
      expect(suggestion).toHaveProperty('description');
      expect(suggestion).toHaveProperty('duration');
      expect(suggestion).toHaveProperty('category');
    });

    it('家で15分の提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'home',
        duration: '15'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.situation).toBe('home');
      expect(responseJson.metadata.duration).toBe(15);
    });

    it('外出先で30分の提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'outside',
        duration: '30'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.situation).toBe('outside');
      expect(responseJson.metadata.duration).toBe(30);
    });

    it('就職・転職活動中で5分の提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'job_hunting',
        duration: '5',
        ageGroup: 'job_seeker'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(Array.isArray(responseJson.suggestions)).toBe(true);
      expect(responseJson.suggestions.length).toBeGreaterThan(0);
      expect(responseJson.metadata.situation).toBe('job_hunting');
      expect(responseJson.metadata.duration).toBe(5);
    });

    it('就職・転職活動中で15分の提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'job_hunting',
        duration: '15',
        ageGroup: 'job_seeker'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.situation).toBe('job_hunting');
      expect(responseJson.metadata.duration).toBe(15);
    });

    it('就職・転職活動中で30分の提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'job_hunting',
        duration: '30',
        ageGroup: 'job_seeker'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.situation).toBe('job_hunting');
      expect(responseJson.metadata.duration).toBe(30);
    });
  });

  describe('異常系テスト', () => {
    it('situationパラメータが不正な場合、エラーハンドラーにエラーを渡す', async () => {
      mockRequest.query = {
        situation: 'invalid',
        duration: '5'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // next関数が呼ばれたことを確認
      expect(nextCallCount).toBe(1);
      expect(nextCalledWith).toBeDefined();
      expect(nextCalledWith.message).toBe('Invalid request parameters');
      expect(nextCalledWith.statusCode).toBe(400);
    });

    it('durationパラメータが不正な場合、エラーハンドラーにエラーを渡す', async () => {
      mockRequest.query = {
        situation: 'workplace',
        duration: '60' // 許可されていない値
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(nextCallCount).toBe(1);
      expect(nextCalledWith).toBeDefined();
      expect(nextCalledWith.message).toBe('Invalid request parameters');
      expect(nextCalledWith.statusCode).toBe(400);
    });

    it('必須パラメータが欠けている場合、エラーハンドラーにエラーを渡す', async () => {
      mockRequest.query = {
        situation: 'workplace'
        // durationが欠けている
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(nextCallCount).toBe(1);
      expect(nextCalledWith).toBeDefined();
      expect(nextCalledWith.message).toBe('Invalid request parameters');
      expect(nextCalledWith.statusCode).toBe(400);
    });

    it('両方のパラメータが欠けている場合、エラーハンドラーにエラーを渡す', async () => {
      mockRequest.query = {};
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(nextCallCount).toBe(1);
      expect(nextCalledWith).toBeDefined();
      expect(nextCalledWith.message).toBe('Invalid request parameters');
      expect(nextCalledWith.statusCode).toBe(400);
    });
  });

  describe('年齢層と学生向けパラメータのテスト', () => {
    it('年齢層パラメータが正しく処理される', async () => {
      mockRequest.query = {
        situation: 'workplace',
        duration: '5',
        ageGroup: 'student'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.ageGroup).toBe('student');
    });

    it('学生向けコンテキストパラメータが正しく処理される', async () => {
      mockRequest.query = {
        situation: 'workplace',
        duration: '5',
        ageGroup: 'student',
        studentConcern: '勉強の合間のリフレッシュ',
        studentSubject: '数学'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.ageGroup).toBe('student');
      // 学生向けの最適化された提案が返されることを確認
      const suggestion = responseJson.suggestions[0];
      expect(suggestion.description).toBeDefined();
    });

    it('無効な年齢層パラメータは無視される', async () => {
      mockRequest.query = {
        situation: 'workplace',
        duration: '5',
        ageGroup: 'invalid_age_group'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // エラーではなく、デフォルトの処理を行う
      expect(nextCallCount).toBe(0);
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
    });

    it('就職活動者（job_seeker）向けパラメータが正しく処理される', async () => {
      mockRequest.query = {
        situation: 'job_hunting',
        duration: '15',
        ageGroup: 'job_seeker',
        jobHuntingPhase: 'interviewing',
        jobHuntingConcern: '面接前の緊張',
        jobHuntingDuration: '3-6months'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.ageGroup).toBe('job_seeker');
      expect(responseJson.metadata.situation).toBe('job_hunting');
      
      // 就職活動者向けの最適化された提案が返されることを確認
      const suggestion = responseJson.suggestions[0];
      expect(suggestion.description).toBeDefined();
      expect(suggestion.title).toBeDefined();
    });

    it('転職活動者（career_changer）向けパラメータが正しく処理される', async () => {
      mockRequest.query = {
        situation: 'job_hunting',
        duration: '5',
        ageGroup: 'career_changer',
        jobHuntingPhase: 'applying',
        jobHuntingConcern: '職務経歴書作成のストレス',
        jobHuntingDuration: 'over_6months'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.ageGroup).toBe('career_changer');
      expect(responseJson.metadata.situation).toBe('job_hunting');
      
      // 転職活動者向けの最適化された提案が返されることを確認
      const suggestion = responseJson.suggestions[0];
      expect(suggestion.description).toBeDefined();
      expect(suggestion.title).toBeDefined();
    });

    it('job_seekerが職場状況で提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'workplace',
        duration: '5',
        ageGroup: 'job_seeker',
        jobHuntingPhase: 'preparation',
        jobHuntingConcern: '就活準備のストレス'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.ageGroup).toBe('job_seeker');
      expect(responseJson.metadata.situation).toBe('workplace');
    });

    it('career_changerが家で提案を取得できる', async () => {
      mockRequest.query = {
        situation: 'home',
        duration: '30',
        ageGroup: 'career_changer',
        jobHuntingPhase: 'waiting',
        jobHuntingConcern: '転職活動の長期化による不安'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.metadata.ageGroup).toBe('career_changer');
      expect(responseJson.metadata.situation).toBe('home');
    });

    it('就職活動向けパラメータの組み合わせテスト', async () => {
      mockRequest.query = {
        situation: 'job_hunting',
        duration: '15',
        ageGroup: 'job_seeker',
        jobHuntingPhase: 'rejected',
        jobHuntingConcern: '不採用通知への落ち込み',
        jobHuntingDuration: '1-3months'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(Array.isArray(responseJson.suggestions)).toBe(true);
      expect(responseJson.suggestions.length).toBeGreaterThan(0);
      
      // すべての提案が適切な構造を持つことを確認
      responseJson.suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('duration');
        expect(suggestion).toHaveProperty('category');
        expect(['認知的', '行動的']).toContain(suggestion.category);
      });
    });
  });

  describe('フォールバック機能のテスト', () => {
    it('Gemini APIが利用できない場合でも、フォールバック提案を返す', async () => {
      // 環境変数を一時的に削除してテスト
      const originalApiKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      mockRequest.query = {
        situation: 'workplace',
        duration: '5'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // フォールバック提案が返されることを確認
      expect(responseJson).toBeDefined();
      expect(responseJson.suggestions).toBeDefined();
      expect(responseJson.suggestions.length).toBeGreaterThan(0);
      
      // 環境変数を復元
      if (originalApiKey) {
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    });
  });
});