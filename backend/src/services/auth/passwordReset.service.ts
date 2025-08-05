import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerification {
  token: string;
  newPassword: string;
}

export interface PasswordResetResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
  message?: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  email: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export class PasswordResetService {
  private static readonly TOKEN_EXPIRY_HOURS = 1; // 1 hour
  private static readonly RATE_LIMIT_MINUTES = 5; // 5 minutes between requests
  private static readonly MAX_ATTEMPTS_PER_DAY = 3; // Maximum 3 reset requests per day

  // In-memory rate limiting (in production, use Redis)
  private static resetAttempts = new Map<string, Array<{ timestamp: number }>>();

  /**
   * Initiate password reset process
   */
  static async initiatePasswordReset(email: string, clientIP: string): Promise<PasswordResetResult> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check rate limiting
      const rateLimitResult = await this.checkResetRateLimit(normalizedEmail);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Too many password reset requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Please wait ${rateLimitResult.waitTimeMinutes} minutes before requesting another password reset.`
        };
      }

      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive'
          }
        }
      });

      // Always return success for security (don't reveal if email exists)
      // but only send email if user actually exists
      if (user && user.isActive) {
        // Generate secure reset token
        const resetToken = await this.generateResetToken();
        const expiresAt = new Date(Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000));

        // Store reset token in database
        await this.storeResetToken(user.id, resetToken, normalizedEmail, expiresAt);

        // Send password reset email
        try {
          const { emailService } = await import('../email.service');
          
          const emailResult = await emailService.sendPasswordResetEmail(
            user.email,
            user.fullName,
            resetToken
          );

          if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            // Continue anyway - don't reveal email send failures
          }

        } catch (emailError) {
          console.error('Error sending password reset email:', emailError);
          // Continue anyway - don't reveal email send failures
        }

        // Log the reset attempt
        await this.logResetAttempt(normalizedEmail, clientIP, true);
      } else {
        // Log attempt even for non-existent users (for security monitoring)
        await this.logResetAttempt(normalizedEmail, clientIP, false, 'USER_NOT_FOUND');
      }

      // Update rate limiting
      this.updateResetAttempts(normalizedEmail);

      // Always return success for security
      return {
        success: true,
        data: {
          emailSent: true,
          message: 'Password reset instructions sent to your email'
        },
        message: 'If an account with that email exists, we\'ve sent password reset instructions.'
      };

    } catch (error) {
      console.error('Error initiating password reset:', error);
      return {
        success: false,
        error: 'Internal server error during password reset initiation',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Verify reset token and reset password
   */
  static async resetPassword(
    token: string,
    newPassword: string,
    clientIP: string
  ): Promise<PasswordResetResult> {
    try {
      // Find and validate reset token
      const resetToken = await this.findValidResetToken(token);
      if (!resetToken) {
        return {
          success: false,
          error: 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        };
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: resetToken.userId }
      });

      if (!user || !user.isActive) {
        // Mark token as used even if user not found (security)
        await this.markTokenAsUsed(resetToken.id);
        return {
          success: false,
          error: 'User account not found or inactive',
          code: 'USER_NOT_FOUND'
        };
      }

      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: 'Password does not meet security requirements',
          code: 'WEAK_PASSWORD',
          data: {
            requirements: passwordValidation.requirements,
            violations: passwordValidation.violations
          }
        };
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password and invalidate all sessions
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Invalidate all existing sessions for security
      await prisma.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      });

      // Mark reset token as used
      await this.markTokenAsUsed(resetToken.id);

      // Clean up old reset tokens for this user
      await this.cleanupOldResetTokens(user.id);

      // Send password change confirmation email (TODO: Implement sendPasswordChangeConfirmation method)
      try {
        // For now, we'll log the successful password change
        console.log(`Password successfully changed for user: ${user.email}`);
        
        // TODO: Implement sendPasswordChangeConfirmation method in EmailService
        // const { emailService } = await import('../email.service');
        // await emailService.sendPasswordChangeConfirmation(user.email, user.fullName);

      } catch (emailError) {
        console.error('Error sending password change confirmation:', emailError);
        // Don't fail the operation if email fails
      }

      // Log successful password reset
      console.log(`[SECURITY] Password reset successful for user ${user.email} from IP ${clientIP}`);

      return {
        success: true,
        data: {
          passwordReset: true,
          message: 'Password has been reset successfully'
        },
        message: 'Your password has been reset. Please log in with your new password.'
      };

    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: 'Internal server error during password reset',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Verify reset token validity (for UI validation)
   */
  static async verifyResetToken(token: string): Promise<PasswordResetResult> {
    try {
      const resetToken = await this.findValidResetToken(token);
      
      if (!resetToken) {
        return {
          success: false,
          error: 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        };
      }

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: resetToken.userId },
        select: { id: true, email: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'User account not found or inactive',
          code: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: {
          tokenValid: true,
          email: user.email
        },
        message: 'Reset token is valid'
      };

    } catch (error) {
      console.error('Error verifying reset token:', error);
      return {
        success: false,
        error: 'Internal server error during token verification',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Generate cryptographically secure reset token
   */
  private static async generateResetToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store reset token in database
   */
  private static async storeResetToken(
    userId: string,
    token: string,
    email: string,
    expiresAt: Date
  ): Promise<void> {
    // First, invalidate any existing reset tokens for this user
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null
      },
      data: {
        usedAt: new Date() // Mark old tokens as used
      }
    });

    // Create new reset token (reusing EmailVerificationToken model)
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        email,
        expiresAt
      }
    });
  }

  /**
   * Find and validate reset token
   */
  private static async findValidResetToken(token: string): Promise<any | null> {
    try {
      const resetToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!resetToken) {
        return null;
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        return null;
      }

      // Check if token has already been used
      if (resetToken.usedAt) {
        return null;
      }

      return resetToken;

    } catch (error) {
      console.error('Error finding reset token:', error);
      return null;
    }
  }

  /**
   * Mark reset token as used
   */
  private static async markTokenAsUsed(tokenId: string): Promise<void> {
    try {
      await prisma.emailVerificationToken.update({
        where: { id: tokenId },
        data: { usedAt: new Date() }
      });
    } catch (error) {
      console.error('Error marking token as used:', error);
    }
  }

  /**
   * Clean up old reset tokens for user
   */
  private static async cleanupOldResetTokens(userId: string): Promise<void> {
    try {
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId,
          OR: [
            { expiresAt: { lt: new Date() } },
            { usedAt: { not: null } }
          ]
        }
      });
    } catch (error) {
      console.error('Error cleaning up old reset tokens:', error);
    }
  }

  /**
   * Check rate limiting for password reset requests
   */
  private static async checkResetRateLimit(email: string): Promise<{
    allowed: boolean;
    waitTimeMinutes?: number;
    attemptsToday?: number;
  }> {
    try {
      const now = Date.now();
      const rateLimitWindow = this.RATE_LIMIT_MINUTES * 60 * 1000;
      const dailyWindow = 24 * 60 * 60 * 1000;

      const attempts = this.resetAttempts.get(email) || [];
      
      // Clean old attempts
      const validAttempts = attempts.filter(attempt => 
        attempt.timestamp > (now - dailyWindow)
      );
      this.resetAttempts.set(email, validAttempts);

      // Check daily limit
      if (validAttempts.length >= this.MAX_ATTEMPTS_PER_DAY) {
        return {
          allowed: false,
          attemptsToday: validAttempts.length
        };
      }

      // Check rate limit (most recent attempt)
      const recentAttempts = validAttempts.filter(attempt => 
        attempt.timestamp > (now - rateLimitWindow)
      );

      if (recentAttempts.length > 0) {
        const waitTime = Math.ceil((rateLimitWindow - (now - recentAttempts[0].timestamp)) / (60 * 1000));
        return {
          allowed: false,
          waitTimeMinutes: waitTime,
          attemptsToday: validAttempts.length
        };
      }

      return {
        allowed: true,
        attemptsToday: validAttempts.length
      };

    } catch (error) {
      console.error('Error checking reset rate limit:', error);
      return { allowed: true }; // Allow on error
    }
  }

  /**
   * Update reset attempts tracking
   */
  private static updateResetAttempts(email: string): void {
    const attempts = this.resetAttempts.get(email) || [];
    attempts.unshift({ timestamp: Date.now() });
    this.resetAttempts.set(email, attempts);
  }

  /**
   * Log password reset attempt
   */
  private static async logResetAttempt(
    email: string,
    clientIP: string,
    success: boolean,
    reason?: string
  ): Promise<void> {
    try {
      const logMessage = `Password reset attempt: ${email} from ${clientIP} - ${success ? 'SUCCESS' : 'FAILED'}`;
      console.log(`[SECURITY] ${logMessage} ${reason ? `(${reason})` : ''}`);
    } catch (error) {
      console.error('Error logging reset attempt:', error);
    }
  }

  /**
   * Validate password strength
   */
  private static validatePasswordStrength(password: string): {
    isValid: boolean;
    requirements: string[];
    violations: string[];
  } {
    const requirements = [
      'At least 8 characters long',
      'Contains at least one uppercase letter',
      'Contains at least one lowercase letter',
      'Contains at least one number',
      'Contains at least one special character (!@#$%^&*)'
    ];

    const violations: string[] = [];

    if (password.length < 8) {
      violations.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      violations.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      violations.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      violations.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      violations.push('Password must contain at least one special character');
    }

    return {
      isValid: violations.length === 0,
      requirements,
      violations
    };
  }

  /**
   * Clean up expired reset tokens (should be run periodically)
   */
  static async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    try {
      const result = await prisma.emailVerificationToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { usedAt: { not: null } }
          ]
        }
      });

      console.log(`[SECURITY] Cleaned up ${result.count} expired/used password reset tokens`);
      
      return { deletedCount: result.count };

    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Get password reset statistics
   */
  static async getResetStatistics(): Promise<{
    pendingTokens: number;
    expiredTokens: number;
    usedTokens: number;
    totalRequestsToday: number;
  }> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const pendingTokens = await prisma.emailVerificationToken.count({
        where: {
          expiresAt: { gt: now },
          usedAt: null
        }
      });

      const expiredTokens = await prisma.emailVerificationToken.count({
        where: {
          expiresAt: { lte: now },
          usedAt: null
        }
      });

      const usedTokens = await prisma.emailVerificationToken.count({
        where: {
          usedAt: { not: null }
        }
      });

      const totalRequestsToday = await prisma.emailVerificationToken.count({
        where: {
          createdAt: { gte: todayStart }
        }
      });

      return {
        pendingTokens,
        expiredTokens,
        usedTokens,
        totalRequestsToday
      };

    } catch (error) {
      console.error('Error getting reset statistics:', error);
      return {
        pendingTokens: 0,
        expiredTokens: 0,
        usedTokens: 0,
        totalRequestsToday: 0
      };
    }
  }
}

export default PasswordResetService;