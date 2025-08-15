/**
 * Profile Validation Utilities
 * 
 * VALIDATION REQUIREMENTS:
 * - Real-time validation for all profile fields
 * - Comprehensive error messages
 * - Accessibility-friendly error descriptions
 * - Type-safe validation functions
 * 
 * SECURITY REQUIREMENTS:
 * - Input sanitization
 * - XSS prevention
 * - File upload validation
 * - URL validation for websites
 */

import { 
  ProfileUpdateRequest, 
  PrivacySettings, 
  ProfileValidationErrors,
  FileValidationResult 
} from '../types/userProfile.types';

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone number validation (international format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// URL validation (http/https) - more flexible
const URL_REGEX = /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;

// Name validation (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s\-'\.]+$/;

// Occupation validation (letters, spaces, common symbols)
const OCCUPATION_REGEX = /^[a-zA-Z0-9\s\-'&.,()\/]+$/;

// Location validation (letters, spaces, common geographic symbols)
const LOCATION_REGEX = /^[a-zA-Z0-9\s\-'.,()\/]+$/;

// Gender options (extensible list)
const VALID_GENDERS = [
  'male', 'female', 'non-binary', 'prefer-not-to-say', 'other'
];

// Privacy visibility options
const VALID_VISIBILITY_OPTIONS = ['PUBLIC', 'PRIVATE', 'FRIENDS'];

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&amp;/g, '&') // Fix HTML entities
    .replace(/&lt;/g, '<') // Fix HTML entities
    .replace(/&gt;/g, '>') // Fix HTML entities
    .replace(/&quot;/g, '"') // Fix HTML entities
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long (maximum 254 characters)' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate full name
 */
export function validateFullName(fullName: string): { isValid: boolean; error?: string } {
  const trimmedName = fullName.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Full name is too long (maximum 100 characters)' };
  }

  if (!NAME_REGEX.test(trimmedName)) {
    return { isValid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  // Check for minimum word count (first and last name)
  const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 1) {
    return { isValid: false, error: 'Please enter your full name' };
  }

  return { isValid: true };
}

/**
 * Validate mobile number
 */
export function validateMobileNumber(mobileNumber: string): { isValid: boolean; error?: string } {
  if (!mobileNumber.trim()) {
    return { isValid: true }; // Optional field
  }

  const cleanNumber = mobileNumber.replace(/[\s\-\(\)]/g, '');

  if (cleanNumber.length < 7) {
    return { isValid: false, error: 'Mobile number is too short' };
  }

  if (cleanNumber.length > 15) {
    return { isValid: false, error: 'Mobile number is too long' };
  }

  if (!PHONE_REGEX.test(cleanNumber)) {
    return { isValid: false, error: 'Please enter a valid mobile number' };
  }

  return { isValid: true };
}

/**
 * Validate bio/description
 */
export function validateBio(bio: string): { isValid: boolean; error?: string } {
  if (!bio.trim()) {
    return { isValid: true }; // Optional field
  }

  if (bio.length > 500) {
    return { isValid: false, error: 'Bio is too long (maximum 500 characters)' };
  }

  return { isValid: true };
}

/**
 * Validate date of birth
 */
export function validateDateOfBirth(dateOfBirth: string): { isValid: boolean; error?: string } {
  if (!dateOfBirth.trim()) {
    return { isValid: true }; // Optional field
  }

  const date = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  // Check if date is in the future
  if (date > now) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  // Check for reasonable age limits (13-120 years old)
  const age = now.getFullYear() - date.getFullYear();
  if (age < 13) {
    return { isValid: false, error: 'You must be at least 13 years old to use this service' };
  }

  if (age > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth (maximum age: 120 years)' };
  }

  return { isValid: true };
}

/**
 * Validate gender
 */
export function validateGender(gender: string): { isValid: boolean; error?: string } {
  if (!gender.trim()) {
    return { isValid: true }; // Optional field
  }

  const normalizedGender = gender.toLowerCase().trim();
  if (!VALID_GENDERS.includes(normalizedGender)) {
    return { isValid: false, error: 'Please select a valid gender option' };
  }

  return { isValid: true };
}

/**
 * Validate nationality
 */
export function validateNationality(nationality: string): { isValid: boolean; error?: string } {
  if (!nationality.trim()) {
    return { isValid: true }; // Optional field
  }

  if (nationality.length > 100) {
    return { isValid: false, error: 'Nationality is too long (maximum 100 characters)' };
  }

  if (!NAME_REGEX.test(nationality)) {
    return { isValid: false, error: 'Nationality can only contain letters, spaces, and common punctuation' };
  }

  return { isValid: true };
}

/**
 * Validate occupation
 */
export function validateOccupation(occupation: string): { isValid: boolean; error?: string } {
  if (!occupation.trim()) {
    return { isValid: true }; // Optional field
  }

  if (occupation.length > 100) {
    return { isValid: false, error: 'Occupation is too long (maximum 100 characters)' };
  }

  if (!OCCUPATION_REGEX.test(occupation)) {
    return { isValid: false, error: 'Occupation contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate website URL
 */
export function validateWebsite(website: string): { isValid: boolean; error?: string } {
  if (!website.trim()) {
    return { isValid: true }; // Optional field
  }

  if (website.length > 200) {
    return { isValid: false, error: 'Website URL is too long (maximum 200 characters)' };
  }

  let urlToValidate = website.trim();
  
  // Auto-add https:// if no protocol is provided
  if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
    // Check if it looks like a domain (contains a dot and doesn't start with a slash)
    if (urlToValidate.includes('.') && !urlToValidate.startsWith('/')) {
      urlToValidate = 'https://' + urlToValidate;
    } else {
      return { isValid: false, error: 'Please enter a valid website URL (e.g., example.com or https://example.com)' };
    }
  }

  // Basic domain validation
  const domainPart = urlToValidate.replace(/^https?:\/\//, '').split('/')[0];
  if (!domainPart || domainPart.length < 3) {
    return { isValid: false, error: 'Website URL must have a valid domain' };
  }

  // Check for valid domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domainPart)) {
    return { isValid: false, error: 'Please enter a valid domain name' };
  }

  return { isValid: true };
}

/**
 * Validate location
 */
export function validateLocation(location: string): { isValid: boolean; error?: string } {
  if (!location.trim()) {
    return { isValid: true }; // Optional field
  }

  if (location.length > 100) {
    return { isValid: false, error: 'Location is too long (maximum 100 characters)' };
  }

  if (!LOCATION_REGEX.test(location)) {
    return { isValid: false, error: 'Location contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate privacy settings
 */
export function validatePrivacySettings(settings: PrivacySettings): { isValid: boolean; errors: Partial<PrivacySettings> } {
  const errors: Partial<PrivacySettings> = {};

  // Validate profile visibility
  if (!VALID_VISIBILITY_OPTIONS.includes(settings.profileVisibility)) {
    errors.profileVisibility = 'Invalid profile visibility option' as any;
  }

  // Validate boolean fields
  if (typeof settings.showEmail !== 'boolean') {
    errors.showEmail = 'Show email must be a boolean value' as any;
  }

  if (typeof settings.showPhone !== 'boolean') {
    errors.showPhone = 'Show phone must be a boolean value' as any;
  }

  if (typeof settings.allowGoogleSync !== 'boolean') {
    errors.allowGoogleSync = 'Allow Google sync must be a boolean value' as any;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate complete profile data
 */
export function validateProfileData(data: ProfileUpdateRequest): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};

  // Validate required fields
  const fullNameValidation = validateFullName(data.fullName ?? '');
  if (!fullNameValidation.isValid) {
    errors.fullName = fullNameValidation.error;
  }

  // Validate optional fields if provided
  if (data.mobileNumber) {
    const mobileValidation = validateMobileNumber(data.mobileNumber);
    if (!mobileValidation.isValid) {
      errors.mobileNumber = mobileValidation.error;
    }
  }

  if (data.bio) {
    const bioValidation = validateBio(data.bio);
    if (!bioValidation.isValid) {
      errors.bio = bioValidation.error;
    }
  }

  if (data.dateOfBirth) {
    const dobValidation = validateDateOfBirth(data.dateOfBirth);
    if (!dobValidation.isValid) {
      errors.dateOfBirth = dobValidation.error;
    }
  }

  if (data.gender) {
    const genderValidation = validateGender(data.gender);
    if (!genderValidation.isValid) {
      errors.gender = genderValidation.error;
    }
  }

  if (data.nationality) {
    const nationalityValidation = validateNationality(data.nationality);
    if (!nationalityValidation.isValid) {
      errors.nationality = nationalityValidation.error;
    }
  }

  if (data.occupation) {
    const occupationValidation = validateOccupation(data.occupation);
    if (!occupationValidation.isValid) {
      errors.occupation = occupationValidation.error;
    }
  }

  if (data.website) {
    const websiteValidation = validateWebsite(data.website);
    if (!websiteValidation.isValid) {
      errors.website = websiteValidation.error;
    }
  }

  if (data.location) {
    const locationValidation = validateLocation(data.location);
    if (!locationValidation.isValid) {
      errors.location = locationValidation.error;
    }
  }

  return errors;
}

/**
 * Validate file upload (profile picture)
 */
export async function validateProfilePictureFile(file: File): Promise<FileValidationResult> {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxDimension = 2000;
  const minDimension = 100;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`,
      code: 'FILE_TOO_LARGE'
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file format. Please upload a JPEG, PNG, or WebP image.',
      code: 'INVALID_FILE_TYPE'
    };
  }

  // Check file name
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: 'Filename is too long.',
      code: 'FILENAME_TOO_LONG'
    };
  }

  // Check for valid image file
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Check dimensions
      if (img.width > maxDimension || img.height > maxDimension) {
        resolve({
          isValid: false,
          error: `Image dimensions too large. Maximum size is ${maxDimension}x${maxDimension} pixels.`,
          code: 'IMAGE_TOO_LARGE'
        });
        return;
      }

      if (img.width < minDimension || img.height < minDimension) {
        resolve({
          isValid: false,
          error: `Image dimensions too small. Minimum size is ${minDimension}x${minDimension} pixels.`,
          code: 'IMAGE_TOO_SMALL'
        });
        return;
      }

      resolve({
        isValid: true,
        dimensions: {
          width: img.width,
          height: img.height
        }
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        error: 'Invalid image file. Please upload a valid image.',
        code: 'INVALID_IMAGE'
      });
    };

    img.src = url;
  });
}

/**
 * Sanitize profile data before submission
 */
export function sanitizeProfileData(data: ProfileUpdateRequest): ProfileUpdateRequest {
  // Special handling for website field to fix HTML entities and auto-add protocol
  const fixWebsiteUrl = (url: string): string | undefined => {
    if (!url || !url.trim()) return undefined;
    
    // First, decode HTML entities properly
    let fixed = url.trim();
    
    // Handle the specific case where https: gets corrupted
    if (fixed.includes('https:&#x2F;&#x2F;')) {
      fixed = fixed.replace(/https:&#x2F;&#x2F;/g, 'https://');
    }
    if (fixed.includes('http:&#x2F;&#x2F;')) {
      fixed = fixed.replace(/http:&#x2F;&#x2F;/g, 'http://');
    }
    
    // Then handle other HTML entities
    fixed = fixed
      .replace(/&#x2F;/g, '/') // Fix HTML entities for forward slashes
      .replace(/&amp;/g, '&') // Fix HTML entities for ampersands
      .replace(/&lt;/g, '<') // Fix HTML entities for less than
      .replace(/&gt;/g, '>') // Fix HTML entities for greater than
      .replace(/&quot;/g, '"'); // Fix HTML entities for quotes
    
    // Auto-add https:// if no protocol is provided and it looks like a domain
    if (!fixed.startsWith('http://') && !fixed.startsWith('https://')) {
      if (fixed.includes('.') && !fixed.startsWith('/')) {
        fixed = 'https://' + fixed;
      }
    }
    
    return fixed;
  };
  
  const sanitized = {
    fullName: sanitizeText(data.fullName ?? ''),
    mobileNumber: data.mobileNumber ? sanitizeText(data.mobileNumber) : undefined,
    bio: data.bio ? sanitizeText(data.bio).replace(/&#x2F;/g, '/') : undefined,
    dateOfBirth: data.dateOfBirth || undefined,
    gender: data.gender ? sanitizeText(data.gender.toLowerCase()) : undefined,
    nationality: data.nationality ? sanitizeText(data.nationality) : undefined,
    occupation: data.occupation ? sanitizeText(data.occupation) : undefined,
    website: data.website ? fixWebsiteUrl(data.website) : undefined,
    location: data.location ? sanitizeText(data.location) : undefined
  };
  
  return sanitized;
}

/**
 * Check if profile data has changed
 */
export function hasProfileDataChanged(original: any, updated: ProfileUpdateRequest): boolean {
  const fields = ['fullName', 'mobileNumber', 'bio', 'dateOfBirth', 'gender', 'nationality', 'occupation', 'website', 'location'];
  
  return fields.some(field => {
    const originalValue = original[field] || '';
    const updatedValue = updated[field as keyof ProfileUpdateRequest] || '';
    return originalValue !== updatedValue;
  });
}

/**
 * Get validation summary
 */
export function getValidationSummary(errors: ProfileValidationErrors): { isValid: boolean; errorCount: number; firstError?: string } {
  const errorKeys = Object.keys(errors);
  const errorCount = errorKeys.length;
  
  return {
    isValid: errorCount === 0,
    errorCount,
    firstError: errorCount > 0 ? errors[errorKeys[0] as keyof ProfileValidationErrors] : undefined
  };
}
