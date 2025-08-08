import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { ResponseUtil } from '../../utils/response.utils';
import ProfilePictureService from '../../services/user/profilePicture.service';
import StorageFactoryService from '../../services/storage/storageFactory.service';
import ProfileService from '../../services/user/profile.service';

export class ProfilePictureController {
  /**
   * Rate limiting middleware for profile picture uploads
   */
  static pictureUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 picture uploads per windowMs
    message: {
      success: false,
      error: 'Too many picture upload attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Rate limiting for Google sync operations
   */
  static googleSyncLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 Google sync operations per windowMs
    message: {
      success: false,
      error: 'Too many Google sync attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * POST /api/v1/user/profile/picture
   * Upload profile picture
   */
  static async uploadPicture(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user.userId;
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        return ResponseUtil.error(res, 'No file uploaded', 'NO_FILE_UPLOADED', 400);
      }

      // Upload to S3 via storage factory (S3-only under the hood)
      const result = await StorageFactoryService.uploadProfilePicture(file as any, userId);

      if (!result.success) {
        let statusCode = 500;
        let errorMessage = result.error!;
        
        // Handle specific error codes
        switch (result.code) {
          case 'INVALID_IMAGE':
            statusCode = 400;
            break;
          case 'S3_NOT_CONFIGURED':
            statusCode = 500;
            errorMessage = 'File storage is not properly configured. Please contact support.';
            break;
          case 'S3_ACCESS_DENIED':
            statusCode = 500;
            errorMessage = 'Unable to upload file due to storage permissions. Please try again later or contact support.';
            break;
          case 'S3_BUCKET_NOT_FOUND':
            statusCode = 500;
            errorMessage = 'File storage is not available. Please try again later.';
            break;
          case 'S3_INVALID_CREDENTIALS':
            statusCode = 500;
            errorMessage = 'File storage authentication failed. Please try again later.';
            break;
          case 'S3_UPLOAD_ERROR':
            statusCode = 500;
            errorMessage = 'File upload failed. Please try again later.';
            break;
          default:
            statusCode = 500;
            errorMessage = 'An unexpected error occurred. Please try again later.';
        }

        return ResponseUtil.error(
          res,
          errorMessage,
          result.code!,
          statusCode,
          result.details
        );
      }

      return ResponseUtil.success(res, {
        profilePicture: (result.data as any).url,
        profilePictureSource: 'S3',
        uploadedAt: new Date(),
        fileSize: (result.data as any).fileSize,
        dimensions: (result.data as any).dimensions
      }, 'Profile picture uploaded successfully');

    } catch (error) {
      console.error('Upload profile picture error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * POST /api/v1/user/profile/picture/sync-google
   * Sync profile picture from Google
   */
  static async syncFromGoogle(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user.userId;

      const result = await ProfilePictureService.syncFromGoogle(userId);

      if (!result.success) {
        const statusCode = result.code === 'USER_NOT_FOUND' ? 404 :
                          result.code === 'GOOGLE_NOT_CONNECTED' ? 400 :
                          result.code === 'GOOGLE_SYNC_DISABLED' ? 400 :
                          result.code === 'NO_GOOGLE_PICTURE' ? 404 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode
        );
      }

      return ResponseUtil.success(res, {
        profilePicture: result.data!.profilePicture,
        profilePictureSource: result.data!.profilePictureSource,
        syncedAt: result.data!.syncedAt,
        googlePictureUrl: result.data!.googlePictureUrl
      }, 'Profile picture synced from Google successfully');

    } catch (error) {
      console.error('Sync Google profile picture error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * DELETE /api/v1/user/profile/picture
   * Delete profile picture
   */
  static async deletePicture(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user.userId;

      const result = await ProfilePictureService.deletePicture(userId);

      if (!result.success) {
        const statusCode = result.code === 'USER_NOT_FOUND' ? 404 :
                          result.code === 'NO_PICTURE' ? 400 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode
        );
      }

      return ResponseUtil.success(res, { deleted: true }, 'Profile picture deleted successfully');

    } catch (error) {
      console.error('Delete profile picture error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * GET /api/v1/user/profile/picture/status
   * Get profile picture status and information
   */
  static async getPictureStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user.userId;

      // Get user profile to check picture status
      const profileResult = await ProfileService.getProfile(userId);

      if (!profileResult.success) {
        const statusCode = profileResult.code === 'USER_NOT_FOUND' ? 404 : 500;
        return ResponseUtil.error(
          res,
          profileResult.error!,
          profileResult.code!,
          statusCode
        );
      }

      const profile = profileResult.data!;
      const pictureInfo: any = {
        hasPicture: !!profile.profilePicture,
        pictureUrl: profile.profilePicture,
        pictureSource: profile.profilePictureSource || 'DEFAULT',
        lastUpdated: profile.lastUpdated
      };

      // If picture exists and is stored remotely, get metadata from S3
      if (profile.profilePicture && (profile.profilePictureSource === 'S3' || profile.profilePictureSource === 'UPLOAD')) {
        const metadata = await StorageFactoryService.getFileMetadata(profile.profilePicture);
        if (metadata) {
          pictureInfo.fileSize = metadata.size;
          pictureInfo.created = metadata.lastModified;
          pictureInfo.modified = metadata.lastModified;
          pictureInfo.contentType = metadata.contentType;
        }
      }

      return ResponseUtil.success(res, pictureInfo, 'Profile picture status retrieved successfully');

    } catch (error) {
      console.error('Get picture status error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }
}

export default ProfilePictureController;
