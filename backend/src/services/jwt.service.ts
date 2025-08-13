import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import Redis from 'ioredis';

// Create Redis connection with error handling
let redis: Redis | null = null;
let redisConnected = false;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't connect immediately
    enableReadyCheck: false,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
    redisConnected = true;
  });

  redis.on('error', (error) => {
    console.warn('⚠️ Redis connection failed:', error.message);
    redisConnected = false;
  });

  redis.on('close', () => {
    console.warn('⚠️ Redis connection closed');
    redisConnected = false;
  });

} catch (error) {
  console.warn('⚠️ Redis initialization failed:', error);
  redisConnected = false;
}

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
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days (updated from 1d for security)
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
      
      const token = jwt.sign(
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

      console.log(`✅ Access token generated for user ${payload.userId}`);
      return token;
    } catch (error) {
      console.error('❌ Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    try {
      const { refreshSecret } = this.getSecrets();
      
      const token = jwt.sign(
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

      console.log(`✅ Refresh token generated for user ${payload.userId} (expires in 7 days)`);
      return token;
    } catch (error) {
      console.error('❌ Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp'>): TokenPair {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);
      
      console.log(`✅ Token pair generated for user ${payload.userId}`);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('❌ Error generating token pair:', error);
      throw error;
    }
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

      console.log(`✅ Access token validated for user ${payload.userId}`);
      return {
        isValid: true,
        payload
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.warn(`⚠️ Access token expired: ${error.message}`);
        return {
          isValid: false,
          error: 'Access token has expired',
          code: 'TOKEN_EXPIRED'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.warn(`⚠️ Invalid access token: ${error.message}`);
        return {
          isValid: false,
          error: 'Invalid access token',
          code: 'TOKEN_INVALID'
        };
      } else {
        console.error('❌ Access token validation error:', error);
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

      console.log(`✅ Refresh token validated for user ${payload.userId}`);
      return {
        isValid: true,
        payload
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.warn(`⚠️ Refresh token expired: ${error.message}`);
        return {
          isValid: false,
          error: 'Refresh token has expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.warn(`⚠️ Invalid refresh token: ${error.message}`);
        return {
          isValid: false,
          error: 'Invalid refresh token',
          code: 'REFRESH_TOKEN_INVALID'
        };
      } else {
        console.error('❌ Refresh token validation error:', error);
        return {
          isValid: false,
          error: 'Refresh token validation failed',
          code: 'REFRESH_TOKEN_VALIDATION_ERROR'
        };
      }
    }
  }

  /**
   * Refresh access token using refresh token (WITHOUT token rotation)
   * This method is kept for backward compatibility
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

      // Check if refresh token is blacklisted
      if (await this.isTokenBlacklisted(refreshToken)) {
        console.warn(`⚠️ Attempted to use blacklisted refresh token for user ${validation.payload!.userId}`);
        return {
          success: false,
          error: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED'
        };
      }

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: validation.payload!.userId }
      });

      if (!user || !user.isActive) {
        console.warn(`⚠️ User ${validation.payload!.userId} not found or inactive during token refresh`);
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

      console.log(`✅ Access token refreshed for user ${user.id}`);
      return {
        success: true,
        accessToken: newAccessToken
      };

    } catch (error) {
      console.error('❌ Error refreshing access token:', error);
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
      // Calculate expiry date (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

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

      console.log(`✅ Refresh token stored for user ${userId}, expires ${expiryDate.toISOString()}`);
      return true;
    } catch (error) {
      console.error('❌ Error storing refresh token:', error);
      return false;
    }
  }

  /**
   * Invalidate refresh token (logout)
   */
  static async invalidateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      // First blacklist the token
      const decoded = jwt.decode(refreshToken) as any;
      if (decoded && decoded.userId) {
        await this.blacklistToken(refreshToken, decoded.userId);
      }

      // Then deactivate in database
      await prisma.session.updateMany({
        where: {
          refreshToken,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log(`✅ Refresh token invalidated: ${refreshToken.substring(0, 20)}...`);
      return true;
    } catch (error) {
      console.error('❌ Error invalidating refresh token:', error);
      return false;
    }
  }

  /**
   * Invalidate all user sessions (logout from all devices)
   */
  static async invalidateAllUserTokens(userId: string): Promise<boolean> {
    try {
      // Get all active sessions for the user
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          isActive: true
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

      console.log(`✅ All tokens invalidated for user ${userId} (${sessions.length} sessions)`);
      return true;
    } catch (error) {
      console.error('❌ Error invalidating all user tokens:', error);
      return false;
    }
  }

  /**
   * Check if refresh token is valid in database
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
      console.error('❌ Error checking refresh token validity:', error);
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

      console.log(`✅ Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
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
      console.error('❌ Error decoding token:', error);
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
      console.error('❌ Error getting token expiry:', error);
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

    if (errors.length === 0) {
      console.log('✅ JWT configuration is valid');
    } else {
      console.error('❌ JWT configuration errors:', errors);
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
        console.warn('⚠️ Cannot blacklist token: invalid or missing expiry');
        return false;
      }

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl <= 0) {
        console.log('ℹ️ Token already expired, no need to blacklist');
        return true; // Token already expired
      }

      // Store in Redis with TTL if available
      if (redisConnected && redis) {
        await redis.setex(`blacklist:${token}`, ttl, userId);
        console.log(`✅ Token blacklisted for user ${userId}, expires in ${ttl} seconds`);
      } else {
        console.warn('⚠️ Redis not available - token blacklisting disabled');
      }

      return true;
    } catch (error) {
      console.error('❌ Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      if (!redisConnected || !redis) {
        console.warn('⚠️ Redis is not connected. Cannot check blacklist.');
        return false;
      }
      const blacklisted = await redis.exists(`blacklist:${token}`);
      if (blacklisted === 1) {
        console.log(`⚠️ Token found in blacklist: ${token.substring(0, 20)}...`);
      }
      return blacklisted === 1;
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Rotate tokens (generate new access token AND new refresh token)
   * This implements proper token rotation for enhanced security
   */
  static async rotateTokens(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    newRefreshToken?: string;
    error?: string;
    code?: string;
  }> {
    try {
      console.log('🔄 Starting token rotation...');

      // Validate refresh token
      const validation = this.validateRefreshToken(refreshToken);
      if (!validation.isValid) {
        console.warn(`⚠️ Token rotation failed: invalid refresh token - ${validation.error}`);
        return {
          success: false,
          error: validation.error,
          code: validation.code
        };
      }

      // Check if refresh token is blacklisted
      if (await this.isTokenBlacklisted(refreshToken)) {
        console.warn(`⚠️ Token rotation failed: refresh token blacklisted for user ${validation.payload!.userId}`);
        return {
          success: false,
          error: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED'
        };
      }

      const userId = validation.payload!.userId;

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.isActive) {
        console.warn(`⚠️ Token rotation failed: user ${userId} not found or inactive`);
        return {
          success: false,
          error: 'User not found or inactive',
          code: 'USER_INACTIVE'
        };
      }

      // Generate new token pair (token rotation)
      const newAccessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Blacklist old refresh token
      await this.blacklistToken(refreshToken, userId);

      // Store new refresh token
      await this.storeRefreshToken(userId, newRefreshToken);

      console.log(`✅ Token rotation completed for user ${userId}`);
      return {
        success: true,
        accessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('❌ Error rotating tokens:', error);
      return {
        success: false,
        error: 'Token rotation failed',
        code: 'ROTATION_FAILED'
      };
    }
  }

  /**
   * Enhanced token validation with blacklist check
   */
  static async validateAccessTokenWithBlacklist(token: string): Promise<TokenValidationResult> {
    try {
      // First check if token is blacklisted
      if (await this.isTokenBlacklisted(token)) {
        console.warn('⚠️ Access token validation failed: token is blacklisted');
        return {
          isValid: false,
          error: 'Token has been revoked',
          code: 'TOKEN_REVOKED',
        };
      }

      // Then validate normally
      return this.validateAccessToken(token);
    } catch (error) {
      console.error('❌ Error in enhanced access token validation:', error);
      return {
        isValid: false,
        error: 'Token validation failed',
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Enhanced refresh token validation with blacklist check
   */
  static async validateRefreshTokenWithBlacklist(token: string): Promise<TokenValidationResult> {
    try {
      // First check if token is blacklisted
      if (await this.isTokenBlacklisted(token)) {
        console.warn('⚠️ Refresh token validation failed: token is blacklisted');
        return {
          isValid: false,
          error: 'Refresh token has been revoked',
          code: 'TOKEN_REVOKED',
        };
      }

      // Then validate normally
      return this.validateRefreshToken(token);
    } catch (error) {
      console.error('❌ Error in enhanced refresh token validation:', error);
      return {
        isValid: false,
        error: 'Token validation failed',
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Logout user by blacklisting all their tokens
   */
  static async logoutUser(userId: string): Promise<boolean> {
    try {
      console.log(`🔄 Logging out user ${userId}...`);

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

      console.log(`✅ User ${userId} logged out successfully (${sessions.length} sessions invalidated)`);
      return true;
    } catch (error) {
      console.error('❌ Error logging out user:', error);
      return false;
    }
  }

  /**
   * Get user's active sessions count
   */
  static async getUserActiveSessionsCount(userId: string): Promise<number> {
    try {
      const count = await prisma.session.count({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      return count;
    } catch (error) {
      console.error('❌ Error getting user active sessions count:', error);
      return 0;
    }
  }

  /**
   * Force logout from all devices except current session
   */
  static async forceLogoutOtherDevices(userId: string, currentRefreshToken: string): Promise<boolean> {
    try {
      console.log(`🔄 Force logging out other devices for user ${userId}...`);

      // Get all active sessions except the current one
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          isActive: true,
          refreshToken: {
            not: currentRefreshToken
          },
          expiresAt: {
            gt: new Date()
          }
        }
      });

      // Blacklist all other refresh tokens
      for (const session of sessions) {
        await this.blacklistToken(session.refreshToken, userId);
      }

      // Deactivate all other sessions
      await prisma.session.updateMany({
        where: {
          userId,
          isActive: true,
          refreshToken: {
            not: currentRefreshToken
          }
        },
        data: {
          isActive: false
        }
      });

      console.log(`✅ Force logout completed for user ${userId} (${sessions.length} other sessions invalidated)`);
      return true;
    } catch (error) {
      console.error('❌ Error force logging out other devices:', error);
      return false;
    }
  }
}

export default JwtService;