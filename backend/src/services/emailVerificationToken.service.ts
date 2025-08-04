import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface EmailVerificationTokenData {
  id: string;
  userId: string;
  token: string;
  email: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface CreateTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface ValidateTokenResult {
  success: boolean;
  tokenData?: EmailVerificationTokenData;
  error?: string;
  code?: string;
}

export class EmailVerificationTokenService {
  private static readonly TOKEN_EXPIRY_HOURS = 24;
  private static readonly TOKEN_LENGTH = 32; // 32 bytes = 64 hex characters

  /**
   * Generate crypto-secure random token
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Create email verification token for user
   * Invalidates any existing tokens for the same user/email combination
   */
  static async createToken(userId: string, email: string): Promise<CreateTokenResult> {
    try {
      // Generate secure token
      const token = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

      // Start transaction to invalidate old tokens and create new one
      const result = await prisma.$transaction(async (tx) => {
        // Delete any existing unused tokens for this user/email
        await tx.emailVerificationToken.deleteMany({
          where: {
            userId,
            email,
            usedAt: null,
          },
        });

        // Create new token
        const tokenRecord = await tx.emailVerificationToken.create({
          data: {
            userId,
            token,
            email,
            expiresAt,
          },
        });

        return tokenRecord.token;
      });

      return {
        success: true,
        token: result,
      };
    } catch (error) {
      console.error('Error creating email verification token:', error);
      return {
        success: false,
        error: 'Failed to create verification token',
      };
    }
  }

  /**
   * Validate email verification token
   * Checks if token exists, is not expired, and is not already used
   */
  static async validateToken(token: string, email: string): Promise<ValidateTokenResult> {
    try {
      // Find token with user relation
      const tokenRecord = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!tokenRecord) {
        return {
          success: false,
          error: 'Invalid verification token',
          code: 'VERIFICATION_TOKEN_INVALID',
        };
      }

      // Check if token is for the correct email
      if (tokenRecord.email !== email) {
        return {
          success: false,
          error: 'Token does not match email address',
          code: 'VERIFICATION_TOKEN_INVALID',
        };
      }

      // Check if token is already used
      if (tokenRecord.usedAt) {
        return {
          success: false,
          error: 'Verification token has already been used',
          code: 'VERIFICATION_TOKEN_USED',
        };
      }

      // Check if token is expired
      const now = new Date();
      if (tokenRecord.expiresAt < now) {
        return {
          success: false,
          error: 'Verification token has expired',
          code: 'VERIFICATION_TOKEN_EXPIRED',
        };
      }

      return {
        success: true,
        tokenData: {
          id: tokenRecord.id,
          userId: tokenRecord.userId,
          token: tokenRecord.token,
          email: tokenRecord.email,
          expiresAt: tokenRecord.expiresAt,
          usedAt: tokenRecord.usedAt,
          createdAt: tokenRecord.createdAt,
        },
      };
    } catch (error) {
      console.error('Error validating email verification token:', error);
      return {
        success: false,
        error: 'Failed to validate verification token',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Mark token as used
   */
  static async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      await prisma.emailVerificationToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('Error marking token as used:', error);
      return false;
    }
  }

  /**
   * Get active token for user/email (for testing purposes)
   */
  static async getActiveToken(userId: string, email: string): Promise<EmailVerificationTokenData | null> {
    try {
      const tokenRecord = await prisma.emailVerificationToken.findFirst({
        where: {
          userId,
          email,
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!tokenRecord) {
        return null;
      }

      return {
        id: tokenRecord.id,
        userId: tokenRecord.userId,
        token: tokenRecord.token,
        email: tokenRecord.email,
        expiresAt: tokenRecord.expiresAt,
        usedAt: tokenRecord.usedAt,
        createdAt: tokenRecord.createdAt,
      };
    } catch (error) {
      console.error('Error getting active token:', error);
      return null;
    }
  }

  /**
   * Clean up expired tokens (utility method)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.emailVerificationToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}

export default EmailVerificationTokenService;