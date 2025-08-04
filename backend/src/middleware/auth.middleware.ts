import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { ResponseUtil } from '../utils/response.utils';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT access token and attach user to request
   */
  static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseUtil.error(res, 'Access token required', 'MISSING_TOKEN', 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Validate token
      const validation = JwtService.validateAccessToken(token);
      if (!validation.isValid) {
        const statusCode = validation.code === 'TOKEN_EXPIRED' ? 401 : 403;
        return ResponseUtil.error(res, validation.error!, validation.code!, statusCode);
      }

      // Attach user info to request
      req.user = {
        userId: validation.payload!.userId,
        email: validation.payload!.email,
        role: validation.payload!.role
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return ResponseUtil.error(res, 'Token validation failed', 'AUTH_ERROR', 500);
    }
  }

  /**
   * Optional auth - verify token if present, but don't require it
   */
  static async optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const validation = JwtService.validateAccessToken(token);
        
        if (validation.isValid) {
          req.user = {
            userId: validation.payload!.userId,
            email: validation.payload!.email,
            role: validation.payload!.role
          };
        }
      }

      next();
    } catch (error) {
      // Continue without auth for optional middleware
      next();
    }
  }

  /**
   * Require specific user role
   */
  static requireRole(allowedRoles: string | string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        return ResponseUtil.error(res, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS', 403);
      }

      next();
    };
  }

  /**
   * Require email verification
   */
  static async requireEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
    }

    try {
      // Check if user's email is verified
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { isEmailVerified: true }
      });

      if (!user || !user.isEmailVerified) {
        return ResponseUtil.error(res, 'Email verification required', 'EMAIL_NOT_VERIFIED', 403, {
          message: 'Please verify your email address to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Email verification check error:', error);
      return ResponseUtil.error(res, 'Verification check failed', 'VERIFICATION_ERROR', 500);
    }
  }

  /**
   * Require user to be active
   */
  static async requireActiveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      return ResponseUtil.error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
    }

    try {
      // Check if user is active
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { isActive: true }
      });

      if (!user || !user.isActive) {
        return ResponseUtil.error(res, 'Account has been deactivated', 'ACCOUNT_DEACTIVATED', 403);
      }

      next();
    } catch (error) {
      console.error('Active user check error:', error);
      return ResponseUtil.error(res, 'Account status check failed', 'ACCOUNT_CHECK_ERROR', 500);
    }
  }

  /**
   * Rate limiting by user ID (for authenticated users)
   */
  static createUserRateLimit(options: {
    windowMs: number;
    maxRequests: number;
    message?: string;
  }) {
    const userRequests = new Map<string, { count: number; resetTime: number }>();

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        return next(); // Skip rate limiting for unauthenticated users
      }

      const userId = req.user.userId;
      const now = Date.now();
      const windowStart = Math.floor(now / options.windowMs) * options.windowMs;

      let userRequest = userRequests.get(userId);
      
      if (!userRequest || userRequest.resetTime <= now) {
        userRequest = { count: 1, resetTime: windowStart + options.windowMs };
        userRequests.set(userId, userRequest);
      } else {
        userRequest.count++;
      }

      if (userRequest.count > options.maxRequests) {
        return ResponseUtil.error(
          res,
          options.message || 'Too many requests from this user',
          'USER_RATE_LIMIT_EXCEEDED',
          429,
          {
            retryAfter: Math.ceil((userRequest.resetTime - now) / 1000)
          }
        );
      }

      next();
    };
  }

  /**
   * Extract user ID from token without full validation (for logging)
   */
  static extractUserId(req: Request): string | null {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      const decoded = JwtService.decodeToken(token);
      
      return decoded?.userId || null;
    } catch {
      return null;
    }
  }

  /**
   * Log request with user context
   */
  static logWithUser(req: Request, res: Response, next: NextFunction): void {
    const userId = req.user?.userId || AuthMiddleware.extractUserId(req) || 'anonymous';
    const originalSend = res.send;

    res.send = function(body) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${userId} - Status: ${res.statusCode}`);
      return originalSend.call(this, body);
    };

    next();
  }
}

export default AuthMiddleware;