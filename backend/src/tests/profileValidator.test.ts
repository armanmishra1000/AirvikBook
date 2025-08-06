import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import ProfileValidator from '../validators/profile.validator';

const prisma = new PrismaClient();

describe('ProfileValidator', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        fullName: 'Test User',
        profileVisibility: 'PUBLIC',
        allowGoogleSync: true
      }
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com'
      }
    });
  });

  describe('validateProfileData', () => {
    it('should validate valid profile data', () => {
      const validData = {
        fullName: 'John Doe',
        bio: 'A software developer',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        nationality: 'US',
        occupation: 'Developer',
        website: 'https://example.com',
        location: 'New York'
      };

      const result = ProfileValidator.validateProfileData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid full name format', () => {
      const invalidData = {
        fullName: 'John123',
        bio: 'A software developer'
      };

      const result = ProfileValidator.validateProfileData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name can only contain letters and spaces');
    });

    it('should reject invalid website URL', () => {
      const invalidData = {
        fullName: 'John Doe',
        website: 'not-a-url'
      };

      const result = ProfileValidator.validateProfileData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Website must be a valid URL');
    });

    it('should reject invalid date of birth', () => {
      const invalidData = {
        fullName: 'John Doe',
        dateOfBirth: 'invalid-date'
      };

      const result = ProfileValidator.validateProfileData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date of birth must be a valid date');
    });

    it('should reject bio that is too long', () => {
      const invalidData = {
        fullName: 'John Doe',
        bio: 'A'.repeat(501) // Over 500 character limit
      };

      const result = ProfileValidator.validateProfileData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bio must be less than 500 characters');
    });
  });

  describe('canDisconnectGoogle', () => {
    it('should allow disconnection when user has Google connected', async () => {
      // Update test user to have Google connected
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          googleId: 'google123',
          allowGoogleSync: true
        }
      });

      const result = await ProfileValidator.canDisconnectGoogle(testUserId);
      expect(result.canDisconnect).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should prevent disconnection when user has no Google connection', async () => {
      // Ensure user has no Google connection
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          googleId: null,
          allowGoogleSync: false
        }
      });

      const result = await ProfileValidator.canDisconnectGoogle(testUserId);
      expect(result.canDisconnect).toBe(false);
      expect(result.reason).toBe('No Google account connected');
    });

    it('should prevent disconnection when user has no password set', async () => {
      // Update user to have no password (Google-only account)
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          googleId: 'google123',
          password: null,
          allowGoogleSync: true
        }
      });

      const result = await ProfileValidator.canDisconnectGoogle(testUserId);
      expect(result.canDisconnect).toBe(false);
      expect(result.reason).toBe('Cannot disconnect Google account without password set');
    });
  });

  describe('validateProfilePictureSource', () => {
    it('should accept valid profile picture sources', () => {
      expect(ProfileValidator.validateProfilePictureSource('UPLOAD')).toBe(true);
      expect(ProfileValidator.validateProfilePictureSource('GOOGLE')).toBe(true);
      expect(ProfileValidator.validateProfilePictureSource('DEFAULT')).toBe(true);
    });

    it('should reject invalid profile picture sources', () => {
      expect(ProfileValidator.validateProfilePictureSource('INVALID')).toBe(false);
      expect(ProfileValidator.validateProfilePictureSource('')).toBe(false);
      expect(ProfileValidator.validateProfilePictureSource('random')).toBe(false);
    });
  });

  describe('sanitizeProfileData', () => {
    it('should sanitize profile data correctly', () => {
      const rawData = {
        fullName: '  John Doe  ',
        bio: '  Hello World  ',
        website: '  https://example.com  ',
        location: '  New York  '
      };

      const sanitized = ProfileValidator.sanitizeProfileData(rawData);
      
      expect(sanitized.fullName).toBe('John Doe');
      expect(sanitized.bio).toBe('Hello World');
      expect(sanitized.website).toBe('https://example.com');
      expect(sanitized.location).toBe('New York');
    });

    it('should handle null and undefined values', () => {
      const rawData = {
        fullName: 'John Doe',
        bio: undefined,
        website: ''
      };

      const sanitized = ProfileValidator.sanitizeProfileData(rawData);
      
      expect(sanitized.fullName).toBe('John Doe');
      expect(sanitized.bio).toBeUndefined();
      expect(sanitized.website).toBe('');
    });
  });

  describe('Validation Rules', () => {
    it('should have profile update validation rules', () => {
      expect(ProfileValidator.validateProfileUpdate).toBeDefined();
      expect(Array.isArray(ProfileValidator.validateProfileUpdate)).toBe(true);
      expect(ProfileValidator.validateProfileUpdate.length).toBeGreaterThan(0);
    });

    it('should have privacy settings validation rules', () => {
      expect(ProfileValidator.validatePrivacySettings).toBeDefined();
      expect(Array.isArray(ProfileValidator.validatePrivacySettings)).toBe(true);
      expect(ProfileValidator.validatePrivacySettings.length).toBeGreaterThan(0);
    });

    it('should have Google connection validation rules', () => {
      expect(ProfileValidator.validateGoogleConnection).toBeDefined();
      expect(Array.isArray(ProfileValidator.validateGoogleConnection)).toBe(true);
      expect(ProfileValidator.validateGoogleConnection.length).toBeGreaterThan(0);
    });

    it('should have user ID validation rules', () => {
      expect(ProfileValidator.validateUserId).toBeDefined();
      expect(Array.isArray(ProfileValidator.validateUserId)).toBe(true);
      expect(ProfileValidator.validateUserId.length).toBeGreaterThan(0);
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error messages for validation failures', () => {
      const invalidData = {
        fullName: '',
        website: 'not-a-url',
        bio: 'A'.repeat(501)
      };

      const result = ProfileValidator.validateProfileData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name must be at least 2 characters');
      expect(result.errors).toContain('Website must be a valid URL');
      expect(result.errors).toContain('Bio must be less than 500 characters');
    });

    it('should provide actionable error messages for business logic failures', async () => {
      // Test user with no Google connection
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          googleId: null,
          allowGoogleSync: false
        }
      });

      const result = await ProfileValidator.canDisconnectGoogle(testUserId);
      
      expect(result.canDisconnect).toBe(false);
      expect(result.reason).toBe('No Google account connected');
    });
  });
});
