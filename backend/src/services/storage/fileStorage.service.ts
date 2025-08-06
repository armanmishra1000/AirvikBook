import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '../../utils/response.utils';
import ImageOptimization, { OptimizationResult } from '../../utils/imageOptimization';

const prisma = new PrismaClient();

// Type definitions
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface UploadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
  url: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

export class FileStorageService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'profiles');
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
  private static readonly MIN_DIMENSIONS = { width: 100, height: 100 };
  private static readonly MAX_DIMENSIONS = { width: 2000, height: 2000 };

  /**
   * Initialize upload directory
   */
  private static ensureUploadDirectory(): void {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Generate secure filename
   */
  private static generateSecureFilename(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName).toLowerCase();
    return `${userId}_${timestamp}_${randomSuffix}${extension}`;
  }

  /**
   * Sanitize filename to prevent security issues
   */
  private static sanitizeFilename(filename: string): string {
    // Remove any path traversal attempts
    const sanitized = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    
    // Remove special characters except alphanumeric, dots, and hyphens
    return sanitized.replace(/[^a-zA-Z0-9.-]/g, '') || 'image';
  }

  /**
   * Upload profile picture with optimization
   */
  static async uploadProfilePicture(file: MulterFile, userId: string): Promise<ServiceResponse<UploadResult>> {
    try {
      // Validate file
      const validation = await this.validateImageFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid image file',
          code: 'INVALID_IMAGE',
          details: validation.errors
        };
      }

      // Ensure upload directory exists
      this.ensureUploadDirectory();

      // Generate secure filename
      const originalName = this.sanitizeFilename(file.originalname);
      const fileName = this.generateSecureFilename(userId, originalName);
      const filePath = path.join(this.UPLOAD_DIR, fileName);

      // Optimize image
      const optimizationResult = await this.optimizeImage(file.buffer);

      // Save optimized image
      fs.writeFileSync(filePath, optimizationResult.buffer);

      // Clean up old uploaded picture
      await this.cleanupOldUploadedPicture(userId);

      // Update user profile
      const relativePath = `/uploads/profiles/${fileName}`;
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const fullUrl = `${baseUrl}${relativePath}`;
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: fullUrl,
          profilePictureSource: 'UPLOAD'
        }
      });

      return {
        success: true,
        data: {
          filePath: relativePath,
          fileName,
          fileSize: optimizationResult.size,
          dimensions: optimizationResult.dimensions,
          format: optimizationResult.format,
          url: fullUrl
        }
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error as file might already be deleted
    }
  }

  /**
   * Validate image file
   */
  static async validateImageFile(file: MulterFile): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file format
    const extension = path.extname(file.originalname).toLowerCase().substring(1);
    if (!this.ALLOWED_FORMATS.includes(extension)) {
      errors.push(`File format not supported. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`);
    }

    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Invalid file content type');
    }

    // Validate image format using Sharp
    try {
      const isValidFormat = await ImageOptimization.validateImageFormat(file.buffer);
      if (!isValidFormat) {
        errors.push('Invalid image format');
      }
    } catch (error) {
      errors.push('Unable to validate image format');
    }

    // Check dimensions
    let dimensions: { width: number; height: number } | undefined;
    try {
      dimensions = await ImageOptimization.getImageDimensions(file.buffer);
      
      if (!ImageOptimization.validateDimensions(
        dimensions,
        this.MIN_DIMENSIONS.width,
        this.MIN_DIMENSIONS.height,
        this.MAX_DIMENSIONS.width,
        this.MAX_DIMENSIONS.height
      )) {
        errors.push(`Image dimensions must be between ${this.MIN_DIMENSIONS.width}x${this.MIN_DIMENSIONS.height} and ${this.MAX_DIMENSIONS.width}x${this.MAX_DIMENSIONS.height}`);
      }
    } catch (error) {
      errors.push('Unable to read image dimensions');
    }

    return {
      isValid: errors.length === 0,
      errors,
      dimensions
    };
  }

  /**
   * Optimize image for storage
   */
  static async optimizeImage(buffer: Buffer): Promise<OptimizationResult> {
    try {
      return await ImageOptimization.optimizeProfilePicture(buffer, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 85,
        format: 'jpeg'
      });
    } catch (error) {
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up old uploaded picture for user
   */
  private static async cleanupOldUploadedPicture(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true, profilePictureSource: true }
      });

      if (user && user.profilePicture && user.profilePictureSource === 'UPLOAD') {
        await this.deleteFile(user.profilePicture);
      }
    } catch (error) {
      console.error('Error cleaning up old profile picture:', error);
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size: number;
    created: Date;
    modified: Date;
  } | null> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath);
      
      if (!fs.existsSync(fullPath)) {
        return { exists: false, size: 0, created: new Date(), modified: new Date() };
      }

      const stats = fs.statSync(fullPath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Create thumbnail from image
   */
  static async createThumbnail(buffer: Buffer, size: number = 150): Promise<Buffer> {
    try {
      return await ImageOptimization.createThumbnail(buffer, size, 80);
    } catch (error) {
      throw new Error(`Thumbnail creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert image format
   */
  static async convertFormat(buffer: Buffer, format: 'jpeg' | 'png' | 'webp', quality = 85): Promise<Buffer> {
    try {
      return await ImageOptimization.convertFormat(buffer, format, quality);
    } catch (error) {
      throw new Error(`Format conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
  }> {
    try {
      this.ensureUploadDirectory();
      
      const files = fs.readdirSync(this.UPLOAD_DIR);
      let totalSize = 0;
      let validFiles = 0;

      for (const file of files) {
        const filePath = path.join(this.UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          validFiles++;
        }
      }

      return {
        totalFiles: validFiles,
        totalSize,
        averageFileSize: validFiles > 0 ? totalSize / validFiles : 0
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        averageFileSize: 0
      };
    }
  }
}

export default FileStorageService;
