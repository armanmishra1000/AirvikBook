// Mock dependencies first
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    passwordResetToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    passwordHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn()
    },
    session: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn()
    }
  }))
}));
jest.mock('bcrypt');

// Mock email service
const mockEmailService = {
  sendPasswordResetEmail: jest.fn(),
  sendEmail: jest.fn()
};

jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => mockEmailService)
}));

// Mock session management service
jest.mock('../services/auth/sessionManagement.service', () => ({
  SessionManagementService: {
    invalidateAllUserSessions: jest.fn()
  }
}));

import { PasswordResetService } from '../services/auth/passwordReset.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('PasswordResetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset static rate limiting maps
    (PasswordResetService as any).forgotPasswordAttempts = new Map();
  });

  describe('generateResetToken', () => {
    it('should successfully generate reset token for valid email user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'hashedpassword',
        googleId: null,
        isActive: true
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockPrisma.passwordResetToken.create as jest.Mock).mockResolvedValue({
        id: 'token123',
        token: 'reset-token',
        userId: 'user123',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 3600000)
      });
      mockEmailService.sendPasswordResetEmail.mockResolvedValue({ success: true });

      const result = await PasswordResetService.generateResetToken({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.data?.emailSent).toBe(true);
      expect(result.data?.canResetPassword).toBe(true);
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        expect.any(String)
      );
    });

    it('should handle Google-only accounts appropriately', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@gmail.com',
        fullName: 'Test User',
        password: null,
        googleId: 'google123',
        isActive: true
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordResetService.generateResetToken({ email: 'test@gmail.com' });

      expect(result.success).toBe(true);
      expect(result.data?.emailSent).toBe(false);
      expect(result.data?.canResetPassword).toBe(false);
      expect(result.data?.accountType).toBe('GOOGLE_ONLY');
      expect(result.data?.alternativeAuth?.method).toBe('GOOGLE_OAUTH');
    });

    it('should return success for non-existent email (security)', async () => {
      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await PasswordResetService.generateResetToken({ email: 'nonexistent@example.com' });

      expect(result.success).toBe(true);
      expect(result.data?.emailSent).toBe(true);
      expect(result.data?.canResetPassword).toBe(true);
      expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('should enforce rate limiting', async () => {
      const email = 'test@example.com';

      // First request should succeed
      const mockUser = {
        id: 'user123',
        email,
        fullName: 'Test User',
        password: 'hashedpassword',
        googleId: null,
        isActive: true
      };

      (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockPrisma.passwordResetToken.create as jest.Mock).mockResolvedValue({});
      mockEmailService.sendPasswordResetEmail.mockResolvedValue({ success: true });

      const firstResult = await PasswordResetService.generateResetToken({ email });
      expect(firstResult.success).toBe(true);

      // Second request within window should be rate limited
      const secondResult = await PasswordResetService.generateResetToken({ email });
      expect(secondResult.success).toBe(false);
      expect(secondResult.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('validateResetToken', () => {
    it('should validate a valid reset token', async () => {
      const mockToken = {
        id: 'token123',
        token: 'valid-token',
        userId: 'user123',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        user: {
          id: 'user123',
          email: 'test@example.com',
          fullName: 'Test User',
          isActive: true,
          isEmailVerified: true
        }
      };

      (mockPrisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);

      const result = await PasswordResetService.validateResetToken('valid-token');

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
      expect(result.data?.user).toEqual(mockToken.user);
      expect(result.data?.timeRemaining).toBeGreaterThan(0);
    });

    it('should reject expired token', async () => {
      (mockPrisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await PasswordResetService.validateResetToken('expired-token');

      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_RESET_TOKEN');
    });

    it('should reject inactive user', async () => {
      const mockToken = {
        id: 'token123',
        token: 'valid-token',
        userId: 'user123',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        user: {
          id: 'user123',
          email: 'test@example.com',
          fullName: 'Test User',
          isActive: false,
          isEmailVerified: true
        }
      };

      (mockPrisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);

      const result = await PasswordResetService.validateResetToken('valid-token');

      expect(result.success).toBe(false);
      expect(result.code).toBe('ACCOUNT_DEACTIVATED');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token and password', async () => {
      const resetRequest = {
        token: 'valid-token',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const mockToken = {
        id: 'token123',
        token: 'valid-token',
        userId: 'user123',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        user: {
          id: 'user123',
          email: 'test@example.com',
          fullName: 'Test User',
          isActive: true,
          isEmailVerified: true
        }
      };

      const mockUpdatedUser = {
        id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User',
        updatedAt: new Date()
      };

      // Mock token validation
      (mockPrisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
      
      // Mock password history check
      (mockPrisma.passwordHistory.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock password hashing
      mockBcrypt.hash.mockResolvedValue('hashed-new-password' as never);
      
      // Mock user update
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      
      // Mock token marking as used
      (mockPrisma.passwordResetToken.update as jest.Mock).mockResolvedValue({});
      
      // Mock password history creation
      (mockPrisma.passwordHistory.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.passwordHistory.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock email sending
      mockEmailService.sendEmail.mockResolvedValue({ success: true });

      const result = await PasswordResetService.resetPassword(resetRequest);

      expect(result.success).toBe(true);
      expect(result.data?.passwordReset).toBe(true);
      expect(result.data?.sessionActions.allSessionsInvalidated).toBe(true);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(mockPrisma.passwordResetToken.update).toHaveBeenCalled();
    });

    it('should reject mismatched passwords', async () => {
      const resetRequest = {
        token: 'valid-token',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!'
      };

      const result = await PasswordResetService.resetPassword(resetRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('PASSWORD_MISMATCH');
    });

    it('should reject weak passwords', async () => {
      const resetRequest = {
        token: 'valid-token',
        newPassword: 'weak',
        confirmPassword: 'weak'
      };

      const result = await PasswordResetService.resetPassword(resetRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('PASSWORD_TOO_WEAK');
    });

    it('should reject reused passwords', async () => {
      const resetRequest = {
        token: 'valid-token',
        newPassword: 'ReusedPassword123!',
        confirmPassword: 'ReusedPassword123!'
      };

      const mockToken = {
        id: 'token123',
        token: 'valid-token',
        userId: 'user123',
        email: 'test@example.com',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        user: {
          id: 'user123',
          email: 'test@example.com',
          fullName: 'Test User',
          isActive: true,
          isEmailVerified: true
        }
      };

      const mockPasswordHistory = [
        { id: '1', userId: 'user123', passwordHash: 'old-hash-1', createdAt: new Date() }
      ];

      (mockPrisma.passwordResetToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
      (mockPrisma.passwordHistory.findMany as jest.Mock).mockResolvedValue(mockPasswordHistory);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await PasswordResetService.resetPassword(resetRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('PASSWORD_REUSED');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should clean up expired tokens and return count', async () => {
      (mockPrisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await PasswordResetService.cleanupExpiredTokens();

      expect(result.deletedCount).toBe(5);
      expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date)
          }
        }
      });
    });
  });

  describe('getResetStatistics', () => {
    it('should return reset statistics for given timeframe', async () => {
      (mockPrisma.passwordResetToken.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalRequests
        .mockResolvedValueOnce(7)  // successfulResets
        .mockResolvedValueOnce(2)  // expiredTokens
        .mockResolvedValueOnce(1); // activeTokens

      const result = await PasswordResetService.getResetStatistics('day');

      expect(result.totalRequests).toBe(10);
      expect(result.successfulResets).toBe(7);
      expect(result.expiredTokens).toBe(2);
      expect(result.activeTokens).toBe(1);
    });
  });
});
