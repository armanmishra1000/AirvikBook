import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ResponseUtil } from '../../utils/response.utils';
import { PasswordManagementService } from '../../services/auth/passwordManagement.service';

export class PasswordManagementController {
  /**
   * Validation rules for change password
   */
  static validateChangePassword = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Password confirmation is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      }),
    body('invalidateOtherSessions')
      .optional()
      .isBoolean()
      .withMessage('invalidateOtherSessions must be a boolean')
  ];

  /**
   * Validation rules for set password (Google users)
   */
  static validateSetPassword = [
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Password confirmation is required')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      })
  ];

  /**
   * Validation rules for remove password
   */
  static validateRemovePassword = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('confirmGoogleOnly')
      .isBoolean()
      .withMessage('confirmGoogleOnly must be a boolean')
      .custom((value) => {
        if (!value) {
          throw new Error('You must confirm that you want to use Google sign-in only');
        }
        return true;
      })
  ];

  /**
   * Change password for authenticated user
   * PUT /api/v1/auth/password
   */
  static async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      const { currentPassword, newPassword, confirmPassword, invalidateOtherSessions } = req.body;
      const userId = req.user.userId;
      
      // Get session ID from the request (we need this to preserve current session)
      // Note: This would need to be passed from the auth middleware or extracted from the token
      const sessionId = req.headers['x-session-id'] as string || 'current-session';

      const result = await PasswordManagementService.changePassword(userId, sessionId, {
        currentPassword,
        newPassword,
        confirmPassword,
        invalidateOtherSessions
      });

      if (!result.success) {
        let statusCode = 400;
        
        switch (result.code) {
          case 'RATE_LIMIT_EXCEEDED':
            statusCode = 429;
            break;
          case 'USER_NOT_FOUND':
            statusCode = 404;
            break;
          case 'INVALID_CURRENT_PASSWORD':
            statusCode = 400;
            break;
          case 'PASSWORD_TOO_WEAK':
          case 'PASSWORD_MISMATCH':
          case 'PASSWORD_REUSED':
            statusCode = 422;
            break;
          default:
            statusCode = 500;
        }

        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      return ResponseUtil.success(res, result.data, 'Password changed successfully');

    } catch (error) {
      console.error('Change password controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Set password for Google-only users (enable mixed authentication)
   * POST /api/v1/auth/set-password
   */
  static async setPassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      const { newPassword, confirmPassword } = req.body;
      const userId = req.user.userId;

      const result = await PasswordManagementService.setPasswordForGoogleUser(userId, {
        newPassword,
        confirmPassword
      });

      if (!result.success) {
        let statusCode = 400;
        
        switch (result.code) {
          case 'USER_NOT_FOUND':
            statusCode = 404;
            break;
          case 'PASSWORD_ALREADY_EXISTS':
            statusCode = 403;
            break;
          case 'GOOGLE_ACCOUNT_REQUIRED':
            statusCode = 403;
            break;
          case 'PASSWORD_TOO_WEAK':
          case 'PASSWORD_MISMATCH':
            statusCode = 422;
            break;
          default:
            statusCode = 500;
        }

        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      return ResponseUtil.success(res, result.data, 'Password set successfully');

    } catch (error) {
      console.error('Set password controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Remove password from mixed account (become Google-only)
   * DELETE /api/v1/auth/password
   */
  static async removePassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      const { currentPassword, confirmGoogleOnly } = req.body;
      const userId = req.user.userId;

      const result = await PasswordManagementService.removePassword(userId, {
        currentPassword,
        confirmGoogleOnly
      });

      if (!result.success) {
        let statusCode = 400;
        
        switch (result.code) {
          case 'USER_NOT_FOUND':
            statusCode = 404;
            break;
          case 'NO_PASSWORD_EXISTS':
          case 'GOOGLE_AUTH_REQUIRED':
            statusCode = 403;
            break;
          case 'INVALID_CURRENT_PASSWORD':
          case 'CONFIRMATION_REQUIRED':
            statusCode = 400;
            break;
          default:
            statusCode = 500;
        }

        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      return ResponseUtil.success(res, result.data, 'Password removed successfully');

    } catch (error) {
      console.error('Remove password controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Get password status and authentication methods
   * GET /api/v1/auth/password-status
   */
  static async getPasswordStatus(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      const userId = req.user.userId;

      const result = await PasswordManagementService.getPasswordStatus(userId);

      if (!result.success) {
        let statusCode = 500;
        
        switch (result.code) {
          case 'USER_NOT_FOUND':
            statusCode = 404;
            break;
          default:
            statusCode = 500;
        }

        return ResponseUtil.error(res, result.error!, result.code!, statusCode);
      }

      return ResponseUtil.success(res, result.data);

    } catch (error) {
      console.error('Get password status controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}

export default PasswordManagementController;
