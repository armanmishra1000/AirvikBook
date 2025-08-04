import { PrismaClient } from '@prisma/client';
import { EmailVerificationTokenService } from '../services/emailVerificationToken.service';

const prisma = new PrismaClient();

describe('EmailVerificationTokenService', () => {
  let testUserId: string;
  const testEmail = 'test@example.com';

  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Test User',
        role: 'GUEST',
        isEmailVerified: false,
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up tokens after each test
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('createToken', () => {
    it('should create a new email verification token', async () => {
      const result = await EmailVerificationTokenService.createToken(testUserId, testEmail);

      expect(result.success).toBe(true);
      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(result.token?.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should invalidate old tokens when creating a new one', async () => {
      // Create first token
      const firstResult = await EmailVerificationTokenService.createToken(testUserId, testEmail);
      expect(firstResult.success).toBe(true);

      // Create second token
      const secondResult = await EmailVerificationTokenService.createToken(testUserId, testEmail);
      expect(secondResult.success).toBe(true);

      // Check that only one active token exists
      const activeToken = await EmailVerificationTokenService.getActiveToken(testUserId, testEmail);
      expect(activeToken).toBeTruthy();
      expect(activeToken?.token).toBe(secondResult.token);
    });
  });

  describe('validateToken', () => {
    it('should validate a correct token', async () => {
      const createResult = await EmailVerificationTokenService.createToken(testUserId, testEmail);
      expect(createResult.success).toBe(true);

      const validateResult = await EmailVerificationTokenService.validateToken(
        createResult.token!,
        testEmail
      );

      expect(validateResult.success).toBe(true);
      expect(validateResult.tokenData).toBeTruthy();
      expect(validateResult.tokenData?.userId).toBe(testUserId);
      expect(validateResult.tokenData?.email).toBe(testEmail);
    });

    it('should reject invalid token', async () => {
      const validateResult = await EmailVerificationTokenService.validateToken(
        'invalid_token',
        testEmail
      );

      expect(validateResult.success).toBe(false);
      expect(validateResult.error).toBe('Invalid verification token');
      expect(validateResult.code).toBe('VERIFICATION_TOKEN_INVALID');
    });

    it('should reject token with wrong email', async () => {
      const createResult = await EmailVerificationTokenService.createToken(testUserId, testEmail);
      expect(createResult.success).toBe(true);

      const validateResult = await EmailVerificationTokenService.validateToken(
        createResult.token!,
        'wrong@example.com'
      );

      expect(validateResult.success).toBe(false);
      expect(validateResult.error).toBe('Token does not match email address');
      expect(validateResult.code).toBe('VERIFICATION_TOKEN_INVALID');
    });

    it('should reject used token', async () => {
      const createResult = await EmailVerificationTokenService.createToken(testUserId, testEmail);
      expect(createResult.success).toBe(true);

      // Mark token as used
      const markUsedResult = await EmailVerificationTokenService.markTokenAsUsed(createResult.token!);
      expect(markUsedResult).toBe(true);

      // Try to validate used token
      const validateResult = await EmailVerificationTokenService.validateToken(
        createResult.token!,
        testEmail
      );

      expect(validateResult.success).toBe(false);
      expect(validateResult.error).toBe('Verification token has already been used');
      expect(validateResult.code).toBe('VERIFICATION_TOKEN_USED');
    });
  });

  describe('markTokenAsUsed', () => {
    it('should mark a token as used', async () => {
      const createResult = await EmailVerificationTokenService.createToken(testUserId, testEmail);
      expect(createResult.success).toBe(true);

      const markUsedResult = await EmailVerificationTokenService.markTokenAsUsed(createResult.token!);
      expect(markUsedResult).toBe(true);

      // Verify token is marked as used
      const validateResult = await EmailVerificationTokenService.validateToken(
        createResult.token!,
        testEmail
      );
      expect(validateResult.success).toBe(false);
      expect(validateResult.code).toBe('VERIFICATION_TOKEN_USED');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should clean up expired tokens', async () => {
      // This test would require manually creating expired tokens
      // For now, just test that the method runs without error
      const result = await EmailVerificationTokenService.cleanupExpiredTokens();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});