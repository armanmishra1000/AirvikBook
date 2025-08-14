import { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { ResponseUtil } from '../utils/response.utils';
import { UserRegistrationService } from '../services/userRegistration.service';
import { GoogleOAuthService } from '../services/googleOAuth.service';
import { EmailVerificationTokenService } from '../services/emailVerificationToken.service';
import { RegistrationEmailService } from '../services/email/registrationEmail.service';
import { JwtService } from '../services/jwt.service';


export class AuthController {
  /**
   * Rate limiting middleware for registration endpoints
   */
  static registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 registration attempts per windowMs
    message: {
      success: false,
      error: 'Too many registration attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Rate limiting for verification email resend
   */
  static verificationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 resend attempts per windowMs
    message: {
      success: false,
      error: 'Too many verification email requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Validation rules for user registration
   */
  static validateRegistration = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('fullName')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s\-']+$/)
      .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),
    body('mobileNumber')
      .optional()
      .matches(/^\+[1-9]\d{6,14}$/)
      .withMessage('Mobile number must be in international format (+1234567890)'),
    body('acceptedTerms')
      .isBoolean()
      .custom((value) => {
        if (value !== true) {
          throw new Error('Terms and conditions must be accepted');
        }
        return true;
      })
  ];

  /**
   * Validation rules for Google OAuth
   */
  static validateGoogleAuth = [
    body('googleToken')
      .notEmpty()
      .withMessage('Google token is required'),
    body('linkToEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Link email must be a valid email address')
  ];

  /**
   * Validation rules for email verification
   */
  static validateEmailVerification = [
    body('token')
      .notEmpty()
      .isLength({ min: 32, max: 128 })
      .withMessage('Valid verification token is required'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required')
  ];

  /**
   * Validation rules for resend verification
   */
  static validateResendVerification = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required')
  ];

  /**
   * POST /api/v1/auth/register
   * Register new user with email/password
   */
  static async register(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const { email, password, fullName, mobileNumber, acceptedTerms } = req.body;

      // Register user
      const registrationResult = await UserRegistrationService.registerUser({
        email,
        password,
        fullName,
        mobileNumber,
        acceptedTerms
      });

      if (!registrationResult.success) {
        const statusCode = registrationResult.code === 'EMAIL_EXISTS' ? 409 : 400;
        return ResponseUtil.error(
          res,
          registrationResult.error!,
          registrationResult.code!,
          statusCode
        );
      }

      // Generate JWT tokens
      const tokenPair = JwtService.generateTokenPair({
        userId: registrationResult.user!.id,
        email: registrationResult.user!.email,
        role: registrationResult.user!.role
      });

      // Store refresh token
      await JwtService.storeRefreshToken(registrationResult.user!.id, tokenPair.refreshToken);

      // Send verification email
      const emailResult = await RegistrationEmailService.sendVerificationEmailWithRetry({
        email: registrationResult.user!.email,
        fullName: registrationResult.user!.fullName,
        verificationToken: registrationResult.verificationToken!
      });

      // Return success response (even if email sending fails)
      return ResponseUtil.success(res, {
        user: registrationResult.user,
        tokens: tokenPair,
        verificationEmailSent: emailResult.success
      }, 'Registration successful. Please check your email to verify your account.', 201);

    } catch (error) {
      console.error('Registration error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * POST /api/v1/auth/google
   * Register/login with Google OAuth
   */
  static async googleAuth(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const { googleToken, linkToEmail } = req.body;

      let result;
      if (linkToEmail) {
        // Link Google account to existing user
        result = await GoogleOAuthService.linkGoogleAccount(googleToken, linkToEmail);
      } else {
        // Authenticate with Google (register or login)
        result = await GoogleOAuthService.authenticateWithGoogle(googleToken);
      }

      if (!result.success) {
        const statusCode = result.code === 'GOOGLE_TOKEN_INVALID' ? 401 : 400;
        return ResponseUtil.error(
          res,
          result.error!,
          result.code!,
          statusCode
        );
      }

      // Generate JWT tokens
      const tokenPair = JwtService.generateTokenPair({
        userId: result.user!.id,
        email: result.user!.email,
        role: result.user!.role
      });

      // Store refresh token
      await JwtService.storeRefreshToken(result.user!.id, tokenPair.refreshToken);

      // Send welcome email for new users
      let welcomeEmailSent = false;
      const isNewUser = 'isNewUser' in result ? result.isNewUser : false;
      
      if (isNewUser) {
        const emailResult = await RegistrationEmailService.sendWelcomeEmail({
          email: result.user!.email,
          fullName: result.user!.fullName
        });
        welcomeEmailSent = emailResult.success;
      }

      return ResponseUtil.success(res, {
        user: result.user,
        tokens: tokenPair,
        isNewUser: isNewUser || false,
        welcomeEmailSent
      }, isNewUser ? 'Google registration successful. Welcome!' : 'Google login successful.');

    } catch (error) {
      console.error('Google authentication error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   * Verify user email with token
   */
  static async verifyEmail(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const { token, email } = req.body;

      // Validate token
      const tokenValidation = await EmailVerificationTokenService.validateToken(token, email);
      if (!tokenValidation.success) {
        const statusCode = tokenValidation.code === 'VERIFICATION_TOKEN_EXPIRED' ? 410 : 400;
        return ResponseUtil.error(
          res,
          tokenValidation.error!,
          tokenValidation.code!,
          statusCode
        );
      }

      // Mark email as verified
      const verificationSuccess = await UserRegistrationService.markEmailAsVerified(
        tokenValidation.tokenData!.userId
      );

      if (!verificationSuccess) {
        return ResponseUtil.error(res, 'Failed to verify email', 'VERIFICATION_FAILED', 500);
      }

      // Mark token as used
      await EmailVerificationTokenService.markTokenAsUsed(token);

      // Get updated user data
      const user = await UserRegistrationService.getUserByEmail(email);
      if (!user) {
        return ResponseUtil.error(res, 'User not found', 'USER_NOT_FOUND', 404);
      }

      // Generate new JWT tokens after email verification
      const tokenPair = JwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Store new refresh token
      await JwtService.storeRefreshToken(user.id, tokenPair.refreshToken);

      // Send welcome email
      const welcomeEmailResult = await RegistrationEmailService.sendWelcomeEmail({
        email: user.email,
        fullName: user.fullName
      });

      // Return user data without password and new tokens
      const { password: _, ...userWithoutPassword } = user;

      return ResponseUtil.success(res, {
        user: userWithoutPassword,
        tokens: tokenPair,
        welcomeEmailSent: welcomeEmailResult.success
      }, 'Email verified successfully. Welcome to AirVikBook!');

    } catch (error) {
      console.error('Email verification error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * POST /api/v1/auth/resend-verification
   * Resend email verification
   */
  static async resendVerification(req: Request, res: Response): Promise<Response | void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          validationErrors: errors.array()
        });
      }

      const { email } = req.body;

      // Check if user exists
      const user = await UserRegistrationService.getUserByEmail(email);
      if (!user) {
        return ResponseUtil.error(res, 'User not found', 'USER_NOT_FOUND', 404);
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return ResponseUtil.error(res, 'Email is already verified', 'EMAIL_ALREADY_VERIFIED', 400);
      }

      // Generate new verification token
      const tokenResult = await EmailVerificationTokenService.createToken(user.id, email);
      if (!tokenResult.success) {
        return ResponseUtil.error(res, 'Failed to generate verification token', 'TOKEN_GENERATION_ERROR', 500);
      }

      // Send verification email
      const emailResult = await RegistrationEmailService.sendVerificationEmailWithRetry({
        email,
        fullName: user.fullName,
        verificationToken: tokenResult.token!
      });

      return ResponseUtil.success(res, {
        emailSent: emailResult.success,
        expiresIn: '24 hours'
      }, 'Verification email sent successfully.');

    } catch (error) {
      console.error('Resend verification error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * GET /api/v1/auth/check-email/:email
   * Check if email is available for registration
   */
  static async checkEmailAvailability(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email } = req.params;

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ResponseUtil.error(res, 'Invalid email format', 'INVALID_EMAIL', 400);
      }

      // Check if email exists
      const emailExists = await UserRegistrationService.checkEmailExists(email);

      if (emailExists) {
        return ResponseUtil.error(res, 'Email already registered', 'EMAIL_EXISTS', 409, {
          available: false,
          suggestion: null // Could add email suggestion logic here
        });
      }

      return ResponseUtil.success(res, {
        available: true,
        suggestion: null
      });

    } catch (error) {
      console.error('Email availability check error:', error);
      return ResponseUtil.error(res, 'Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Email parameter validation middleware
   */
  static validateEmailParam = [
    param('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address is required')
  ];


}

export default AuthController;