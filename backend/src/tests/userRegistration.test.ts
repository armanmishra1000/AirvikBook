import { PrismaClient } from '@prisma/client';
import { UserRegistrationService, UserRegistrationData } from '../services/userRegistration.service';

const prisma = new PrismaClient();

describe('UserRegistrationService', () => {
  const validUserData: UserRegistrationData = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    fullName: 'John Doe',
    mobileNumber: '+1234567890',
    acceptedTerms: true
  };

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.emailVerificationToken.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.emailVerificationToken.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
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
      const exists = await UserRegistrationService.checkEmailExists('nonexistent@example.com');
      expect(exists).toBe(false);
    });

    it('should return true for existing email (case insensitive)', async () => {
      // First create a user
      await UserRegistrationService.registerUser(validUserData);
      
      // Check with different case
      const exists = await UserRegistrationService.checkEmailExists('TEST@EXAMPLE.COM');
      expect(exists).toBe(true);
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
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      await UserRegistrationService.registerUser(validUserData);
      
      // Try to register again with same email
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
      
      const result = await UserRegistrationService.registerUser(dataWithoutMobile);
      
      expect(result.success).toBe(true);
      expect(result.user?.mobileNumber).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user for existing email', async () => {
      await UserRegistrationService.registerUser(validUserData);
      
      const user = await UserRegistrationService.getUserByEmail(validUserData.email);
      
      expect(user).toBeTruthy();
      expect(user?.email).toBe(validUserData.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await UserRegistrationService.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('markEmailAsVerified', () => {
    it('should mark user email as verified', async () => {
      const registrationResult = await UserRegistrationService.registerUser(validUserData);
      expect(registrationResult.success).toBe(true);
      
      const success = await UserRegistrationService.markEmailAsVerified(registrationResult.user!.id);
      expect(success).toBe(true);
      
      // Verify the update
      const user = await UserRegistrationService.getUserByEmail(validUserData.email);
      expect(user?.isEmailVerified).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const registrationResult = await UserRegistrationService.registerUser(validUserData);
      expect(registrationResult.success).toBe(true);
      
      const user = await UserRegistrationService.getUserByEmail(validUserData.email);
      expect(user).toBeTruthy();
      
      const isValid = await UserRegistrationService.verifyPassword(
        validUserData.password,
        user!.password!
      );
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const registrationResult = await UserRegistrationService.registerUser(validUserData);
      expect(registrationResult.success).toBe(true);
      
      const user = await UserRegistrationService.getUserByEmail(validUserData.email);
      expect(user).toBeTruthy();
      
      const isValid = await UserRegistrationService.verifyPassword(
        'wrongpassword',
        user!.password!
      );
      expect(isValid).toBe(false);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const stats = await UserRegistrationService.getUserStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('verified');
      expect(stats).toHaveProperty('unverified');
      expect(stats).toHaveProperty('guests');
      expect(typeof stats.total).toBe('number');
    });
  });
});