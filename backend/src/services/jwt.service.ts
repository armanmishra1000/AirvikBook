import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
  code?: string;
}

export class JwtService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = '1d'; // 1 day (reduced from 7d for security)
  private static readonly ISSUER = 'airvikbook';
  private static readonly AUDIENCE = 'airvikbook-users';

  /**
   * Get JWT secrets from environment variables
   */
  private static getSecrets(): { accessSecret: string; refreshSecret: string } {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured. Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.');
    }

    return { accessSecret, refreshSecret };
  }

  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    try {
      const { accessSecret } = this.getSecrets();
      
      return jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        },
        accessSecret,
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRY,
          issuer: this.ISSUER,
          audience: this.AUDIENCE,
          algorithm: 'HS256'
        }
      );
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    try {
      const { refreshSecret } = this.getSecrets();
      
      return jwt.sign(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        },
        refreshSecret,
        {
          expiresIn: this.REFRESH_TOKEN_EXPIRY,
          issuer: this.ISSUER,
          audience: this.AUDIENCE,
          algorithm: 'HS256'
        }
      );
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    return { accessToken, refreshToken };
  }

  /**
   * Validate access token
   */
  static validateAccessToken(token: string): TokenValidationResult {
    try {
      const { accessSecret } = this.getSecrets();
      
      const payload = jwt.verify(token, accessSecret, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithms: ['HS256']
      }) as TokenPayload;

      return {
        isValid: true,
        payload
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          isValid: false,
          error: 'Access token has expired',
          code: 'TOKEN_EXPIRED'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: 'Invalid access token',
          code: 'TOKEN_INVALID'
        };
      } else {
        return {
          isValid: false,
          error: 'Token validation failed',
          code: 'TOKEN_VALIDATION_ERROR'
        };
      }
    }
  }

  /**
   * Validate refresh token
   */
  static validateRefreshToken(token: string): TokenValidationResult {
    try {
      const { refreshSecret } = this.getSecrets();
      
      const payload = jwt.verify(token, refreshSecret, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithms: ['HS256']
      }) as TokenPayload;

      return {
        isValid: true,
        payload
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          isValid: false,
          error: 'Refresh token has expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: 'Invalid refresh token',
          code: 'REFRESH_TOKEN_INVALID'
        };
      } else {
        return {
          isValid: false,
          error: 'Refresh token validation failed',
          code: 'REFRESH_TOKEN_VALIDATION_ERROR'
        };
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    error?: string;
    code?: string;
  }> {
    try {
      // Validate refresh token
      const validation = this.validateRefreshToken(refreshToken);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: validation.code
        };
      }

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: validation.payload!.userId }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User not found or inactive',
          code: 'USER_INACTIVE'
        };
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        accessToken: newAccessToken
      };

    } catch (error) {
      console.error('Error refreshing access token:', error);
      return {
        success: false,
        error: 'Failed to refresh access token',
        code: 'REFRESH_FAILED'
      };
    }
  }

  /**
   * Store refresh token in database (for token blacklisting)
   */
  static async storeRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

      // Generate a unique session token
      const sessionToken = require('crypto').randomBytes(32).toString('hex');

      // Store in sessions table
      await prisma.session.create({
        data: {
          userId,
          token: sessionToken, // Unique session identifier
          refreshToken,
          expiresAt: expiryDate,
          isActive: true
        }
      });

      return true;
    } catch (error) {
      console.error('Error storing refresh token:', error);
      return false;
    }
  }

  /**
   * Invalidate refresh token (logout)
   */
  static async invalidateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      await prisma.session.updateMany({
        where: {
          refreshToken,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      return true;
    } catch (error) {
      console.error('Error invalidating refresh token:', error);
      return false;
    }
  }

  /**
   * Invalidate all user sessions (logout from all devices)
   */
  static async invalidateAllUserTokens(userId: string): Promise<boolean> {
    try {
      await prisma.session.updateMany({
        where: {
          userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      return true;
    } catch (error) {
      console.error('Error invalidating all user tokens:', error);
      return false;
    }
  }

  /**
   * Check if refresh token is blacklisted
   */
  static async isRefreshTokenValid(refreshToken: string): Promise<boolean> {
    try {
      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return !!session;
    } catch (error) {
      console.error('Error checking refresh token validity:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false }
          ]
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate JWT configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      this.getSecrets();
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    // Check secret strength
    if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < 32) {
      errors.push('JWT_ACCESS_SECRET should be at least 32 characters long');
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
      errors.push('JWT_REFRESH_SECRET should be at least 32 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Blacklist a token until it expires
   */
  static async blacklistToken(token: string, userId: string): Promise<boolean> {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return false;
      }

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl <= 0) {
        return true; // Token already expired
      }

      // Store in Redis with TTL
      await redis.setex(`blacklist:${token}`, ttl, userId);
      
      // Log blacklisting event for audit (using existing audit service)
      console.log(`Token blacklisted for user ${userId}, expires in ${ttl} seconds`);

      return true;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklisted = await redis.exists(`blacklist:${token}`);
      return blacklisted === 1;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Rotate tokens (generate new access token with refresh token)
   */
  static async rotateTokens(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    newRefreshToken?: string;
    error?: string;
  }> {
    try {
      // Validate refresh token
      const validation = this.validateRefreshToken(refreshToken);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Check if refresh token is blacklisted
      if (await this.isTokenBlacklisted(refreshToken)) {
        return {
          success: false,
          error: 'Refresh token has been revoked',
        };
      }

      const userId = validation.payload!.userId;

      // Generate new token pair
      const newAccessToken = this.generateAccessToken({
        userId: validation.payload!.userId,
        email: validation.payload!.email,
        role: validation.payload!.role,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: validation.payload!.userId,
        email: validation.payload!.email,
        role: validation.payload!.role,
      });

      // Blacklist old refresh token
      await this.blacklistToken(refreshToken, userId);

      // Store new refresh token
      await this.storeRefreshToken(userId, newRefreshToken);

      return {
        success: true,
        accessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Error rotating tokens:', error);
      return {
        success: false,
        error: 'Token rotation failed',
      };
    }
  }

  /**
   * Enhanced token validation with blacklist check
   */
  static async validateAccessTokenWithBlacklist(token: string): Promise<TokenValidationResult> {
    // First check if token is blacklisted
    if (await this.isTokenBlacklisted(token)) {
      return {
        isValid: false,
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED',
      };
    }

    // Then validate normally
    return this.validateAccessToken(token);
  }

  /**
   * Enhanced refresh token validation with blacklist check
   */
  static async validateRefreshTokenWithBlacklist(token: string): Promise<TokenValidationResult> {
    // First check if token is blacklisted
    if (await this.isTokenBlacklisted(token)) {
      return {
        isValid: false,
        error: 'Refresh token has been revoked',
        code: 'TOKEN_REVOKED',
      };
    }

    // Then validate normally
    return this.validateRefreshToken(token);
  }

  /**
   * Logout user by blacklisting all their tokens
   */
  static async logoutUser(userId: string): Promise<boolean> {
    try {
      // Get all active sessions for the user
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      // Blacklist all refresh tokens
      for (const session of sessions) {
        await this.blacklistToken(session.refreshToken, userId);
      }

      // Deactivate all sessions
      await prisma.session.updateMany({
        where: {
          userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      return true;
    } catch (error) {
      console.error('Error logging out user:', error);
      return false;
    }
  }
}

export default JwtService;