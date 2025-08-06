import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import FileStorageService from '../services/storage/fileStorage.service';
import ImageOptimization from '../utils/imageOptimization';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

describe('FileStorageService', () => {
  let testUserId: string;
  const testUploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');

  beforeEach(async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test-storage@example.com',
        fullName: 'Test Storage User',
        password: 'hashedpassword',
        role: 'GUEST'
      }
    });
    testUserId = testUser.id;

    // Ensure test directory exists
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  afterEach(async () => {
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUserId }
    });

    // Clean up test files
    if (fs.existsSync(testUploadDir)) {
      const files = fs.readdirSync(testUploadDir);
      for (const file of files) {
        if (file.startsWith(testUserId)) {
          fs.unlinkSync(path.join(testUploadDir, file));
        }
      }
    }
  });

  describe('validateImageFile', () => {
    it('should validate valid image file', async () => {
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

      const result = await FileStorageService.validateImageFile(mockFile);
      
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

      const result = await FileStorageService.validateImageFile(mockFile);
      
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

      const result = await FileStorageService.validateImageFile(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File format not supported');
    });
  });

  describe('optimizeImage', () => {
    it('should optimize image successfully', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      
      const result = await FileStorageService.optimizeImage(mockBuffer);
      
      expect(result).toBeDefined();
      expect(result.buffer).toBeDefined();
      expect(result.dimensions).toBeDefined();
      expect(result.format).toBe('jpeg');
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const testFilePath = '/uploads/profiles/test-delete.jpg';
      const fullPath = path.join(process.cwd(), 'public', testFilePath);
      
      // Create a test file
      fs.writeFileSync(fullPath, 'test content');
      expect(fs.existsSync(fullPath)).toBe(true);
      
      // Delete the file
      await FileStorageService.deleteFile(testFilePath);
      expect(fs.existsSync(fullPath)).toBe(false);
    });

    it('should handle non-existent file gracefully', async () => {
      const nonExistentPath = '/uploads/profiles/non-existent.jpg';
      
      // Should not throw error
      await expect(FileStorageService.deleteFile(nonExistentPath)).resolves.not.toThrow();
    });
  });

  describe('getFileInfo', () => {
    it('should return file info for existing file', async () => {
      const testFilePath = '/uploads/profiles/test-info.jpg';
      const fullPath = path.join(process.cwd(), 'public', testFilePath);
      
      // Create a test file
      const testContent = 'test content';
      fs.writeFileSync(fullPath, testContent);
      
      const result = await FileStorageService.getFileInfo(testFilePath);
      
      expect(result).toBeDefined();
      expect(result?.exists).toBe(true);
      expect(result?.size).toBe(testContent.length);
      expect(result?.created).toBeInstanceOf(Date);
      expect(result?.modified).toBeInstanceOf(Date);
      
      // Clean up
      fs.unlinkSync(fullPath);
    });

    it('should return null for non-existent file', async () => {
      const nonExistentPath = '/uploads/profiles/non-existent.jpg';
      
      const result = await FileStorageService.getFileInfo(nonExistentPath);
      
      expect(result).toBeDefined();
      expect(result?.exists).toBe(false);
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const result = await FileStorageService.getStorageStats();
      
      expect(result).toBeDefined();
      expect(result.totalFiles).toBeGreaterThanOrEqual(0);
      expect(result.totalSize).toBeGreaterThanOrEqual(0);
      expect(result.averageFileSize).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('ImageOptimization', () => {
  describe('getImageDimensions', () => {
    it('should get image dimensions', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      
      const result = await ImageOptimization.getImageDimensions(mockBuffer);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateDimensions', () => {
    it('should validate dimensions correctly', () => {
      const validDimensions = { width: 500, height: 500 };
      const invalidSmallDimensions = { width: 50, height: 50 };
      const invalidLargeDimensions = { width: 3000, height: 3000 };
      
      expect(ImageOptimization.validateDimensions(validDimensions)).toBe(true);
      expect(ImageOptimization.validateDimensions(invalidSmallDimensions)).toBe(false);
      expect(ImageOptimization.validateDimensions(invalidLargeDimensions)).toBe(false);
    });
  });

  describe('validateImageFormat', () => {
    it('should validate image format', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      
      const result = await ImageOptimization.validateImageFormat(mockBuffer);
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getImageMetadata', () => {
    it('should get image metadata', async () => {
      const mockBuffer = Buffer.from('fake-image-data');
      
      const result = await ImageOptimization.getImageMetadata(mockBuffer);
      
      expect(result).toBeDefined();
      expect(result.format).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
      expect(result.size).toBeGreaterThan(0);
      expect(typeof result.hasAlpha).toBe('boolean');
    });
  });
});
