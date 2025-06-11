import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { getSuggestions } from './suggestionController';
import { SuggestionGenerator } from '../../services/suggestion/generator';

jest.mock('../../services/suggestion/generator');

describe('suggestionController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockGenerator: jest.Mocked<SuggestionGenerator>;

  beforeEach(() => {
    mockRequest = {
      query: {
        situation: 'office',
        duration: '5'
      }
    };
    
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    
    mockGenerator = {
      generate: jest.fn()
    } as any;
    
    (SuggestionGenerator as jest.Mock).mockImplementation(() => mockGenerator);
    
    jest.clearAllMocks();
  });

  describe('getSuggestions', () => {
    it('正常なリクエストで提案を返す', async () => {
      const mockSuggestions = [
        {
          id: '1',
          title: 'テスト提案',
          description: 'テスト説明',
          duration: 5,
          category: 'cognitive' as const,
          guide: 'ガイド'
        }
      ];
      
      mockGenerator.generate.mockResolvedValue(mockSuggestions);
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockGenerator.generate).toHaveBeenCalledWith('office', 5);
      expect(mockResponse.json).toHaveBeenCalledWith({
        suggestions: mockSuggestions
      });
    });

    it('situationパラメータが不正な場合エラーを返す', async () => {
      mockRequest.query = {
        situation: 'invalid',
        duration: '5'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid situation'),
          statusCode: 400
        })
      );
    });

    it('durationパラメータが不正な場合エラーを返す', async () => {
      mockRequest.query = {
        situation: 'office',
        duration: '60'
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid duration'),
          statusCode: 400
        })
      );
    });

    it('必須パラメータが欠けている場合エラーを返す', async () => {
      mockRequest.query = {
        situation: 'office'
        // duration is missing
      };
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('required'),
          statusCode: 400
        })
      );
    });

    it('サービスエラーを適切に処理する', async () => {
      const serviceError = new Error('Service error');
      mockGenerator.generate.mockRejectedValue(serviceError);
      
      await getSuggestions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});