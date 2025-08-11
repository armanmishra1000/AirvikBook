import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

export interface S3UploadResult {
  key: string;
  fileName: string;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  format: string;
  url: string;
  bucket: string;
  region: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

export class S3StorageService {
  private static s3Client: S3Client;
  private static readonly BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'airvikbook-uploads';
  private static readonly REGION = process.env.AWS_REGION || 'us-east-1';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
  private static readonly MIN_DIMENSIONS = { width: 100, height: 100 };
  private static readonly MAX_DIMENSIONS = { width: 2000, height: 2000 };

  /**
   * Initialize S3 client
   */
  private static initializeS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: this.REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });
    }
    return this.s3Client;
  }

  /**
   * Generate S3 key for file
   */
  private static generateS3Key(userId: string, originalName: string, folder: string = 'profiles'): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${folder}/${userId}_${timestamp}_${randomSuffix}.${extension}`;
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
   * Upload profile picture to S3 with optimization
   */
  static async uploadProfilePicture(file: MulterFile, userId: string): Promise<ServiceResponse<S3UploadResult>> {
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

      // Initialize S3 client
      const s3Client = this.initializeS3Client();

      // Generate S3 key
      const originalName = this.sanitizeFilename(file.originalname);
      const s3Key = this.generateS3Key(userId, originalName, 'profiles');

      // Optimize image
      const optimizationResult = await this.optimizeImage(file.buffer);

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: s3Key,
        Body: optimizationResult.buffer,
        ContentType: `image/${optimizationResult.format}`,
        ContentLength: optimizationResult.size,
        Metadata: {
          userId,
          originalName,
          dimensions: `${optimizationResult.dimensions.width}x${optimizationResult.dimensions.height}`,
          uploadedAt: new Date().toISOString(),
        },
      });

      try {
        await s3Client.send(uploadCommand);
      } catch (s3Error: any) {
        console.error('S3 upload error details:', s3Error);
        
        // Handle specific S3 errors
        if (s3Error.name === 'AccessDenied') {
          return {
            success: false,
            error: 'Access denied to S3 bucket. Please check bucket permissions and IAM policies.',
            code: 'S3_ACCESS_DENIED',
            details: {
              bucket: this.BUCKET_NAME,
              key: s3Key,
              errorCode: s3Error.$metadata?.httpStatusCode,
              requestId: s3Error.$metadata?.requestId
            }
          };
        } else if (s3Error.name === 'NoSuchBucket') {
          return {
            success: false,
            error: `S3 bucket '${this.BUCKET_NAME}' does not exist. Please check bucket configuration.`,
            code: 'S3_BUCKET_NOT_FOUND',
            details: { bucket: this.BUCKET_NAME }
          };
        } else if (s3Error.name === 'InvalidAccessKeyId' || s3Error.name === 'SignatureDoesNotMatch') {
          return {
            success: false,
            error: 'Invalid AWS credentials. Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
            code: 'S3_INVALID_CREDENTIALS',
            details: { errorName: s3Error.name }
          };
        } else {
          return {
            success: false,
            error: `S3 upload failed: ${s3Error.message || 'Unknown error'}`,
            code: 'S3_UPLOAD_ERROR',
            details: {
              errorName: s3Error.name,
              errorCode: s3Error.$metadata?.httpStatusCode,
              requestId: s3Error.$metadata?.requestId
            }
          };
        }
      }

      // Clean up old profile picture (previously uploaded)
      await this.cleanupOldProfilePicture(userId);

      // Generate public URL
      const publicUrl = `https://${this.BUCKET_NAME}.s3.${this.REGION}.amazonaws.com/${s3Key}`;

      // Update user profile (mark as UPLOAD to keep compatibility)
      await prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: publicUrl,
          profilePictureSource: 'UPLOAD'
        }
      });

      return {
        success: true,
        data: {
          key: s3Key,
          fileName: originalName,
          fileSize: optimizationResult.size,
          dimensions: optimizationResult.dimensions,
          format: optimizationResult.format,
          url: publicUrl,
          bucket: this.BUCKET_NAME,
          region: this.REGION
        }
      };
    } catch (error) {
      console.error('Error uploading profile picture to S3:', error);
      return {
        success: false,
        error: 'Failed to upload file to S3',
        code: 'S3_UPLOAD_ERROR'
      };
    }
  }

  /**
   * Upload room images to S3
   */
  static async uploadRoomImage(file: MulterFile, roomId: string, imageType: 'main' | 'gallery' = 'gallery'): Promise<ServiceResponse<S3UploadResult>> {
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

      // Initialize S3 client
      const s3Client = this.initializeS3Client();

      // Generate S3 key
      const originalName = this.sanitizeFilename(file.originalname);
      const s3Key = this.generateS3Key(roomId, originalName, `rooms/${imageType}`);

      // Optimize image
      const optimizationResult = await this.optimizeImage(file.buffer);

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: s3Key,
        Body: optimizationResult.buffer,
        ContentType: `image/${optimizationResult.format}`,
        ContentLength: optimizationResult.size,
        Metadata: {
          roomId,
          imageType,
          originalName,
          dimensions: `${optimizationResult.dimensions.width}x${optimizationResult.dimensions.height}`,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(uploadCommand);

      // Generate public URL
      const publicUrl = `https://${this.BUCKET_NAME}.s3.${this.REGION}.amazonaws.com/${s3Key}`;

      return {
        success: true,
        data: {
          key: s3Key,
          fileName: originalName,
          fileSize: optimizationResult.size,
          dimensions: optimizationResult.dimensions,
          format: optimizationResult.format,
          url: publicUrl,
          bucket: this.BUCKET_NAME,
          region: this.REGION
        }
      };
    } catch (error) {
      console.error('Error uploading room image to S3:', error);
      return {
        success: false,
        error: 'Failed to upload room image to S3',
        code: 'S3_UPLOAD_ERROR'
      };
    }
  }

  /**
   * Upload hotel property images
   */
  static async uploadPropertyImage(file: MulterFile, propertyId: string, imageType: 'logo' | 'exterior' | 'interior' | 'amenity' = 'interior'): Promise<ServiceResponse<S3UploadResult>> {
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

      // Initialize S3 client
      const s3Client = this.initializeS3Client();

      // Generate S3 key
      const originalName = this.sanitizeFilename(file.originalname);
      const s3Key = this.generateS3Key(propertyId, originalName, `properties/${imageType}`);

      // Optimize image
      const optimizationResult = await this.optimizeImage(file.buffer);

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: s3Key,
        Body: optimizationResult.buffer,
        ContentType: `image/${optimizationResult.format}`,
        ContentLength: optimizationResult.size,
        Metadata: {
          propertyId,
          imageType,
          originalName,
          dimensions: `${optimizationResult.dimensions.width}x${optimizationResult.dimensions.height}`,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(uploadCommand);

      // Generate public URL
      const publicUrl = `https://${this.BUCKET_NAME}.s3.${this.REGION}.amazonaws.com/${s3Key}`;

      return {
        success: true,
        data: {
          key: s3Key,
          fileName: originalName,
          fileSize: optimizationResult.size,
          dimensions: optimizationResult.dimensions,
          format: optimizationResult.format,
          url: publicUrl,
          bucket: this.BUCKET_NAME,
          region: this.REGION
        }
      };
    } catch (error) {
      console.error('Error uploading property image to S3:', error);
      return {
        success: false,
        error: 'Failed to upload property image to S3',
        code: 'S3_UPLOAD_ERROR'
      };
    }
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(s3Key: string): Promise<boolean> {
    try {
      const s3Client = this.initializeS3Client();
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: s3Key,
      });

      await s3Client.send(deleteCommand);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }

  /**
   * Generate presigned URL for file upload
   */
  static async generatePresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    try {
      const s3Client = this.initializeS3Client();
      
      const command = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate presigned URL for file download
   */
  static async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const s3Client = this.initializeS3Client();
      
      const command = new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Check if file exists in S3
   */
  static async fileExists(key: string): Promise<boolean> {
    try {
      const s3Client = this.initializeS3Client();
      
      const headCommand = new HeadObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(headCommand);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata from S3
   */
  static async getFileMetadata(key: string): Promise<{
    exists: boolean;
    size: number;
    lastModified: Date;
    contentType: string;
    metadata: Record<string, string>;
  } | null> {
    try {
      const s3Client = this.initializeS3Client();
      
      const headCommand = new HeadObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(headCommand);
      
      return {
        exists: true,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || '',
        metadata: response.Metadata || {},
      };
    } catch (error) {
      return { exists: false, size: 0, lastModified: new Date(), contentType: '', metadata: {} };
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
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension || !this.ALLOWED_FORMATS.includes(extension)) {
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
   * Clean up old profile picture for user
   */
  private static async cleanupOldProfilePicture(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true, profilePictureSource: true }
      });

      if (user && user.profilePicture && user.profilePictureSource === 'UPLOAD') {
        // Extract S3 key from URL
        const urlParts = user.profilePicture.split('/');
        const s3Key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/
        await this.deleteFile(s3Key);
      }
    } catch (error) {
      console.error('Error cleaning up old profile picture:', error);
    }
  }

  /**
   * Get S3 storage statistics
   */
  static async getStorageStats(): Promise<{
    bucketName: string;
    region: string;
    totalObjects: number;
    totalSize: number;
  }> {
    try {
      // Note: This is a simplified version. For detailed stats, you'd need to use S3 ListObjectsV2
      return {
        bucketName: this.BUCKET_NAME,
        region: this.REGION,
        totalObjects: 0, // Would need to implement ListObjectsV2 for actual count
        totalSize: 0, // Would need to implement ListObjectsV2 for actual size
      };
    } catch (error) {
      console.error('Error getting S3 storage stats:', error);
      return {
        bucketName: this.BUCKET_NAME,
        region: this.REGION,
        totalObjects: 0,
        totalSize: 0,
      };
    }
  }
}

export default S3StorageService;
