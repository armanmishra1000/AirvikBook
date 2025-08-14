import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { EMAIL_PATHS } from '../lib/paths';

const router = Router();

/**
 * Email Routes
 * Base path: /api/v1/email
 */

// Test email configuration
router.post('/test', EmailController.testEmailConfig);

// Get email configuration status
router.get('/config', EmailController.getEmailConfig);

// Send welcome email
router.post('/welcome', EmailController.sendWelcomeEmail);

// Send booking confirmation email
router.post('/booking-confirmation', EmailController.sendBookingConfirmation);

// Send password reset email
router.post('/password-reset', EmailController.sendPasswordResetEmail);

// Send email verification
router.post(EMAIL_PATHS.VERIFY_EMAIL, EmailController.sendEmailVerification);

// Send custom email
router.post('/send', EmailController.sendCustomEmail);

export default router;