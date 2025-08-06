import { Router } from 'express';
import { PasswordManagementController } from '../controllers/auth/passwordManagement.controller';
import { PasswordResetController } from '../controllers/auth/passwordReset.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Password Management Routes
 * Base path: /api/v1/auth
 * 
 * These routes handle authenticated password operations
 * like changing, setting, and removing passwords
 */

// ==================== AUTHENTICATED PASSWORD MANAGEMENT ====================

/**
 * Change password for authenticated user
 * PUT /api/v1/auth/password
 * Requires: Authentication
 * Rate Limited: 5 attempts per 15 minutes per user
 */
router.put(
  '/password',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireActiveUser,
  AuthMiddleware.createUserRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many password change attempts. Please try again later.'
  }),
  PasswordManagementController.validateChangePassword,
  PasswordManagementController.changePassword
);

/**
 * Set password for Google-only users (enable mixed authentication)
 * POST /api/v1/auth/set-password
 * Requires: Authentication with Google account
 * Rate Limited: 3 attempts per 30 minutes per user
 */
router.post(
  '/set-password',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireActiveUser,
  AuthMiddleware.createUserRateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 3,
    message: 'Too many password set attempts. Please try again later.'
  }),
  PasswordManagementController.validateSetPassword,
  PasswordManagementController.setPassword
);

/**
 * Remove password from mixed account (become Google-only)
 * DELETE /api/v1/auth/password
 * Requires: Authentication with mixed account
 * Rate Limited: 3 attempts per 30 minutes per user
 */
router.delete(
  '/password',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireActiveUser,
  AuthMiddleware.createUserRateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 3,
    message: 'Too many password removal attempts. Please try again later.'
  }),
  PasswordManagementController.validateRemovePassword,
  PasswordManagementController.removePassword
);

/**
 * Get password status and authentication methods
 * GET /api/v1/auth/password-status
 * Requires: Authentication
 * No rate limiting (read-only operation)
 */
router.get(
  '/password-status',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireActiveUser,
  PasswordManagementController.getPasswordStatus
);

// ==================== UNAUTHENTICATED PASSWORD RESET ====================

/**
 * Initiate password reset process
 * POST /api/v1/auth/forgot-password
 * Rate Limited: 1 request per 5 minutes per IP/email
 */
router.post(
  '/forgot-password',
  // Rate limiting is handled internally by the service for email-based limiting
  PasswordResetController.validateForgotPassword,
  PasswordResetController.forgotPassword
);

/**
 * Complete password reset using reset token
 * POST /api/v1/auth/reset-password
 * Rate Limited: 5 attempts per 15 minutes per IP
 */
router.post(
  '/reset-password',
  AuthMiddleware.createUserRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many password reset attempts. Please try again later.'
  }),
  PasswordResetController.validateResetPassword,
  PasswordResetController.resetPassword
);

/**
 * Validate reset token before showing password reset form
 * GET /api/v1/auth/reset-token/:token
 * Rate Limited: 10 requests per minute per IP
 */
router.get(
  '/reset-token/:token',
  AuthMiddleware.createUserRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many token validation attempts. Please try again later.'
  }),
  PasswordResetController.validateResetTokenParam,
  PasswordResetController.validateResetToken
);

// ==================== ADMIN ROUTES ====================

/**
 * Get password reset statistics (admin only)
 * GET /api/v1/auth/reset-statistics
 * Requires: Admin authentication
 */
router.get(
  '/reset-statistics',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireActiveUser,
  AuthMiddleware.requireRole(['ADMIN', 'OWNER']),
  PasswordResetController.getResetStatistics
);

/**
 * Cleanup expired reset tokens (admin only)
 * POST /api/v1/auth/cleanup-reset-tokens
 * Requires: Admin authentication
 */
router.post(
  '/cleanup-reset-tokens',
  AuthMiddleware.verifyToken,
  AuthMiddleware.requireActiveUser,
  AuthMiddleware.requireRole(['ADMIN', 'OWNER']),
  PasswordResetController.cleanupExpiredTokens
);

export default router;
