import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { ResponseUtil } from '../../utils/response.utils';
import ProfilePictureService from '../../services/user/profilePicture.service';
import FileStorageService from '../../services/storage/fileStorage.service';
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
      const file = req.file;

      if (!file) {
        return ResponseUtil.error(res, 'No file uploaded', 'NO_FILE_UPLOADED', 400);
      }

      // Use FileStorageService for secure upload
      const result = await FileStorageService.uploadProfilePicture(file, userId);

      if (!result.success) {
        const statusCode = result.code === 'INVALID_IMAGE' ? 400 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode,
          result.details
        );
      }

      return ResponseUtil.success(res, {
        profilePicture: result.data!.url,
        profilePictureSource: 'UPLOAD',
        uploadedAt: new Date(),
        fileSize: result.data!.fileSize,
        dimensions: result.data!.dimensions
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

      // If picture exists and is uploaded, get file info
      if (profile.profilePicture && profile.profilePictureSource === 'UPLOAD') {
        const fileInfo = await FileStorageService.getFileInfo(profile.profilePicture);
        if (fileInfo) {
          pictureInfo.fileSize = fileInfo.size;
          pictureInfo.created = fileInfo.created;
          pictureInfo.modified = fileInfo.modified;
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
