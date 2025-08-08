import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '../../utils/response.utils';
import StorageFactoryService from '../storage/storageFactory.service';

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
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

  /**
   * Upload profile picture to S3
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

      // Upload via storage factory (S3 only under the hood)
      const upload = await StorageFactoryService.uploadProfilePicture(file as any, userId);
      if (!upload.success || !upload.data) {
        return {
          success: false,
          error: upload.error || 'Upload failed',
          code: upload.code || 'UPLOAD_FAILED'
        };
      }

      // Update user profile with S3 URL
      await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: (upload.data as any).url,
          profilePictureSource: 'S3'
        }
      });

      return {
        success: true,
        data: {
          profilePicture: (upload.data as any).url,
          profilePictureSource: 'S3',
          uploadedAt: new Date(),
          fileSize: (upload.data as any).fileSize,
          dimensions: (upload.data as any).dimensions
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
   * Sync profile picture from Google (unchanged)
   */
  static async syncFromGoogle(userId: string): Promise<ServiceResponse<SyncResult>> {
    try {
      // Get user to check Google connection
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
      }

      if (!user.googleId) {
        return { success: false, error: 'No Google account connected', code: 'GOOGLE_NOT_CONNECTED' };
      }

      if (!user.allowGoogleSync) {
        return { success: false, error: 'Google sync is disabled', code: 'GOOGLE_SYNC_DISABLED' };
      }

      if (!user.profilePicture || user.profilePictureSource !== 'GOOGLE') {
        return { success: false, error: 'No Google profile picture available', code: 'NO_GOOGLE_PICTURE' };
      }

      await prisma.user.update({
        where: { id: userId },
        data: { profilePictureSource: 'GOOGLE' }
      });

      return {
        success: true,
        data: {
          profilePicture: user.profilePicture,
          profilePictureSource: 'GOOGLE',
          syncedAt: new Date(),
          googlePictureUrl: user.profilePicture
        }
      };
    } catch (error) {
      console.error('Error syncing Google profile picture:', error);
      return { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' };
    }
  }

  /**
   * Delete profile picture (supports S3)
   */
  static async deletePicture(userId: string): Promise<ServiceResponse<{ deleted: boolean }>> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { success: false, error: 'User not found', code: 'USER_NOT_FOUND' };
      }
      if (!user.profilePicture) {
        return { success: false, error: 'No profile picture to delete', code: 'NO_PICTURE' };
      }

      if (user.profilePictureSource === 'S3') {
        await StorageFactoryService.deleteFile(user.profilePicture);
      }

      await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: null, profilePictureSource: 'DEFAULT' }
      });

      return { success: true, data: { deleted: true } };
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' };
    }
  }

  /**
   * Basic image validation (kept minimal)
   */
  static async validateImageFile(file: MulterFile): Promise<ValidationResult> {
    const errors: string[] = [];

    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension || !this.ALLOWED_FORMATS.includes(extension)) {
      errors.push(`File format not supported. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Invalid file content type');
    }

    // Placeholder dimensions
    const dimensions = { width: 400, height: 400 };

    return { isValid: errors.length === 0, errors, dimensions };
  }
}

export default ProfilePictureService;
