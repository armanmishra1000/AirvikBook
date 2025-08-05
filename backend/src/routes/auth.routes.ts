import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { LoginController } from '../controllers/auth/login.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */

// ==================== REGISTRATION ROUTES ====================
// POST /api/v1/auth/register
router.post(
  '/register',
  AuthController.registrationLimiter,
  AuthController.validateRegistration,
  AuthController.register
);

// POST /api/v1/auth/google
router.post(
  '/google',
  AuthController.registrationLimiter,
  AuthController.validateGoogleAuth,
  AuthController.googleAuth
);

// POST /api/v1/auth/verify-email
router.post(
  '/verify-email',
  AuthController.validateEmailVerification,
  AuthController.verifyEmail
);

// POST /api/v1/auth/resend-verification
router.post(
  '/resend-verification',
  AuthController.verificationLimiter,
  AuthController.validateResendVerification,
  AuthController.resendVerification
);

// GET /api/v1/auth/check-email/:email
router.get(
  '/check-email/:email',
  AuthController.validateEmailParam,
  AuthController.checkEmailAvailability
);

// ==================== LOGIN ROUTES ====================
// POST /api/v1/auth/login
router.post(
  '/login',
  LoginController.loginLimiter,
  LoginController.validateLogin,
  LoginController.login
);

// POST /api/v1/auth/google-login
router.post(
  '/google-login',
  LoginController.loginLimiter,
  LoginController.validateGoogleLogin,
  LoginController.googleLogin
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  LoginController.validateRefresh,
  LoginController.refresh
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  AuthMiddleware.verifyToken,
  LoginController.validateLogout,
  LoginController.logout
);

// ==================== SESSION MANAGEMENT ROUTES ====================
// GET /api/v1/auth/sessions
router.get(
  '/sessions',
  AuthMiddleware.verifyToken,
  LoginController.sessionLimiter,
  LoginController.getSessions
);

// DELETE /api/v1/auth/sessions
router.delete(
  '/sessions',
  AuthMiddleware.verifyToken,
  LoginController.sessionLimiter,
  LoginController.logoutFromAllDevices
);

// DELETE /api/v1/auth/sessions/:sessionId
router.delete(
  '/sessions/:sessionId',
  AuthMiddleware.verifyToken,
  LoginController.sessionLimiter,
  LoginController.invalidateSpecificSession
);

// ==================== ACCOUNT LINKING ROUTES ====================
// POST /api/v1/auth/link-google
router.post(
  '/link-google',
  AuthMiddleware.verifyToken,
  LoginController.validateLinkGoogle,
  LoginController.linkGoogleAccount
);

// ==================== PASSWORD RESET ROUTES ====================
// POST /api/v1/auth/forgot-password
router.post(
  '/forgot-password',
  LoginController.loginLimiter, // Reuse login rate limiter for password reset
  AuthController.validateForgotPassword, // Will create this validator
  AuthController.forgotPassword // Will create this controller method
);

// POST /api/v1/auth/reset-password
router.post(
  '/reset-password',
  LoginController.loginLimiter,
  AuthController.validateResetPassword, // Will create this validator
  AuthController.resetPassword // Will create this controller method
);

// GET /api/v1/auth/verify-reset-token/:token
router.get(
  '/verify-reset-token/:token',
  AuthController.verifyResetToken // Will create this controller method
);

export default router;