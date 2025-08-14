import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { LoginController } from '../controllers/auth/login.controller';
import { GoogleOAuthRedirectController } from '../controllers/auth/googleOAuthRedirect.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import passwordManagementRoutes from './passwordManagement.routes';
import { AUTH_PATHS } from '../lib/paths';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */

// ==================== REGISTRATION ROUTES ====================
// POST /api/v1/auth/register
router.post(
  AUTH_PATHS.REGISTER,
  AuthController.registrationLimiter,
  AuthController.validateRegistration,
  AuthController.register
);

// POST /api/v1/auth/google
router.post(
  AUTH_PATHS.GOOGLE_AUTH,
  AuthController.registrationLimiter,
  AuthController.validateGoogleAuth,
  AuthController.googleAuth
);

// ==================== GOOGLE OAUTH REDIRECT ROUTES ====================
// GET /api/v1/auth/google/redirect
router.get(AUTH_PATHS.GOOGLE_REDIRECT, GoogleOAuthRedirectController.initiateOAuth);

// GET /api/v1/auth/google/callback  
router.get(AUTH_PATHS.GOOGLE_CALLBACK, GoogleOAuthRedirectController.handleCallback);

// POST /api/v1/auth/verify-email
router.post(
  AUTH_PATHS.VERIFY_EMAIL,
  AuthController.validateEmailVerification,
  AuthController.verifyEmail
);

// POST /api/v1/auth/resend-verification
router.post(
  AUTH_PATHS.RESEND_VERIFICATION,
  AuthController.verificationLimiter,
  AuthController.validateResendVerification,
  AuthController.resendVerification
);

// GET /api/v1/auth/check-email/:email
router.get(
  `${AUTH_PATHS.CHECK_EMAIL}/:email`,
  AuthController.validateEmailParam,
  AuthController.checkEmailAvailability
);

// ==================== LOGIN ROUTES ====================
// POST /api/v1/auth/login
router.post(
  AUTH_PATHS.LOGIN,
  LoginController.loginLimiter,
  LoginController.validateLogin,
  LoginController.login
);

// POST /api/v1/auth/google-login
router.post(
  AUTH_PATHS.GOOGLE_LOGIN,
  LoginController.loginLimiter,
  LoginController.validateGoogleLogin,
  LoginController.googleLogin
);

// POST /api/v1/auth/refresh
router.post(
  AUTH_PATHS.REFRESH,
  LoginController.validateRefresh,
  LoginController.refresh
);

// POST /api/v1/auth/logout
router.post(
  AUTH_PATHS.LOGOUT,
  AuthMiddleware.verifyToken,
  LoginController.validateLogout,
  LoginController.logout
);

// ==================== SESSION MANAGEMENT ROUTES ====================
// GET /api/v1/auth/sessions
router.get(
  AUTH_PATHS.SESSIONS,
  AuthMiddleware.verifyToken,
  AuthMiddleware.updateSessionActivity, // Add session activity tracking
  LoginController.sessionLimiter,
  LoginController.getSessions
);

// DELETE /api/v1/auth/sessions
router.delete(
  AUTH_PATHS.SESSIONS,
  AuthMiddleware.verifyToken,
  AuthMiddleware.updateSessionActivity, // Add session activity tracking
  LoginController.sessionLimiter,
  LoginController.logoutFromAllDevices
);

// DELETE /api/v1/auth/sessions/:sessionId
router.delete(
  `${AUTH_PATHS.SESSIONS}/:sessionId`,
  AuthMiddleware.verifyToken,
  AuthMiddleware.updateSessionActivity, // Add session activity tracking
  LoginController.sessionLimiter,
  LoginController.invalidateSpecificSession
);

// ==================== ACCOUNT LINKING ROUTES ====================
// POST /api/v1/auth/link-google
router.post(
  AUTH_PATHS.LINK_GOOGLE,
  AuthMiddleware.verifyToken,
  LoginController.validateLinkGoogle,
  LoginController.linkGoogleAccount
);

// ==================== PASSWORD MANAGEMENT ====================
// Include all password management routes (reset, change, set, remove, etc.)
router.use('/', passwordManagementRoutes);

export default router;