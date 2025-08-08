// Mock dependencies first
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    }
  }
}));

// Mock Google Auth Library
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn()
  }))
}));

import { GoogleOAuthService } from '../services/googleOAuth.service';
import prisma from '../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('GoogleOAuthService', () => {
  const mockGoogleProfile = {
    googleId: 'google_123456789',
    email: 'test@gmail.com',
    name: 'John Google User',
    picture: 'https://lh3.googleusercontent.com/a/default-user',
    emailVerified: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set required env vars for testing
    process.env.GOOGLE_CLIENT_ID = 'test_client_id';
    process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
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
      // Mock user lookup - no existing user with Google ID
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock user lookup - no existing user with email
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock user creation
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await GoogleOAuthService.authenticateWithGoogle('valid_token');

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.isNewUser).toBe(true);
    });

    it('should login existing user with Google ID', async () => {
      // Mock user lookup - existing user with Google ID
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mock user update
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await GoogleOAuthService.authenticateWithGoogle('valid_token');

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.isNewUser).toBe(false);
    });

    it('should link Google account to existing user with email', async () => {
      // Mock user lookup - no existing user with Google ID
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock user lookup - existing user with email
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: 'Existing User',
        password: 'hashedpassword',
        role: 'GUEST',
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mock user update
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: 'Existing User',
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await GoogleOAuthService.authenticateWithGoogle('valid_token');

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.isNewUser).toBe(false);
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
      // Mock user lookup - existing user
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: 'Existing User',
        password: 'hashedpassword',
        role: 'GUEST',
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mock Google ID lookup - no existing link
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock user update
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: 'Existing User',
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await GoogleOAuthService.linkGoogleAccount('valid_token', mockGoogleProfile.email);

      expect(result.success).toBe(true);
      expect(result.user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(result.user?.isEmailVerified).toBe(true);
      expect(result.linked).toBe(true);
    });

    it('should reject linking when emails do not match', async () => {
      // Mock user lookup - existing user with different email
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'different@example.com',
        fullName: 'Existing User',
        role: 'GUEST',
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await GoogleOAuthService.linkGoogleAccount('valid_token', 'different@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Google account email does not match user email');
      expect(result.code).toBe('EMAIL_MISMATCH');
    });

    it('should reject linking when user not found', async () => {
      // Mock user lookup - no user found
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await GoogleOAuthService.linkGoogleAccount('valid_token', mockGoogleProfile.email);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('unlinkGoogleAccount', () => {
    it('should unlink Google account from user', async () => {
      // Mock user lookup
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mock user update
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: null,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const success = await GoogleOAuthService.unlinkGoogleAccount('user123');
      expect(success).toBe(true);

      // Mock the findUnique call to return the updated user
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: null,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Verify Google ID is removed
      const updatedUser = await prisma.user.findUnique({ where: { id: 'user123' } });
      expect(updatedUser?.googleId).toBeNull();
    });
  });

  describe('isGoogleAccountLinked', () => {
    it('should return true for linked Google account', async () => {
      // Mock user lookup - user with Google ID
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const isLinked = await GoogleOAuthService.isGoogleAccountLinked(mockGoogleProfile.googleId);
      expect(isLinked).toBe(true);
    });

    it('should return false for unlinked Google account', async () => {
      // Mock user lookup - no user found
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const isLinked = await GoogleOAuthService.isGoogleAccountLinked('non_existent_google_id');
      expect(isLinked).toBe(false);
    });
  });

  describe('getUserByGoogleId', () => {
    it('should return user by Google ID', async () => {
      // Mock user lookup - user with Google ID
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: mockGoogleProfile.email,
        fullName: mockGoogleProfile.name,
        googleId: mockGoogleProfile.googleId,
        role: 'GUEST',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const user = await GoogleOAuthService.getUserByGoogleId(mockGoogleProfile.googleId);
      expect(user).toBeTruthy();
      expect(user?.googleId).toBe(mockGoogleProfile.googleId);
      expect(user).not.toHaveProperty('password');
    });

    it('should return null for non-existent Google ID', async () => {
      // Mock user lookup - no user found
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const user = await GoogleOAuthService.getUserByGoogleId('non_existent_google_id');
      expect(user).toBeNull();
    });
  });
});