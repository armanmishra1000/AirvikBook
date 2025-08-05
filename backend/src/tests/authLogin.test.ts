import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthLoginService } from '../services/auth/authLogin.service';
import { SessionManagementService } from '../services/auth/sessionManagement.service';

const prisma = new PrismaClient();

describe('AuthLoginService', () => {
  let testUser: any;
  const testEmail = 'test.login@example.com';
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });

    // Create test user
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        fullName: 'Test User',
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.session.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await prisma.session.deleteMany({
      where: { userId: testUser.id }
    });
  });

  describe('authenticateWithEmail', () => {
    test('should successfully authenticate with valid credentials', async () => {
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
    });

    test('should fail with invalid password', async () => {
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

      // Now refresh the session
      const refreshResult = await AuthLoginService.refreshSession(refreshToken);

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.user).toBeDefined();
      expect(refreshResult.user?.email).toBe(testEmail);
    });

    test('should fail with invalid refresh token', async () => {
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

describe('SessionManagementService', () => {
  let testUser: any;
  const testEmail = 'test.session@example.com';

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Test Session User',
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.session.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await prisma.session.deleteMany({
      where: { userId: testUser.id }
    });
  });

  describe('getActiveSessions', () => {
    test('should return empty array for user with no sessions', async () => {
      const result = await SessionManagementService.getActiveSessions(testUser.id);

      expect(result.success).toBe(true);
      expect(result.data?.sessions).toEqual([]);
      expect(result.data?.totalSessions).toBe(0);
    });

    test('should return active sessions for user', async () => {
      // Create a test session
      await prisma.session.create({
        data: {
          userId: testUser.id,
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          isActive: true,
          deviceInfo: JSON.stringify({
            deviceId: 'test-device',
            deviceName: 'Test Device'
          }),
          ipAddress: '127.0.0.1'
        }
      });

      const result = await SessionManagementService.getActiveSessions(testUser.id);

      expect(result.success).toBe(true);
      expect(result.data?.sessions).toHaveLength(1);
      expect(result.data?.totalSessions).toBe(1);
      expect(result.data?.sessions[0].deviceInfo.deviceName).toBe('Test Device');
    });
  });

  describe('invalidateAllUserSessions', () => {
    test('should invalidate all user sessions', async () => {
      // Create multiple test sessions
      await prisma.session.createMany({
        data: [
          {
            userId: testUser.id,
            token: 'test-token-1',
            refreshToken: 'test-refresh-token-1',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isActive: true
          },
          {
            userId: testUser.id,
            token: 'test-token-2',
            refreshToken: 'test-refresh-token-2',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            isActive: true
          }
        ]
      });

      const result = await SessionManagementService.invalidateAllUserSessions(testUser.id);

      expect(result.success).toBe(true);
      expect(result.data?.sessionsInvalidated).toBe(2);

      // Verify sessions are inactive
      const activeSessions = await SessionManagementService.getActiveSessions(testUser.id);
      expect(activeSessions.data?.totalSessions).toBe(0);
    });
  });

  describe('generateDeviceFingerprint', () => {
    test('should generate device fingerprint', () => {
      const fingerprint = SessionManagementService.generateDeviceFingerprint(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        { language: 'en-US', timezone: 'America/New_York' }
      );

      expect(fingerprint.deviceId).toBeDefined();
      expect(fingerprint.deviceName).toBeDefined();
      expect(fingerprint.userAgent).toBeDefined();
      expect(fingerprint.lastActivity).toBeDefined();
    });
  });
});