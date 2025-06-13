import { describe, it, expect, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler';

/**
 * エラーハンドラーミドルウェアのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のエラーオブジェクトを使用してテスト
 * - エラーの3要素（何が・なぜ・どうすれば）が含まれることを検証
 * - 本番環境と開発環境の両方の動作を確認
 */
describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: any;
  let responseStatus: number;

  beforeEach(() => {
    // リクエストオブジェクトの準備
    mockRequest = {
      method: 'GET',
      path: '/api/v1/suggestions',
      query: {},
      url: '/api/v1/suggestions',
      headers: {}
    };
    
    // レスポンスオブジェクトの準備
    responseJson = undefined;
    responseStatus = 500;
    mockResponse = {
      status: function(code: number) {
        responseStatus = code;
        return this;
      },
      json: function(data: any) {
        responseJson = data;
        return this;
      }
    };
    
    // NextFunctionの準備（エラーハンドラーでは使用されない）
    mockNext = () => {};
  });

  describe('基本的なエラー処理', () => {
    it('一般的なエラーを適切に処理する', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // ステータスコードの検証
      expect(responseStatus).toBe(500);
      
      // エラーレスポンスの検証
      expect(responseJson).toBeDefined();
      expect(responseJson.error).toBeDefined();
      expect(responseJson.error.message).toBe('サーバーエラーが発生しました');
      expect(responseJson.error.reason).toBe('サーバー側で予期しない問題が発生しました。');
      expect(responseJson.error.solution).toBe('数分後にもう一度お試しください。問題が続く場合はサポートにお問い合わせください。');
      expect(responseJson.error.statusCode).toBe(500);
    });

    it('カスタムエラーメッセージを含むエラーを処理する', () => {
      const error = new Error('Database connection failed');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(500);
      expect(responseJson.error.message).toBe('サーバーエラーが発生しました');
    });
  });

  describe('HTTPステータスコード付きエラー', () => {
    it('400エラー（Bad Request）を適切に処理する', () => {
      const error: any = new Error('Invalid parameters');
      error.statusCode = 400;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(400);
      expect(responseJson.error.message).toBe('リクエストに問題があります');
      expect(responseJson.error.reason).toBe('送信されたデータの形式が正しくありません。');
      expect(responseJson.error.solution).toBe('入力内容を確認して、もう一度お試しください。');
      expect(responseJson.error.statusCode).toBe(400);
    });

    it('404エラー（Not Found）を適切に処理する', () => {
      const error: any = new Error('Resource not found');
      error.statusCode = 404;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(404);
      expect(responseJson.error.message).toBe('リソースが見つかりません');
      expect(responseJson.error.reason).toBe('要求された情報が存在しないか、削除された可能性があります。');
      expect(responseJson.error.solution).toBe('URLが正しいか確認してください。');
    });

    it('429エラー（Rate Limit）を適切に処理する', () => {
      const error: any = new Error('Too many requests');
      error.statusCode = 429;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(429);
      expect(responseJson.error.message).toBe('リクエストが多すぎます');
      expect(responseJson.error.reason).toBe('短時間に多くのリクエストが送信されました。');
      expect(responseJson.error.solution).toBe('しばらく時間をおいてから再度お試しください。');
    });

    it('503エラー（Service Unavailable）を適切に処理する', () => {
      const error: any = new Error('Service temporarily unavailable');
      error.statusCode = 503;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(503);
      expect(responseJson.error.message).toBe('サービスが一時的に利用できません');
      expect(responseJson.error.reason).toBe('サーバーがメンテナンス中か、一時的に利用できない状態です。');
      expect(responseJson.error.solution).toBe('しばらく時間をおいてから再度アクセスしてください。');
    });
  });

  describe('開発環境と本番環境の違い', () => {
    it('開発環境ではスタックトレースを含む', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson.error.stack).toBeDefined();
      expect(responseJson.error.stack).toContain('Test error');
      expect(responseJson.error.originalMessage).toBe('Test error');
      
      // 環境変数を復元
      process.env.NODE_ENV = originalEnv;
    });

    it('本番環境ではスタックトレースを含まない', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Test error');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson.error.stack).toBeUndefined();
      expect(responseJson.error.originalMessage).toBeUndefined();
      
      // 環境変数を復元
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('特殊なエラーケース', () => {
    it('エラーオブジェクトがない場合でも処理できる', () => {
      errorHandler(
        null as any,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(500);
      expect(responseJson.error.message).toBe('サーバーエラーが発生しました');
    });

    it('エラーメッセージがない場合でも処理できる', () => {
      const error = new Error();
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(500);
      expect(responseJson.error.message).toBe('サーバーエラーが発生しました');
    });

    it('文字列エラーも処理できる', () => {
      const error = 'String error';
      
      errorHandler(
        error as any,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(500);
      expect(responseJson.error.message).toBe('サーバーエラーが発生しました');
    });
  });

  describe('エラーメッセージのパターンマッチング', () => {
    it('タイムアウトエラーを適切に処理する（未定義のステータスコード）', () => {
      const error: any = new Error('Request timeout occurred');
      error.statusCode = 599; // 定義されていないステータスコード
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson.error.message).toBe('処理がタイムアウトしました');
      expect(responseJson.error.reason).toBe('処理に時間がかかりすぎました。');
      expect(responseJson.error.solution).toBe('ネットワークが不安定な可能性があります。再度お試しください。');
    });

    it('接続エラーを適切に処理する（未定義のステータスコード）', () => {
      const error: any = new Error('Connection failed');
      error.statusCode = 599; // 定義されていないステータスコード
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson.error.message).toBe('接続エラー');
      expect(responseJson.error.reason).toBe('サーバーへの接続に失敗しました。');
      expect(responseJson.error.solution).toBe('インターネット接続を確認してください。');
    });
  });

  describe('その他のステータスコード', () => {
    it('401エラー（Unauthorized）を適切に処理する', () => {
      const error: any = new Error('Unauthorized');
      error.statusCode = 401;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(401);
      expect(responseJson.error.message).toBe('認証が必要です');
      expect(responseJson.error.reason).toBe('アクセス権限がありません。');
      expect(responseJson.error.solution).toBe('ログインしてから再度お試しください。');
    });

    it('403エラー（Forbidden）を適切に処理する', () => {
      const error: any = new Error('Forbidden');
      error.statusCode = 403;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(403);
      expect(responseJson.error.message).toBe('アクセスが拒否されました');
      expect(responseJson.error.reason).toBe('この操作を行う権限がありません。');
      expect(responseJson.error.solution).toBe('アクセス権限があるか確認してください。');
    });

    it('504エラー（Gateway Timeout）を適切に処理する', () => {
      const error: any = new Error('Gateway timeout');
      error.statusCode = 504;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(504);
      expect(responseJson.error.message).toBe('タイムアウトエラー');
      expect(responseJson.error.reason).toBe('サーバーからの応答が時間内に返ってきませんでした。');
      expect(responseJson.error.solution).toBe('ネットワーク接続を確認し、再度お試しください。');
    });

    it('502エラー（Bad Gateway）を適切に処理する', () => {
      const error: any = new Error('Bad gateway');
      error.statusCode = 502;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseStatus).toBe(502);
      expect(responseJson.error.message).toBe('サービスが一時的に利用できません');
      expect(responseJson.error.reason).toBe('サーバーがメンテナンス中か、一時的に利用できない状態です。');
      expect(responseJson.error.solution).toBe('しばらく時間をおいてから再度アクセスしてください。');
    });
  });

  describe('エラーオブジェクトの構造', () => {
    it('すべての必須フィールドが含まれる', () => {
      const error: any = new Error('Test error');
      error.statusCode = 400;
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      // 必須フィールドの存在確認
      expect(responseJson.error).toHaveProperty('message');
      expect(responseJson.error).toHaveProperty('reason');
      expect(responseJson.error).toHaveProperty('solution');
      expect(responseJson.error).toHaveProperty('statusCode');
      
      // フィールドの型確認
      expect(typeof responseJson.error.message).toBe('string');
      expect(typeof responseJson.error.reason).toBe('string');
      expect(typeof responseJson.error.solution).toBe('string');
      expect(typeof responseJson.error.statusCode).toBe('number');
    });

    it('エラーメッセージは空でない', () => {
      const error = new Error('');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(responseJson.error.message).not.toBe('');
      expect(responseJson.error.reason).not.toBe('');
      expect(responseJson.error.solution).not.toBe('');
    });
  });
});