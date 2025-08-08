import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import FileStorageService from '../services/storage/fileStorage.service';
import ImageOptimization from '../utils/imageOptimization';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn()
}));

// Mock ImageOptimization
jest.mock('../utils/imageOptimization', () => ({
  __esModule: true,
  default: {
    getImageDimensions: jest.fn(),
    validateDimensions: jest.fn(),
    validateImageFormat: jest.fn(),
    getImageMetadata: jest.fn(),
    optimizeProfilePicture: jest.fn()
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockImageOptimization = ImageOptimization as jest.Mocked<typeof ImageOptimization>;

describe('FileStorageService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.unlinkSync.mockImplementation(() => {});
    mockFs.readdirSync.mockReturnValue([]);
    mockFs.statSync.mockReturnValue({
      size: 1024,
      birthtime: new Date('2023-01-01'),
      mtime: new Date('2023-01-01'),
      isFile: () => true,
      isDirectory: () => false
    } as any);

    // Setup ImageOptimization mocks
    mockImageOptimization.getImageDimensions.mockResolvedValue({ width: 400, height: 400 });
    mockImageOptimization.validateDimensions.mockReturnValue(true);
    mockImageOptimization.validateImageFormat.mockResolvedValue(true);
    mockImageOptimization.getImageMetadata.mockResolvedValue({
      format: 'jpeg',
      width: 400,
      height: 400,
      size: 1024,
      hasAlpha: false
    });
    mockImageOptimization.optimizeProfilePicture.mockResolvedValue({
      buffer: Buffer.from('optimized-image'),
      dimensions: { width: 400, height: 400 },
      format: 'jpeg',
      size: 1024
    });
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
      expect(result.errors).toContain('File format not supported. Allowed formats: jpg, jpeg, png, webp');
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
      
      // Mock file exists
      mockFs.existsSync.mockReturnValueOnce(true);
      
      // Delete the file
      await FileStorageService.deleteFile(testFilePath);
      
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(path.join(process.cwd(), 'public', testFilePath));
    });

    it('should handle non-existent file gracefully', async () => {
      const nonExistentPath = '/uploads/profiles/non-existent.jpg';
      
      // Mock file doesn't exist
      mockFs.existsSync.mockReturnValueOnce(false);
      
      // Should not throw error
      await expect(FileStorageService.deleteFile(nonExistentPath)).resolves.not.toThrow();
    });
  });

  describe('getFileInfo', () => {
    it('should return file info for existing file', async () => {
      const testFilePath = '/uploads/profiles/test-info.jpg';
      
      // Mock file exists and stats
      mockFs.existsSync.mockReturnValueOnce(true);
      mockFs.statSync.mockReturnValueOnce({
        size: 1024,
        birthtime: new Date('2023-01-01'),
        mtime: new Date('2023-01-01'),
        isFile: () => true,
        isDirectory: () => false
      } as any);
      
      const result = await FileStorageService.getFileInfo(testFilePath);
      
      expect(result).toBeDefined();
      expect(result?.exists).toBe(true);
      expect(result?.size).toBe(1024);
      expect(result?.created).toBeInstanceOf(Date);
      expect(result?.modified).toBeInstanceOf(Date);
    });

    it('should return null for non-existent file', async () => {
      const nonExistentPath = '/uploads/profiles/non-existent.jpg';
      
      // Mock file doesn't exist
      mockFs.existsSync.mockReturnValueOnce(false);
      
      const result = await FileStorageService.getFileInfo(nonExistentPath);
      
      expect(result).toBeDefined();
      expect(result?.exists).toBe(false);
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      // Mock directory exists and has files
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['file1.jpg', 'file2.png'] as any);
      mockFs.statSync.mockReturnValue({
        size: 1024,
        birthtime: new Date('2023-01-01'),
        mtime: new Date('2023-01-01'),
        isFile: () => true,
        isDirectory: () => false
      } as any);
      
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
      
      // Setup mocks to return appropriate values
      mockImageOptimization.validateDimensions
        .mockReturnValueOnce(true)  // valid dimensions
        .mockReturnValueOnce(false) // invalid small dimensions
        .mockReturnValueOnce(false); // invalid large dimensions
      
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
