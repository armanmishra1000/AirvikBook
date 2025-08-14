import { describe, test, expect, beforeEach } from '@jest/globals';
import { JwtService } from '../services/jwt.service';

describe('Token Refresh - Simple Tests', () => {
  beforeEach(() => {
    // Set required environment variables
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough-for-testing';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough-for-testing';
  });

  describe('JWT Service Basic Functions', () => {
    test('should generate access token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate refresh token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateRefreshToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate token pair', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const tokenPair = JwtService.generateTokenPair(payload);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });

    test('should validate access token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateAccessToken(payload);
      const result = JwtService.validateAccessToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(payload.userId);
      expect(result.payload?.email).toBe(payload.email);
      expect(result.payload?.role).toBe(payload.role);
    });

    test('should validate refresh token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateRefreshToken(payload);
      const result = JwtService.validateRefreshToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(payload.userId);
    });

    test('should reject invalid token', () => {
      const result = JwtService.validateAccessToken('invalid-token');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('TOKEN_INVALID');
    });

    test('should reject invalid refresh token', () => {
      const result = JwtService.validateRefreshToken('invalid-token');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBe('REFRESH_TOKEN_INVALID');
    });
  });

  describe('Token Decoding', () => {
    test('should decode valid token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateAccessToken(payload);
      const decoded = JwtService.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });

    test('should return null for invalid token', () => {
      const decoded = JwtService.decodeToken('invalid-token');
      
      expect(decoded).toBeNull();
    });
  });

  describe('Token Expiry', () => {
    test('should get token expiry time', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateAccessToken(payload);
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

  describe('Configuration Validation', () => {
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

  describe('Token Refresh Flow', () => {
    test('should demonstrate complete token refresh flow', async () => {
      // Step 1: Generate initial tokens
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const initialTokens = JwtService.generateTokenPair(payload);
      
      expect(initialTokens.accessToken).toBeDefined();
      expect(initialTokens.refreshToken).toBeDefined();

      // Step 2: Validate initial access token
      const initialValidation = JwtService.validateAccessToken(initialTokens.accessToken);
      expect(initialValidation.isValid).toBe(true);

      // Step 3: Validate refresh token
      const refreshValidation = JwtService.validateRefreshToken(initialTokens.refreshToken);
      expect(refreshValidation.isValid).toBe(true);

      // Step 4: Generate new tokens (simulating refresh)
      const newTokens = JwtService.generateTokenPair(payload);
      
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      
      // Step 5: Verify new tokens are different
      expect(newTokens.accessToken).not.toBe(initialTokens.accessToken);
      expect(newTokens.refreshToken).not.toBe(initialTokens.refreshToken);

      // Step 6: Validate new access token
      const newValidation = JwtService.validateAccessToken(newTokens.accessToken);
      expect(newValidation.isValid).toBe(true);
      expect(newValidation.payload?.userId).toBe(payload.userId);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing JWT secrets', () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      expect(() => {
        JwtService.generateAccessToken(payload);
      }).toThrow('JWT secrets not configured');

      expect(() => {
        JwtService.generateRefreshToken(payload);
      }).toThrow('JWT secrets not configured');
    });

    test('should handle expired token validation', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'GUEST'
      };

      const token = JwtService.generateAccessToken(payload);
      
      // Manually modify the token to make it expired
      const parts = token.split('.');
      const payloadData = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      payloadData.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      parts[1] = Buffer.from(JSON.stringify(payloadData)).toString('base64');
      const expiredToken = parts.join('.');
      
      const result = JwtService.validateAccessToken(expiredToken);
      
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('TOKEN_EXPIRED');
    });
  });
});
