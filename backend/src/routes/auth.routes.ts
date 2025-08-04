import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */

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

export default router;