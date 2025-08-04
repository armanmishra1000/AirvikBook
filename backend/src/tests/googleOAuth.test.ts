import { PrismaClient } from '@prisma/client';
import { GoogleOAuthService } from '../services/googleOAuth.service';

const prisma = new PrismaClient();

// Mock Google Auth Library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn()
  }))
}));

describe('GoogleOAuthService', () => {
  const mockGoogleProfile = {
    googleId: 'google_123456789',
    email: 'test@gmail.com',
    name: 'John Google User',
    picture: 'https://lh3.googleusercontent.com/a/default-user',
    emailVerified: true
  };

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'gmail.com' } },
          { googleId: { not: null } }
        ]
      }
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'gmail.com' } },
          { googleId: { not: null } }
        ]
      }
    });
  });

  describe('validateConfiguration', () => {
    it('should validate Google OAuth configuration', () => {
      // Save original env vars
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;

      // Test with missing configuration
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;

      const result = GoogleOAuthService.validateConfiguration();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('GOOGLE_CLIENT_ID environment variable is missing');
      expect(result.errors).toContain('GOOGLE_CLIENT_SECRET environment variable is missing');

      // Restore env vars
      if (originalClientId) process.env.GOOGLE_CLIENT_ID = originalClientId;
      if (originalClientSecret) process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    });
  });

  describe('authenticateWithGoogle', () => {
    beforeEach(() => {
      // Mock successful token verification
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: mockGoogleProfile.googleId,
          email: mockGoogleProfile.email,
          name: mockGoogleProfile.name,
          picture: mockGoogleProfile.picture,
          email_verified: mockGoogleProfile.emailVerified
        })
      });

      const { OAuth2Client } = require('google-auth-library');
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken
      }));

      // Set required env vars for testing
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
    });

    it('should create new user with Google account', async () => {
      const result = await GoogleOAuthService.authenticateWithGoogle('valid_token');

      expect(result.success).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.user?.email).toBe(mockGoogleProfile.email);
      expect(result.user?.fullName).toBe(mockGoogleProfile.name);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.user?.isEmailVerified).toBe(true);
      expect(result.isNewUser).toBe(true);
    });

    it('should login existing user with Google ID', async () => {
      // First create a user with Google ID
      await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          fullName: mockGoogleProfile.name,
          googleId: mockGoogleProfile.googleId,
          role: 'GUEST',
          isEmailVerified: true,
          isActive: true
        }
      });

      const result = await GoogleOAuthService.authenticateWithGoogle('valid_token');

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.isNewUser).toBe(false);
    });

    it('should link Google account to existing email user', async () => {
      // Create existing user with same email but no Google ID
      await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          fullName: 'Existing User',
          password: 'hashedpassword',
          role: 'GUEST',
          isEmailVerified: false,
          isActive: true
        }
      });

      const result = await GoogleOAuthService.authenticateWithGoogle('valid_token');

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.user?.isEmailVerified).toBe(true); // Should be auto-verified
      expect(result.isNewUser).toBe(false);
    });

    it('should handle invalid Google token', async () => {
      // Create a new mock instance for this test
      const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));
      
      // Clear the existing mock and create a new one
      jest.clearAllMocks();
      const { OAuth2Client } = require('google-auth-library');
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken
      }));

      // Reset the internal OAuth2Client to force re-initialization
      (GoogleOAuthService as any).oAuth2Client = null;

      const result = await GoogleOAuthService.authenticateWithGoogle('invalid_token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid Google token');
      expect(result.code).toBe('GOOGLE_TOKEN_INVALID');
    });
  });

  describe('linkGoogleAccount', () => {
    beforeEach(() => {
      // Mock successful token verification
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: mockGoogleProfile.googleId,
          email: mockGoogleProfile.email,
          name: mockGoogleProfile.name,
          picture: mockGoogleProfile.picture,
          email_verified: mockGoogleProfile.emailVerified
        })
      });

      const { OAuth2Client } = require('google-auth-library');
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken
      }));

      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
    });

    it('should link Google account to existing user', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          fullName: 'Existing User',
          password: 'hashedpassword',
          role: 'GUEST',
          isEmailVerified: false,
          isActive: true
        }
      });

      const result = await GoogleOAuthService.linkGoogleAccount('valid_token', mockGoogleProfile.email);

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.user?.isEmailVerified).toBe(true);
      expect(result.linked).toBe(true);
    });

    it('should reject linking when emails do not match', async () => {
      const result = await GoogleOAuthService.linkGoogleAccount('valid_token', 'different@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Google account email does not match user email');
      expect(result.code).toBe('EMAIL_MISMATCH');
    });

    it('should reject linking when user not found', async () => {
      // Mock Google profile with different email for this test
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: mockGoogleProfile.googleId,
          email: 'nonexistent@example.com', // Different email
          name: mockGoogleProfile.name,
          picture: mockGoogleProfile.picture,
          email_verified: mockGoogleProfile.emailVerified
        })
      });

      const { OAuth2Client } = require('google-auth-library');
      OAuth2Client.mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken
      }));

      const result = await GoogleOAuthService.linkGoogleAccount('valid_token', 'nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('unlinkGoogleAccount', () => {
    it('should unlink Google account from user', async () => {
      // Create user with Google account
      const user = await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          fullName: mockGoogleProfile.name,
          googleId: mockGoogleProfile.googleId,
          role: 'GUEST',
          isEmailVerified: true,
          isActive: true
        }
      });

      const success = await GoogleOAuthService.unlinkGoogleAccount(user.id);
      expect(success).toBe(true);

      // Verify Google ID is removed
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.googleId).toBeNull();
    });
  });

  describe('isGoogleAccountLinked', () => {
    it('should return true for linked Google account', async () => {
      // Create user with Google account
      await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          fullName: mockGoogleProfile.name,
          googleId: mockGoogleProfile.googleId,
          role: 'GUEST',
          isEmailVerified: true,
          isActive: true
        }
      });

      const isLinked = await GoogleOAuthService.isGoogleAccountLinked(mockGoogleProfile.googleId);
      expect(isLinked).toBe(true);
    });

    it('should return false for unlinked Google account', async () => {
      const isLinked = await GoogleOAuthService.isGoogleAccountLinked('non_existent_google_id');
      expect(isLinked).toBe(false);
    });
  });

  describe('getUserByGoogleId', () => {
    it('should return user by Google ID', async () => {
      // Create user with Google account
      await prisma.user.create({
        data: {
          email: mockGoogleProfile.email,
          fullName: mockGoogleProfile.name,
          googleId: mockGoogleProfile.googleId,
          role: 'GUEST',
          isEmailVerified: true,
          isActive: true
        }
      });

      const user = await GoogleOAuthService.getUserByGoogleId(mockGoogleProfile.googleId);
      expect(user).toBeTruthy();
      expect(user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(user).not.toHaveProperty('password');
    });

    it('should return null for non-existent Google ID', async () => {
      const user = await GoogleOAuthService.getUserByGoogleId('non_existent_google_id');
      expect(user).toBeNull();
    });
  });
});