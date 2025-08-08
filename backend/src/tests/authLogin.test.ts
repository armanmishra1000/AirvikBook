// Mock dependencies first
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}));

jest.mock('bcrypt');

// Mock JWT service
const mockJwtService = {
  generateTokenPair: jest.fn(),
  verifyToken: jest.fn(),
  validateConfiguration: jest.fn(),
  refreshAccessToken: jest.fn(),
  validateRefreshToken: jest.fn()
};

jest.mock('../services/jwt.service', () => ({
  JwtService: mockJwtService
}));

// Mock Google OAuth service
const mockGoogleOAuthService = {
  verifyGoogleToken: jest.fn(),
  linkGoogleAccount: jest.fn(),
  validateConfiguration: jest.fn()
};

jest.mock('../services/googleOAuth.service', () => ({
  GoogleOAuthService: mockGoogleOAuthService
}));

// Mock session management service
const mockSessionManagementService = {
  invalidateAllUserSessions: jest.fn(),
  updateSessionActivity: jest.fn()
};

jest.mock('../services/auth/sessionManagement.service', () => ({
  SessionManagementService: mockSessionManagementService
}));

import { describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import { AuthLoginService } from '../services/auth/authLogin.service';
import prisma from '../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthLoginService', () => {
  const testEmail = 'test.login@example.com';
  const testPassword = 'TestPassword123!';
  const testUser = {
    id: 'user123',
    email: testEmail,
    password: 'hashedpassword',
    fullName: 'Test User',
    role: 'GUEST',
    isEmailVerified: true,
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set required environment variables for JWT service
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    
    // Setup default JWT service mocks
    mockJwtService.generateTokenPair.mockReturnValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
    
    mockJwtService.verifyToken.mockResolvedValue({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    });
    
    mockJwtService.validateConfiguration.mockReturnValue({
      isValid: true,
      errors: []
    });
    
    mockJwtService.refreshAccessToken.mockResolvedValue({
      success: true,
      accessToken: 'new-access-token',
      expiresIn: 900
    });
    
    mockJwtService.validateRefreshToken.mockReturnValue({
      isValid: true,
      payload: {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role
      }
    });
    
    // Setup default Google OAuth service mocks
    mockGoogleOAuthService.verifyGoogleToken.mockResolvedValue({
      success: true,
      profile: {
        googleId: 'google123',
        email: testUser.email,
        name: testUser.fullName,
        emailVerified: true
      }
    });
    
    mockGoogleOAuthService.validateConfiguration.mockReturnValue({
      isValid: true,
      errors: []
    });
    
    // Setup default session management service mocks
    mockSessionManagementService.invalidateAllUserSessions.mockResolvedValue({
      success: true,
      data: { sessionsInvalidated: 0 }
    });
  });

  describe('authenticateWithEmail', () => {
    test('should successfully authenticate with valid credentials', async () => {

      
      try {
        // Mock user lookup
        (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(testUser);
        
        // Mock password comparison
        mockBcrypt.compare.mockResolvedValue(true as never);
        
        // Mock user update (for lastLoginAt)
        (mockPrisma.user.update as jest.Mock).mockResolvedValue({
          ...testUser,
          lastLoginAt: new Date()
        });
        
        // Mock session creation
        (mockPrisma.session.create as jest.Mock).mockResolvedValue({
          id: 'session123',
          userId: testUser.id,
          deviceId: 'test-device-001',
          deviceName: 'Test Device',
          ipAddress: '127.0.0.1',
          userAgent: 'Test User Agent',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const result = await AuthLoginService.authenticateWithEmail(
          {
            email: testEmail,
            password: testPassword,
            rememberMe: false,
            deviceInfo: {
              deviceId: 'test-device-001',
              deviceName: 'Test Device'
            }
          },
          '127.0.0.1',
          'Test User Agent'
        );


        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user?.email).toBe(testEmail);
        expect(result.tokens).toBeDefined();
        expect(result.tokens?.accessToken).toBeDefined();
        expect(result.tokens?.refreshToken).toBeDefined();
        expect(result.session).toBeDefined();
      } catch (error) {
        console.error('Test error:', error);
        throw error;
      }
    });

    test('should fail with invalid password', async () => {
      // Mock user lookup
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(testUser);
      
      // Mock password comparison failure
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await AuthLoginService.authenticateWithEmail(
        {
          email: testEmail,
          password: 'WrongPassword123!',
          rememberMe: false
        },
        '127.0.0.1',
        'Test User Agent'
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_CREDENTIALS');
      expect(result.error).toContain('Invalid email or password');
    });

    test('should fail with non-existent email', async () => {
      // Mock user lookup - no user found
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await AuthLoginService.authenticateWithEmail(
        {
          email: 'nonexistent@example.com',
          password: testPassword,
          rememberMe: false
        },
        '127.0.0.1',
        'Test User Agent'
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_CREDENTIALS');
    });

    test('should handle remember me functionality', async () => {
      // Mock user lookup
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(testUser);
      
      // Mock password comparison
      mockBcrypt.compare.mockResolvedValue(true as never);
      
      // Mock user update (for lastLoginAt)
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        ...testUser,
        lastLoginAt: new Date()
      });
      
      // Mock session creation
      (mockPrisma.session.create as jest.Mock).mockResolvedValue({
        id: 'session123',
        userId: testUser.id,
        deviceId: 'test-device-002',
        deviceName: 'Test Device',
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await AuthLoginService.authenticateWithEmail(
        {
          email: testEmail,
          password: testPassword,
          rememberMe: true,
          deviceInfo: {
            deviceId: 'test-device-002',
            deviceName: 'Test Device'
          }
        },
        '127.0.0.1',
        'Test User Agent'
      );

      expect(result.success).toBe(true);
      expect(result.tokens?.refreshExpiresIn).toBe(30 * 24 * 60 * 60); // 30 days
    });
  });

  describe('refreshSession', () => {
    test('should successfully refresh valid session', async () => {
      // Mock user lookup for login
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(testUser);
      
      // Mock password comparison
      mockBcrypt.compare.mockResolvedValue(true as never);
      
      // Mock user update (for lastLoginAt)
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        ...testUser,
        lastLoginAt: new Date()
      });
      
      // Mock session creation
      (mockPrisma.session.create as jest.Mock).mockResolvedValue({
        id: 'session123',
        userId: testUser.id,
        deviceId: 'test-device-003',
        deviceName: 'Test Device',
        ipAddress: '127.0.0.1',
        userAgent: 'Test User Agent',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // First, login to get a refresh token
      const loginResult = await AuthLoginService.authenticateWithEmail(
        {
          email: testEmail,
          password: testPassword,
          rememberMe: false,
          deviceInfo: {
            deviceId: 'test-device-003',
            deviceName: 'Test Device'
          }
        },
        '127.0.0.1',
        'Test User Agent'
      );

      expect(loginResult.success).toBe(true);
      const refreshToken = loginResult.tokens!.refreshToken;

      // Mock user lookup for refresh
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: testUser.id,
        email: testUser.email,
        fullName: testUser.fullName,
        role: testUser.role,
        isEmailVerified: testUser.isEmailVerified,
        isActive: testUser.isActive,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Now refresh the session
      const refreshResult = await AuthLoginService.refreshSession(refreshToken);

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.user).toBeDefined();
      expect(refreshResult.user?.email).toBe(testEmail);
    });

    test('should fail with invalid refresh token', async () => {
      // Mock JWT service to return failure for invalid token
      mockJwtService.refreshAccessToken.mockResolvedValue({
        success: false,
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });

      const refreshResult = await AuthLoginService.refreshSession('invalid-token');

      expect(refreshResult.success).toBe(false);
      expect(refreshResult.code).toBe('REFRESH_TOKEN_INVALID');
    });
  });

  describe('validateConfiguration', () => {
    test('should validate service configuration', () => {
      const validation = AuthLoginService.validateConfiguration();
      
      // This will depend on environment variables being set
      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });
});