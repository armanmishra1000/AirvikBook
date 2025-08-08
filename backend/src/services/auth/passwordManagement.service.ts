import bcrypt from 'bcrypt';
import { ServiceResponse } from '../../utils/response.utils';
import { SessionManagementService } from './sessionManagement.service';
import { EmailService } from '../email.service';
import prisma from '../../lib/prisma';

const emailService = new EmailService();

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  invalidateOtherSessions?: boolean;
}

export interface SetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface RemovePasswordRequest {
  currentPassword: string;
  confirmGoogleOnly: boolean;
}

export interface PasswordStatusResult {
  hasPassword: boolean;
  hasGoogleAuth: boolean;
  authMethods: string[];
  accountType: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  passwordLastChanged?: string;
  securityRecommendations: SecurityRecommendation[];
  passwordPolicy: PasswordPolicy;
}

export interface SecurityRecommendation {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  historyLimit: number;
}

export interface ChangePasswordResult {
  passwordChanged: boolean;
  message: string;
  user: {
    email: string;
    passwordLastChanged: string;
    hasPassword: boolean;
  };
  sessionActions: {
    otherSessionsInvalidated: boolean;
    currentSessionMaintained: boolean;
    sessionsInvalidated: number;
  };
  securityActions: {
    passwordAddedToHistory: boolean;
    securityEmailSent: boolean;
  };
}

export interface SetPasswordResult {
  passwordSet: boolean;
  message: string;
  user: {
    email: string;
    hasPassword: boolean;
    hasGoogleAuth: boolean;
    authMethods: string[];
    passwordLastChanged: string;
  };
  securityActions: {
    mixedAuthEnabled: boolean;
    securityEmailSent: boolean;
  };
}

export interface RemovePasswordResult {
  passwordRemoved: boolean;
  message: string;
  user: {
    email: string;
    hasPassword: boolean;
    hasGoogleAuth: boolean;
    authMethods: string[];
    accountType: 'GOOGLE_ONLY';
  };
  sessionActions: {
    allSessionsInvalidated: boolean;
    newLoginRequired: boolean;
    loginMethod: 'GOOGLE_OAUTH';
  };
}

export class PasswordManagementService {
  private static readonly BCRYPT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 12; // Increased from 8 to 12
  private static readonly MAX_PASSWORD_LENGTH = 128; // Added maximum length
  private static readonly PASSWORD_HISTORY_LIMIT = 5;
  
  // Rate limiting maps
  private static passwordChangeAttempts = new Map<string, { count: number; resetTime: number }>();
  private static readonly PASSWORD_CHANGE_LIMIT = 5; // 5 attempts per 15 minutes per user
  private static readonly PASSWORD_CHANGE_WINDOW = 15 * 60 * 1000; // 15 minutes

  // Common passwords to prevent
  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
    'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
    'ranger', 'iwantu', 'jennifer', 'hunter', 'buster', 'soccer',
    'baseball', 'tiger', 'charlie', 'andrew', 'michelle', 'love',
    'sunshine', 'jessica', 'asshole', '696969', 'amanda', 'access',
    'computer', 'cookie', 'mickey', 'shadow', 'maggie', '654321',
    'superman', '1qaz2wsx', '7777777', '121212', 'buster', 'butter',
    'dragon', 'jordan', 'michael', 'michelle', 'charlie', 'andrew',
    'matthew', 'access', 'ninja', 'password1', '12345678', 'qwerty123'
  ];

  /**
   * Validate password strength with enhanced security
   */
  private static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Length validation
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (password.length > this.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must be no more than ${this.MAX_PASSWORD_LENGTH} characters long`);
    }

    // Character requirements
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Enhanced security checks
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common. Please choose a more unique password');
    }

    if (this.hasSequentialCharacters(password)) {
      errors.push('Password contains sequential characters (e.g., 123, abc)');
    }

    if (this.hasRepeatingCharacters(password)) {
      errors.push('Password contains too many repeating characters');
    }

    if (this.hasKeyboardPatterns(password)) {
      errors.push('Password contains keyboard patterns (e.g., qwerty, asdf)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if password is in common passwords list
   */
  private static isCommonPassword(password: string): boolean {
    const normalizedPassword = password.toLowerCase().trim();
    return this.COMMON_PASSWORDS.includes(normalizedPassword);
  }

  /**
   * Check for sequential characters
   */
  private static hasSequentialCharacters(password: string): boolean {
    const sequences = [
      '123', '234', '345', '456', '567', '678', '789', '890',
      'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
      'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
      'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl'
    ];

    const normalizedPassword = password.toLowerCase();
    return sequences.some(seq => normalizedPassword.includes(seq));
  }

  /**
   * Check for repeating characters
   */
  private static hasRepeatingCharacters(password: string): boolean {
    // Check for 3 or more consecutive identical characters
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for keyboard patterns
   */
  private static hasKeyboardPatterns(password: string): boolean {
    const patterns = [
      'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'edcrfv', 'tgbyhn',
      '123456', '654321', '111111', '000000', 'aaaaaa', 'zzzzzz'
    ];

    const normalizedPassword = password.toLowerCase();
    return patterns.some(pattern => normalizedPassword.includes(pattern));
  }

  /**
   * Check if password has been used recently
   */
  private static async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    try {
      const passwordHistory = await prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: this.PASSWORD_HISTORY_LIMIT
      });

      for (const historyEntry of passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, historyEntry.passwordHash);
        if (isMatch) {
          return true; // Password has been used recently
        }
      }

      return false; // Password is new
    } catch (error) {
      console.error('Error checking password history:', error);
      return false; // Allow password change if history check fails
    }
  }

  /**
   * Add password to history
   */
  private static async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    try {
      // Add new password to history
      await prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash
        }
      });

      // Keep only the last 5 passwords
      const allHistory = await prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (allHistory.length > this.PASSWORD_HISTORY_LIMIT) {
        const toDelete = allHistory.slice(this.PASSWORD_HISTORY_LIMIT);
        await prisma.passwordHistory.deleteMany({
          where: {
            id: {
              in: toDelete.map(h => h.id)
            }
          }
        });
      }
    } catch (error) {
      console.error('Error adding password to history:', error);
      // Don't throw error, as this is not critical for password operations
    }
  }

  /**
   * Check rate limiting for password changes
   */
  private static checkPasswordChangeRateLimit(userId: string): { allowed: boolean; retryAfter?: number; remainingAttempts?: number } {
    const now = Date.now();
    const windowStart = Math.floor(now / this.PASSWORD_CHANGE_WINDOW) * this.PASSWORD_CHANGE_WINDOW;
    
    let attempts = this.passwordChangeAttempts.get(userId);
    
    if (!attempts || attempts.resetTime <= now) {
      attempts = { count: 1, resetTime: windowStart + this.PASSWORD_CHANGE_WINDOW };
      this.passwordChangeAttempts.set(userId, attempts);
      return { 
        allowed: true, 
        remainingAttempts: this.PASSWORD_CHANGE_LIMIT - 1 
      };
    }
    
    if (attempts.count >= this.PASSWORD_CHANGE_LIMIT) {
      return {
        allowed: false,
        retryAfter: Math.ceil((attempts.resetTime - now) / 1000),
        remainingAttempts: 0
      };
    }
    
    attempts.count++;
    return { 
      allowed: true, 
      remainingAttempts: this.PASSWORD_CHANGE_LIMIT - attempts.count 
    };
  }

  /**
   * Determine account type based on password and Google ID
   */
  private static getAccountType(hasPassword: boolean, hasGoogleId: boolean): 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED' {
    if (hasPassword && hasGoogleId) return 'MIXED';
    if (hasPassword && !hasGoogleId) return 'EMAIL_ONLY';
    if (!hasPassword && hasGoogleId) return 'GOOGLE_ONLY';
    // This shouldn't happen in normal cases, but default to email-only
    return 'EMAIL_ONLY';
  }

  /**
   * Generate security recommendations based on account status
   */
  private static generateSecurityRecommendations(
    accountType: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED',
    passwordLastChanged?: Date
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Password age recommendations
    if (passwordLastChanged) {
      const daysSinceChange = Math.floor((Date.now() - passwordLastChanged.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceChange > 180) {
        recommendations.push({
          type: 'PASSWORD_AGE',
          message: 'Your password is very old - please update it for better security',
          priority: 'high'
        });
      } else if (daysSinceChange > 90) {
        recommendations.push({
          type: 'PASSWORD_AGE',
          message: 'Consider changing your password - it hasn\'t been updated in over 3 months',
          priority: 'medium'
        });
      }
    }

    // Account type recommendations
    if (accountType === 'EMAIL_ONLY') {
      recommendations.push({
        type: 'GOOGLE_AUTH',
        message: 'Add Google authentication for easier and more secure sign-in',
        priority: 'low'
      });
    }

    if (accountType === 'GOOGLE_ONLY') {
      recommendations.push({
        type: 'BACKUP_PASSWORD',
        message: 'Consider setting a backup password in case Google authentication is unavailable',
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Get password status and authentication methods
   */
  static async getPasswordStatus(userId: string): Promise<ServiceResponse<PasswordStatusResult>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          password: true,
          googleId: true,
          updatedAt: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User not found or inactive',
          code: 'USER_NOT_FOUND'
        };
      }

      const hasPassword = !!user.password;
      const hasGoogleAuth = !!user.googleId;
      const accountType = this.getAccountType(hasPassword, hasGoogleAuth);

      const authMethods: string[] = [];
      if (hasPassword) authMethods.push('EMAIL');
      if (hasGoogleAuth) authMethods.push('GOOGLE');

      const securityRecommendations = this.generateSecurityRecommendations(
        accountType,
        hasPassword ? user.updatedAt : undefined
      );

      const passwordPolicy: PasswordPolicy = {
        minLength: this.MIN_PASSWORD_LENGTH,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        historyLimit: this.PASSWORD_HISTORY_LIMIT
      };

      return {
        success: true,
        data: {
          hasPassword,
          hasGoogleAuth,
          authMethods,
          accountType,
          passwordLastChanged: hasPassword ? user.updatedAt.toISOString() : undefined,
          securityRecommendations,
          passwordPolicy
        }
      };

    } catch (error) {
      console.error('Error getting password status:', error);
      return {
        success: false,
        error: 'Failed to get password status',
        code: 'PASSWORD_STATUS_FAILED'
      };
    }
  }

  /**
   * Validate current password for user
   */
  static async validateCurrentPassword(userId: string, currentPassword: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user || !user.password) {
        return false;
      }

      return await bcrypt.compare(currentPassword, user.password);
    } catch (error) {
      console.error('Error validating current password:', error);
      return false;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(
    userId: string,
    sessionId: string,
    request: ChangePasswordRequest
  ): Promise<ServiceResponse<ChangePasswordResult>> {
    try {
      const { currentPassword, newPassword, confirmPassword, invalidateOtherSessions = false } = request;

      // Check rate limiting
      const rateLimitResult = this.checkPasswordChangeRateLimit(userId);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Too many password change attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            retryAfter: rateLimitResult.retryAfter,
            remainingAttempts: rateLimitResult.remainingAttempts
          }
        };
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: 'New password and confirmation do not match',
          code: 'PASSWORD_MISMATCH',
          details: { field: 'confirmPassword' }
        };
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: 'Password does not meet strength requirements',
          code: 'PASSWORD_TOO_WEAK',
          details: { requirements: passwordValidation.errors }
        };
      }

      // Get user and validate current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          fullName: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User not found or inactive',
          code: 'USER_NOT_FOUND'
        };
      }

      if (!user.password) {
        return {
          success: false,
          error: 'Account does not have a password. Use set password instead',
          code: 'NO_PASSWORD_EXISTS',
          details: { useSetPassword: true }
        };
      }

      // Validate current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
          details: {
            field: 'currentPassword',
            remainingAttempts: rateLimitResult.remainingAttempts
          }
        };
      }

      // Check password history
      const hasUsedPassword = await this.checkPasswordHistory(userId, newPassword);
      if (hasUsedPassword) {
        return {
          success: false,
          error: 'Please choose a password you haven\'t used recently',
          code: 'PASSWORD_REUSED',
          details: { historyLimit: this.PASSWORD_HISTORY_LIMIT }
        };
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

      // Update user password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          updatedAt: new Date()
        },
        select: {
          email: true,
          updatedAt: true
        }
      });

      // Add password to history
      await this.addPasswordToHistory(userId, passwordHash);

      // Handle session invalidation
      let sessionsInvalidated = 0;
      if (invalidateOtherSessions) {
        // Get all sessions for the user first
        const userSessions = await prisma.session.findMany({
          where: { userId, isActive: true }
        });
        
        // Invalidate all sessions except current one
        await prisma.session.updateMany({
          where: {
            userId,
            id: { not: sessionId },
            isActive: true
          },
          data: { isActive: false }
        });
        
        sessionsInvalidated = Math.max(0, userSessions.length - 1);
      }

      // Update current session's last activity
      await prisma.session.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      }).catch(() => {
        // Ignore error if session not found
      });

      // Send security notification email
      const securityEmailResult = await emailService.sendEmail({
        to: user.email,
        subject: 'Password Changed Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Changed</h1>
            <p>Hello ${user.fullName},</p>
            <p>Your password has been successfully changed.</p>
            <p><strong>When:</strong> ${new Date().toLocaleString()}</p>
            ${invalidateOtherSessions ? 
              '<p>All other devices have been signed out for your security.</p>' : 
              '<p>You remain signed in on other devices.</p>'
            }
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The AirVikBook Team</p>
          </div>
        `
      });

      return {
        success: true,
        data: {
          passwordChanged: true,
          message: 'Password updated successfully',
          user: {
            email: updatedUser.email,
            passwordLastChanged: updatedUser.updatedAt.toISOString(),
            hasPassword: true
          },
          sessionActions: {
            otherSessionsInvalidated: invalidateOtherSessions,
            currentSessionMaintained: true,
            sessionsInvalidated
          },
          securityActions: {
            passwordAddedToHistory: true,
            securityEmailSent: securityEmailResult.success
          }
        }
      };

    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: 'Failed to change password',
        code: 'PASSWORD_CHANGE_FAILED'
      };
    }
  }

  /**
   * Set password for Google-only users (enable mixed authentication)
   */
  static async setPasswordForGoogleUser(
    userId: string,
    request: SetPasswordRequest
  ): Promise<ServiceResponse<SetPasswordResult>> {
    try {
      const { newPassword, confirmPassword } = request;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: 'New password and confirmation do not match',
          code: 'PASSWORD_MISMATCH',
          details: { field: 'confirmPassword' }
        };
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: 'Password does not meet strength requirements',
          code: 'PASSWORD_TOO_WEAK',
          details: { requirements: passwordValidation.errors }
        };
      }

      // Get user and validate they're Google-only
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          googleId: true,
          fullName: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User not found or inactive',
          code: 'USER_NOT_FOUND'
        };
      }

      if (user.password) {
        return {
          success: false,
          error: 'Account already has a password. Use change password instead',
          code: 'PASSWORD_ALREADY_EXISTS',
          details: {
            hasPassword: true,
            useChangePassword: true,
            endpoint: '/api/v1/auth/password'
          }
        };
      }

      if (!user.googleId) {
        return {
          success: false,
          error: 'Account must have Google authentication to set password',
          code: 'GOOGLE_ACCOUNT_REQUIRED'
        };
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

      // Update user with password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          updatedAt: new Date()
        },
        select: {
          email: true,
          password: true,
          googleId: true,
          updatedAt: true
        }
      });

      // Add password to history
      await this.addPasswordToHistory(userId, passwordHash);

      // Send mixed authentication notification email
      const securityEmailResult = await emailService.sendEmail({
        to: user.email,
        subject: 'Password Set - Mixed Authentication Enabled',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Set Successfully</h1>
            <p>Hello ${user.fullName},</p>
            <p>You have successfully set a password for your account.</p>
            <p><strong>When:</strong> ${new Date().toLocaleString()}</p>
            <p>You can now sign in using either:</p>
            <ul>
              <li>Your email and password</li>
              <li>Google sign-in</li>
            </ul>
            <p>This gives you more flexibility in accessing your account.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The AirVikBook Team</p>
          </div>
        `
      });

      const authMethods = ['EMAIL', 'GOOGLE'];

      return {
        success: true,
        data: {
          passwordSet: true,
          message: 'Password set successfully. You can now use email or Google to sign in',
          user: {
            email: updatedUser.email,
            hasPassword: true,
            hasGoogleAuth: true,
            authMethods,
            passwordLastChanged: updatedUser.updatedAt.toISOString()
          },
          securityActions: {
            mixedAuthEnabled: true,
            securityEmailSent: securityEmailResult.success
          }
        }
      };

    } catch (error) {
      console.error('Error setting password for Google user:', error);
      return {
        success: false,
        error: 'Failed to set password',
        code: 'SET_PASSWORD_FAILED'
      };
    }
  }

  /**
   * Remove password from mixed account (become Google-only)
   */
  static async removePassword(
    userId: string,
    request: RemovePasswordRequest
  ): Promise<ServiceResponse<RemovePasswordResult>> {
    try {
      const { currentPassword, confirmGoogleOnly } = request;

      if (!confirmGoogleOnly) {
        return {
          success: false,
          error: 'You must confirm that you want to use Google sign-in only',
          code: 'CONFIRMATION_REQUIRED',
          details: { field: 'confirmGoogleOnly' }
        };
      }

      // Get user and validate they have mixed authentication
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          googleId: true,
          fullName: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User not found or inactive',
          code: 'USER_NOT_FOUND'
        };
      }

      if (!user.password) {
        return {
          success: false,
          error: 'Account does not have a password to remove',
          code: 'NO_PASSWORD_EXISTS'
        };
      }

      if (!user.googleId) {
        return {
          success: false,
          error: 'Cannot remove password without Google authentication. Account would become inaccessible',
          code: 'GOOGLE_AUTH_REQUIRED'
        };
      }

      // Validate current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
          details: { field: 'currentPassword' }
        };
      }

      // Remove password from user account
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: null,
          updatedAt: new Date()
        }
      });

      // Invalidate all user sessions (they need to re-login with Google)
      await SessionManagementService.invalidateAllUserSessions(userId);

      // Send security notification email
      await emailService.sendEmail({
        to: user.email,
        subject: 'Password Removed - Google Sign-in Only',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Removed</h1>
            <p>Hello ${user.fullName},</p>
            <p>Your account password has been removed. Your account now uses Google sign-in only.</p>
            <p><strong>When:</strong> ${new Date().toLocaleString()}</p>
            <p>For your security, you have been signed out of all devices and will need to sign in again using Google.</p>
            <p>You can set a new password at any time from your account security settings.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The AirVikBook Team</p>
          </div>
        `
      });

      return {
        success: true,
        data: {
          passwordRemoved: true,
          message: 'Password removed. Account now uses Google sign-in only',
          user: {
            email: user.email,
            hasPassword: false,
            hasGoogleAuth: true,
            authMethods: ['GOOGLE'],
            accountType: 'GOOGLE_ONLY'
          },
          sessionActions: {
            allSessionsInvalidated: true,
            newLoginRequired: true,
            loginMethod: 'GOOGLE_OAUTH'
          }
        }
      };

    } catch (error) {
      console.error('Error removing password:', error);
      return {
        success: false,
        error: 'Failed to remove password',
        code: 'REMOVE_PASSWORD_FAILED'
      };
    }
  }

  /**
   * Clean up old password history entries
   */
  static async cleanupPasswordHistory(retentionDays: number = 90): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const result = await prisma.passwordHistory.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Cleaned up ${result.count} old password history entries`);
      return { deletedCount: result.count };

    } catch (error) {
      console.error('Error cleaning up password history:', error);
      return { deletedCount: 0 };
    }
  }
}

export default PasswordManagementService;
