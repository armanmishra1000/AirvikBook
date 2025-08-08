import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { EmailVerificationTokenService } from './emailVerificationToken.service';
import prisma from '../lib/prisma';

export interface UserRegistrationData {
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  acceptedTerms: boolean;
}

export interface RegistrationResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  error?: string;
  code?: string;
  verificationToken?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class UserRegistrationService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Validate email format using RFC 5322 compliant regex
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requirements: 8+ chars, uppercase, lowercase, number, special char
   */
  private static validatePassword(password: string): boolean {
    if (password.length < 8) return false;
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }

  /**
   * Validate full name format
   * Requirements: 2-100 chars, letters, spaces, hyphens, apostrophes only
   */
  private static validateFullName(fullName: string): boolean {
    if (fullName.length < 2 || fullName.length > 100) return false;
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(fullName.trim());
  }

  /**
   * Validate mobile number (international format)
   */
  private static validateMobileNumber(mobileNumber?: string): boolean {
    if (!mobileNumber) return true; // Optional field
    // International format: +1234567890 (7-15 digits)
    const mobileRegex = /^\+[1-9]\d{6,14}$/;
    return mobileRegex.test(mobileNumber);
  }

  /**
   * Check if email is disposable/temporary
   */
  private static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }

  /**
   * Comprehensive input validation
   */
  static validateRegistrationData(data: UserRegistrationData): ValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    } else if (this.isDisposableEmail(data.email)) {
      errors.push('Disposable email addresses are not allowed');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else if (!this.validatePassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    // Full name validation
    if (!data.fullName) {
      errors.push('Full name is required');
    } else if (!this.validateFullName(data.fullName)) {
      errors.push('Full name must be 2-100 characters, letters, spaces, hyphens, and apostrophes only');
    }

    // Mobile number validation
    if (data.mobileNumber && !this.validateMobileNumber(data.mobileNumber)) {
      errors.push('Mobile number must be in international format (+1234567890)');
    }

    // Terms acceptance validation
    if (!data.acceptedTerms) {
      errors.push('Terms and conditions must be accepted');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if email already exists (case-insensitive)
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      });
      return !!existingUser;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email availability');
    }
  }

  /**
   * Hash password with bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Register new user with email verification
   */
  static async registerUser(data: UserRegistrationData): Promise<RegistrationResult> {
    try {
      // Validate input data
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Check if email already exists
      const emailExists = await this.checkEmailExists(data.email);
      if (emailExists) {
        return {
          success: false,
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          fullName: data.fullName.trim(),
          mobileNumber: data.mobileNumber?.trim() || null,
          role: 'GUEST',
          isEmailVerified: false,
          isActive: true
        }
      });

      // Generate email verification token
      const tokenResult = await EmailVerificationTokenService.createToken(
        newUser.id,
        newUser.email
      );

      if (!tokenResult.success) {
        // Rollback user creation if token generation fails
        await prisma.user.delete({ where: { id: newUser.id } });
        return {
          success: false,
          error: 'Failed to generate verification token',
          code: 'TOKEN_GENERATION_ERROR'
        };
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        user: userWithoutPassword,
        verificationToken: tokenResult.token
      };

    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        error: 'Internal server error during registration',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Get user by email (for login/verification purposes)
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      });
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Update user email verification status
   */
  static async markEmailAsVerified(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as verified:', error);
      return false;
    }
  }

  /**
   * Get user statistics (for testing/admin purposes)
   */
  static async getUserStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    guests: number;
  }> {
    try {
      const [total, verified, unverified, guests] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isEmailVerified: true } }),
        prisma.user.count({ where: { isEmailVerified: false } }),
        prisma.user.count({ where: { role: 'GUEST' } })
      ]);

      return { total, verified, unverified, guests };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { total: 0, verified: 0, unverified: 0, guests: 0 };
    }
  }

  /**
   * Verify password for login (utility method)
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }
}

export default UserRegistrationService;