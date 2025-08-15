import { Router } from 'express';
import { PasswordManagementController } from '../controllers/auth/passwordManagement.controller';
import { PasswordResetController } from '../controllers/auth/passwordReset.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AUTH_PATHS } from '../lib/paths';

const router = Router();

/**
 * Password Management Routes
 * Base path: /api/v1/auth
 */

// ==================== PASSWORD CHANGE ROUTES ====================

/**
 * POST /api/v1/auth/password
 */
router.post(
  AUTH_PATHS.PASSWORD,
  AuthMiddleware.verifyToken,
  PasswordManagementController.validateChangePassword,
  PasswordManagementController.changePassword
);

/**
 * POST /api/v1/auth/set-password
 */
router.post(
  AUTH_PATHS.SET_PASSWORD,
  AuthMiddleware.verifyToken,
  PasswordManagementController.validateSetPassword,
  PasswordManagementController.setPassword
);

/**
 * DELETE /api/v1/auth/password
 */
router.delete(
  AUTH_PATHS.PASSWORD,
  AuthMiddleware.verifyToken,
  PasswordManagementController.validateRemovePassword,
  PasswordManagementController.removePassword
);

// ==================== PASSWORD RESET ROUTES ====================

/**
 * POST /api/v1/auth/forgot-password
 */
router.post(
  AUTH_PATHS.FORGOT_PASSWORD,
  PasswordResetController.validateForgotPassword,
  PasswordResetController.forgotPassword
);

/**
 * POST /api/v1/auth/reset-password
 */
router.post(
  AUTH_PATHS.RESET_PASSWORD,
  PasswordResetController.validateResetPassword,
  PasswordResetController.resetPassword
);

// ==================== PASSWORD SECURITY ROUTES ====================

/**
 * GET /api/v1/auth/password-status
 */
router.get(
  AUTH_PATHS.PASSWORD_STATUS,
  AuthMiddleware.verifyToken,
  PasswordManagementController.getPasswordStatus
);

export default router;
