import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import GoogleOAuthService from '../services/googleOAuth.service';

const prisma = new PrismaClient();

// Mock Google OAuth client
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn()
  }))
}));

describe('Google Profile Integration (B7)', () => {
  let testUserId: string;
  let testUserWithPasswordId: string;
  let testGoogleId: string;

  beforeEach(async () => {
    // Create test users
    const userWithPassword = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        fullName: 'Test User',
        profileVisibility: 'PUBLIC',
        allowGoogleSync: true
      }
    });
    testUserWithPasswordId = userWithPassword.id;

    const userWithoutPassword = await prisma.user.create({
      data: {
        email: 'google@example.com',
        password: null,
        fullName: 'Google User',
        profileVisibility: 'PUBLIC',
        allowGoogleSync: true
      }
    });
    testUserId = userWithoutPassword.id;

    testGoogleId = 'google123456';
  });

  afterEach(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'google@example.com']
        }
      }
    });
  });

  describe('connectGoogleToUser', () => {
    it('should successfully connect a Google account to an existing user', async () => {
      // Mock Google token verification
      const mockGoogleProfile = {
        googleId: testGoogleId,
        email: 'test@example.com',
        name: 'Test User Updated',
        picture: 'https://lh3.googleusercontent.com/test-picture.jpg',
        emailVerified: true
      };

      // Mock the verifyGoogleToken method
      jest.spyOn(GoogleOAuthService, 'verifyGoogleToken').mockResolvedValue(mockGoogleProfile);

      const result = await GoogleOAuthService.connectGoogleToUser(testUserWithPasswordId, 'mock-token');

      expect(result.success).toBe(true);
      expect(result.connected).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.googleId).toBe(testGoogleId);
      expect(result.user?.profilePictureSource).toBe('GOOGLE');
      expect(result.user?.allowGoogleSync).toBe(true);
    });

    it('should fail to connect a Google account that is already linked elsewhere', async () => {
      // First, link the Google account to another user
      await prisma.user.update({
        where: { id: testUserId },
        data: { googleId: testGoogleId }
      });

      // Mock Google token verification
      const mockGoogleProfile = {
        googleId: testGoogleId,
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/test-picture.jpg',
        emailVerified: true
      };

      jest.spyOn(GoogleOAuthService, 'verifyGoogleToken').mockResolvedValue(mockGoogleProfile);

      const result = await GoogleOAuthService.connectGoogleToUser(testUserWithPasswordId, 'mock-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Google account is already linked to another user');
      expect(result.code).toBe('GOOGLE_ACCOUNT_LINKED');
    });

    it('should fail with invalid Google token', async () => {
      jest.spyOn(GoogleOAuthService, 'verifyGoogleToken').mockResolvedValue(null);

      const result = await GoogleOAuthService.connectGoogleToUser(testUserWithPasswordId, 'invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid Google token');
      expect(result.code).toBe('GOOGLE_TOKEN_INVALID');
    });

    it('should fail when user not found', async () => {
      const mockGoogleProfile = {
        googleId: testGoogleId,
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/test-picture.jpg',
        emailVerified: true
      };

      jest.spyOn(GoogleOAuthService, 'verifyGoogleToken').mockResolvedValue(mockGoogleProfile);

      const result = await GoogleOAuthService.connectGoogleToUser('non-existent-user-id', 'mock-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('syncProfileFromGoogle', () => {
    it('should successfully sync profile picture from Google', async () => {
      // Setup user with Google connection and Google profile picture
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          googleId: testGoogleId,
          profilePicture: 'https://lh3.googleusercontent.com/test-picture.jpg',
          profilePictureSource: 'GOOGLE'
        }
      });

      const result = await GoogleOAuthService.syncProfileFromGoogle(testUserId);

      expect(result.success).toBe(true);
      expect(result.syncedFields).toContain('profilePicture');
    });

    it('should fail when no Google account is connected', async () => {
      const result = await GoogleOAuthService.syncProfileFromGoogle(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No Google account connected');
      expect(result.code).toBe('GOOGLE_NOT_CONNECTED');
    });

    it('should fail when user not found', async () => {
      const result = await GoogleOAuthService.syncProfileFromGoogle('non-existent-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('disconnectGoogle', () => {
    it('should successfully disconnect a Google account when password exists', async () => {
      // Setup user with Google connection and password
      await prisma.user.update({
        where: { id: testUserWithPasswordId },
        data: {
          googleId: testGoogleId,
          profilePictureSource: 'GOOGLE'
        }
      });

      const result = await GoogleOAuthService.disconnectGoogle(testUserWithPasswordId);

      expect(result.success).toBe(true);
      expect(result.disconnected).toBe(true);

      // Verify the user was updated correctly
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUserWithPasswordId }
      });
      expect(updatedUser?.googleId).toBeNull();
      expect(updatedUser?.allowGoogleSync).toBe(false);
      expect(updatedUser?.profilePictureSource).toBe('DEFAULT');
    });

    it('should fail to disconnect a Google account when no password exists', async () => {
      // Setup user with Google connection but no password
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          googleId: testGoogleId,
          profilePictureSource: 'GOOGLE'
        }
      });

      const result = await GoogleOAuthService.disconnectGoogle(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot disconnect Google account without password set');
      expect(result.code).toBe('PASSWORD_REQUIRED');

      // Verify the user was NOT updated
      const user = await prisma.user.findUnique({
        where: { id: testUserId }
      });
      expect(user?.googleId).toBe(testGoogleId);
      expect(user?.profilePictureSource).toBe('GOOGLE');
    });

    it('should fail when no Google account is connected', async () => {
      const result = await GoogleOAuthService.disconnectGoogle(testUserWithPasswordId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No Google account connected');
      expect(result.code).toBe('GOOGLE_NOT_CONNECTED');
    });

    it('should fail when user not found', async () => {
      const result = await GoogleOAuthService.disconnectGoogle('non-existent-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('validateGooglePictureUrl', () => {
    it('should validate valid Google profile picture URLs', async () => {
      const validUrls = [
        'https://lh3.googleusercontent.com/test-picture.jpg',
        'https://lh4.googleusercontent.com/test-picture.png',
        'https://lh5.googleusercontent.com/test-picture.webp'
      ];

      for (const url of validUrls) {
        const result = await GoogleOAuthService.validateGooglePictureUrl(url);
        expect(result).toBe(true);
      }
    });

    it('should reject invalid Google profile picture URLs', async () => {
      const invalidUrls = [
        'http://lh3.googleusercontent.com/test-picture.jpg', // HTTP instead of HTTPS
        'https://malicious-site.com/fake-picture.jpg', // Wrong domain
        'https://googleusercontent.com/test-picture.jpg', // Wrong subdomain
        'not-a-url',
        ''
      ];

      for (const url of invalidUrls) {
        const result = await GoogleOAuthService.validateGooglePictureUrl(url);
        expect(result).toBe(false);
      }
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain existing Google OAuth functionality', async () => {
      // Test that existing methods still work
      const mockGoogleProfile = {
        googleId: testGoogleId,
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/test-picture.jpg',
        emailVerified: true
      };

      jest.spyOn(GoogleOAuthService, 'verifyGoogleToken').mockResolvedValue(mockGoogleProfile);

      // Test existing linkGoogleAccount method
      const linkResult = await GoogleOAuthService.linkGoogleAccount('mock-token', 'test@example.com');
      expect(linkResult.success).toBe(true);
      expect(linkResult.linked).toBe(true);

      // Test existing unlinkGoogleAccount method
      const unlinkResult = await GoogleOAuthService.unlinkGoogleAccount(testUserWithPasswordId);
      expect(unlinkResult).toBe(true);

      // Test existing isGoogleAccountLinked method
      const isLinkedResult = await GoogleOAuthService.isGoogleAccountLinked(testGoogleId);
      expect(isLinkedResult).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error by using an invalid user ID format
      const result = await GoogleOAuthService.connectGoogleToUser('invalid-id-format', 'mock-token');
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('USER_NOT_FOUND');
    });

    it('should handle Google API failures gracefully', async () => {
      jest.spyOn(GoogleOAuthService, 'verifyGoogleToken').mockRejectedValue(new Error('Google API error'));

      const result = await GoogleOAuthService.connectGoogleToUser(testUserWithPasswordId, 'mock-token');

      expect(result.success).toBe(false);
      expect(result.code).toBe('INTERNAL_ERROR');
    });
  });
});
