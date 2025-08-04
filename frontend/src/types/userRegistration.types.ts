/**
 * User Registration Types
 * 
 * CRITICAL RULE: These are LOCAL interfaces that follow the API contract patterns.
 * NEVER import from shared/contracts/ - this will cause build failures.
 * These types are copied from the API contract for frontend use only.
 */

// ===== API Response Types =====

/**
 * Standard API response wrapper - LOCAL COPY
 * DO NOT import from shared/contracts/
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

/**
 * Type guards for safe property access on API responses
 * MANDATORY: Use these guards before accessing .data or .error properties
 */
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } => {
  return response && response.success === true;
};

export const isErrorResponse = <T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: false; error: string } => {
  return response && response.success === false;
};

// ===== User Data Types =====

export interface User {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN' | 'OWNER';
  profilePicture?: string;
  googleId?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ===== Request Types =====

export interface UserRegistrationRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  acceptedTerms: boolean;
}

export interface GoogleAuthRequest {
  googleToken: string;
  linkToEmail?: string;
}

export interface EmailVerificationRequest {
  token: string;
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// ===== Response Types =====

export interface RegistrationResponse {
  user: User;
  tokens: AuthTokens;
  verificationEmailSent?: boolean;
  isNewUser?: boolean;
  welcomeEmailSent?: boolean;
}

export interface EmailVerificationResponse {
  user: User;
  welcomeEmailSent: boolean;
}

export interface EmailAvailabilityResponse {
  available: boolean;
  suggestion?: string;
}

export interface ResendVerificationResponse {
  emailSent: boolean;
  expiresIn: string;
}

// ===== Form Data Types =====

export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  mobileNumber: string;
  acceptedTerms: boolean;
}

export interface EmailVerificationFormData {
  token: string;
  email: string;
}

// ===== UI State Types =====

export interface RegistrationState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  registrationStep: 'form' | 'verification-pending' | 'verification-success' | 'complete';
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  mobileNumber?: string;
  acceptedTerms?: string;
  general?: string;
}

// ===== Password Strength Types =====

export interface PasswordStrength {
  score: number; // 0-4 (weak to strong)
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

// ===== Google OAuth Types =====

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export interface GoogleAuthState {
  isLoading: boolean;
  error: string | null;
  user: GoogleUser | null;
}

// ===== Email Verification Types =====

export interface EmailVerificationState {
  isLoading: boolean;
  isVerified: boolean;
  error: string | null;
  resendCount: number;
  lastResendTime: number | null;
  canResend: boolean;
}

// ===== Account Linking Types =====

export interface AccountLinkingState {
  isLinking: boolean;
  existingUser: User | null;
  googleUser: GoogleUser | null;
  error: string | null;
}

// ===== Toast Notification Types =====

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ===== API Error Types =====

export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// Known API error codes
export type ApiErrorCode =
  | 'EMAIL_EXISTS'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'INVALID_PHONE'
  | 'TERMS_NOT_ACCEPTED'
  | 'GOOGLE_TOKEN_INVALID'
  | 'VERIFICATION_TOKEN_INVALID'
  | 'VERIFICATION_TOKEN_EXPIRED'
  | 'USER_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

// ===== Hook Return Types =====

export interface UseRegistrationReturn {
  register: (data: UserRegistrationRequest) => Promise<void>;
  registerWithGoogle: (googleToken: string) => Promise<void>;
  state: RegistrationState;
  formErrors: FormErrors;
  clearErrors: () => void;
  resetRegistration: () => void;
}

export interface UseEmailVerificationReturn {
  verifyEmail: (token: string, email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  state: EmailVerificationState;
  clearError: () => void;
}

export interface UsePasswordStrengthReturn {
  checkStrength: (password: string) => PasswordStrength;
  validatePassword: (password: string) => boolean;
  getStrengthColor: (score: number) => string;
  getStrengthText: (score: number) => string;
}

// ===== Validation Schema Types =====

export interface ValidationSchema {
  email: {
    required: boolean;
    pattern: RegExp;
    message: string;
  };
  password: {
    required: boolean;
    minLength: number;
    pattern: RegExp;
    message: string;
  };
  fullName: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    message: string;
  };
  mobileNumber: {
    required: boolean;
    pattern: RegExp;
    message: string;
  };
}

// ===== Constants =====

export const REGISTRATION_STEPS = {
  FORM: 'form',
  VERIFICATION_PENDING: 'verification-pending',
  VERIFICATION_SUCCESS: 'verification-success',
  COMPLETE: 'complete'
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  UPPERCASE_PATTERN: /[A-Z]/,
  LOWERCASE_PATTERN: /[a-z]/,
  NUMBER_PATTERN: /\d/,
  SPECIAL_CHAR_PATTERN: /[!@#$%^&*(),.?":{}|<>]/
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  FULL_NAME: /^[a-zA-Z\s\-']+$/,
  MOBILE_NUMBER: /^\+[1-9]\d{6,14}$/
} as const;

// Types are already exported above, no need to re-export