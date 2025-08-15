import { Request, Response } from 'express';
import { ResponseUtil } from '../../utils/response.utils';
import ProfilePictureService from '../../services/user/profilePicture.service';

export class ProfilePictureController {
  // Remove all rate limiter static properties

  /**
   * Upload profile picture
   */
  static async uploadPicture(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      if (!req.file) {
        return ResponseUtil.error(res, 'No file uploaded', 'NO_FILE', 400);
      }

      const result = await ProfilePictureService.uploadPicture(req.file, userId);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Profile picture uploaded successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to upload profile picture', result.code || 'UPLOAD_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Upload profile picture error:', error);
      return ResponseUtil.error(res, 'Failed to upload profile picture', 'UPLOAD_ERROR', 500);
    }
  }

  /**
   * Sync profile picture from Google
   */
  static async syncFromGoogle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const result = await ProfilePictureService.syncFromGoogle(userId);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Profile picture synced from Google successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to sync profile picture from Google', result.code || 'SYNC_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Sync from Google error:', error);
      return ResponseUtil.error(res, 'Failed to sync profile picture from Google', 'SYNC_ERROR', 500);
    }
  }

  /**
   * Delete profile picture
   */
  static async deletePicture(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const result = await ProfilePictureService.deletePicture(userId);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Profile picture deleted successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to delete profile picture', result.code || 'DELETE_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Delete profile picture error:', error);
      return ResponseUtil.error(res, 'Failed to delete profile picture', 'DELETE_ERROR', 500);
    }
  }

  /**
   * Get profile picture status
   */
  static async getPictureStatus(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      // TODO: Implement getPictureStatus method in ProfilePictureService
      // For now, return a placeholder response
      return ResponseUtil.success(res, { 
        hasProfilePicture: false, 
        source: null, 
        lastUpdated: null 
      }, 'Profile picture status retrieved successfully');
    } catch (error) {
      console.error('Get picture status error:', error);
      return ResponseUtil.error(res, 'Failed to get profile picture status', 'STATUS_ERROR', 500);
    }
  }
}
