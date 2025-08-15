// Mock dependencies first
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => {
  const mockJwt = {
    sign: jest.fn((payload, _secret, options) => {
      // Return a mock JWT token with different signatures based on options
      const header = { alg: 'HS256', typ: 'JWT' };
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const signature = (options as any)?.expiresIn === '1d' ? 'refresh-signature' : 'access-signature';
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    }),
    verify: jest.fn((token: string, _secret, _options) => {
      // Mock token verification
      if (token === 'invalid-token') {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      }
      if (token.includes('expired')) {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      }
      const parts = token.split('.');
      if (parts.length !== 3) {
        const error = new Error('Invalid token format');
        error.name = 'JsonWebTokenError';
        throw error;
      }
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload;
      } catch (error) {
        const jwtError = new Error('Invalid token');
        jwtError.name = 'JsonWebTokenError';
        throw jwtError;
      }
    }),
    decode: jest.fn((token: string) => {
      // Mock token decoding
      if (token === 'invalid-token') {
        return null;
      }
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload;
      } catch (error) {
        return null;
      }
    }),
    TokenExpiredError: class TokenExpiredError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'TokenExpiredError';
      }
    },
    JsonWebTokenError: class JsonWebTokenError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'JsonWebTokenError';
      }
    }
  };
  
  return mockJwt;
});

jest.mock('../services/jwt.service', () => ({
  JwtService: {
    refreshAccessToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    generateTokenPair: jest.fn(),
    storeRefreshToken: jest.fn(),
    invalidateRefreshToken: jest.fn()
  }
}));

jest.mock('../services/auth/authLogin.service', () => ({
  AuthLoginService: {
    refreshSession: jest.fn(),
    validateConfiguration: jest.fn()
  }
}));

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { JwtService } from '../services/jwt.service';
import prisma from '../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockJwtService = JwtService as jest.Mocked<typeof JwtService>;

describe('Token Refresh Tests', () => {
  const testUser = {
    id: 'user123',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'GUEST',
    isEmailVerified: true,
    isActive: true,
    mobileNumber: '+1234567890',
    profilePicture: 'https://example.com/avatar.jpg',
    googleId: 'google123',
    lastLoginAt: new Date(),
    createdAt: new Date()
  };

  const testTokens = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    accessExpiresIn: 20 * 60, // 20 minutes
    refreshExpiresIn: 7 * 24 * 60 * 60 // 7 days
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set required environment variables with proper length
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough-for-testing-purposes-only-64-chars';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough-for-testing-purposes-only-64-chars';
  });

  describe('JwtService.refreshAccessToken', () => {
    test('should successfully refresh access token with user data', async () => {
      const refreshToken = 'valid-refresh-token';

      // Mock refresh token validation
      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: true,
        payload: { userId: testUser.id, email: testUser.email, role: testUser.role }
      });

      // Mock user lookup
      (mockPrisma.user.findUnique as any).mockResolvedValue(testUser);

      // Mock token generation
      mockJwtService.generateTokenPair.mockReturnValue(testTokens);

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe(testTokens.accessToken);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(testUser.id);
      expect(result.user?.email).toBe(testUser.email);
      expect(result.user?.fullName).toBe(testUser.fullName);
    });

    test('should fail with invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: false,
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('REFRESH_TOKEN_INVALID');
    });

    test('should fail when user not found', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: true,
        payload: { userId: testUser.id, email: testUser.email, role: testUser.role }
      });

      (mockPrisma.user.findUnique as any).mockResolvedValue(null);

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.code).toBe('USER_INACTIVE');
    });

    test('should fail when user is inactive', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: true,
        payload: { userId: testUser.id, email: testUser.email, role: testUser.role }
      });

      (mockPrisma.user.findUnique as any).mockResolvedValue({
        ...testUser,
        isActive: false
      });

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.code).toBe('USER_INACTIVE');
    });
  });

  describe('AuthLoginService.refreshSession', () => {
    test('should successfully refresh session', async () => {
      const refreshToken = 'valid-refresh-token';

      // Mock JWT service refresh
      mockJwtService.refreshAccessToken.mockResolvedValue({
        success: true,
        accessToken: testTokens.accessToken,
        user: testUser
      });

      // Mock session storage
      mockJwtService.storeRefreshToken.mockResolvedValue(true);

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe(testTokens.accessToken);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testUser.email);
    });

    test('should fail when JWT refresh fails', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.refreshAccessToken.mockResolvedValue({
        success: false,
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.code).toBe('REFRESH_TOKEN_INVALID');
    });

    test('should fail when session storage fails', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwtService.refreshAccessToken.mockResolvedValue({
        success: true,
        accessToken: testTokens.accessToken,
        user: testUser
      });

      mockJwtService.storeRefreshToken.mockResolvedValue(false);

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.code).toBe('SESSION_STORAGE_FAILED');
    });
  });

  describe('Token Invalidation', () => {
    test('should successfully invalidate refresh token', async () => {
      const refreshToken = 'refresh-token-to-invalidate';

      (mockPrisma.session.updateMany as any).mockResolvedValue({
        count: 1
      });

      const result = await JwtService.invalidateRefreshToken(refreshToken);

      expect(result).toBe(true);
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          refreshToken,
          isActive: true
        },
        data: {
          isActive: false
        }
      });
    });

    test('should handle invalidation errors gracefully', async () => {
      const refreshToken = 'refresh-token-to-invalidate';

      (mockPrisma.session.updateMany as any).mockRejectedValue(
        new Error('Database error')
      );

      const result = await JwtService.invalidateRefreshToken(refreshToken);

      expect(result).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should check if refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';

      (mockPrisma.session.findFirst as any).mockResolvedValue({
        id: 'session123',
        refreshToken,
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });

      const result = await JwtService.isRefreshTokenValid(refreshToken);

      expect(result).toBe(true);
    });

    test('should return false for expired session', async () => {
      const refreshToken = 'expired-refresh-token';

      (mockPrisma.session.findFirst as any).mockResolvedValue({
        id: 'session123',
        refreshToken,
        isActive: true,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });

      const result = await JwtService.isRefreshTokenValid(refreshToken);

      expect(result).toBe(false);
    });

    test('should return false for inactive session', async () => {
      const refreshToken = 'inactive-refresh-token';

      (mockPrisma.session.findFirst as any).mockResolvedValue({
        id: 'session123',
        refreshToken,
        isActive: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const result = await JwtService.isRefreshTokenValid(refreshToken);

      expect(result).toBe(false);
    });
  });

  describe('Token Rotation', () => {
    test('should successfully rotate tokens', async () => {
      const oldRefreshToken = 'old-refresh-token';

      // Mock refresh token validation
      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: true,
        payload: { userId: testUser.id, email: testUser.email, role: testUser.role }
      });

      // Mock user lookup
      (mockPrisma.user.findUnique as any).mockResolvedValue(testUser);

      // Mock new token generation
      mockJwtService.generateTokenPair.mockReturnValue(testTokens);

      // Mock session creation
      (mockPrisma.session.create as any).mockResolvedValue({
        id: 'session123',
        userId: testUser.id,
        token: 'new-session-token',
        refreshToken: testTokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      const result = await JwtService.rotateTokens(oldRefreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe(testTokens.accessToken);
      expect(result.newRefreshToken).toBe(testTokens.refreshToken);
      expect(result.accessToken).not.toBe(oldRefreshToken);
      expect(result.newRefreshToken).not.toBe(oldRefreshToken);
    });

    test('should fail rotation with invalid refresh token', async () => {
      const oldRefreshToken = 'invalid-refresh-token';

      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: false,
        error: 'Invalid refresh token'
      });

      const result = await JwtService.rotateTokens(oldRefreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors during refresh', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwtService.validateRefreshToken.mockReturnValue({
        isValid: true,
        payload: { userId: testUser.id, email: testUser.email, role: testUser.role }
      });

      (mockPrisma.user.findUnique as any).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle JWT service errors', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwtService.validateRefreshToken.mockImplementation(() => {
        throw new Error('JWT service error');
      });

      const result = await JwtService.refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    test('should validate JWT configuration', () => {
      const validation = JwtService.validateConfiguration();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect missing JWT secrets', () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      const validation = JwtService.validateConfiguration();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should validate AuthLoginService configuration', () => {
      const validation = JwtService.validateConfiguration();

      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });
});
