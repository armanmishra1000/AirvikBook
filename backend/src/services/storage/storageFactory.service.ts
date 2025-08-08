import { ServiceResponse } from '../../utils/response.utils';
import S3StorageService, { S3UploadResult } from './s3Storage.service';

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

export type StorageType = 's3';
export type UploadResultType = S3UploadResult;

export class StorageFactoryService {
  /**
   * Check if S3 is configured
   */
  static isS3Configured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME
    );
  }

  /**
   * Upload profile picture (S3 only)
   */
  static async uploadProfilePicture(file: MulterFile, userId: string): Promise<ServiceResponse<UploadResultType>> {
    try {
      if (!this.isS3Configured()) {
        return {
          success: false,
          error: 'S3 is not properly configured. Please check AWS credentials and bucket settings.',
          code: 'S3_NOT_CONFIGURED'
        };
      }
      
      const result = await S3StorageService.uploadProfilePicture(file, userId);
      
      if (!result.success && result.code === 'S3_UPLOAD_ERROR') {
        return {
          success: false,
          error: 'Failed to upload to S3. Please check S3 bucket permissions and try again.',
          code: 'S3_PERMISSION_ERROR',
          details: result.error
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error in storage upload (S3):', error);
      return {
        success: false,
        error: 'Storage upload failed. Please try again later.',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * Upload room image (S3 only)
   */
  static async uploadRoomImage(file: MulterFile, roomId: string, imageType: 'main' | 'gallery' = 'gallery'): Promise<ServiceResponse<UploadResultType>> {
    try {
      if (!this.isS3Configured()) {
        return {
          success: false,
          error: 'S3 is not properly configured. Please check AWS credentials and bucket settings.',
          code: 'S3_NOT_CONFIGURED'
        };
      }
      
      const result = await S3StorageService.uploadRoomImage(file, roomId, imageType);
      
      if (!result.success && result.code === 'S3_UPLOAD_ERROR') {
        return {
          success: false,
          error: 'Failed to upload to S3. Please check S3 bucket permissions and try again.',
          code: 'S3_PERMISSION_ERROR',
          details: result.error
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error in storage room upload (S3):', error);
      return {
        success: false,
        error: 'Room image upload failed. Please try again later.',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * Upload property image (S3 only)
   */
  static async uploadPropertyImage(file: MulterFile, propertyId: string, imageType: 'logo' | 'exterior' | 'interior' | 'amenity' = 'interior'): Promise<ServiceResponse<UploadResultType>> {
    try {
      if (!this.isS3Configured()) {
        return {
          success: false,
          error: 'S3 is not properly configured. Please check AWS credentials and bucket settings.',
          code: 'S3_NOT_CONFIGURED'
        };
      }
      
      const result = await S3StorageService.uploadPropertyImage(file, propertyId, imageType);
      
      if (!result.success && result.code === 'S3_UPLOAD_ERROR') {
        return {
          success: false,
          error: 'Failed to upload to S3. Please check S3 bucket permissions and try again.',
          code: 'S3_PERMISSION_ERROR',
          details: result.error
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error in storage property upload (S3):', error);
      return {
        success: false,
        error: 'Property image upload failed. Please try again later.',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * Delete file (S3 only)
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!this.isS3Configured()) {
        console.error('S3 is not properly configured for file deletion');
        return false;
      }
      // Extract S3 key from URL if it's a full URL
      let s3Key = filePath;
      if (filePath.startsWith('http')) {
        const urlParts = filePath.split('/');
        s3Key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/
      }
      return await S3StorageService.deleteFile(s3Key);
    } catch (error) {
      console.error('Error in storage delete (S3):', error);
      return false;
    }
  }

  /**
   * Get storage statistics (S3 only)
   */
  static async getStorageStats(): Promise<{
    storageType: StorageType;
    stats: any;
  }> {
    try {
      if (!this.isS3Configured()) {
        return { 
          storageType: 's3', 
          stats: { error: 'S3 is not properly configured' } 
        };
      }
      const stats = await S3StorageService.getStorageStats();
      return { storageType: 's3', stats };
    } catch (error) {
      console.error('Error getting storage stats (S3):', error);
      return { storageType: 's3', stats: { error: 'Failed to get storage stats' } };
    }
  }

  /**
   * Generate presigned URL (S3 only)
   */
  static async generatePresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isS3Configured()) {
      throw new Error('Presigned URLs are only available with S3 storage');
    }
    return await S3StorageService.generatePresignedUploadUrl(key, contentType, expiresIn);
  }

  /**
   * Generate presigned download URL (S3 only)
   */
  static async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isS3Configured()) {
      throw new Error('Presigned URLs are only available with S3 storage');
    }
    return await S3StorageService.generatePresignedDownloadUrl(key, expiresIn);
  }

  /**
   * Check if file exists (S3 only)
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      if (!this.isS3Configured()) {
        console.error('S3 is not properly configured for file existence check');
        return false;
      }
      // Extract S3 key from URL if it's a full URL
      let s3Key = filePath;
      if (filePath.startsWith('http')) {
        const urlParts = filePath.split('/');
        s3Key = urlParts.slice(3).join('/');
      }
      return await S3StorageService.fileExists(s3Key);
    } catch (error) {
      console.error('Error checking file existence (S3):', error);
      return false;
    }
  }

  /**
   * Get file metadata (S3 only)
   */
  static async getFileMetadata(filePath: string): Promise<any> {
    try {
      if (!this.isS3Configured()) {
        console.error('S3 is not properly configured for file metadata');
        return null;
      }
      // Extract S3 key from URL if it's a full URL
      let s3Key = filePath;
      if (filePath.startsWith('http')) {
        const urlParts = filePath.split('/');
        s3Key = urlParts.slice(3).join('/');
      }
      return await S3StorageService.getFileMetadata(s3Key);
    } catch (error) {
      console.error('Error getting file metadata (S3):', error);
      return null;
    }
  }
}

export default StorageFactoryService;
