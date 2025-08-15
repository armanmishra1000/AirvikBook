import { ServiceResponse } from '../../utils/response.utils';
import { StorageConfig, StorageType } from '../../config/storage.config';
import FileStorageService, { UploadResult as LocalUploadResult } from './fileStorage.service';
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

export type UploadResultType = LocalUploadResult | S3UploadResult;

export class StorageFactoryService {
  /**
   * Get current storage type
   */
  static getStorageType(): StorageType {
    return StorageConfig.getStorageType();
  }

  /**
   * Check if storage is properly configured
   */
  static isStorageConfigured(): boolean {
    return StorageConfig.isStorageConfigured();
  }

  /**
   * Upload profile picture with environment-based storage
   */
  static async uploadProfilePicture(file: MulterFile, userId: string): Promise<ServiceResponse<UploadResultType>> {
    try {
      const storageType = this.getStorageType();
      
      // Log storage type for debugging
      console.log(`📁 Uploading profile picture using ${storageType} storage`);
      
      if (storageType === 'local') {
        return await FileStorageService.uploadProfilePicture(file, userId);
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
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
      }
      
      return {
        success: false,
        error: `Unsupported storage type: ${storageType}`,
        code: 'UNSUPPORTED_STORAGE_TYPE'
      };
    } catch (error) {
      console.error('Error in storage upload:', error);
      return {
        success: false,
        error: 'Storage upload failed. Please try again later.',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * Upload room image with environment-based storage
   */
  static async uploadRoomImage(file: MulterFile, roomId: string, imageType: 'main' | 'gallery' = 'gallery'): Promise<ServiceResponse<UploadResultType>> {
    try {
      const storageType = this.getStorageType();
      
      console.log(`📁 Uploading room image using ${storageType} storage`);
      
      if (storageType === 'local') {
        // For now, use S3 service as local service doesn't have room image upload
        // TODO: Add room image upload to FileStorageService
        return {
          success: false,
          error: 'Room image upload not yet implemented for local storage',
          code: 'FEATURE_NOT_IMPLEMENTED'
        };
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
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
      }
      
      return {
        success: false,
        error: `Unsupported storage type: ${storageType}`,
        code: 'UNSUPPORTED_STORAGE_TYPE'
      };
    } catch (error) {
      console.error('Error in storage room upload:', error);
      return {
        success: false,
        error: 'Room image upload failed. Please try again later.',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * Upload property image with environment-based storage
   */
  static async uploadPropertyImage(file: MulterFile, propertyId: string, imageType: 'logo' | 'exterior' | 'interior' | 'amenity' = 'interior'): Promise<ServiceResponse<UploadResultType>> {
    try {
      const storageType = this.getStorageType();
      
      console.log(`📁 Uploading property image using ${storageType} storage`);
      
      if (storageType === 'local') {
        // For now, use S3 service as local service doesn't have property image upload
        // TODO: Add property image upload to FileStorageService
        return {
          success: false,
          error: 'Property image upload not yet implemented for local storage',
          code: 'FEATURE_NOT_IMPLEMENTED'
        };
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
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
      }
      
      return {
        success: false,
        error: `Unsupported storage type: ${storageType}`,
        code: 'UNSUPPORTED_STORAGE_TYPE'
      };
    } catch (error) {
      console.error('Error in storage property upload:', error);
      return {
        success: false,
        error: 'Property image upload failed. Please try again later.',
        code: 'STORAGE_ERROR'
      };
    }
  }

  /**
   * Delete file with environment-based storage
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const storageType = this.getStorageType();
      
      console.log(`📁 Deleting file using ${storageType} storage`);
      
      if (storageType === 'local') {
        await FileStorageService.deleteFile(filePath);
        return true; // Local deletion is always successful if no error is thrown
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
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
      }
      
      console.error(`Unsupported storage type for file deletion: ${storageType}`);
      return false;
    } catch (error) {
      console.error('Error in storage delete:', error);
      return false;
    }
  }

  /**
   * Get storage statistics with environment-based storage
   */
  static async getStorageStats(): Promise<{
    storageType: StorageType;
    stats: any;
  }> {
    try {
      const storageType = this.getStorageType();
      
      console.log(`📁 Getting storage stats for ${storageType} storage`);
      
      if (storageType === 'local') {
        const stats = await FileStorageService.getStorageStats();
        return { storageType: 'local', stats };
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
          return { 
            storageType: 's3', 
            stats: { error: 'S3 is not properly configured' } 
          };
        }
        const stats = await S3StorageService.getStorageStats();
        return { storageType: 's3', stats };
      }
      
      return { 
        storageType: storageType as StorageType, 
        stats: { error: 'Unsupported storage type' } 
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { 
        storageType: this.getStorageType(), 
        stats: { error: 'Failed to get storage stats' } 
      };
    }
  }

  /**
   * Generate presigned URL (S3 only)
   */
  static async generatePresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    const storageType = this.getStorageType();
    
    if (storageType !== 's3') {
      throw new Error('Presigned URLs are only available with S3 storage');
    }
    
    if (!this.isStorageConfigured()) {
      throw new Error('S3 is not properly configured for presigned URLs');
    }
    
    return await S3StorageService.generatePresignedUploadUrl(key, contentType, expiresIn);
  }

  /**
   * Generate presigned download URL (S3 only)
   */
  static async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const storageType = this.getStorageType();
    
    if (storageType !== 's3') {
      throw new Error('Presigned URLs are only available with S3 storage');
    }
    
    if (!this.isStorageConfigured()) {
      throw new Error('S3 is not properly configured for presigned URLs');
    }
    
    return await S3StorageService.generatePresignedDownloadUrl(key, expiresIn);
  }

  /**
   * Check if file exists with environment-based storage
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const storageType = this.getStorageType();
      
      console.log(`📁 Checking file existence using ${storageType} storage`);
      
      if (storageType === 'local') {
        const fileInfo = await FileStorageService.getFileInfo(filePath);
        return fileInfo?.exists || false;
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
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
      }
      
      console.error(`Unsupported storage type for file existence check: ${storageType}`);
      return false;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  /**
   * Get file metadata with environment-based storage
   */
  static async getFileMetadata(filePath: string): Promise<any> {
    try {
      const storageType = this.getStorageType();
      
      console.log(`📁 Getting file metadata using ${storageType} storage`);
      
      if (storageType === 'local') {
        return await FileStorageService.getFileInfo(filePath);
      } else if (storageType === 's3') {
        if (!this.isStorageConfigured()) {
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
      }
      
      console.error(`Unsupported storage type for file metadata: ${storageType}`);
      return null;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return null;
    }
  }
}

export default StorageFactoryService;
