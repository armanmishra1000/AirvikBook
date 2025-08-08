import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import ProfileService from '../services/user/profile.service';
import ProfilePictureService from '../services/user/profilePicture.service';

const prisma = new PrismaClient();

describe('ProfileService', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedpassword',
        role: 'GUEST'
      }
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUserId }
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const result = await ProfileService.getProfile(testUserId);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(testUserId);
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.fullName).toBe('Test User');
    });

    it('should return error for non-existent user', async () => {
      const result = await ProfileService.getProfile('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const profileData = {
        fullName: 'Updated Name',
        bio: 'Test bio',
        location: 'Test City'
      };

      const result = await ProfileService.updateProfile(testUserId, profileData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.user.fullName).toBe('Updated Name');
      expect(result.data?.user.bio).toBe('Test bio');
      expect(result.data?.user.location).toBe('Test City');
      expect(result.data?.changesApplied).toContain('fullName');
      expect(result.data?.changesApplied).toContain('bio');
      expect(result.data?.changesApplied).toContain('location');
    });

    it('should validate profile data', async () => {
      const invalidData = {
        fullName: 'A', // Too short
        website: 'invalid-url' // Invalid URL
      };

      const result = await ProfileService.updateProfile(testUserId, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.details).toBeDefined();
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update privacy settings successfully', async () => {
      const privacySettings = {
        profileVisibility: 'PRIVATE' as const,
        showEmail: false,
        showPhone: true,
        allowGoogleSync: false
      };

      const result = await ProfileService.updatePrivacySettings(testUserId, privacySettings);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.privacy.profileVisibility).toBe('PRIVATE');
      expect(result.data?.privacy.showEmail).toBe(false);
      expect(result.data?.privacy.showPhone).toBe(true);
      expect(result.data?.privacy.allowGoogleSync).toBe(false);
    });

    it('should validate privacy settings', async () => {
      const invalidSettings = {
        profileVisibility: 'INVALID' as any,
        showEmail: 'not-boolean' as any,
        showPhone: true,
        allowGoogleSync: false
      };

      const result = await ProfileService.updatePrivacySettings(testUserId, invalidSettings);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid privacy setting');
      expect(result.code).toBe('INVALID_PRIVACY_SETTING');
    });
  });

  describe('disconnectGoogle', () => {
    it('should return error when no Google account connected', async () => {
      const result = await ProfileService.disconnectGoogle(testUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No Google account connected');
      expect(result.code).toBe('GOOGLE_NOT_CONNECTED');
    });
  });
});

describe('ProfilePictureService', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-picture@example.com',
        fullName: 'Test Picture User',
        password: 'hashedpassword',
        role: 'GUEST'
      }
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUserId }
    });
  });

  describe('validateImageFile', () => {
    it('should validate image file successfully', async () => {
      const mockFile = {
        fieldname: 'picture',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        destination: '',
        filename: 'test.jpg',
        path: '',
        buffer: Buffer.from('fake-image-data')
      };

      const result = await ProfilePictureService.validateImageFile(mockFile);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject oversized files', async () => {
      const mockFile = {
        fieldname: 'picture',
        originalname: 'large.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
        destination: '',
        filename: 'large.jpg',
        path: '',
        buffer: Buffer.from('fake-image-data')
      };

      const result = await ProfilePictureService.validateImageFile(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds maximum limit of 5MB');
    });

    it('should reject unsupported formats', async () => {
      const mockFile = {
        fieldname: 'picture',
        originalname: 'test.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        size: 1024 * 1024,
        destination: '',
        filename: 'test.gif',
        path: '',
        buffer: Buffer.from('fake-image-data')
      };

      const result = await ProfilePictureService.validateImageFile(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File format not supported. Allowed formats: jpg, jpeg, png, webp');
    });
  });

  describe('syncFromGoogle', () => {
    it('should return error when no Google account connected', async () => {
      const result = await ProfilePictureService.syncFromGoogle(testUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No Google account connected');
      expect(result.code).toBe('GOOGLE_NOT_CONNECTED');
    });
  });

  describe('deletePicture', () => {
    it('should return error when no profile picture exists', async () => {
      const result = await ProfilePictureService.deletePicture(testUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No profile picture to delete');
      expect(result.code).toBe('NO_PICTURE');
    });
  });
});
