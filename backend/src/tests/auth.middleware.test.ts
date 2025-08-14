// Mock dependencies first
jest.mock('../services/jwt.service', () => ({
  JwtService: {
    validateAccessToken: jest.fn(),
    decodeToken: jest.fn()
  }
}));

jest.mock('../services/auth/sessionManagement.service', () => ({
  SessionManagementService: {
    updateSessionActivity: jest.fn()
  }
}));

jest.mock('../utils/response.utils', () => ({
  ResponseUtil: {
    error: jest.fn(),
    unauthorized: jest.fn()
  }
}));

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/jwt.service';
import { SessionManagementService } from '../services/auth/sessionManagement.service';
import { ResponseUtil } from '../utils/response.utils';

const mockJwtService = JwtService as jest.Mocked<typeof JwtService>;
const mockSessionManagementService = SessionManagementService as jest.Mocked<typeof SessionManagementService>;
const mockResponseUtil = ResponseUtil as jest.Mocked<typeof ResponseUtil>;

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const testUser = {
    userId: 'user123',
    email: 'test@example.com',
    role: 'GUEST'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {},
      ip: '127.0.0.1'
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('verifyToken', () => {
    test('should verify valid token and attach user to request', async () => {
      const validToken = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${validToken}`
      };

      mockJwtService.validateAccessToken.mockReturnValue({
        isValid: true,
        payload: testUser
      });

      await AuthMiddleware.verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJwtService.validateAccessToken).toHaveBeenCalledWith(validToken);
      expect(mockRequest.user).toEqual(testUser);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should return error when no authorization header', async () => {
      mockRequest.headers = {};

      const mockErrorResponse = {
        success: false,
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      };
      mockResponseUtil.error.mockReturnValue(mockErrorResponse as any);

      await AuthMiddleware.verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Access token required',
        'MISSING_TOKEN',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return error when token is invalid', async () => {
      const invalidToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${invalidToken}`
      };

      mockJwtService.validateAccessToken.mockReturnValue({
        isValid: false,
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });

      const mockErrorResponse = {
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      };
      mockResponseUtil.error.mockReturnValue(mockErrorResponse as any);

      await AuthMiddleware.verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Invalid or expired token',
        'INVALID_TOKEN',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    test('should allow access for user with required role', async () => {
      mockRequest.user = { ...testUser, role: 'ADMIN' };

      const middleware = AuthMiddleware.requireRole('ADMIN');
      
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    test('should deny access when no user is present', async () => {
      const middleware = AuthMiddleware.requireRole('ADMIN');
      
      const mockErrorResponse = {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      };
      mockResponseUtil.error.mockReturnValue(mockErrorResponse as any);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Authentication required',
        'AUTH_REQUIRED',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should deny access when user role is insufficient', async () => {
      mockRequest.user = { ...testUser, role: 'GUEST' };

      const middleware = AuthMiddleware.requireRole('ADMIN');
      
      const mockErrorResponse = {
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      };
      mockResponseUtil.error.mockReturnValue(mockErrorResponse as any);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponseUtil.error).toHaveBeenCalledWith(
        mockResponse,
        'Insufficient permissions',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('extractUserId', () => {
    test('should extract user ID from valid token', () => {
      const token = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockJwtService.decodeToken.mockReturnValue({
        userId: 'user123'
      });

      const userId = AuthMiddleware.extractUserId(mockRequest as Request);

      expect(userId).toBe('user123');
      expect(mockJwtService.decodeToken).toHaveBeenCalledWith(token);
    });

    test('should return null when no authorization header', () => {
      mockRequest.headers = {};

      const userId = AuthMiddleware.extractUserId(mockRequest as Request);

      expect(userId).toBeNull();
    });
  });
});
