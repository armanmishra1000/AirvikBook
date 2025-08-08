import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserRegistrationService, UserRegistrationData } from '../services/userRegistration.service';
import bcrypt from 'bcryptjs';

// Mock the shared prisma instance
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    emailVerificationToken: {
      create: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock EmailVerificationTokenService
jest.mock('../services/emailVerificationToken.service', () => ({
  EmailVerificationTokenService: {
    createToken: jest.fn(),
    deleteTokensForEmail: jest.fn()
  }
}));

const mockPrisma = require('../lib/prisma').default;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockEmailVerificationTokenService = require('../services/emailVerificationToken.service').EmailVerificationTokenService;

describe('UserRegistrationService', () => {
  const validUserData: UserRegistrationData = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    fullName: 'John Doe',
    mobileNumber: '+1234567890',
    acceptedTerms: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'test-user-id',
      email: validUserData.email,
      fullName: validUserData.fullName,
      mobileNumber: validUserData.mobileNumber,
      isEmailVerified: false,
      role: 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      email: validUserData.email,
      fullName: validUserData.fullName,
      mobileNumber: validUserData.mobileNumber,
      isEmailVerified: false,
      role: 'GUEST',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockPrisma.user.update.mockResolvedValue({
      id: 'test-user-id',
      email: validUserData.email,
      fullName: validUserData.fullName,
      mobileNumber: validUserData.mobileNumber,
      isEmailVerified: true,
      role: 'GUEST',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockPrisma.user.count.mockResolvedValue(10);
    mockPrisma.emailVerificationToken.create.mockResolvedValue({
      id: 'test-token-id',
      email: validUserData.email,
      token: 'test-verification-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date()
    });
    mockPrisma.emailVerificationToken.deleteMany.mockResolvedValue({ count: 1 });
    
    mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
    mockBcrypt.compare.mockResolvedValue(true as never);
    
    mockEmailVerificationTokenService.createToken.mockResolvedValue({
      success: true,
      token: 'test-verification-token'
    });
    mockEmailVerificationTokenService.deleteTokensForEmail.mockResolvedValue(true);
  });

  describe('validateRegistrationData', () => {
    it('should validate correct user data', () => {
      const result = UserRegistrationService.validateRegistrationData(validUserData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email formats', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      const result = UserRegistrationService.validateRegistrationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject disposable email addresses', () => {
      const invalidData = { ...validUserData, email: 'test@10minutemail.com' };
      const result = UserRegistrationService.validateRegistrationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Disposable email addresses are not allowed');
    });

    it('should reject weak passwords', () => {
      const invalidData = { ...validUserData, password: 'weak' };
      const result = UserRegistrationService.validateRegistrationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    });

    it('should reject invalid full names', () => {
      const invalidData = { ...validUserData, fullName: 'A' };
      const result = UserRegistrationService.validateRegistrationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Full name must be 2-100 characters, letters, spaces, hyphens, and apostrophes only');
    });

    it('should reject invalid mobile numbers', () => {
      const invalidData = { ...validUserData, mobileNumber: '123' };
      const result = UserRegistrationService.validateRegistrationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mobile number must be in international format (+1234567890)');
    });

    it('should reject when terms not accepted', () => {
      const invalidData = { ...validUserData, acceptedTerms: false };
      const result = UserRegistrationService.validateRegistrationData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Terms and conditions must be accepted');
    });
  });

  describe('checkEmailExists', () => {
    it('should return false for non-existent email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      
      const exists = await UserRegistrationService.checkEmailExists('nonexistent@example.com');
      expect(exists).toBe(false);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'nonexistent@example.com', mode: 'insensitive' } }
      });
    });

    it('should return true for existing email (case insensitive)', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com'
      });
      
      const exists = await UserRegistrationService.checkEmailExists('TEST@EXAMPLE.COM');
      expect(exists).toBe(true);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'TEST@EXAMPLE.COM', mode: 'insensitive' } }
      });
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const result = await UserRegistrationService.registerUser(validUserData);
      

      expect(result.success).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.user?.email).toBe(validUserData.email);
      expect(result.user?.fullName).toBe(validUserData.fullName);
      expect(result.user?.isEmailVerified).toBe(false);
      expect(result.user?.role).toBe('GUEST');
      expect(result.verificationToken).toBeTruthy();
      expect(result.user).not.toHaveProperty('password'); // Password should not be returned
      
      expect(mockBcrypt.hash).toHaveBeenCalledWith(validUserData.password, 12);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockEmailVerificationTokenService.createToken).toHaveBeenCalledWith('test-user-id', validUserData.email);
    });

    it('should reject duplicate email registration', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: validUserData.email
      });
      
      const result = await UserRegistrationService.registerUser(validUserData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
      expect(result.code).toBe('EMAIL_EXISTS');
    });

    it('should reject invalid data', async () => {
      const invalidData = { ...validUserData, email: 'invalid' };
      const result = await UserRegistrationService.registerUser(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should handle optional mobile number', async () => {
      const dataWithoutMobile = { 
        email: 'nomobile@example.com',
        password: validUserData.password,
        fullName: validUserData.fullName,
        acceptedTerms: validUserData.acceptedTerms
      };
      
      mockPrisma.user.create.mockResolvedValue({
        id: 'test-user-id',
        email: dataWithoutMobile.email,
        fullName: dataWithoutMobile.fullName,
        mobileNumber: null,
        isEmailVerified: false,
        role: 'GUEST',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const result = await UserRegistrationService.registerUser(dataWithoutMobile);
      
      expect(result.success).toBe(true);
      expect(result.user?.mobileNumber).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user for existing email', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: validUserData.email,
        fullName: validUserData.fullName,
        mobileNumber: validUserData.mobileNumber,
        isEmailVerified: false,
        role: 'GUEST',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      
      const user = await UserRegistrationService.getUserByEmail(validUserData.email);
      
      expect(user).toBeTruthy();
      expect(user?.email).toBe(validUserData.email);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: validUserData.email,
            mode: 'insensitive'
          }
        }
      });
    });

    it('should return null for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      const user = await UserRegistrationService.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('markEmailAsVerified', () => {
    it('should mark user email as verified', async () => {
      const success = await UserRegistrationService.markEmailAsVerified('test-user-id');
      expect(success).toBe(true);
      
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { isEmailVerified: true }
      });
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const isValid = await UserRegistrationService.verifyPassword(
        validUserData.password,
        'hashed-password'
      );
      expect(isValid).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(validUserData.password, 'hashed-password');
    });

    it('should reject incorrect password', async () => {
      mockBcrypt.compare.mockResolvedValue(false as never);
      
      const isValid = await UserRegistrationService.verifyPassword(
        'wrongpassword',
        'hashed-password'
      );
      expect(isValid).toBe(false);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(7)  // verified
        .mockResolvedValueOnce(3)  // unverified
        .mockResolvedValueOnce(5); // guests
      
      const stats = await UserRegistrationService.getUserStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('verified');
      expect(stats).toHaveProperty('unverified');
      expect(stats).toHaveProperty('guests');
      expect(typeof stats.total).toBe('number');
      expect(stats.total).toBe(10);
      expect(stats.verified).toBe(7);
      expect(stats.unverified).toBe(3);
      expect(stats.guests).toBe(5);
    });
  });
});