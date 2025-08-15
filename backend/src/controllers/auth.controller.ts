import { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { ResponseUtil } from '../utils/response.utils';
import { UserRegistrationService } from '../services/userRegistration.service';
import { EmailVerificationTokenService } from '../services/emailVerificationToken.service';
import { RegistrationEmailService } from '../services/email/registrationEmail.service';

export class AuthController {
  // Remove all rate limiter static properties

  /**
   * Validation middleware for registration
   */
  static validateRegistration = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('acceptedTerms')
      .isBoolean()
      .custom((value) => {
        if (!value) {
          throw new Error('You must accept the terms and conditions');
        }
        return true;
      })
      .withMessage('You must accept the terms and conditions'),
  ];

  /**
   * Validation middleware for Google authentication
   */
  static validateGoogleAuth = [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
  ];

  /**
   * Validation middleware for email verification
   */
  static validateEmailVerification = [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ];

  /**
   * Validation middleware for resend verification
   */
  static validateResendVerification = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ];

  /**
   * Validation middleware for email parameter
   */
  static validateEmailParam = [
    param('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ];

  /**
   * Register a new user with email and password
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { email, password, fullName, acceptedTerms } = req.body;

      const result = await UserRegistrationService.registerUser({
        email,
        password,
        fullName,
        acceptedTerms
      });

      if (result.success) {
        return ResponseUtil.success(res, result, 'User registered successfully', 201);
      } else {
        return ResponseUtil.error(res, result.error || 'Registration failed', result.code || 'REGISTRATION_ERROR', 400);
      }
    } catch (error) {
      console.error('Registration error:', error);
      return ResponseUtil.error(res, 'Registration failed', 'REGISTRATION_ERROR', 500);
    }
  }

  /**
   * Register a new user with Google authentication
   */
  static async googleAuth(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { fullName } = req.body;

      // For now, we'll use the regular registration method
      // TODO: Implement Google OAuth registration
      const result = await UserRegistrationService.registerUser({
        email: `google_${Date.now()}@temp.com`, // Temporary email for Google users
        password: 'google_auth_' + Math.random().toString(36).substring(7), // Temporary password
        fullName,
        acceptedTerms: true
      });

      if (result.success) {
        return ResponseUtil.success(res, result, 'User registered successfully with Google', 201);
      } else {
        return ResponseUtil.error(res, result.error || 'Google registration failed', result.code || 'GOOGLE_REGISTRATION_ERROR', 400);
      }
    } catch (error) {
      console.error('Google registration error:', error);
      return ResponseUtil.error(res, 'Google registration failed', 'GOOGLE_REGISTRATION_ERROR', 500);
    }
  }

  /**
   * Verify email address with token
   */
  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { token, email } = req.body;

      // Validate the token
      const result = await EmailVerificationTokenService.validateToken(token, email);

      if (!result.success || !result.tokenData) {
        return ResponseUtil.error(res, result.error || 'Email verification failed', result.code || 'VERIFICATION_ERROR', 400);
      }

      const { userId } = result.tokenData;

      // Mark token as used
      const tokenMarked = await EmailVerificationTokenService.markTokenAsUsed(token);
      if (!tokenMarked) {
        return ResponseUtil.error(res, 'Failed to mark token as used', 'TOKEN_UPDATE_ERROR', 500);
      }

      // Mark user's email as verified
      const emailVerified = await UserRegistrationService.markEmailAsVerified(userId);
      if (!emailVerified) {
        return ResponseUtil.error(res, 'Failed to mark email as verified', 'EMAIL_UPDATE_ERROR', 500);
      }

      // Get updated user data
      const user = await UserRegistrationService.getUserByEmail(email);
      if (!user) {
        return ResponseUtil.error(res, 'User not found after verification', 'USER_NOT_FOUND', 404);
      }

      // Generate authentication tokens for immediate login
      const { JwtService } = await import('../services/jwt.service');
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const tokens = JwtService.generateTokenPair(tokenPayload);

      // Store refresh token
      await JwtService.storeRefreshToken(user.id, tokens.refreshToken);

      // Send welcome email (don't fail verification if email fails)
      let welcomeEmailSent = false;
      try {
        const { RegistrationEmailService } = await import('../services/email/registrationEmail.service');
        const welcomeResult = await RegistrationEmailService.sendWelcomeEmail({
          email: user.email,
          fullName: user.fullName || 'User'
        });
        welcomeEmailSent = welcomeResult.success;
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail verification for email issues
      }

      // Return success response with user data and tokens
      const { password: _, ...userWithoutPassword } = user;
      
      return ResponseUtil.success(res, {
        user: userWithoutPassword,
        tokens: {
          ...tokens,
          expiresIn: 15 * 60, // 15 minutes
          refreshExpiresIn: 7 * 24 * 60 * 60 // 7 days
        },
        welcomeEmailSent,
        message: 'Email verified successfully. You are now logged in!'
      }, 'Email verified successfully');

    } catch (error) {
      console.error('Email verification error:', error);
      return ResponseUtil.error(res, 'Email verification failed', 'VERIFICATION_ERROR', 500);
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { email } = req.body;

      // Get user by email
      const user = await UserRegistrationService.getUserByEmail(email);
      if (!user) {
        return ResponseUtil.error(res, 'User not found', 'USER_NOT_FOUND', 404);
      }

      // Generate new verification token
      const tokenResult = await EmailVerificationTokenService.createToken(user.id, user.email);
      if (!tokenResult.success) {
        return ResponseUtil.error(res, 'Failed to generate verification token', 'TOKEN_GENERATION_ERROR', 500);
      }

      // Send verification email
      const result = await RegistrationEmailService.sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        verificationToken: tokenResult.token!
      });

      if (result.success) {
        return ResponseUtil.success(res, { emailSent: true }, 'Verification email sent successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to send verification email', 'EMAIL_SEND_ERROR', 500);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return ResponseUtil.error(res, 'Failed to resend verification email', 'RESEND_ERROR', 500);
    }
  }

  /**
   * Check email availability
   */
  static async checkEmailAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { email } = req.params;

      if (!email) {
        return ResponseUtil.error(res, 'Email parameter is required', 'MISSING_EMAIL', 400);
      }

      const emailExists = await UserRegistrationService.checkEmailExists(email);

      if (emailExists) {
        return ResponseUtil.error(res, 'Email already registered', 'EMAIL_EXISTS', 409);
      } else {
        return ResponseUtil.success(res, { available: true }, 'Email is available');
      }
    } catch (error) {
      console.error('Email availability check error:', error);
      return ResponseUtil.error(res, 'Email availability check failed', 'EMAIL_CHECK_ERROR', 500);
    }
  }
}