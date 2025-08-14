import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { ResponseUtil } from '../../utils/response.utils';
import ProfileService from '../../services/user/profile.service';
import { ProfileData, PrivacySettings } from '../../services/user/profile.service';

export class ProfileController {
  /**
   * Rate limiting middleware for profile updates
   * DISABLED IN DEVELOPMENT
   */
  static profileUpdateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 profile updates per windowMs
    message: {
      success: false,
      error: 'Too many profile update attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req: Request) => {
      // Skip rate limiting for development
      return process.env.NODE_ENV === 'development';
    }
  });

  /**
   * Rate limiting for Google account operations
   * DISABLED IN DEVELOPMENT
   */
  static googleOperationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 Google operations per windowMs
    message: {
      success: false,
      error: 'Too many Google account operations. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req: Request) => {
      // Skip rate limiting for development
      return process.env.NODE_ENV === 'development';
    }
  });

  /**
   * Validation rules for profile updates
   */
  static validateProfileUpdate = [
    body('fullName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s\-'\.]+$/)
      .withMessage('Full name can only contain letters, spaces, hyphens, apostrophes, and periods'),
    body('mobileNumber')
      .optional()
      .custom((value) => {
        if (!value) return true; // Allow empty values
        
        // Allow various phone number formats
        const phoneRegex = /^(\+?[1-9]\d{1,14}|\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})$/;
        if (!phoneRegex.test(value)) {
          throw new Error('Mobile number must be in a valid format (e.g., +1234567890, (123) 456-7890, 123-456-7890, or 1234567890)');
        }
        return true;
      }),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    body('dateOfBirth')
      .optional()
      .custom((value) => {
        if (!value) return true; // Allow empty/undefined values
        
        // Try to parse the date
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Date of birth must be a valid date');
        }
        
        // Check if it's in the past
        if (date >= new Date()) {
          throw new Error('Date of birth must be in the past');
        }
        
        return true;
      }),
    body('gender')
      .optional()
      .isString()
      .withMessage('Gender must be a string'),
    body('nationality')
      .optional()
      .isString()
      .withMessage('Nationality must be a string'),
    body('occupation')
      .optional()
      .isString()
      .withMessage('Occupation must be a string'),
    body('website')
      .optional()
      .custom((value) => {
        if (!value) {
          return true; // Allow empty values
        }
        
        let urlToValidate = value.trim();
        
        // Auto-add https:// if no protocol is provided
        if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
          // Check if it looks like a domain (contains a dot and doesn't start with a slash)
          if (urlToValidate.includes('.') && !urlToValidate.startsWith('/')) {
            urlToValidate = 'https://' + urlToValidate;
          } else {
            throw new Error('Please enter a valid website URL (e.g., example.com or https://example.com)');
          }
        }
        
        // Check if it has a domain part
        const domainPart = urlToValidate.replace(/^https?:\/\//, '').split('/')[0];
        if (!domainPart || domainPart.length < 3) {
          throw new Error('Website must have a valid domain');
        }
        
        // Check for valid domain format
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!domainRegex.test(domainPart)) {
          throw new Error('Please enter a valid domain name');
        }
        
        return true;
      }),
    body('location')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Location must be between 2 and 100 characters')
  ];

  /**
   * Validation rules for privacy settings
   */
  static validatePrivacySettings = [
    body('profileVisibility')
      .isIn(['PUBLIC', 'PRIVATE', 'FRIENDS'])
      .withMessage('Profile visibility must be PUBLIC, PRIVATE, or FRIENDS'),
    body('showEmail')
      .isBoolean()
      .withMessage('showEmail must be a boolean value'),
    body('showPhone')
      .isBoolean()
      .withMessage('showPhone must be a boolean value'),
    body('allowGoogleSync')
      .isBoolean()
      .withMessage('allowGoogleSync must be a boolean value')
  ];

  /**
   * Validation rules for Google connection
   */
  static validateGoogleConnection = [
    body('googleToken')
      .notEmpty()
      .withMessage('Google token is required')
  ];

  /**
   * GET /api/v1/user/profile
   * Retrieve user profile information
   */
  static async getProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user.userId;

      const result = await ProfileService.getProfile(userId);

      if (!result.success) {
        const statusCode = result.code === 'USER_NOT_FOUND' ? 404 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode
        );
      }

      // Add cache control headers to prevent caching of profile data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      return ResponseUtil.success(res, result.data, 'Profile retrieved successfully');

    } catch (error) {
      console.error('Get profile error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * PUT /api/v1/user/profile
   * Update user profile information
   */
  static async updateProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const userId = (req as any).user.userId;
      const profileData: ProfileData = req.body;

      const result = await ProfileService.updateProfile(userId, profileData);

      if (!result.success) {
        const statusCode = result.code === 'VALIDATION_ERROR' ? 400 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode,
          result.details
        );
      }

      return ResponseUtil.success(res, result.data, 'Profile updated successfully');

    } catch (error) {
      console.error('Update profile error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * PUT /api/v1/user/profile/privacy
   * Update privacy settings
   */
  static async updatePrivacySettings(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const userId = (req as any).user.userId;
      const privacySettings: PrivacySettings = req.body;

      const result = await ProfileService.updatePrivacySettings(userId, privacySettings);

      if (!result.success) {
        const statusCode = result.code === 'INVALID_PRIVACY_SETTING' ? 400 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode,
          result.details
        );
      }

      return ResponseUtil.success(res, result.data, 'Privacy settings updated successfully');

    } catch (error) {
      console.error('Update privacy settings error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * POST /api/v1/user/profile/connect-google
   * Connect Google account to user profile
   */
  static async connectGoogle(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const userId = (req as any).user.userId;
      const { googleToken } = req.body;

      const result = await ProfileService.connectGoogle(userId, googleToken);

      if (!result.success) {
        const statusCode = result.code === 'USER_NOT_FOUND' ? 404 : 
                          result.code === 'GOOGLE_CONNECTION_ERROR' ? 400 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode
        );
      }

      return ResponseUtil.success(res, result.data, 'Google account connected successfully');

    } catch (error) {
      console.error('Connect Google account error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * DELETE /api/v1/user/profile/disconnect-google
   * Disconnect Google account from user profile
   */
  static async disconnectGoogle(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user.userId;

      const result = await ProfileService.disconnectGoogle(userId);

      if (!result.success) {
        const statusCode = result.code === 'USER_NOT_FOUND' ? 404 :
                          result.code === 'GOOGLE_NOT_CONNECTED' ? 400 :
                          result.code === 'PASSWORD_REQUIRED' ? 400 : 500;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode
        );
      }

      return ResponseUtil.success(res, result.data, 'Google account disconnected successfully');

    } catch (error) {
      console.error('Disconnect Google account error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }
}

export default ProfileController;
