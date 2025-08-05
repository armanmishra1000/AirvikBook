import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { ResponseUtil } from '../../utils/response.utils';
import { AuthLoginService, DeviceInfo } from '../../services/auth/authLogin.service';
import { SessionManagementService } from '../../services/auth/sessionManagement.service';
// import { AuthMiddleware } from '../../middleware/auth.middleware'; // Not used yet

export class LoginController {
  /**
   * Rate limiter for login endpoints
   */
  static loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 login attempts per IP per window
    message: {
      success: false,
      error: 'Too many login attempts from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (_req: Request) => {
      // Skip rate limiting for development
      return process.env.NODE_ENV === 'development';
    }
  });

  /**
   * Rate limiter for session management endpoints
   */
  static sessionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Maximum 20 session operations per minute
    message: {
      success: false,
      error: 'Too many session requests, please try again later',
      code: 'SESSION_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  /**
   * Validation middleware for email/password login
   */
  static validateLogin = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean'),
    body('deviceInfo.deviceId')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Device ID must be a valid string'),
    body('deviceInfo.deviceName')
      .optional()
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Device name must be a valid string'),
    body('deviceInfo.userAgent')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('User agent must be a valid string')
  ];

  /**
   * Validation middleware for Google OAuth login
   */
  static validateGoogleLogin = [
    body('googleToken')
      .notEmpty()
      .isString()
      .withMessage('Google token is required'),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean'),
    body('deviceInfo.deviceId')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Device ID must be a valid string'),
    body('deviceInfo.deviceName')
      .optional()
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Device name must be a valid string')
  ];

  /**
   * Validation middleware for token refresh
   */
  static validateRefresh = [
    body('refreshToken')
      .notEmpty()
      .isString()
      .withMessage('Refresh token is required')
  ];

  /**
   * Validation middleware for logout
   */
  static validateLogout = [
    body('refreshToken')
      .notEmpty()
      .isString()
      .withMessage('Refresh token is required'),
    body('logoutFromAllDevices')
      .optional()
      .isBoolean()
      .withMessage('Logout from all devices must be a boolean')
  ];

  /**
   * Handle email/password login
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          errors: errors.array()
        });
      }

      const { email, password, rememberMe, deviceInfo } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');

      // Generate device fingerprint if not provided
      const finalDeviceInfo: DeviceInfo = deviceInfo || 
        SessionManagementService.generateDeviceFingerprint(userAgent);

      // Authenticate user
      const result = await AuthLoginService.authenticateWithEmail(
        { email, password, rememberMe, deviceInfo: finalDeviceInfo },
        clientIP,
        userAgent
      );

      if (!result.success) {
        const statusCode = LoginController.getStatusCodeFromError(result.code);
        return ResponseUtil.error(res, result.error!, result.code!, statusCode, result.details);
      }

      // Enforce session limits after successful login
      if (result.user) {
        await SessionManagementService.enforceSessionLimits(result.user.id);
      }

      return ResponseUtil.success(res, {
        user: result.user,
        tokens: result.tokens,
        session: result.session,
        securityAlert: result.securityAlert
      }, 'Login successful. Welcome back!');

    } catch (error) {
      console.error('Login controller error:', error);
      return ResponseUtil.error(res, 'Internal server error during login', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Handle Google OAuth login
   * POST /api/v1/auth/google-login
   */
  static async googleLogin(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          errors: errors.array()
        });
      }

      const { googleToken, rememberMe, deviceInfo } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent');

      // Generate device fingerprint if not provided
      const finalDeviceInfo: DeviceInfo = deviceInfo || 
        SessionManagementService.generateDeviceFingerprint(userAgent);

      // Authenticate with Google
      const result = await AuthLoginService.authenticateWithGoogle(
        { googleToken, rememberMe, deviceInfo: finalDeviceInfo },
        clientIP,
        userAgent
      );

      if (!result.success) {
        const statusCode = LoginController.getStatusCodeFromError(result.code);
        return ResponseUtil.error(res, result.error!, result.code!, statusCode);
      }

      // Enforce session limits after successful login
      if (result.user) {
        await SessionManagementService.enforceSessionLimits(result.user.id);
      }

      return ResponseUtil.success(res, {
        user: result.user,
        tokens: result.tokens,
        session: result.session,
        securityAlert: result.securityAlert,
        accountStatus: result.accountStatus
      }, 'Google login successful. Welcome back!');

    } catch (error) {
      console.error('Google login controller error:', error);
      return ResponseUtil.error(res, 'Internal server error during Google login', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Handle token refresh
   * POST /api/v1/auth/refresh
   */
  static async refresh(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          errors: errors.array()
        });
      }

      const { refreshToken } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

      // Update session activity
      await SessionManagementService.updateSessionActivity(refreshToken, clientIP);

      // Refresh token
      const result = await AuthLoginService.refreshSession(refreshToken);

      if (!result.success) {
        const statusCode = LoginController.getStatusCodeFromError(result.code);
        return ResponseUtil.error(res, result.error!, result.code!, statusCode);
      }

      return ResponseUtil.success(res, {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user
      });

    } catch (error) {
      console.error('Token refresh controller error:', error);
      return ResponseUtil.error(res, 'Internal server error during token refresh', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Handle logout
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          errors: errors.array()
        });
      }

      if (!req.user) {
        return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
      }

      const { refreshToken, logoutFromAllDevices } = req.body;
      const userId = req.user.userId;

      let result;
      if (logoutFromAllDevices) {
        result = await SessionManagementService.invalidateAllUserSessions(userId);
      } else {
        // Find session by refresh token to get session ID
        const sessions = await SessionManagementService.getActiveSessions(userId, refreshToken);
        if (sessions.success && sessions.data?.sessions.length) {
          const currentSession = sessions.data.sessions.find(s => s.isCurrent);
          if (currentSession) {
            result = await SessionManagementService.invalidateSession(currentSession.id, userId);
          } else {
            return ResponseUtil.error(res, 'Session not found', 'SESSION_NOT_FOUND', 404);
          }
        } else {
          return ResponseUtil.error(res, 'Session not found', 'SESSION_NOT_FOUND', 404);
        }
      }

      if (!result?.success) {
        return ResponseUtil.error(res, result?.error || 'Logout failed', 'LOGOUT_ERROR', 500);
      }

      return ResponseUtil.success(res, result.data, 'Successfully logged out');

    } catch (error) {
      console.error('Logout controller error:', error);
      return ResponseUtil.error(res, 'Internal server error during logout', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Handle logout from all devices
   * DELETE /api/v1/auth/sessions
   */
  static async logoutFromAllDevices(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
      }

      const userId = req.user.userId;
      const result = await SessionManagementService.invalidateAllUserSessions(userId);

      if (!result.success) {
        return ResponseUtil.error(res, result.error || 'Failed to logout from all devices', 'LOGOUT_ALL_ERROR', 500);
      }

      return ResponseUtil.success(res, result.data, 'Logged out from all devices');

    } catch (error) {
      console.error('Logout from all devices controller error:', error);
      return ResponseUtil.error(res, 'Internal server error during logout', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Get active sessions
   * GET /api/v1/auth/sessions
   */
  static async getSessions(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
      }

      const userId = req.user.userId;
      // const authHeader = req.headers.authorization; // Not used yet
      let currentRefreshToken: string | undefined;

      // Try to get current refresh token for identifying current session
      // This would need to be passed by the client or derived from the access token
      // For now, we'll mark current session based on latest activity

      const result = await SessionManagementService.getActiveSessions(userId, currentRefreshToken);

      if (!result.success) {
        return ResponseUtil.error(res, result.error || 'Failed to get sessions', 'SESSION_RETRIEVAL_ERROR', 500);
      }

      return ResponseUtil.success(res, result.data);

    } catch (error) {
      console.error('Get sessions controller error:', error);
      return ResponseUtil.error(res, 'Internal server error getting sessions', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Invalidate specific session
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  static async invalidateSpecificSession(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
      }

      const { sessionId } = req.params;
      const userId = req.user.userId;

      if (!sessionId) {
        return ResponseUtil.error(res, 'Session ID is required', 'VALIDATION_ERROR', 400);
      }

      const result = await SessionManagementService.invalidateSession(sessionId, userId);

      if (!result.success) {
        const statusCode = result.code === 'SESSION_NOT_FOUND' ? 404 : 500;
        return ResponseUtil.error(res, result.error!, result.code!, statusCode);
      }

      return ResponseUtil.success(res, result.data, 'Session invalidated successfully');

    } catch (error) {
      console.error('Invalidate specific session controller error:', error);
      return ResponseUtil.error(res, 'Internal server error invalidating session', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Link Google account to existing user
   * POST /api/v1/auth/link-google
   */
  static async linkGoogleAccount(req: Request, res: Response): Promise<Response> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, {
          errors: errors.array()
        });
      }

      if (!req.user) {
        return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
      }

      const { googleToken } = req.body;
      const userEmail = req.user.email;

      const result = await AuthLoginService.linkGoogleAccount(googleToken, userEmail);

      if (!result.success) {
        const statusCode = LoginController.getStatusCodeFromError(result.code);
        return ResponseUtil.error(res, result.error!, result.code!, statusCode);
      }

      return ResponseUtil.success(res, {
        user: result.user,
        accountStatus: result.accountStatus
      }, 'Google account linked successfully');

    } catch (error) {
      console.error('Link Google account controller error:', error);
      return ResponseUtil.error(res, 'Internal server error linking Google account', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * Get appropriate HTTP status code from error code
   */
  private static getStatusCodeFromError(code?: string): number {
    switch (code) {
      case 'INVALID_CREDENTIALS':
      case 'EMAIL_NOT_VERIFIED':
      case 'NO_PASSWORD_SET':
        return 401;
      case 'ACCOUNT_DISABLED':
      case 'ACCOUNT_LOCKED':
        return 403;
      case 'RATE_LIMIT_EXCEEDED':
        return 429;
      case 'GOOGLE_TOKEN_INVALID':
      case 'REFRESH_TOKEN_INVALID':
      case 'REFRESH_TOKEN_EXPIRED':
        return 401;
      case 'SESSION_NOT_FOUND':
      case 'USER_NOT_FOUND':
        return 404;
      case 'VALIDATION_ERROR':
        return 400;
      default:
        return 500;
    }
  }

  /**
   * Validation middleware for Google account linking
   */
  static validateLinkGoogle = [
    body('googleToken')
      .notEmpty()
      .isString()
      .withMessage('Google token is required')
  ];
}

export default LoginController;