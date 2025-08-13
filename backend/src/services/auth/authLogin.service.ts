import { User, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { JwtService, TokenPair } from '../jwt.service';
import { GoogleOAuthService } from '../googleOAuth.service';
import prisma from '../../lib/prisma';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface GoogleLoginCredentials {
  googleToken: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent?: string;
}

export interface LoginResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  tokens?: TokenPair & { expiresIn: number; refreshExpiresIn: number };
  session?: {
    id: string;
    deviceInfo: DeviceInfo;
    isNewDevice: boolean;
  };
  securityAlert?: {
    newDeviceEmailSent: boolean;
    requiresAdditionalVerification: boolean;
  };
  accountStatus?: {
    isExistingUser: boolean;
    hasEmailAccount: boolean;
    accountLinked: boolean;
  };
  error?: string;
  code?: string;
  details?: any;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
}

export class AuthLoginService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days
  private static readonly REMEMBER_ME_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

  /**
   * Authenticate user with email and password
   */
  static async authenticateWithEmail(
    credentials: LoginCredentials,
    clientIP: string,
    userAgent?: string
  ): Promise<LoginResult> {
    try {
      const { email, password, rememberMe = false, deviceInfo } = credentials;

      // Check rate limiting first
      const rateLimitResult = await this.checkRateLimit(email, clientIP);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Too many failed login attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            attempts: rateLimitResult.attempts,
            maxAttempts: this.MAX_LOGIN_ATTEMPTS,
            lockoutTime: rateLimitResult.lockoutUntil
          }
        };
      }

      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email.toLowerCase().trim(),
            mode: 'insensitive'
          }
        }
      });

      if (!user) {
        await this.logLoginAttempt(email, clientIP, userAgent, false, 'USER_NOT_FOUND');
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Check if account is active
      if (!user.isActive) {
        await this.logLoginAttempt(email, clientIP, userAgent, false, 'ACCOUNT_DISABLED');
        return {
          success: false,
          error: 'Account has been disabled',
          code: 'ACCOUNT_DISABLED'
        };
      }

      // Check email verification (required for email/password login)
      if (!user.isEmailVerified) {
        await this.logLoginAttempt(email, clientIP, userAgent, false, 'EMAIL_NOT_VERIFIED');
        return {
          success: false,
          error: 'Please verify your email address before logging in',
          code: 'EMAIL_NOT_VERIFIED'
        };
      }

      // Check if user has a password (could be Google-only user)
      if (!user.password) {
        await this.logLoginAttempt(email, clientIP, userAgent, false, 'NO_PASSWORD_SET');
        return {
          success: false,
          error: 'No password set for this account. Please use Google sign-in or reset your password.',
          code: 'NO_PASSWORD_SET'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.logLoginAttempt(email, clientIP, userAgent, false, 'INVALID_PASSWORD');
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Successful authentication - log success
      await this.logLoginAttempt(email, clientIP, userAgent, true);

      // Update last login timestamp
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const tokens = JwtService.generateTokenPair(tokenPayload);
      const refreshExpiresIn = rememberMe ? 
        this.REMEMBER_ME_EXPIRY_SECONDS : 
        this.REFRESH_TOKEN_EXPIRY_SECONDS;

      // Create session
      const sessionResult = await this.createSession(
        user.id,
        tokens.refreshToken,
        deviceInfo,
        clientIP,
        userAgent,
        rememberMe
      );

      // Check for new device and send security alert if needed
      const isNewDevice = deviceInfo ? await this.isNewDevice(user.id, deviceInfo) : false;
      let securityAlert = undefined;

      if (isNewDevice && deviceInfo) {
        // Send new device email notification (implementation in security service)
        securityAlert = {
          newDeviceEmailSent: true,
          requiresAdditionalVerification: false
        };
      }

      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        user: userWithoutPassword,
        tokens: {
          ...tokens,
          expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
          refreshExpiresIn
        },
        session: {
          id: sessionResult.id,
          deviceInfo: deviceInfo || { deviceId: 'unknown', deviceName: 'Unknown Device' },
          isNewDevice
        },
        securityAlert
      };

    } catch (error) {
      console.error('Error in email authentication:', error);

      return {
        success: false,
        error: 'Internal server error during authentication',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Authenticate user with Google OAuth token
   */
  static async authenticateWithGoogle(
    credentials: GoogleLoginCredentials,
    clientIP: string,
    userAgent?: string
  ): Promise<LoginResult> {
    try {
      const { googleToken, rememberMe = false, deviceInfo } = credentials;

      // Verify Google token using existing Google OAuth service
      const googleResult = await GoogleOAuthService.authenticateWithGoogle(googleToken);
      
      if (!googleResult.success || !googleResult.user) {
        return {
          success: false,
          error: googleResult.error || 'Google authentication failed',
          code: googleResult.code || 'GOOGLE_AUTH_FAILED'
        };
      }

      const user = googleResult.user;

      // Check if account is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'Account has been disabled',
          code: 'ACCOUNT_DISABLED'
        };
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const tokens = JwtService.generateTokenPair(tokenPayload);
      const refreshExpiresIn = rememberMe ? 
        this.REMEMBER_ME_EXPIRY_SECONDS : 
        this.REFRESH_TOKEN_EXPIRY_SECONDS;

      // Create session
      const sessionResult = await this.createSession(
        user.id,
        tokens.refreshToken,
        deviceInfo,
        clientIP,
        userAgent,
        rememberMe
      );

      // Check for new device
      const isNewDevice = deviceInfo ? await this.isNewDevice(user.id, deviceInfo) : false;
      let securityAlert = undefined;

      if (isNewDevice && deviceInfo) {
        securityAlert = {
          newDeviceEmailSent: true,
          requiresAdditionalVerification: false
        };
      }

      // Get full user data to check password status
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      // Determine account status for Google login
      const hasEmailAccount = !!fullUser?.password; // User has email/password set
      const accountStatus = {
        isExistingUser: !googleResult.isNewUser,
        hasEmailAccount,
        accountLinked: hasEmailAccount && !!user.googleId
      };

      return {
        success: true,
        user,
        tokens: {
          ...tokens,
          expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
          refreshExpiresIn
        },
        session: {
          id: sessionResult.id,
          deviceInfo: deviceInfo || { deviceId: 'unknown', deviceName: 'Unknown Device' },
          isNewDevice
        },
        securityAlert,
        accountStatus
      };

    } catch (error) {
      console.error('Error in Google authentication:', error);
      return {
        success: false,
        error: 'Internal server error during Google authentication',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Create a new session record
   */
  private static async createSession(
    userId: string,
    refreshToken: string,
    deviceInfo?: DeviceInfo,
    ipAddress?: string,
    userAgent?: string,
    rememberMe: boolean = false
  ): Promise<{ id: string }> {
    const expiresAt = new Date();
    if (rememberMe) {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    }

    // Generate a unique session token
    const sessionToken = require('crypto').randomBytes(32).toString('hex');

    const session = await prisma.session.create({
      data: {
        userId,
        token: sessionToken, // Unique session identifier
        refreshToken,
        expiresAt,
        isActive: true,
        deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : Prisma.JsonNull,
        ipAddress,
        userAgent
      }
    });

    return { id: session.id };
  }

  /**
   * Check if this is a new device for the user
   */
  private static async isNewDevice(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    try {
      const existingSession = await prisma.session.findFirst({
        where: {
          userId,
          isActive: true,
                  deviceInfo: {
          path: ['deviceId'],
          equals: deviceInfo.deviceId
        }
        }
      });

      return !existingSession;
    } catch (error) {
      console.error('Error checking new device:', error);
      return true; // Assume new device on error for security
    }
  }

  /**
   * Check rate limiting for login attempts
   */
  private static async checkRateLimit(email: string, ipAddress: string): Promise<{
    allowed: boolean;
    attempts: number;
    lockoutUntil?: Date;
  }> {
    try {
      const windowStart = new Date(Date.now() - this.LOCKOUT_DURATION_MS);
      
      // Count failed attempts in the last 15 minutes for this IP
      const recentAttempts = await this.getRecentFailedAttempts(email, ipAddress, windowStart);
      
      if (recentAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
        return {
          allowed: false,
          attempts: recentAttempts,
          lockoutUntil
        };
      }

      return {
        allowed: true,
        attempts: recentAttempts
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, attempts: 0 }; // Allow on error to avoid blocking legitimate users
    }
  }

  /**
   * Get recent failed login attempts
   */
  private static async getRecentFailedAttempts(
    _email: string,
    _ipAddress: string,
    _since: Date
  ): Promise<number> {
    // For now, we'll implement a simple in-memory cache
    // In production, this should use Redis or database storage
    
    // This is a simplified implementation - in reality, you'd want to store
    // login attempts in a separate table or cache system
    return 0; // Placeholder - will be implemented in security service
  }

  /**
   * Log login attempt for security monitoring
   */
  private static async logLoginAttempt(
    _email: string,
    _ipAddress: string,
    _userAgent?: string,
    _success: boolean = false,
    _failureReason?: string
  ): Promise<void> {
    try {
      // In a production system, this would log to a security audit table
      // For now, we'll just log to console and implement full logging in security service
      
      // Mask email for security
      const maskEmail = (email: string) => {
        const [local, domain] = email.split('@');
        return `${local.substring(0, 2)}***@${domain}`;
      };
      
      console.log(`Login attempt: ${maskEmail(_email)} from ${_ipAddress} - ${_success ? 'SUCCESS' : 'FAILED'} ${_failureReason || ''}`);
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  /**
   * Refresh user session and generate new access token
   */
  static async refreshSession(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: Omit<User, 'password'>;
    error?: string;
    code?: string;
  }> {
    try {
      // Use new JWT service token rotation functionality
      const rotationResult = await JwtService.rotateTokens(refreshToken);
      
      if (!rotationResult.success) {
        return {
          success: false,
          error: rotationResult.error,
          code: rotationResult.code
        };
      }

      // Get user information for the response
      const tokenValidation = JwtService.validateRefreshToken(rotationResult.newRefreshToken!);
      if (!tokenValidation.isValid || !tokenValidation.payload) {
        return {
          success: false,
          error: 'Invalid refresh token',
          code: 'REFRESH_TOKEN_INVALID'
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: tokenValidation.payload.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          mobileNumber: true,
          role: true,
          profilePicture: true,
          googleId: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          // Profile fields added in B1
          bio: true,
          dateOfBirth: true,
          gender: true,
          nationality: true,
          occupation: true,
          website: true,
          location: true,
          profileVisibility: true,
          showEmail: true,
          showPhone: true,
          allowGoogleSync: true,
          profilePictureSource: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        accessToken: rotationResult.accessToken,
        refreshToken: rotationResult.newRefreshToken,
        expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
        user
      };

    } catch (error) {
      console.error('Error refreshing session:', error);
      return {
        success: false,
        error: 'Internal server error during token refresh',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Link Google account to existing email account
   */
  static async linkGoogleAccount(
    googleToken: string,
    userEmail: string
  ): Promise<LoginResult> {
    try {
      const linkResult = await GoogleOAuthService.linkGoogleAccount(googleToken, userEmail);
      
      if (!linkResult.success || !linkResult.user) {
        return {
          success: false,
          error: linkResult.error,
          code: linkResult.code
        };
      }

      return {
        success: true,
        user: linkResult.user,
        accountStatus: {
          isExistingUser: true,
          hasEmailAccount: true,
          accountLinked: true
        }
      };

    } catch (error) {
      console.error('Error linking Google account:', error);
      return {
        success: false,
        error: 'Internal server error during account linking',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Validate authentication service configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check JWT configuration
    const jwtValidation = JwtService.validateConfiguration();
    if (!jwtValidation.isValid) {
      errors.push(...jwtValidation.errors);
    }

    // Check Google OAuth configuration
    const googleValidation = GoogleOAuthService.validateConfiguration();
    if (!googleValidation.isValid) {
      errors.push(...googleValidation.errors);
    }

    // Check bcrypt configuration
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS || '12';
    if (parseInt(saltRounds) < 10) {
      errors.push('BCRYPT_SALT_ROUNDS should be at least 10 for security');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default AuthLoginService;