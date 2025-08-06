import { body, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  optional?: boolean;
  mustBePast?: boolean;
  isUrl?: boolean;
  isEmail?: boolean;
  custom?: (value: any) => boolean | Promise<boolean>;
}

export interface ProfileValidationRules {
  fullName: ValidationRule;
  mobileNumber: ValidationRule;
  bio: ValidationRule;
  website: ValidationRule;
  dateOfBirth: ValidationRule;
  gender: ValidationRule;
  nationality: ValidationRule;
  occupation: ValidationRule;
  location: ValidationRule;
  profileVisibility: ValidationRule;
  showEmail: ValidationRule;
  showPhone: ValidationRule;
  allowGoogleSync: ValidationRule;
}

// Profile validation rules configuration
export const profileValidationRules: ProfileValidationRules = {
  fullName: { 
    required: true, 
    minLength: 2, 
    maxLength: 100, 
    pattern: /^[a-zA-Z\s]+$/ 
  },
  mobileNumber: { 
    optional: true, 
    pattern: /^\+[1-9]\d{1,14}$/ 
  },
  bio: { 
    optional: true, 
    maxLength: 500 
  },
  website: { 
    optional: true, 
    isUrl: true 
  },
  dateOfBirth: { 
    optional: true, 
    mustBePast: true 
  },
  gender: { 
    optional: true, 
    maxLength: 50 
  },
  nationality: { 
    optional: true, 
    maxLength: 100 
  },
  occupation: { 
    optional: true, 
    maxLength: 200 
  },
  location: { 
    optional: true, 
    minLength: 2, 
    maxLength: 100 
  },
  profileVisibility: { 
    required: true, 
    pattern: /^(PUBLIC|PRIVATE|FRIENDS)$/ 
  },
  showEmail: { 
    required: true 
  },
  showPhone: { 
    required: true 
  },
  allowGoogleSync: { 
    required: true 
  }
};

export class ProfileValidator {
  /**
   * Validate profile update data
   */
  static validateProfileUpdate = [
    body('fullName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Full name can only contain letters and spaces'),
    
    body('mobileNumber')
      .optional()
      .matches(/^\+[1-9]\d{1,14}$/)
      .withMessage('Mobile number must be in international format (+1234567890)'),
    
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters')
      .trim()
      .escape(),
    
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date')
      .custom((value) => {
        if (value && new Date(value) >= new Date()) {
          throw new Error('Date of birth must be in the past');
        }
        return true;
      }),
    
    body('gender')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Gender must be a string with maximum 50 characters')
      .trim()
      .escape(),
    
    body('nationality')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Nationality must be a string with maximum 100 characters')
      .trim()
      .escape(),
    
    body('occupation')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Occupation must be a string with maximum 200 characters')
      .trim()
      .escape(),
    
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL')
      .custom((value) => {
        if (value && !value.match(/^https?:\/\//)) {
          throw new Error('Website must start with http:// or https://');
        }
        return true;
      }),
    
    body('location')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Location must be between 2 and 100 characters')
      .trim()
      .escape()
  ];

  /**
   * Validate privacy settings
   */
  static validatePrivacySettings = [
    body('profileVisibility')
      .isIn(['PUBLIC', 'PRIVATE', 'FRIENDS'])
      .withMessage('Profile visibility must be PUBLIC, PRIVATE, or FRIENDS'),
    
    body('showEmail')
      .isBoolean()
      .withMessage('showEmail must be a boolean value'),
    
    body('showPhone')
      .isBoolean()
      .withMessage('showPhone must be a boolean value'),
    
    body('allowGoogleSync')
      .isBoolean()
      .withMessage('allowGoogleSync must be a boolean value')
  ];

  /**
   * Validate Google connection
   */
  static validateGoogleConnection = [
    body('googleToken')
      .notEmpty()
      .withMessage('Google token is required')
      .isString()
      .withMessage('Google token must be a string')
      .isLength({ min: 10 })
      .withMessage('Google token must be at least 10 characters')
  ];

  /**
   * Validate user ID parameter
   */
  static validateUserId = [
    param('userId')
      .isString()
      .withMessage('User ID must be a string')
      .isLength({ min: 1 })
      .withMessage('User ID is required')
  ];

  /**
   * Custom validation for profile data
   */
  static validateProfileData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate full name if provided
    if (data.fullName !== undefined) {
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters');
      } else if (data.fullName.trim().length > 100) {
        errors.push('Full name must be less than 100 characters');
      } else if (!/^[a-zA-Z\s]+$/.test(data.fullName.trim())) {
        errors.push('Full name can only contain letters and spaces');
      }
    }

    // Validate mobile number if provided
    if (data.mobileNumber !== undefined && data.mobileNumber) {
      if (!/^\+[1-9]\d{1,14}$/.test(data.mobileNumber)) {
        errors.push('Mobile number must be in international format (+1234567890)');
      }
    }

    // Validate bio if provided
    if (data.bio !== undefined && data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    // Validate website if provided
    if (data.website !== undefined && data.website) {
      try {
        const url = new URL(data.website);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          errors.push('Website must be a valid URL');
        }
      } catch {
        errors.push('Website must be a valid URL');
      }
    }

    // Validate location if provided
    if (data.location !== undefined && data.location) {
      if (data.location.length < 2 || data.location.length > 100) {
        errors.push('Location must be between 2 and 100 characters');
      }
    }

    // Validate date of birth if provided
    if (data.dateOfBirth !== undefined && data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        errors.push('Date of birth must be a valid date');
      } else if (birthDate >= new Date()) {
        errors.push('Date of birth must be in the past');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Check if user can safely disconnect Google account
   */
  static canDisconnectGoogle = async (userId: string): Promise<{ canDisconnect: boolean; reason?: string }> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, googleId: true }
      });

      if (!user) {
        return { canDisconnect: false, reason: 'User not found' };
      }

      if (!user.googleId) {
        return { canDisconnect: false, reason: 'No Google account connected' };
      }

      if (!user.password) {
        return { canDisconnect: false, reason: 'Cannot disconnect Google account without password set' };
      }

      return { canDisconnect: true };
    } catch (error) {
      console.error('Error checking Google disconnection safety:', error);
      return { canDisconnect: false, reason: 'Database error' };
    }
  };

  /**
   * Validate profile picture source
   */
  static validateProfilePictureSource = (source: string): boolean => {
    const validSources = ['UPLOAD', 'GOOGLE', 'DEFAULT'];
    return validSources.includes(source);
  };

  /**
   * Sanitize profile data
   */
  static sanitizeProfileData = (data: any): any => {
    const sanitized: any = {};

    if (data.fullName !== undefined) {
      sanitized.fullName = data.fullName.trim();
    }
    if (data.mobileNumber !== undefined) {
      sanitized.mobileNumber = data.mobileNumber.trim();
    }
    if (data.bio !== undefined) {
      sanitized.bio = data.bio.trim();
    }
    if (data.gender !== undefined) {
      sanitized.gender = data.gender.trim();
    }
    if (data.nationality !== undefined) {
      sanitized.nationality = data.nationality.trim();
    }
    if (data.occupation !== undefined) {
      sanitized.occupation = data.occupation.trim();
    }
    if (data.website !== undefined) {
      sanitized.website = data.website.trim();
    }
    if (data.location !== undefined) {
      sanitized.location = data.location.trim();
    }
    if (data.dateOfBirth !== undefined) {
      sanitized.dateOfBirth = data.dateOfBirth;
    }

    return sanitized;
  };
}

export default ProfileValidator;
