import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '../../utils/response.utils';
import * as fs from 'fs';
import * as path from 'path';

// Type definition for Multer file
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

const prisma = new PrismaClient();

// Type definitions for profile picture operations
export interface UploadResult {
  profilePicture: string;
  profilePictureSource: string;
  uploadedAt: Date;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface SyncResult {
  profilePicture: string;
  profilePictureSource: string;
  syncedAt: Date;
  googlePictureUrl: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  format: string;
}

export class ProfilePictureService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'profiles');
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
   * Upload profile picture
   */
  static async uploadPicture(file: MulterFile, userId: string): Promise<ServiceResponse<UploadResult>> {
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

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname).toLowerCase();
      const filename = `${userId}_${timestamp}${extension}`;
      const filePath = path.join(this.UPLOAD_DIR, filename);

      // Clean up old uploaded picture
      await this.cleanupOldUploadedPicture(userId);

      // Save file
      fs.writeFileSync(filePath, file.buffer);

      // Get image dimensions
      const dimensions = validation.dimensions!;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: `/uploads/profiles/${filename}`,
          profilePictureSource: 'UPLOAD'
        }
      });

      return {
        success: true,
        data: {
          profilePicture: updatedUser.profilePicture!,
          profilePictureSource: updatedUser.profilePictureSource!,
          uploadedAt: new Date(),
          fileSize: file.size,
          dimensions
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
   * Sync profile picture from Google
   */
  static async syncFromGoogle(userId: string): Promise<ServiceResponse<SyncResult>> {
    try {
      // Get user to check Google connection
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      if (!user.googleId) {
        return {
          success: false,
          error: 'No Google account connected',
          code: 'GOOGLE_NOT_CONNECTED'
        };
      }

      if (!user.allowGoogleSync) {
        return {
          success: false,
          error: 'Google sync is disabled',
          code: 'GOOGLE_SYNC_DISABLED'
        };
      }

      // Get Google profile data (this would typically come from a stored token or re-authentication)
      // For now, we'll use the existing profile picture if it's from Google
      if (!user.profilePicture || user.profilePictureSource !== 'GOOGLE') {
        return {
          success: false,
          error: 'No Google profile picture available',
          code: 'NO_GOOGLE_PICTURE'
        };
      }

      // Clean up old uploaded picture
      await this.cleanupOldUploadedPicture(userId);

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profilePictureSource: 'GOOGLE'
        }
      });

      return {
        success: true,
        data: {
          profilePicture: updatedUser.profilePicture!,
          profilePictureSource: updatedUser.profilePictureSource!,
          syncedAt: new Date(),
          googlePictureUrl: updatedUser.profilePicture!
        }
      };
    } catch (error) {
      console.error('Error syncing Google profile picture:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Delete profile picture
   */
  static async deletePicture(userId: string): Promise<ServiceResponse<{ deleted: boolean }>> {
    try {
      // Get user to check current picture
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      if (!user.profilePicture) {
        return {
          success: false,
          error: 'No profile picture to delete',
          code: 'NO_PICTURE'
        };
      }

      // Delete uploaded file if it exists
      if (user.profilePictureSource === 'UPLOAD') {
        const filePath = path.join(process.cwd(), 'public', user.profilePicture);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Update user profile
      await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: null,
          profilePictureSource: 'DEFAULT'
        }
      });

      return {
        success: true,
        data: { deleted: true }
      };
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
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

    // Check file content type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Invalid file content type');
    }

    // Basic dimension check (this is a simplified version)
    // In production, you'd want to use a library like sharp or jimp to get actual dimensions
    let dimensions: { width: number; height: number } | undefined;

    try {
      // For now, we'll assume the image is valid if it passes other checks
      // In a real implementation, you'd extract actual dimensions
      dimensions = { width: 400, height: 400 }; // Placeholder
    } catch (error) {
      errors.push('Unable to read image dimensions');
    }

    if (dimensions) {
      if (dimensions.width < this.MIN_DIMENSIONS.width || dimensions.height < this.MIN_DIMENSIONS.height) {
        errors.push(`Image dimensions too small. Minimum: ${this.MIN_DIMENSIONS.width}x${this.MIN_DIMENSIONS.height}`);
      }
      if (dimensions.width > this.MAX_DIMENSIONS.width || dimensions.height > this.MAX_DIMENSIONS.height) {
        errors.push(`Image dimensions too large. Maximum: ${this.MAX_DIMENSIONS.width}x${this.MAX_DIMENSIONS.height}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      dimensions
    };
  }

  /**
   * Clean up old uploaded picture
   */
  private static async cleanupOldUploadedPicture(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true, profilePictureSource: true }
      });

      if (user && user.profilePicture && user.profilePictureSource === 'UPLOAD') {
        const filePath = path.join(process.cwd(), 'public', user.profilePicture);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old profile picture:', error);
    }
  }

  /**
   * Get image information
   */
  static async getImageInfo(file: MulterFile): Promise<ImageInfo | null> {
    try {
      // This is a simplified version
      // In production, you'd use a library like sharp or jimp to get actual image info
      return {
        width: 400, // Placeholder
        height: 400, // Placeholder
        size: file.size,
        format: path.extname(file.originalname).toLowerCase().substring(1)
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }

  /**
   * Optimize image (placeholder for future implementation)
   */
  static async optimizeImage(buffer: Buffer): Promise<Buffer> {
    // This is a placeholder for image optimization
    // In production, you'd use a library like sharp to resize and optimize images
    return buffer;
  }

}

export default ProfilePictureService;
