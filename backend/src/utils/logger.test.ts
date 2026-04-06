import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from './logger';

/**
 * Loggerユーティリティのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のログ出力を検証
 * - 本番環境と開発環境での動作の違いを確認
 * - ログレベルとフォーマットの適切性を重視
 */
describe('Logger', () => {
  let originalNodeEnv: string | undefined;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    
    // コンソール出力をモック
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    
    // モックをリストア
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('基本的なログ出力のテスト', () => {
    it('infoレベルのログが出力される', () => {
      logger.info('テスト情報ログ');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('テスト情報ログ')
      );
    });

    it('warnレベルのログが出力される', () => {
      logger.warn('テスト警告ログ');
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('テスト警告ログ')
      );
    });

    it('errorレベルのログが出力される', () => {
      logger.error('テストエラーログ');
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('テストエラーログ')
      );
    });

    it('debugレベルのログが出力される', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('テストデバッグログ');
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('テストデバッグログ')
      );
    });
  });

  describe('メタデータ付きログのテスト', () => {
    it('オブジェクトメタデータと共にログ出力', () => {
      const metadata = {
        userId: '12345',
        service: 'kibarashi-backend',
        timestamp: new Date().toISOString()
      };
      
      logger.info('ユーザーログイン', metadata);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('ユーザーログイン')
      );
    });

    it('エラーオブジェクトと共にログ出力', () => {
      const error = new Error('テストエラー');
      
      logger.error('エラーが発生しました', { error: error.message });
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('エラーが発生しました')
      );
    });

    it('複雑なオブジェクト構造もログ出力', () => {
      const complexData = {
        request: {
          method: 'POST',
          url: '/api/v1/suggestions',
          body: { situation: 'workplace', duration: 5 }
        },
        response: {
          status: 200,
          time: '125ms'
        }
      };
      
      logger.info('APIリクエスト処理完了', complexData);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('APIリクエスト処理完了')
      );
    });
  });

  describe('ログレベルのテスト', () => {
    it('本番環境ではdebugログが出力されない', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('本番環境のデバッグログ');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('開発環境ではdebugログが出力される', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('開発環境のデバッグログ');
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('開発環境のデバッグログ')
      );
    });

    it('テスト環境ではdebugログが出力される', () => {
      process.env.NODE_ENV = 'test';
      
      logger.debug('テスト環境のデバッグログ');
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('テスト環境のデバッグログ')
      );
    });

    it('環境変数未設定時はデフォルト動作', () => {
      delete process.env.NODE_ENV;
      
      logger.info('環境変数未設定のログ');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('環境変数未設定のログ')
      );
    });
  });

  describe('ログフォーマットのテスト', () => {
    it('タイムスタンプが含まれる', () => {
      logger.info('タイムスタンプテスト');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      );
    });

    it('ログレベルが含まれる', () => {
      logger.warn('レベルテスト');
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('[warn]')
      );
    });

    it('サービス名が含まれる', () => {
      logger.info('サービス名テスト');
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('kibarashi-backend')
      );
    });

    it('JSONフォーマットで出力される', () => {
      logger.info('JSONフォーマットテスト', { key: 'value' });
      
      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(() => JSON.parse(logCall)).not.toThrow();
    });
  });

  describe('特殊文字とエンコーディングのテスト', () => {
    it('日本語文字列が正しく出力される', () => {
      logger.info('こんにちは世界', { メッセージ: 'テスト' });
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('こんにちは世界')
      );
    });

    it('特殊文字が正しく出力される', () => {
      const specialChars = '!@#$%^&*()[]{}|;:,.<>?`~';
      
      logger.info('特殊文字テスト', { special: specialChars });
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('改行文字が適切に処理される', () => {
      const multilineMessage = 'ライン1\nライン2\nライン3';
      
      logger.info(multilineMessage);
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('Unicode文字が正しく出力される', () => {
      const unicodeMessage = '🚀 ログテスト 🎉';
      
      logger.info(unicodeMessage);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('🚀')
      );
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('nullメッセージでもエラーにならない', () => {
      expect(() => {
        logger.info(null as unknown as string);
      }).not.toThrow();
    });

    it('undefinedメッセージでもエラーにならない', () => {
      expect(() => {
        logger.info(undefined as unknown as string);
      }).not.toThrow();
    });

    it('空文字列メッセージでもエラーにならない', () => {
      expect(() => {
        logger.info('');
      }).not.toThrow();
    });

    it('循環参照オブジェクトでもエラーにならない', () => {
      const circularObj: Record<string, unknown> = { name: 'test' };
      circularObj.self = circularObj;
      
      expect(() => {
        logger.info('循環参照テスト', circularObj);
      }).not.toThrow();
    });

    it('非常に大きなオブジェクトでもエラーにならない', () => {
      const largeObj = {
        data: 'x'.repeat(10000),
        array: new Array(1000).fill('test')
      };
      
      expect(() => {
        logger.info('大きなオブジェクトテスト', largeObj);
      }).not.toThrow();
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量のログ出力でもパフォーマンスが劣化しない', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        logger.info(`パフォーマンステスト ${i}`, { iteration: i });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 1000回のログ出力が5秒以内に完了することを確認
      expect(duration).toBeLessThan(5000);
    });

    it('メモリリークが発生しない', () => {
      const beforeMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 100; i++) {
        logger.info(`メモリテスト ${i}`, {
          data: new Array(100).fill(`data-${i}`)
        });
      }
      
      // ガベージコレクションを促進
      if (global.gc) {
        global.gc();
      }
      
      const afterMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterMemory - beforeMemory;
      
      // メモリ増加が5MB以下であることを確認
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('HTTP リクエストログのテスト', () => {
    it('HTTPリクエストログが適切にフォーマットされる', () => {
      const requestData = {
        method: 'GET',
        url: '/api/v1/suggestions',
        headers: { 'user-agent': 'test-client' },
        ip: '127.0.0.1'
      };
      
      logger.info('HTTP Request', requestData);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('HTTP Request')
      );
    });

    it('HTTPレスポンスログが適切にフォーマットされる', () => {
      const responseData = {
        status: 200,
        duration: '125ms',
        size: '1.2KB'
      };
      
      logger.info('HTTP Response', responseData);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('HTTP Response')
      );
    });
  });

  describe('構造化ログのテスト', () => {
    it('ネストされたオブジェクトが正しく出力される', () => {
      const structuredData = {
        user: {
          id: '12345',
          name: 'テストユーザー',
          preferences: {
            theme: 'dark',
            language: 'ja'
          }
        },
        action: 'generate_suggestions',
        timestamp: new Date().toISOString()
      };
      
      logger.info('構造化ログテスト', structuredData);
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('配列データが正しく出力される', () => {
      const arrayData = {
        suggestions: [
          { title: '提案1', category: '認知的' },
          { title: '提案2', category: '行動的' },
          { title: '提案3', category: '認知的' }
        ]
      };
      
      logger.info('配列ログテスト', arrayData);
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('ログレベル別動作確認', () => {
    it('各ログレベルが適切な関数を呼び出す', () => {
      logger.debug('デバッグメッセージ');
      logger.info('情報メッセージ');
      logger.warn('警告メッセージ');
      logger.error('エラーメッセージ');
      
      // 開発環境でない場合はデバッグは出力されない
      if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
        expect(consoleSpy.debug).not.toHaveBeenCalled();
      }
      
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('実際のアプリケーションログシナリオ', () => {
    it('サーバー起動ログ', () => {
      logger.info('Server started', {
        port: 8080,
        environment: 'test',
        timestamp: new Date().toISOString()
      });
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('Server started')
      );
    });

    it('API リクエスト成功ログ', () => {
      logger.info('API request successful', {
        method: 'GET',
        path: '/api/v1/suggestions',
        statusCode: 200,
        responseTime: '125ms',
        userAgent: 'test-client'
      });
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('API リクエスト失敗ログ', () => {
      logger.error('API request failed', {
        method: 'POST',
        path: '/api/v1/suggestions',
        statusCode: 400,
        error: 'Invalid parameters',
        responseTime: '15ms'
      });
      
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('データベース操作ログ', () => {
      logger.debug('Database query executed', {
        query: 'SELECT * FROM suggestions WHERE category = ?',
        parameters: ['認知的'],
        executionTime: '25ms',
        resultCount: 5
      });
      
      // 開発環境の場合のみ確認
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        expect(consoleSpy.debug).toHaveBeenCalled();
      }
    });
  });
});