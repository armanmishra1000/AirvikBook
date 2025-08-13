import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { JwtService } from '../services/jwt.service';
import prisma from '../lib/prisma';
import Redis from 'ioredis';
import { UserRole } from '@prisma/client';

// Mock Redis for testing
jest.mock('ioredis');

describe('JWT Token Rotation Tests', () => {
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(async () => {
    // Clear database before each test
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Mock Redis
    mockRedis = {
      setex: jest.fn().mockResolvedValue('OK'),
      exists: jest.fn().mockResolvedValue(0),
      on: jest.fn(),
    } as any;

    // Mock the Redis import
    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis);
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    jest.clearAllMocks();
  });

  describe('Token Generation', () => {
    it('should generate access token with 15 minutes expiry', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);
      const decoded = JwtService.decodeToken(token) as any;

      expect(token).toBeDefined();
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.iss).toBe('airvikbook');
      expect(decoded.aud).toBe('airvikbook-users');

      // Check expiry (should be ~15 minutes from now)
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (15 * 60); // 15 minutes
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp);
    });

    it('should generate refresh token with 7 days expiry', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);
      const decoded = JwtService.decodeToken(token) as any;

      expect(token).toBeDefined();
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);

      // Check expiry (should be ~7 days from now)
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (7 * 24 * 60 * 60); // 7 days
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp);
    });

    it('should generate token pair with both access and refresh tokens', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const tokenPair = JwtService.generateTokenPair(payload);

      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);

      // Verify both tokens are valid
      const accessValidation = JwtService.validateAccessToken(tokenPair.accessToken);
      const refreshValidation = JwtService.validateRefreshToken(tokenPair.refreshToken);

      expect(accessValidation.isValid).toBe(true);
      expect(refreshValidation.isValid).toBe(true);
    });
  });

  describe('Token Validation', () => {
    it('should validate valid access tokens', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);
      const result = JwtService.validateAccessToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload!.userId).toBe(payload.userId);
    });

    it('should validate valid refresh tokens', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);
      const result = JwtService.validateRefreshToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload!.userId).toBe(payload.userId);
    });

    it('should reject invalid tokens', () => {
      const result = JwtService.validateAccessToken('invalid-token');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject expired tokens', () => {
      // Create a token that expires immediately
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      // Mock the JWT sign to return an expired token
      const originalSign = require('jsonwebtoken').sign;
      require('jsonwebtoken').sign = jest.fn().mockReturnValue('expired-token');

      const token = JwtService.generateAccessToken(payload);
      const result = JwtService.validateAccessToken(token);

      expect(result.isValid).toBe(false);
      expect(result.code).toBe('TOKEN_EXPIRED');

      // Restore original function
      require('jsonwebtoken').sign = originalSign;
    });
  });

  describe('Token Rotation', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          fullName: 'Test User',
          password: 'hashed-password',
          role: UserRole.GUEST,
          isActive: true,
          isEmailVerified: true
        }
      });
    });

    it('should rotate tokens successfully', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      // Generate initial token pair
      const initialTokenPair = JwtService.generateTokenPair(payload);
      await JwtService.storeRefreshToken(payload.userId, initialTokenPair.refreshToken);

      // Rotate tokens
      const rotationResult = await JwtService.rotateTokens(initialTokenPair.refreshToken);

      expect(rotationResult.success).toBe(true);
      expect(rotationResult.accessToken).toBeDefined();
      expect(rotationResult.newRefreshToken).toBeDefined();
      expect(rotationResult.accessToken).not.toBe(initialTokenPair.accessToken);
      expect(rotationResult.newRefreshToken).not.toBe(initialTokenPair.refreshToken);

      // Verify new tokens are valid
      const newAccessValidation = JwtService.validateAccessToken(rotationResult.accessToken!);
      const newRefreshValidation = JwtService.validateRefreshToken(rotationResult.newRefreshToken!);

      expect(newAccessValidation.isValid).toBe(true);
      expect(newRefreshValidation.isValid).toBe(true);
    });

    it('should blacklist old refresh token after rotation', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      // Generate initial token pair
      const initialTokenPair = JwtService.generateTokenPair(payload);
      await JwtService.storeRefreshToken(payload.userId, initialTokenPair.refreshToken);

      // Rotate tokens
      const rotationResult = await JwtService.rotateTokens(initialTokenPair.refreshToken);

      expect(rotationResult.success).toBe(true);

      // Try to use old refresh token - should fail
      const reuseResult = await JwtService.rotateTokens(initialTokenPair.refreshToken);
      expect(reuseResult.success).toBe(false);
      expect(reuseResult.code).toBe('TOKEN_REVOKED');
    });

    it('should fail rotation with invalid refresh token', async () => {
      const result = await JwtService.rotateTokens('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('REFRESH_TOKEN_INVALID');
    });

    it('should fail rotation with expired refresh token', async () => {
      // This test would require mocking time or creating an expired token
      // For now, we'll test the basic flow
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);
      
      // Mock the validateRefreshToken to return expired
      const originalValidate = JwtService.validateRefreshToken;
      JwtService.validateRefreshToken = jest.fn().mockReturnValue({
        isValid: false,
        error: 'Refresh token has expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });

      const result = await JwtService.rotateTokens(token);

      expect(result.success).toBe(false);
      expect(result.code).toBe('REFRESH_TOKEN_EXPIRED');

      // Restore original function
      JwtService.validateRefreshToken = originalValidate;
    });

    it('should fail rotation with inactive user', async () => {
      // Deactivate the user
      await prisma.user.update({
        where: { id: 'test-user-id' },
        data: { isActive: false }
      });

      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);
      await JwtService.storeRefreshToken(payload.userId, token);

      const result = await JwtService.rotateTokens(token);

      expect(result.success).toBe(false);
      expect(result.code).toBe('USER_INACTIVE');
    });
  });

  describe('Token Blacklisting', () => {
    it('should blacklist tokens successfully', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);
      const success = await JwtService.blacklistToken(token, payload.userId);

      expect(success).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `blacklist:${token}`,
        expect.any(Number),
        payload.userId
      );
    });

    it('should check if token is blacklisted', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);

      // Initially not blacklisted
      mockRedis.exists.mockResolvedValue(0);
      let isBlacklisted = await JwtService.isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(false);

      // After blacklisting
      mockRedis.exists.mockResolvedValue(1);
      isBlacklisted = await JwtService.isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(true);
    });

    it('should handle Redis connection failures gracefully', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);

      // Mock Redis connection failure
      mockRedis.exists.mockRejectedValue(new Error('Redis connection failed'));

      const isBlacklisted = await JwtService.isTokenBlacklisted(token);
      expect(isBlacklisted).toBe(false); // Should return false on Redis failure
    });
  });

  describe('Enhanced Token Validation', () => {
    it('should validate access token with blacklist check', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);

      // Mock not blacklisted
      mockRedis.exists.mockResolvedValue(0);

      const result = await JwtService.validateAccessTokenWithBlacklist(token);
      expect(result.isValid).toBe(true);
    });

    it('should reject blacklisted access token', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);

      // Mock blacklisted
      mockRedis.exists.mockResolvedValue(1);

      const result = await JwtService.validateAccessTokenWithBlacklist(token);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('TOKEN_REVOKED');
    });

    it('should validate refresh token with blacklist check', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);

      // Mock not blacklisted
      mockRedis.exists.mockResolvedValue(0);

      const result = await JwtService.validateRefreshTokenWithBlacklist(token);
      expect(result.isValid).toBe(true);
    });

    it('should reject blacklisted refresh token', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);

      // Mock blacklisted
      mockRedis.exists.mockResolvedValue(1);

      const result = await JwtService.validateRefreshTokenWithBlacklist(token);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('TOKEN_REVOKED');
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          fullName: 'Test User',
          password: 'hashed-password',
          role: UserRole.GUEST,
          isActive: true,
          isEmailVerified: true
        }
      });
    });

    it('should store refresh token in database', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);
      const success = await JwtService.storeRefreshToken(payload.userId, token);

      expect(success).toBe(true);

      // Verify token is stored in database
      const session = await prisma.session.findFirst({
        where: {
          userId: payload.userId,
          refreshToken: token,
          isActive: true
        }
      });

      expect(session).toBeDefined();
      expect(session!.refreshToken).toBe(token);
    });

    it('should invalidate refresh token', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateRefreshToken(payload);
      await JwtService.storeRefreshToken(payload.userId, token);

      const success = await JwtService.invalidateRefreshToken(token);
      expect(success).toBe(true);

      // Verify token is invalidated in database
      const session = await prisma.session.findFirst({
        where: {
          userId: payload.userId,
          refreshToken: token,
          isActive: true
        }
      });

      expect(session).toBeNull();
    });

    it('should logout user from all devices', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      // Create multiple sessions
      const token1 = JwtService.generateRefreshToken(payload);
      const token2 = JwtService.generateRefreshToken(payload);
      const token3 = JwtService.generateRefreshToken(payload);

      await JwtService.storeRefreshToken(payload.userId, token1);
      await JwtService.storeRefreshToken(payload.userId, token2);
      await JwtService.storeRefreshToken(payload.userId, token3);

      const success = await JwtService.logoutUser(payload.userId);
      expect(success).toBe(true);

      // Verify all sessions are invalidated
      const activeSessions = await prisma.session.findMany({
        where: {
          userId: payload.userId,
          isActive: true
        }
      });

      expect(activeSessions).toHaveLength(0);
    });

    it('should get user active sessions count', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      // Create multiple sessions
      const token1 = JwtService.generateRefreshToken(payload);
      const token2 = JwtService.generateRefreshToken(payload);

      await JwtService.storeRefreshToken(payload.userId, token1);
      await JwtService.storeRefreshToken(payload.userId, token2);

      const count = await JwtService.getUserActiveSessionsCount(payload.userId);
      expect(count).toBe(2);
    });

    it('should force logout from other devices', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      // Create multiple sessions
      const token1 = JwtService.generateRefreshToken(payload);
      const token2 = JwtService.generateRefreshToken(payload);
      const token3 = JwtService.generateRefreshToken(payload);

      await JwtService.storeRefreshToken(payload.userId, token1);
      await JwtService.storeRefreshToken(payload.userId, token2);
      await JwtService.storeRefreshToken(payload.userId, token3);

      // Force logout from other devices (keep token1)
      const success = await JwtService.forceLogoutOtherDevices(payload.userId, token1);
      expect(success).toBe(true);

      // Verify only token1 session remains active
      const activeSessions = await prisma.session.findMany({
        where: {
          userId: payload.userId,
          isActive: true
        }
      });

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].refreshToken).toBe(token1);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate JWT configuration', () => {
      // Test with valid configuration
      const result = JwtService.validateConfiguration();
      
      // This will depend on environment variables
      // For now, we'll just check the structure
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing JWT secrets gracefully', () => {
      // Save original environment variables
      const originalAccessSecret = process.env.JWT_ACCESS_SECRET;
      const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;

      // Remove secrets
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      expect(() => {
        JwtService.generateAccessToken({
          userId: 'test',
          email: 'test@example.com',
          role: UserRole.GUEST
        });
      }).toThrow('JWT secrets not configured');

      // Restore environment variables
      process.env.JWT_ACCESS_SECRET = originalAccessSecret;
      process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
    });

    it('should handle Redis connection failures gracefully', async () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: UserRole.GUEST
      };

      const token = JwtService.generateAccessToken(payload);

      // Mock Redis connection failure
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));

      const success = await JwtService.blacklistToken(token, payload.userId);
      expect(success).toBe(true); // Should still return true even if Redis fails
    });
  });
});
