import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './errorHandler';
import { AppError } from '../../utils/errors';

describe('errorHandler', () => {
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('AppErrorを適切にハンドリングする', () => {
    const error = new AppError('カスタムエラー', 400);
    
    errorHandler(error, mockRequest, mockResponse, mockNext);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'カスタムエラー',
        code: 'APP_ERROR'
      }
    });
  });

  it('一般的なErrorを500エラーとして処理する', () => {
    const error = new Error('予期しないエラー');
    
    errorHandler(error, mockRequest, mockResponse, mockNext);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: '予期しないエラー',
        code: 'INTERNAL_ERROR'
      }
    });
  });

  it('ValidationErrorを400エラーとして処理する', () => {
    const error = new Error('ValidationError: 無効な入力');
    error.name = 'ValidationError';
    
    errorHandler(error, mockRequest, mockResponse, mockNext);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'ValidationError: 無効な入力',
        code: 'VALIDATION_ERROR'
      }
    });
  });

  it('エラーオブジェクトでない場合も処理する', () => {
    const error = 'エラー文字列';
    
    errorHandler(error as any, mockRequest, mockResponse, mockNext);
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'エラーが発生しました',
        code: 'UNKNOWN_ERROR'
      }
    });
  });
});