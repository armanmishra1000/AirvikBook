import { PasswordResetToken } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { EmailService } from '../email.service';
import { ServiceResponse } from '../../utils/response.utils';
import { SessionManagementService } from './sessionManagement.service';
import prisma from '../../lib/prisma';

const emailService = new EmailService();

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetTokenValidationResult {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    isEmailVerified: boolean;
  };
  token?: PasswordResetToken;
  error?: string;
  code?: string;
  timeRemaining?: number;
}

export interface ForgotPasswordResult {
  emailSent: boolean;
  message: string;
  canResetPassword: boolean;
  accountType?: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  alternativeAuth?: {
    method: 'GOOGLE_OAUTH';
    suggestion: string;
  };
}

export interface ResetPasswordResult {
  passwordReset: boolean;
  message: string;
  user: {
    email: string;
    fullName: string;
    passwordLastChanged: string;
  };
  sessionActions: {
    allSessionsInvalidated: boolean;
    newLoginRequired: boolean;
  };
  securityActions: {
    passwordAddedToHistory: boolean;
    securityEmailSent: boolean;
  };
}

export class PasswordResetService {
  // Remove rate limiting constants and storage
  private static readonly RESET_TOKEN_EXPIRY_HOURS = 24;

  /**
   * Generate a secure password reset token
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate password strength
   */
  private static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) { // Changed from MIN_PASSWORD_LENGTH to 8
      errors.push(`Password must be at least 8 characters long`);
    }

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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if password has been used recently
   */
  private static async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    try {
      const passwordHistory = await prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5 // Changed from PASSWORD_HISTORY_LIMIT to 5
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

      if (allHistory.length > 5) { // Changed from PASSWORD_HISTORY_LIMIT to 5
        const toDelete = allHistory.slice(5); // Changed from PASSWORD_HISTORY_LIMIT to 5
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
      // Don't throw error, as this is not critical for password reset
    }
  }

  /**
   * Initiate password reset process
   */
  static async generateResetToken(request: ForgotPasswordRequest): Promise<ServiceResponse<ForgotPasswordResult>> {
    try {
      const { email } = request;
      const normalizedEmail = email.toLowerCase().trim();

      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive'
          }
        }
      });

      // Always return success response for security (no email enumeration)
      if (!user) {
        return {
          success: true,
          data: {
            emailSent: true,
            message: 'If an account with this email exists, you will receive password reset instructions',
            canResetPassword: true
          }
        };
      }

      // Check account type
      const hasPassword = !!user.password;
      const hasGoogleAuth = !!user.googleId;

      // Handle Google-only accounts
      if (!hasPassword && hasGoogleAuth) {
        return {
          success: true,
          data: {
            emailSent: false,
            message: 'This account uses Google sign-in. Please use \'Sign in with Google\' instead',
            canResetPassword: false,
            accountType: 'GOOGLE_ONLY',
            alternativeAuth: {
              method: 'GOOGLE_OAUTH',
              suggestion: 'Use the \'Sign in with Google\' button on the login page'
            }
          }
        };
      }

      // Generate reset token for email accounts (email-only or mixed)
      const resetToken = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Clean up any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          email: normalizedEmail,
          expiresAt
        }
      });

      // Send password reset email
      const emailResult = await emailService.sendPasswordResetEmail(
        normalizedEmail,
        user.fullName,
        resetToken
      );

      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        // Still return success to prevent email enumeration
      }

      return {
        success: true,
        data: {
          emailSent: emailResult.success,
          message: 'If an account with this email exists, you will receive password reset instructions',
          canResetPassword: true
        }
      };

    } catch (error) {
      console.error('Error generating reset token:', error);
      return {
        success: false,
        error: 'Failed to process password reset request',
        code: 'RESET_TOKEN_GENERATION_FAILED'
      };
    }
  }

  /**
   * Validate reset token
   */
  static async validateResetToken(token: string): Promise<ServiceResponse<ResetTokenValidationResult>> {
    try {
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token,
          usedAt: null, // Token hasn't been used
          expiresAt: {
            gt: new Date() // Token hasn't expired
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              isActive: true,
              isEmailVerified: true
            }
          }
        }
      });

      if (!resetToken) {
        return {
          success: false,
          error: 'Reset token is invalid or expired',
          code: 'INVALID_RESET_TOKEN',
          details: {
            tokenExpired: true,
            requestNewReset: true
          }
        };
      }

      if (!resetToken.user.isActive) {
        return {
          success: false,
          error: 'User account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        };
      }

      const timeRemaining = Math.max(0, Math.floor((resetToken.expiresAt.getTime() - Date.now()) / 1000));

      return {
        success: true,
        data: {
          isValid: true,
          user: resetToken.user,
          token: resetToken,
          timeRemaining
        }
      };

    } catch (error) {
      console.error('Error validating reset token:', error);
      return {
        success: false,
        error: 'Failed to validate reset token',
        code: 'TOKEN_VALIDATION_FAILED'
      };
    }
  }

  /**
   * Complete password reset
   */
  static async resetPassword(request: ResetPasswordRequest): Promise<ServiceResponse<ResetPasswordResult>> {
    try {
      const { token, newPassword, confirmPassword } = request;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: 'New password and confirmation do not match',
          code: 'PASSWORD_MISMATCH',
          details: {
            field: 'confirmPassword'
          }
        };
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: 'Password does not meet strength requirements',
          code: 'PASSWORD_TOO_WEAK',
          details: {
            requirements: passwordValidation.errors
          }
        };
      }

      // Validate reset token
      const tokenValidation = await this.validateResetToken(token);
      if (!tokenValidation.success || !tokenValidation.data || !tokenValidation.data.user || !tokenValidation.data.token) {
        return {
          success: false,
          error: tokenValidation.error || 'Invalid reset token',
          code: tokenValidation.code || 'INVALID_RESET_TOKEN'
        };
      }

      const { user, token: resetToken } = tokenValidation.data;

      // Check password history
      const hasUsedPassword = await this.checkPasswordHistory(user.id, newPassword);
      if (hasUsedPassword) {
        return {
          success: false,
          error: 'Please choose a password you haven\'t used recently',
          code: 'PASSWORD_REUSED',
          details: {
            historyLimit: 5 // Changed from PASSWORD_HISTORY_LIMIT to 5
          }
        };
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12); // Changed from BCRYPT_ROUNDS to 12

      // Update user password
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          updatedAt: true
        }
      });

      // Mark reset token as used
      await prisma.passwordResetToken.update({
        where: { id: resetToken!.id },
        data: { usedAt: new Date() }
      });

      // Add password to history
      await this.addPasswordToHistory(user.id, passwordHash);

      // Invalidate all user sessions (they need to log in again)
      await SessionManagementService.invalidateAllUserSessions(user.id);

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
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>For your security, you'll need to log in again on all devices.</p>
            <p>Best regards,<br>The AirVikBook Team</p>
          </div>
        `
      });

      return {
        success: true,
        data: {
          passwordReset: true,
          message: 'Password has been reset successfully',
          user: {
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            passwordLastChanged: updatedUser.updatedAt.toISOString()
          },
          sessionActions: {
            allSessionsInvalidated: true,
            newLoginRequired: true
          },
          securityActions: {
            passwordAddedToHistory: true,
            securityEmailSent: securityEmailResult.success
          }
        }
      };

    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: 'Failed to reset password',
        code: 'PASSWORD_RESET_FAILED'
      };
    }
  }

  /**
   * Clean up expired reset tokens
   */
  static async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    try {
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      // eslint-disable-next-line no-console
      console.log(`Cleaned up ${result.count} expired password reset tokens`);
      return { deletedCount: result.count };

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error cleaning up expired tokens:', error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Get password reset statistics (for monitoring)
   */
  static async getResetStatistics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalRequests: number;
    successfulResets: number;
    expiredTokens: number;
    activeTokens: number;
  }> {
    try {
      const timeframeDays = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
      const since = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);

      const [totalRequests, successfulResets, expiredTokens, activeTokens] = await Promise.all([
        prisma.passwordResetToken.count({
          where: { createdAt: { gte: since } }
        }),
        prisma.passwordResetToken.count({
          where: {
            createdAt: { gte: since },
            usedAt: { not: null }
          }
        }),
        prisma.passwordResetToken.count({
          where: {
            expiresAt: { lt: new Date() },
            usedAt: null
          }
        }),
        prisma.passwordResetToken.count({
          where: {
            expiresAt: { gt: new Date() },
            usedAt: null
          }
        })
      ]);

      return {
        totalRequests,
        successfulResets,
        expiredTokens,
        activeTokens
      };

    } catch (error) {
      console.error('Error getting reset statistics:', error);
      return {
        totalRequests: 0,
        successfulResets: 0,
        expiredTokens: 0,
        activeTokens: 0
      };
    }
  }
}

export default PasswordResetService;