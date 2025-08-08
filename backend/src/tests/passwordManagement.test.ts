// Mock dependencies first
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
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
  }
}));
jest.mock('bcrypt');

// Mock email service
const mockEmailService = {
  sendEmail: jest.fn()
};

jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => mockEmailService)
}));

// Mock session management service
jest.mock('../services/auth/sessionManagement.service', () => ({
  SessionManagementService: {
    invalidateAllUserSessions: jest.fn(),
    updateSessionActivity: jest.fn()
  }
}));

import { PasswordManagementService } from '../services/auth/passwordManagement.service';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('PasswordManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset static rate limiting maps
    (PasswordManagementService as any).passwordChangeAttempts = new Map();
  });

  describe('getPasswordStatus', () => {
    it('should return status for email-only account', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedpassword',
        googleId: null,
        updatedAt: new Date(),
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.getPasswordStatus('user123');

      expect(result.success).toBe(true);
      expect(result.data?.hasPassword).toBe(true);
      expect(result.data?.hasGoogleAuth).toBe(false);
      expect(result.data?.accountType).toBe('EMAIL_ONLY');
      expect(result.data?.authMethods).toEqual(['EMAIL']);
    }  );

    it('should return status for Google-only account', async () => {
      const mockUser = {
        email: 'test@gmail.com',
        password: null,
        googleId: 'google123',
        updatedAt: new Date(),
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.getPasswordStatus('user123');

      expect(result.success).toBe(true);
      expect(result.data?.hasPassword).toBe(false);
      expect(result.data?.hasGoogleAuth).toBe(true);
      expect(result.data?.accountType).toBe('GOOGLE_ONLY');
      expect(result.data?.authMethods).toEqual(['GOOGLE']);
    });

    it('should return status for mixed account', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedpassword',
        googleId: 'google123',
        updatedAt: new Date(),
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.getPasswordStatus('user123');

      expect(result.success).toBe(true);
      expect(result.data?.hasPassword).toBe(true);
      expect(result.data?.hasGoogleAuth).toBe(true);
      expect(result.data?.accountType).toBe('MIXED');
      expect(result.data?.authMethods).toEqual(['EMAIL', 'GOOGLE']);
    });
  });

  describe('validateCurrentPassword', () => {
    it('should validate correct password', async () => {
      const mockUser = {
        password: 'hashedpassword'
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await PasswordManagementService.validateCurrentPassword('user123', 'correctpassword');

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
    });

    it('should reject incorrect password', async () => {
      const mockUser = {
        password: 'hashedpassword'
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await PasswordManagementService.validateCurrentPassword('user123', 'wrongpassword');

      expect(result).toBe(false);
    });

    it('should return false for user without password', async () => {
      const mockUser = {
        password: null
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.validateCurrentPassword('user123', 'anypassword');

      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password for email account', async () => {
      const changeRequest = {
        currentPassword: 'oldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
        invalidateOtherSessions: true
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedoldpassword',
        fullName: 'Test User',
        isActive: true
      };

      const mockUpdatedUser = {
        email: 'test@example.com',
        updatedAt: new Date()
      };

      const mockSessions = [
        { id: 'session1', userId: 'user123', isActive: true },
        { id: 'session2', userId: 'user123', isActive: true }
      ];

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      (mockPrisma.passwordHistory.findMany as jest.Mock).mockResolvedValue([]);
      mockBcrypt.hash.mockResolvedValue('hashednewpassword' as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (mockPrisma.passwordHistory.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.session.findMany as jest.Mock).mockResolvedValue(mockSessions);
      (mockPrisma.session.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (mockPrisma.session.update as jest.Mock).mockResolvedValue({});
      mockEmailService.sendEmail.mockResolvedValue({ success: true });

      const result = await PasswordManagementService.changePassword('user123', 'session2', changeRequest);

      expect(result.success).toBe(true);
      expect(result.data?.passwordChanged).toBe(true);
      expect(result.data?.sessionActions.otherSessionsInvalidated).toBe(true);
      expect(result.data?.sessionActions.sessionsInvalidated).toBe(1);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
    });

    it('should reject incorrect current password', async () => {
      const changeRequest = {
        currentPassword: 'wrongPassword',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedoldpassword',
        fullName: 'Test User',
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await PasswordManagementService.changePassword('user123', 'session1', changeRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should reject mismatched new passwords', async () => {
      const changeRequest = {
        currentPassword: 'oldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!'
      };

      const result = await PasswordManagementService.changePassword('user123', 'session1', changeRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('PASSWORD_MISMATCH');
    });

    it('should enforce rate limiting', async () => {
      const changeRequest = {
        currentPassword: 'oldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      // Simulate 5 attempts already made
      const attempts = new Map();
      attempts.set('user123', { 
        count: 5, 
        resetTime: Date.now() + 15 * 60 * 1000 
      });
      (PasswordManagementService as any).passwordChangeAttempts = attempts;

      const result = await PasswordManagementService.changePassword('user123', 'session1', changeRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('setPasswordForGoogleUser', () => {
    it('should successfully set password for Google-only user', async () => {
      const setRequest = {
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const mockUser = {
        id: 'user123',
        email: 'test@gmail.com',
        password: null,
        googleId: 'google123',
        fullName: 'Test User',
        isActive: true
      };

      const mockUpdatedUser = {
        email: 'test@gmail.com',
        password: 'hashednewpassword',
        googleId: 'google123',
        updatedAt: new Date()
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('hashednewpassword' as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (mockPrisma.passwordHistory.create as jest.Mock).mockResolvedValue({});
      mockEmailService.sendEmail.mockResolvedValue({ success: true });

      const result = await PasswordManagementService.setPasswordForGoogleUser('user123', setRequest);

      expect(result.success).toBe(true);
      expect(result.data?.passwordSet).toBe(true);
      expect(result.data?.user.hasPassword).toBe(true);
      expect(result.data?.user.hasGoogleAuth).toBe(true);
      expect(result.data?.user.authMethods).toEqual(['EMAIL', 'GOOGLE']);
    });

    it('should reject setting password for account that already has one', async () => {
      const setRequest = {
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'existingpassword',
        googleId: 'google123',
        fullName: 'Test User',
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.setPasswordForGoogleUser('user123', setRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('PASSWORD_ALREADY_EXISTS');
    });

    it('should reject setting password for account without Google authentication', async () => {
      const setRequest = {
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: null,
        googleId: null,
        fullName: 'Test User',
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.setPasswordForGoogleUser('user123', setRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('GOOGLE_ACCOUNT_REQUIRED');
    });
  });

  describe('removePassword', () => {
    it('should successfully remove password from mixed account', async () => {
      const removeRequest = {
        currentPassword: 'currentPassword123!',
        confirmGoogleOnly: true
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        googleId: 'google123',
        fullName: 'Test User',
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({});
      mockEmailService.sendEmail.mockResolvedValue({ success: true });

      const result = await PasswordManagementService.removePassword('user123', removeRequest);

      expect(result.success).toBe(true);
      expect(result.data?.passwordRemoved).toBe(true);
      expect(result.data?.user.hasPassword).toBe(false);
      expect(result.data?.user.hasGoogleAuth).toBe(true);
      expect(result.data?.user.authMethods).toEqual(['GOOGLE']);
    });

    it('should reject removing password without confirmation', async () => {
      const removeRequest = {
        currentPassword: 'currentPassword123!',
        confirmGoogleOnly: false
      };

      const result = await PasswordManagementService.removePassword('user123', removeRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('CONFIRMATION_REQUIRED');
    });

    it('should reject removing password from account without Google auth', async () => {
      const removeRequest = {
        currentPassword: 'currentPassword123!',
        confirmGoogleOnly: true
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        googleId: null,
        fullName: 'Test User',
        isActive: true
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await PasswordManagementService.removePassword('user123', removeRequest);

      expect(result.success).toBe(false);
      expect(result.code).toBe('GOOGLE_AUTH_REQUIRED');
    });
  });

  describe('cleanupPasswordHistory', () => {
    it('should clean up old password history entries', async () => {
      (mockPrisma.passwordHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });

      const result = await PasswordManagementService.cleanupPasswordHistory(90);

      expect(result.deletedCount).toBe(10);
      expect(mockPrisma.passwordHistory.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date)
          }
        }
      });
    });
  });
});
