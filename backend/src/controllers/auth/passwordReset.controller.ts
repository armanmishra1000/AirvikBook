import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ResponseUtil } from '../../utils/response.utils';
import { PasswordResetService } from '../../services/auth/passwordReset.service';

export class PasswordResetController {
  /**
   * Validation rules for forgot password
   */
  static validateForgotPassword = [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ];

  /**
   * Validation rules for reset password
   */
  static validateResetPassword = [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 10 })
      .withMessage('Invalid reset token format'),
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
   * Validation rules for reset token verification
   */
  static validateResetTokenParam = [
    param('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 10 })
      .withMessage('Invalid reset token format')
  ];

  /**
   * Handle forgot password request
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { email } = req.body;

      // Initiate password reset
      const result = await PasswordResetService.generateResetToken({ email });

      if (!result.success) {
        const statusCode = result.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500;
        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      // Always return success for security (no email enumeration)
      return ResponseUtil.success(res, result.data, 'Password reset instructions sent if account exists');

    } catch (error) {
      console.error('Forgot password controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Handle reset password request
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { token, newPassword, confirmPassword } = req.body;

      // Reset password
      const result = await PasswordResetService.resetPassword({ token, newPassword, confirmPassword });

      if (!result.success) {
        let statusCode = 400;
        
        switch (result.code) {
          case 'INVALID_RESET_TOKEN':
          case 'RESET_TOKEN_EXPIRED':
            statusCode = 400;
            break;
          case 'PASSWORD_TOO_WEAK':
          case 'PASSWORD_MISMATCH':
          case 'PASSWORD_REUSED':
            statusCode = 422;
            break;
          case 'ACCOUNT_DEACTIVATED':
            statusCode = 403;
            break;
          default:
            statusCode = 500;
        }

        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      return ResponseUtil.success(res, result.data, 'Password reset successfully');

    } catch (error) {
      console.error('Reset password controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Verify reset token validity
   * GET /api/v1/auth/reset-token/:token
   */
  static async validateResetToken(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { token } = req.params;

      if (!token) {
        return ResponseUtil.error(res, 'Reset token is required', 'VALIDATION_ERROR', 400);
      }

      // Verify token
      const result = await PasswordResetService.validateResetToken(token);

      if (!result.success) {
        let statusCode = 400;
        
        switch (result.code) {
          case 'INVALID_RESET_TOKEN':
          case 'TOKEN_VALIDATION_FAILED':
            statusCode = 400;
            break;
          case 'ACCOUNT_DEACTIVATED':
            statusCode = 403;
            break;
          default:
            statusCode = 500;
        }

        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      return ResponseUtil.success(res, result.data, 'Reset token is valid');

    } catch (error) {
      console.error('Validate reset token controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Get password reset statistics (admin endpoint)
   * GET /api/v1/auth/reset-statistics
   */
  static async getResetStatistics(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Check if user has admin role
      if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
        return ResponseUtil.forbidden(res, 'Admin access required');
      }

      const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'day';

      const statistics = await PasswordResetService.getResetStatistics(timeframe);

      return ResponseUtil.success(res, statistics, 'Password reset statistics retrieved');

    } catch (error) {
      console.error('Get reset statistics controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Cleanup expired reset tokens (admin endpoint)
   * POST /api/v1/auth/cleanup-reset-tokens
   */
  static async cleanupExpiredTokens(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Authentication required');
      }

      // Check if user has admin role
      if (req.user.role !== 'ADMIN' && req.user.role !== 'OWNER') {
        return ResponseUtil.forbidden(res, 'Admin access required');
      }

      const result = await PasswordResetService.cleanupExpiredTokens();

      return ResponseUtil.success(res, result, 'Expired reset tokens cleaned up');

    } catch (error) {
      console.error('Cleanup reset tokens controller error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}

export default PasswordResetController;
