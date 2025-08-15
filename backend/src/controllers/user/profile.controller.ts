import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ResponseUtil } from '../../utils/response.utils';
import ProfileService from '../../services/user/profile.service';
import { ProfileData, PrivacySettings } from '../../services/user/profile.service';

export class ProfileController {
  // Remove all rate limiter static properties

  /**
   * Validation middleware for profile updates
   */
  static validateProfileUpdate = [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location must not exceed 100 characters'),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date'),
  ];

  /**
   * Validation middleware for privacy settings
   */
  static validatePrivacySettings = [
    body('profileVisibility')
      .optional()
      .isIn(['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'])
      .withMessage('Profile visibility must be PUBLIC, PRIVATE, or FRIENDS_ONLY'),
    body('showEmail')
      .optional()
      .isBoolean()
      .withMessage('Show email must be a boolean value'),
    body('showPhone')
      .optional()
      .isBoolean()
      .withMessage('Show phone must be a boolean value'),
    body('showLocation')
      .optional()
      .isBoolean()
      .withMessage('Show location must be a boolean value'),
  ];

  /**
   * Validation middleware for Google connection
   */
  static validateGoogleConnection = [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required'),
  ];

  /**
   * Get user profile
   */
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const result = await ProfileService.getProfile(userId);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Profile retrieved successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to get profile', result.code || 'GET_PROFILE_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return ResponseUtil.error(res, 'Failed to get profile', 'GET_PROFILE_ERROR', 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const profileData: ProfileData = req.body;

      const result = await ProfileService.updateProfile(userId, profileData);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Profile updated successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to update profile', result.code || 'UPDATE_PROFILE_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return ResponseUtil.error(res, 'Failed to update profile', 'UPDATE_PROFILE_ERROR', 500);
    }
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const privacySettings: PrivacySettings = req.body;

      const result = await ProfileService.updatePrivacySettings(userId, privacySettings);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Privacy settings updated successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to update privacy settings', result.code || 'UPDATE_PRIVACY_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Update privacy settings error:', error);
      return ResponseUtil.error(res, 'Failed to update privacy settings', 'UPDATE_PRIVACY_ERROR', 500);
    }
  }

  /**
   * Connect Google account to user profile
   */
  static async connectGoogle(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const { idToken } = req.body;

      const result = await ProfileService.connectGoogle(userId, idToken);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Google account connected successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to connect Google account', result.code || 'CONNECT_GOOGLE_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Connect Google account error:', error);
      return ResponseUtil.error(res, 'Failed to connect Google account', 'CONNECT_GOOGLE_ERROR', 500);
    }
  }

  /**
   * Disconnect Google account from user profile
   */
  static async disconnectGoogle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const result = await ProfileService.disconnectGoogle(userId);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Google account disconnected successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to disconnect Google account', result.code || 'DISCONNECT_GOOGLE_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Disconnect Google account error:', error);
      return ResponseUtil.error(res, 'Failed to disconnect Google account', 'DISCONNECT_GOOGLE_ERROR', 500);
    }
  }
}
