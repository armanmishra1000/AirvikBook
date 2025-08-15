import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ResponseUtil } from '../../utils/response.utils';
import { AuthLoginService } from '../../services/auth/authLogin.service';
import { SessionManagementService } from '../../services/auth/sessionManagement.service';
// import { AuthMiddleware } from '../../middleware/auth.middleware'; // Not used yet

export class LoginController {
  // Remove all rate limiter static properties

  /**
   * Validation middleware for email/password login
   */
  static validateLogin = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];

  /**
   * Validation middleware for Google login
   */
  static validateGoogleLogin = [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required'),
  ];

  /**
   * Validation middleware for token refresh
   */
  static validateRefresh = [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ];

  /**
   * Validation middleware for logout
   */
  static validateLogout = [
    body('refreshToken')
      .optional()
      .notEmpty()
      .withMessage('Refresh token must not be empty if provided'),
  ];

  /**
   * Validation middleware for linking Google account
   */
  static validateLinkGoogle = [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required'),
  ];

  /**
   * Login with email and password
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { email, password } = req.body;
      const deviceInfo = LoginController.getDeviceInfo(req);

      const result = await AuthLoginService.loginWithEmailPassword({
        email,
        password,
        deviceInfo
      });

      if (result.success) {
        return ResponseUtil.success(res, result, 'Login successful');
      } else {
        return ResponseUtil.error(res, result.error || 'Login failed', result.code || 'LOGIN_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Login error:', error);
      return ResponseUtil.error(res, 'Login failed', 'LOGIN_ERROR', 500);
    }
  }

  /**
   * Login with Google
   */
  static async googleLogin(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const deviceInfo = LoginController.getDeviceInfo(req);

      const result = await AuthLoginService.authenticateWithGoogle({
        googleToken: req.body.idToken,
        deviceInfo
      }, req.ip || req.connection.remoteAddress || 'unknown', req.get('User-Agent'));

      if (result.success) {
        return ResponseUtil.success(res, result, 'Google login successful');
      } else {
        return ResponseUtil.error(res, result.error || 'Google login failed', result.code || 'GOOGLE_LOGIN_ERROR', 400, result.details);
      }
    } catch (error) {
      console.error('Google login error:', error);
      return ResponseUtil.error(res, 'Google login failed', 'GOOGLE_LOGIN_ERROR', 500);
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseUtil.error(res, 'Refresh token is required', 'MISSING_REFRESH_TOKEN', 400);
      }

      const result = await AuthLoginService.refreshSession(refreshToken);

      if (result.success) {
        return ResponseUtil.success(res, {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user
        }, 'Token refreshed successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Token refresh failed', result.code || 'REFRESH_ERROR', 400);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return ResponseUtil.error(res, 'Token refresh failed', 'REFRESH_ERROR', 500);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      // TODO: Implement logout logic
      // For now, return a placeholder response
      return ResponseUtil.success(res, { loggedOut: true }, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return ResponseUtil.error(res, 'Logout failed', 'LOGOUT_ERROR', 500);
    }
  }

  /**
   * Get user sessions
   */
  static async getSessions(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      const result = await SessionManagementService.getActiveSessions(userId);

      if (result.success) {
        return ResponseUtil.success(res, result.data, 'Sessions retrieved successfully');
      } else {
        return ResponseUtil.error(res, result.error || 'Failed to get sessions', result.code || 'GET_SESSIONS_ERROR', 400);
      }
    } catch (error) {
      console.error('Get sessions error:', error);
      return ResponseUtil.error(res, 'Failed to get sessions', 'GET_SESSIONS_ERROR', 500);
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutFromAllDevices(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      // TODO: Implement logout from all devices logic
      // For now, return a placeholder response
      return ResponseUtil.success(res, { loggedOut: true, sessionsInvalidated: 0 }, 'Logged out from all devices successfully');
    } catch (error) {
      console.error('Logout from all devices error:', error);
      return ResponseUtil.error(res, 'Failed to logout from all devices', 'LOGOUT_ALL_ERROR', 500);
    }
  }

  /**
   * Invalidate specific session
   */
  static async invalidateSpecificSession(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      if (!sessionId) {
        return ResponseUtil.error(res, 'Session ID is required', 'MISSING_SESSION_ID', 400);
      }

      // TODO: Implement session invalidation logic
      // For now, return a placeholder response
      return ResponseUtil.success(res, { invalidated: true }, 'Session invalidated successfully');
    } catch (error) {
      console.error('Invalidate session error:', error);
      return ResponseUtil.error(res, 'Failed to invalidate session', 'INVALIDATE_SESSION_ERROR', 500);
    }
  }

  /**
   * Link Google account to existing user
   */
  static async linkGoogleAccount(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.error(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors.array());
      }

      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'User not authenticated', 'UNAUTHORIZED', 401);
      }

      // TODO: Implement Google account linking logic
      // For now, return a placeholder response
      return ResponseUtil.success(res, { linked: true }, 'Google account linked successfully');
    } catch (error) {
      console.error('Link Google account error:', error);
      return ResponseUtil.error(res, 'Failed to link Google account', 'LINK_GOOGLE_ERROR', 500);
    }
  }

  /**
   * Get device information from request
   */
  private static getDeviceInfo(req: Request): {
    deviceId: string;
    deviceName: string;
    userAgent: string;
    lastActivity: string;
  } {
    return {
      deviceId: req.ip || req.connection.remoteAddress || 'unknown',
      deviceName: this.detectDeviceType(req.get('User-Agent') || ''),
      userAgent: req.get('User-Agent') || 'unknown',
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * Detect device type from user agent
   */
  private static detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'MOBILE';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'TABLET';
    } else {
      return 'DESKTOP';
    }
  }
}

export default LoginController;