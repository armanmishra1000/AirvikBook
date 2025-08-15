// Mock dependencies first
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
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

// Mock Redis
const mockRedis = {
  setex: jest.fn(),
  exists: jest.fn(),
  pipeline: jest.fn(() => ({
    setex: jest.fn(),
    exec: jest.fn()
  }))
};

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(() => mockRedis)
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-session-token')
  }))
}));

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { JwtService } from '../services/jwt.service';
import prisma from '../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('JwtService', () => {
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

  const testPayload = {
    userId: testUser.id,
    email: testUser.email,
    role: testUser.role
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set required environment variables with proper length
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough-for-testing-purposes-only-64-chars';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough-for-testing-purposes-only-64-chars';
    
    // Setup default Redis mocks with proper typing
    (mockRedis.setex as any).mockResolvedValue('OK');
    (mockRedis.exists as any).mockResolvedValue(0);
    (mockRedis.pipeline().exec as any).mockResolvedValue([['OK']]);
  });

  describe('generateAccessToken', () => {
    test('should generate valid access token', () => {
      const token = JwtService.generateAccessToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should throw error if JWT secrets not configured', () => {
      delete process.env.JWT_ACCESS_SECRET;
      
      expect(() => {
        JwtService.generateAccessToken(testPayload);
      }).toThrow('JWT secrets not configured');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate valid refresh token', () => {
      const token = JwtService.generateRefreshToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should throw error if JWT secrets not configured', () => {
      delete process.env.JWT_REFRESH_SECRET;
      
      expect(() => {
        JwtService.generateRefreshToken(testPayload);
      }).toThrow('JWT secrets not configured');
    });
  });

  describe('generateTokenPair', () => {
    test('should generate both access and refresh tokens', () => {
      const tokenPair = JwtService.generateTokenPair(testPayload);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('validateAccessToken', () => {
    test('should validate valid access token', () => {
      const token = JwtService.generateAccessToken(testPayload);
      const result = JwtService.validateAccessToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testPayload.userId);
      expect(result.payload?.email).toBe(testPayload.email);
      expect(result.payload?.role).toBe(testPayload.role);
    });

    test('should reject invalid token', () => {
      const result = JwtService.validateAccessToken('invalid-token');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('TOKEN_INVALID');
    });

    test('should reject expired token', () => {
      // Create a token that expires in the past
      const expiredPayload = { ...testPayload };
      const token = JwtService.generateAccessToken(expiredPayload);
      
      // Manually modify the token to make it expired
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      parts[1] = Buffer.from(JSON.stringify(payload)).toString('base64');
      const expiredToken = parts.join('.');
      
      const result = JwtService.validateAccessToken(expiredToken);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('validateRefreshToken', () => {
    test('should validate valid refresh token', () => {
      const token = JwtService.generateRefreshToken(testPayload);
      const result = JwtService.validateRefreshToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testPayload.userId);
    });

    test('should reject invalid refresh token', () => {
      const result = JwtService.validateRefreshToken('invalid-token');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('REFRESH_TOKEN_INVALID');
    });
  });

  describe('refreshAccessToken', () => {
    test('should successfully refresh access token', async () => {
      const refreshToken = JwtService.generateRefreshToken(testPayload);
      
      // Mock user lookup
      (mockPrisma.user.findUnique as any).mockResolvedValue(testUser);
      
      const result = await JwtService.refreshAccessToken(refreshToken);
      
      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(testUser.id);
      expect(result.user?.email).toBe(testUser.email);
      expect(result.user?.fullName).toBe(testUser.fullName);
    });

    test('should fail with invalid refresh token', async () => {
      const result = await JwtService.refreshAccessToken('invalid-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('REFRESH_TOKEN_INVALID');
    });

    test('should fail when user not found', async () => {
      const refreshToken = JwtService.generateRefreshToken(testPayload);
      
      // Mock user not found
      (mockPrisma.user.findUnique as any).mockResolvedValue(null);
      
      const result = await JwtService.refreshAccessToken(refreshToken);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('USER_INACTIVE');
    });

    test('should fail when user is inactive', async () => {
      const refreshToken = JwtService.generateRefreshToken(testPayload);
      
      // Mock inactive user
      (mockPrisma.user.findUnique as any).mockResolvedValue({
        ...testUser,
        isActive: false
      });
      
      const result = await JwtService.refreshAccessToken(refreshToken);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('USER_INACTIVE');
    });
  });

  describe('storeRefreshToken', () => {
    test('should successfully store refresh token', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock session creation
      (mockPrisma.session.create as any).mockResolvedValue({
        id: 'session123',
        userId: testUser.id,
        token: 'mock-session-token',
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
      
      const result = await JwtService.storeRefreshToken(testUser.id, refreshToken);
      
      expect(result).toBe(true);
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: testUser.id,
          token: 'mock-session-token',
          refreshToken,
          expiresAt: expect.any(Date),
          isActive: true
        }
      });
    });

    test('should handle storage errors', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock session creation error
      (mockPrisma.session.create as any).mockRejectedValue(new Error('Database error'));
      
      const result = await JwtService.storeRefreshToken(testUser.id, refreshToken);
      
      expect(result).toBe(false);
    });
  });

  describe('invalidateRefreshToken', () => {
    test('should successfully invalidate refresh token', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock session update
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

    test('should handle invalidation errors', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock session update error
      (mockPrisma.session.updateMany as any).mockRejectedValue(new Error('Database error'));
      
      const result = await JwtService.invalidateRefreshToken(refreshToken);
      
      expect(result).toBe(false);
    });
  });

  describe('invalidateAllUserTokens', () => {
    test('should successfully invalidate all user tokens', async () => {
      // Mock session update
      (mockPrisma.session.updateMany as any).mockResolvedValue({
        count: 3
      });
      
      const result = await JwtService.invalidateAllUserTokens(testUser.id);
      
      expect(result).toBe(true);
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: testUser.id,
          isActive: true
        },
        data: {
          isActive: false
        }
      });
    });

    test('should handle invalidation errors', async () => {
      // Mock session update error
      (mockPrisma.session.updateMany as any).mockRejectedValue(new Error('Database error'));
      
      const result = await JwtService.invalidateAllUserTokens(testUser.id);
      
      expect(result).toBe(false);
    });
  });

  describe('isRefreshTokenValid', () => {
    test('should return true for valid refresh token', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock valid session
      (mockPrisma.session.findFirst as any).mockResolvedValue({
        id: 'session123',
        refreshToken,
        isActive: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });
      
      const result = await JwtService.isRefreshTokenValid(refreshToken);
      
      expect(result).toBe(true);
    });

    test('should return false for invalid refresh token', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock no session found
      (mockPrisma.session.findFirst as any).mockResolvedValue(null);
      
      const result = await JwtService.isRefreshTokenValid(refreshToken);
      
      expect(result).toBe(false);
    });

    test('should return false for expired session', async () => {
      const refreshToken = 'test-refresh-token';
      
      // Mock expired session
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
      const refreshToken = 'test-refresh-token';
      
      // Mock inactive session
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

  describe('cleanupExpiredSessions', () => {
    test('should cleanup expired sessions', async () => {
      // Mock session deletion
      (mockPrisma.session.deleteMany as any).mockResolvedValue({
        count: 5
      });
      
      const result = await JwtService.cleanupExpiredSessions();
      
      expect(result).toBe(5);
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lt: expect.any(Date) } },
            { isActive: false }
          ]
        }
      });
    });

    test('should handle cleanup errors', async () => {
      // Mock session deletion error
      (mockPrisma.session.deleteMany as any).mockRejectedValue(new Error('Database error'));
      
      const result = await JwtService.cleanupExpiredSessions();
      
      expect(result).toBe(0);
    });
  });

  describe('decodeToken', () => {
    test('should decode valid token', () => {
      const token = JwtService.generateAccessToken(testPayload);
      const decoded = JwtService.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
    });

    test('should return null for invalid token', () => {
      const decoded = JwtService.decodeToken('invalid-token');
      
      expect(decoded).toBeNull();
    });
  });

  describe('getTokenExpiry', () => {
    test('should get token expiry time', () => {
      const token = JwtService.generateAccessToken(testPayload);
      const expiry = JwtService.getTokenExpiry(token);
      
      expect(expiry).toBeDefined();
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry!.getTime()).toBeGreaterThan(Date.now());
    });

    test('should return null for invalid token', () => {
      const expiry = JwtService.getTokenExpiry('invalid-token');
      
      expect(expiry).toBeNull();
    });
  });

  describe('validateConfiguration', () => {
    test('should validate correct configuration', () => {
      const validation = JwtService.validateConfiguration();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect missing secrets', () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      
      const validation = JwtService.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should detect weak secrets', () => {
      process.env.JWT_ACCESS_SECRET = 'weak';
      process.env.JWT_REFRESH_SECRET = 'weak';
      
      const validation = JwtService.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('32 characters'))).toBe(true);
    });
  });

  describe('blacklistToken', () => {
    test('should blacklist token with Redis', async () => {
      const token = JwtService.generateAccessToken(testPayload);
      
      const result = await JwtService.blacklistToken(token, testUser.id);
      
      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `blacklist:${token}`,
        expect.any(Number),
        testUser.id
      );
    });

    test('should handle Redis errors gracefully', async () => {
      const token = JwtService.generateAccessToken(testPayload);
      
      // Mock Redis error
      (mockRedis.setex as any).mockRejectedValue(new Error('Redis error'));
      
      const result = await JwtService.blacklistToken(token, testUser.id);
      
      expect(result).toBe(false);
    });
  });

  describe('isTokenBlacklisted', () => {
    test('should return true for blacklisted token', async () => {
      const token = 'test-token';
      
      // Mock Redis to return token exists
      (mockRedis.exists as any).mockResolvedValue(1);
      
      const result = await JwtService.isTokenBlacklisted(token);
      
      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith(`blacklist:${token}`);
    });

    test('should return false for non-blacklisted token', async () => {
      const token = 'test-token';
      
      // Mock Redis to return token doesn't exist
      (mockRedis.exists as any).mockResolvedValue(0);
      
      const result = await JwtService.isTokenBlacklisted(token);
      
      expect(result).toBe(false);
    });

    test('should handle Redis errors gracefully', async () => {
      const token = 'test-token';
      
      // Mock Redis error
      (mockRedis.exists as any).mockRejectedValue(new Error('Redis error'));
      
      const result = await JwtService.isTokenBlacklisted(token);
      
      expect(result).toBe(false);
    });
  });

  describe('rotateTokens', () => {
    test('should successfully rotate tokens', async () => {
      const refreshToken = JwtService.generateRefreshToken(testPayload);
      
      // Mock user lookup
      (mockPrisma.user.findUnique as any).mockResolvedValue(testUser);
      
      // Mock session creation
      (mockPrisma.session.create as any).mockResolvedValue({
        id: 'session123',
        userId: testUser.id,
        token: 'new-session-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
      
      const result = await JwtService.rotateTokens(refreshToken);
      
      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.newRefreshToken).toBeDefined();
      expect(result.accessToken).not.toBe(refreshToken);
      expect(result.newRefreshToken).not.toBe(refreshToken);
    });

    test('should fail with invalid refresh token', async () => {
      const result = await JwtService.rotateTokens('invalid-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('logoutUser', () => {
    test('should successfully logout user', async () => {
      const sessions = [
        { refreshToken: 'token1' },
        { refreshToken: 'token2' }
      ];
      
      // Mock session lookup
      (mockPrisma.session.findMany as any).mockResolvedValue(sessions);
      
      // Mock session deactivation
      (mockPrisma.session.updateMany as any).mockResolvedValue({
        count: 2
      });
      
      const result = await JwtService.logoutUser(testUser.id);
      
      expect(result).toBe(true);
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith({
        where: {
          userId: testUser.id,
          isActive: true,
          expiresAt: {
            gt: expect.any(Date)
          }
        }
      });
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: testUser.id,
          isActive: true
        },
        data: {
          isActive: false
        }
      });
    });

    test('should handle logout errors', async () => {
      // Mock session lookup error
      (mockPrisma.session.findMany as any).mockRejectedValue(new Error('Database error'));
      
      const result = await JwtService.logoutUser(testUser.id);
      
      expect(result).toBe(false);
    });
  });
});
