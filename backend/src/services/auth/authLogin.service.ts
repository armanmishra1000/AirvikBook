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
  // Remove rate limiting constants and methods
  private static readonly ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days
  private static readonly REMEMBER_ME_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

  /**
   * Login with email and password
   */
  static async loginWithEmailPassword(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const { email, password, rememberMe = false, deviceInfo } = credentials;

      // Remove rate limiting check

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
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Check if account is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'Account has been disabled',
          code: 'ACCOUNT_DISABLED'
        };
      }

      // Check email verification (required for email/password login)
      if (!user.isEmailVerified) {
        return {
          success: false,
          error: 'Please verify your email address before logging in',
          code: 'EMAIL_NOT_VERIFIED'
        };
      }

      // Check if user has a password (could be Google-only user)
      if (!user.password) {
        return {
          success: false,
          error: 'No password set for this account. Please use Google sign-in or reset your password.',
          code: 'NO_PASSWORD_SET'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

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

      let tokens;
      try {
        tokens = JwtService.generateTokenPair(tokenPayload);
      } catch (tokenError) {
        console.error('Token generation error:', tokenError);
        return {
          success: false,
          error: 'Failed to generate authentication tokens',
          code: 'TOKEN_GENERATION_ERROR'
        };
      }

      // Store refresh token
      try {
        await JwtService.storeRefreshToken(user.id, tokens.refreshToken);
      } catch (storeError) {
        console.error('Token storage error:', storeError);
        // Continue without storing refresh token for now
      }

      // Create session using internal method
      let session;
      try {
        session = await this.createSession(
          user.id,
          tokens.refreshToken,
          deviceInfo || this.generateDeviceInfo(),
          undefined,
          undefined,
          rememberMe
        );
      } catch (sessionError) {
        console.error('Session creation error:', sessionError);
        // Continue without session for now
        session = { id: 'temp-session-id' };
      }

      // Check if this is a new device
      let isNewDevice = false;
      try {
        isNewDevice = await this.isNewDevice(user.id, deviceInfo || this.generateDeviceInfo());
      } catch (deviceError) {
        console.error('Device check error:', deviceError);
        // Assume new device on error
        isNewDevice = true;
      }

      // Return success response
      const { password: _unusedPassword, ...userWithoutPassword } = updatedUser;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      return {
        success: true,
        user: userWithoutPassword,
        tokens: {
          ...tokens,
          expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
          refreshExpiresIn: rememberMe ? this.REMEMBER_ME_EXPIRY_SECONDS : this.REFRESH_TOKEN_EXPIRY_SECONDS
        },
        session: {
          id: session.id,
          deviceInfo: deviceInfo || this.generateDeviceInfo(),
          isNewDevice
        },
        securityAlert: isNewDevice ? {
          newDeviceEmailSent: true,
          requiresAdditionalVerification: false
        } : undefined
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.',
        code: 'LOGIN_ERROR'
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
      let googleResult;
      try {
        googleResult = await GoogleOAuthService.authenticateWithGoogle(googleToken);
      } catch (googleError) {
        console.error('Google authentication error:', googleError);
        return {
          success: false,
          error: 'Google authentication service unavailable',
          code: 'GOOGLE_SERVICE_ERROR'
        };
      }
      
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
      let sessionResult;
      try {
        sessionResult = await this.createSession(
          user.id,
          tokens.refreshToken,
          deviceInfo,
          clientIP,
          userAgent,
          rememberMe
        );
      } catch (sessionError) {
        console.error('Google session creation error:', sessionError);
        sessionResult = { id: 'temp-session-id' };
      }

      // Check for new device
      let isNewDevice = false;
      try {
        isNewDevice = deviceInfo ? await this.isNewDevice(user.id, deviceInfo) : false;
      } catch (deviceError) {
        console.error('Google device check error:', deviceError);
        isNewDevice = true;
      }
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const sessionData = {
      userId,
      token: sessionToken, // Unique session identifier
      refreshToken,
      expiresAt,
      isActive: true,
      deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : Prisma.JsonNull,
      ipAddress,
      userAgent
    };

    const session = await prisma.session.create({
      data: sessionData
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
   * Generate default device info for new sessions
   */
  private static generateDeviceInfo(): DeviceInfo {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const deviceId = crypto.randomBytes(16).toString('hex');
    const deviceName = 'Unknown Device';
    const userAgent = 'Unknown Browser';
    return { deviceId, deviceName, userAgent };
  }

  /**
   * Refresh user session and generate new access token
   */
  static async refreshSession(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    expiresIn?: number;
    user?: Omit<User, 'password'>;
    error?: string;
    code?: string;
  }> {
    try {
      // Use existing JWT service refresh functionality
      const refreshResult = await JwtService.refreshAccessToken(refreshToken);
      
      if (!refreshResult.success) {
        return {
          success: false,
          error: refreshResult.error,
          code: refreshResult.code
        };
      }

      // Get user information for the response
      const tokenValidation = JwtService.validateRefreshToken(refreshToken);
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
        accessToken: refreshResult.accessToken,
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