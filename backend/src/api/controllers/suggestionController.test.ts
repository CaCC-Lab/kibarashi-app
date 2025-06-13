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
  let responseStatus: number;
  let nextCallCount: number;
  let nextCalledWith: any;

  beforeEach(() => {
    // リクエストオブジェクトの準備
    mockRequest = {
      query: {}
    };
    
    // レスポンスオブジェクトの準備
    responseJson = undefined;
    responseStatus = 200;
    mockResponse = {
      json: (data: any) => {
        responseJson = data;
        return mockResponse as Response;
      },
      status: (code: number) => {
        responseStatus = code;
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