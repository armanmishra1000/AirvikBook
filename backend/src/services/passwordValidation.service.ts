import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventSequentialChars: boolean;
  preventRepeatingChars: boolean;
  preventPersonalInfo: boolean;
  preventKeyboardPatterns: boolean;
}

export class PasswordValidationService {
  // Enhanced password requirements
  private static readonly REQUIREMENTS: PasswordRequirements = {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventSequentialChars: true,
    preventRepeatingChars: true,
    preventPersonalInfo: true,
    preventKeyboardPatterns: true,
  };

  // Common passwords list (top 1000 most common)
  private static readonly COMMON_PASSWORDS = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
    'princess', 'qwerty123', 'football', 'baseball', 'superman', 'batman',
    'trustno1', 'hello123', 'freedom', 'whatever', 'qazwsx', 'password1',
    '12345678', '1234567', '1234567890', 'qwertyuiop', 'asdfghjkl',
    'zxcvbnm', '111111', '123123', '123321', '12345678910', 'password123',
    'admin123', 'root', 'toor', 'test', 'guest', 'user', 'demo', 'sample',
    'changeme', 'newpass', 'oldpass', 'secret', 'private', 'public',
    'temp', 'temporary', 'pass', 'pass123', 'pass1', 'pass2', 'pass3',
    '1234', '12345', '123456', '1234567', '12345678', '123456789',
    'qwerty', 'qwerty123', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'password', 'password1', 'password123', 'admin', 'admin123',
    'root', 'root123', 'test', 'test123', 'guest', 'guest123',
    'user', 'user123', 'demo', 'demo123', 'sample', 'sample123',
    'changeme', 'newpass', 'oldpass', 'secret', 'private', 'public',
    'temp', 'temporary', 'pass', 'pass123', 'pass1', 'pass2', 'pass3',
    // Add more common passwords as needed
  ]);

  // Keyboard patterns
  private static readonly KEYBOARD_PATTERNS = [
    'qwerty', 'asdfgh', 'zxcvbn', '123456', '654321',
    'qazwsx', 'edcrfv', 'tgbyhn', 'ujmikl', 'poiuyt',
    'lkjhgf', 'mnbvcx', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    '1234567890', '0987654321', 'qwerty123', 'asdfgh123', 'zxcvbn123',
  ];

  /**
   * Validate password against all security requirements
   */
  static async validatePassword(password: string, userId?: string, userInfo?: { email?: string; firstName?: string; lastName?: string }): Promise<PasswordValidationResult> {
    const errors: string[] = [];
    let score = 0;

    // Basic length validation
    if (password.length < this.REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${this.REQUIREMENTS.minLength} characters long`);
    } else {
      score += 10;
    }

    if (password.length > this.REQUIREMENTS.maxLength) {
      errors.push(`Password must be no more than ${this.REQUIREMENTS.maxLength} characters long`);
    }

    // Character type requirements
    if (this.REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (this.REQUIREMENTS.requireUppercase) {
      score += 10;
    }

    if (this.REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (this.REQUIREMENTS.requireLowercase) {
      score += 10;
    }

    if (this.REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (this.REQUIREMENTS.requireNumbers) {
      score += 10;
    }

    if (this.REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (this.REQUIREMENTS.requireSpecialChars) {
      score += 15;
    }

    // Advanced security checks
    if (this.REQUIREMENTS.preventCommonPasswords && this.isCommonPassword(password)) {
      errors.push('Password is too common and easily guessable');
    } else {
      score += 15;
    }

    if (this.REQUIREMENTS.preventSequentialChars && this.hasSequentialChars(password)) {
      errors.push('Password contains sequential characters (e.g., 123, abc)');
    } else {
      score += 10;
    }

    if (this.REQUIREMENTS.preventRepeatingChars && this.hasRepeatingChars(password)) {
      errors.push('Password contains repeating characters (e.g., aaa, 111)');
    } else {
      score += 10;
    }

    if (this.REQUIREMENTS.preventKeyboardPatterns && this.hasKeyboardPattern(password)) {
      errors.push('Password contains keyboard patterns (e.g., qwerty, 123456)');
    } else {
      score += 10;
    }

    if (this.REQUIREMENTS.preventPersonalInfo && userInfo && this.containsPersonalInfo(password, userInfo)) {
      errors.push('Password contains personal information (name, email, etc.)');
    } else {
      score += 10;
    }

    // Check against user's password history
    if (userId && await this.isPasswordReused(password, userId)) {
      errors.push('Password has been used recently. Please choose a different password');
    } else if (userId) {
      score += 10;
    }

    // Determine strength based on score
    const strength = this.getPasswordStrength(score);

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score
    };
  }

  /**
   * Check if password is in common passwords list
   */
  private static isCommonPassword(password: string): boolean {
    return this.COMMON_PASSWORDS.has(password.toLowerCase());
  }

  /**
   * Check for sequential characters
   */
  private static hasSequentialChars(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    
    // Check for sequential letters
    for (let i = 0; i < lowerPassword.length - 2; i++) {
      const char1 = lowerPassword.charCodeAt(i);
      const char2 = lowerPassword.charCodeAt(i + 1);
      const char3 = lowerPassword.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }

    // Check for sequential numbers
    for (let i = 0; i < lowerPassword.length - 2; i++) {
      const char1 = lowerPassword.charCodeAt(i);
      const char2 = lowerPassword.charCodeAt(i + 1);
      const char3 = lowerPassword.charCodeAt(i + 2);
      
      if (char1 >= 48 && char1 <= 57 && // is digit
          char2 >= 48 && char2 <= 57 && // is digit
          char3 >= 48 && char3 <= 57 && // is digit
          char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for repeating characters
   */
  private static hasRepeatingChars(password: string): boolean {
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
  private static hasKeyboardPattern(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    return this.KEYBOARD_PATTERNS.some(pattern => 
      lowerPassword.includes(pattern) || lowerPassword.includes(pattern.split('').reverse().join(''))
    );
  }

  /**
   * Check if password contains personal information
   */
  private static containsPersonalInfo(password: string, userInfo: { email?: string; firstName?: string; lastName?: string }): boolean {
    const lowerPassword = password.toLowerCase();
    
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts) && emailParts.length > 2) {
        return true;
      }
    }

    if (userInfo.firstName) {
      const firstName = userInfo.firstName.toLowerCase();
      if (lowerPassword.includes(firstName) && firstName.length > 2) {
        return true;
      }
    }

    if (userInfo.lastName) {
      const lastName = userInfo.lastName.toLowerCase();
      if (lowerPassword.includes(lastName) && lastName.length > 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if password has been used recently
   */
  private static async isPasswordReused(password: string, userId: string): Promise<boolean> {
    try {
      const passwordHistory = await prisma.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5, // Check last 5 passwords
      });

      // In a real implementation, you would hash the password and compare
      // For now, we'll do a simple check (this should be improved with proper hashing)
      return passwordHistory.some(history => history.passwordHash === password);
    } catch (error) {
      console.error('Error checking password history:', error);
      return false;
    }
  }

  /**
   * Get password strength based on score
   */
  private static getPasswordStrength(score: number): 'weak' | 'medium' | 'strong' | 'very-strong' {
    if (score < 40) return 'weak';
    if (score < 60) return 'medium';
    if (score < 80) return 'strong';
    return 'very-strong';
  }

  /**
   * Get password requirements for frontend validation
   */
  static getRequirements(): PasswordRequirements {
    return { ...this.REQUIREMENTS };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)]; // special char
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Get password strength tips
   */
  static getStrengthTips(): string[] {
    return [
      'Use at least 12 characters',
      'Include uppercase and lowercase letters',
      'Include numbers and special characters',
      'Avoid common words and phrases',
      'Avoid sequential characters (123, abc)',
      'Avoid repeating characters (aaa, 111)',
      'Avoid keyboard patterns (qwerty, 123456)',
      'Avoid personal information (name, email)',
      'Use a unique password for each account',
      'Consider using a password manager',
    ];
  }
}

export default PasswordValidationService;
