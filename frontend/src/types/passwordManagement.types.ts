// =====================================================
// PASSWORD MANAGEMENT TYPES - LOCAL INTERFACES ONLY
// =====================================================
// CRITICAL: NEVER import from shared/contracts/
// All types must be defined locally to avoid build failures

// =====================================================
// API RESPONSE WRAPPER TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

// Type Guards for API Response Safety
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};

export const isErrorResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } => {
  return response.success === false && response.error !== undefined;
};

// =====================================================
// REQUEST TYPES
// =====================================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  invalidateOtherSessions?: boolean;
}

export interface SetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface RemovePasswordRequest {
  currentPassword: string;
  confirmGoogleOnly: boolean;
}

// =====================================================
// RESPONSE DATA TYPES
// =====================================================

export interface ForgotPasswordResponse {
  emailSent: boolean;
  message: string;
  canResetPassword: boolean;
  accountType?: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  alternativeAuth?: {
    method: 'GOOGLE_OAUTH';
    suggestion: string;
  };
}

export interface ResetPasswordResponse {
  passwordReset: boolean;
  message: string;
  user: {
    email: string;
    fullName: string;
    passwordLastChanged: string;
  };
  sessionActions: {
    allSessionsInvalidated: boolean;
    newLoginRequired: boolean;
  };
  securityActions: {
    passwordAddedToHistory: boolean;
    securityEmailSent: boolean;
  };
}

export interface ChangePasswordResponse {
  passwordChanged: boolean;
  message: string;
  user: {
    email: string;
    passwordLastChanged: string;
    hasPassword: boolean;
  };
  sessionActions: {
    otherSessionsInvalidated: boolean;
    currentSessionMaintained: boolean;
    sessionsInvalidated: number;
  };
  securityActions: {
    passwordAddedToHistory: boolean;
    securityEmailSent: boolean;
  };
}

export interface SetPasswordResponse {
  passwordSet: boolean;
  message: string;
  user: {
    email: string;
    hasPassword: boolean;
    hasGoogleAuth: boolean;
    authMethods: string[];
    passwordLastChanged: string;
  };
  securityActions: {
    mixedAuthEnabled: boolean;
    securityEmailSent: boolean;
  };
}

export interface RemovePasswordResponse {
  passwordRemoved: boolean;
  message: string;
  user: {
    email: string;
    hasPassword: boolean;
    hasGoogleAuth: boolean;
    authMethods: string[];
    accountType: 'GOOGLE_ONLY';
  };
  sessionActions: {
    allSessionsInvalidated: boolean;
    newLoginRequired: boolean;
    loginMethod: 'GOOGLE_OAUTH';
  };
}

export interface PasswordStatusResponse {
  hasPassword: boolean;
  hasGoogleAuth: boolean;
  authMethods: string[];
  accountType: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  passwordLastChanged?: string;
  securityRecommendations: SecurityRecommendation[];
  passwordPolicy: PasswordPolicy;
}

export interface ResetTokenValidationResponse {
  tokenValid: boolean;
  user: {
    email: string;
    fullName: string;
  };
  expiresAt: string;
  timeRemaining: number;
}

// =====================================================
// SUPPORTING TYPES
// =====================================================

export interface SecurityRecommendation {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  historyLimit: number;
}

export interface AccountType {
  type: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  description: string;
  canSetPassword: boolean;
  canRemovePassword: boolean;
  canChangePassword: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  type: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
  met: boolean;
  required: boolean;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export type ForgotPasswordApiResponse = ApiResponse<ForgotPasswordResponse>;
export type ResetPasswordApiResponse = ApiResponse<ResetPasswordResponse>;
export type ChangePasswordApiResponse = ApiResponse<ChangePasswordResponse>;
export type SetPasswordApiResponse = ApiResponse<SetPasswordResponse>;
export type RemovePasswordApiResponse = ApiResponse<RemovePasswordResponse>;
export type PasswordStatusApiResponse = ApiResponse<PasswordStatusResponse>;
export type ResetTokenValidationApiResponse = ApiResponse<ResetTokenValidationResponse>;

// =====================================================
// FORM TYPES
// =====================================================

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

export interface ForgotPasswordFormState {
  data: ForgotPasswordFormData;
  errors: ForgotPasswordFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export interface ResetPasswordFormState {
  data: ResetPasswordFormData;
  errors: ResetPasswordFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  invalidateOtherSessions: boolean;
}

export interface ChangePasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export interface ChangePasswordFormState {
  data: ChangePasswordFormData;
  errors: ChangePasswordFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface SetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface SetPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export interface SetPasswordFormState {
  data: SetPasswordFormData;
  errors: SetPasswordFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface RemovePasswordFormData {
  currentPassword: string;
  confirmGoogleOnly: boolean;
}

export interface RemovePasswordFormErrors {
  currentPassword?: string;
  confirmGoogleOnly?: string;
  general?: string;
}

export interface RemovePasswordFormState {
  data: RemovePasswordFormData;
  errors: RemovePasswordFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// =====================================================
// COMPONENT PROPS TYPES
// =====================================================

export interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface ResetPasswordFormProps {
  token: string;
  onSubmit: (data: ResetPasswordRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface SetPasswordFormProps {
  onSubmit: (data: SetPasswordRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface RemovePasswordFormProps {
  onSubmit: (data: RemovePasswordRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export interface PasswordRequirementsProps {
  password: string;
  policy?: PasswordPolicy;
  className?: string;
}

export interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  showToggle?: boolean;
  className?: string;
  disabled?: boolean;
}

export interface SecurityDashboardProps {
  passwordStatus: PasswordStatusResponse;
  onRefresh: () => Promise<void>;
  className?: string;
}

export interface AuthenticationMethodsProps {
  authMethods: string[];
  accountType: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  onSetPassword?: () => void;
  onRemovePassword?: () => void;
  onChangePassword?: () => void;
  className?: string;
}

export interface SecurityRecommendationsProps {
  recommendations: SecurityRecommendation[];
  className?: string;
}

// =====================================================
// ERROR TYPES
// =====================================================

export interface PasswordManagementError {
  code: string;
  message: string;
  details?: any;
}

export enum PASSWORD_ERROR_CODES {
  INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  PASSWORD_REUSED = 'PASSWORD_REUSED',
  NO_PASSWORD_SET = 'NO_PASSWORD_SET',
  NO_PASSWORD_EXISTS = 'NO_PASSWORD_EXISTS',
  GOOGLE_ONLY_ACCOUNT = 'GOOGLE_ONLY_ACCOUNT',
  MIXED_AUTH_REQUIRED = 'MIXED_AUTH_REQUIRED',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  RESET_TOKEN_EXPIRED = 'RESET_TOKEN_EXPIRED',
  RESET_TOKEN_USED = 'RESET_TOKEN_USED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export type PasswordErrorCode = typeof PASSWORD_ERROR_CODES[keyof typeof PASSWORD_ERROR_CODES];

// =====================================================
// UTILITY TYPES
// =====================================================

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

export interface PasswordValidationRule {
  type: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special' | 'history';
  test: (password: string) => boolean;
  message: string;
}

export interface SecurityAction {
  type: 'PASSWORD_CHANGED' | 'PASSWORD_SET' | 'PASSWORD_REMOVED' | 'RESET_REQUESTED';
  timestamp: string;
  deviceInfo?: {
    deviceId: string;
    deviceName: string;
    ipAddress?: string;
  };
  details?: any;
}

// =====================================================
// HOOK TYPES
// =====================================================

export interface UsePasswordResetReturn {
  forgotPassword: (email: string) => Promise<ForgotPasswordApiResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<ResetPasswordApiResponse>;
  verifyResetToken: (token: string) => Promise<ResetTokenValidationApiResponse>;
  isLoading: boolean;
  error: PasswordManagementError | null;
  clearError: () => void;
}

export interface UsePasswordChangeReturn {
  changePassword: (data: ChangePasswordRequest) => Promise<ChangePasswordApiResponse>;
  setPassword: (data: SetPasswordRequest) => Promise<SetPasswordApiResponse>;
  removePassword: (data: RemovePasswordRequest) => Promise<RemovePasswordApiResponse>;
  getPasswordStatus: () => Promise<PasswordStatusApiResponse>;
  isLoading: boolean;
  error: PasswordManagementError | null;
  clearError: () => void;
}

export interface UsePasswordValidationReturn {
  validatePassword: (password: string, policy?: PasswordPolicy) => PasswordValidationResult;
  getPasswordStrength: (password: string) => PasswordStrength;
  checkPasswordRequirements: (password: string, policy?: PasswordPolicy) => PasswordRequirement[];
}

// =====================================================
// CONSTANTS
// =====================================================

export const PASSWORD_STRENGTH_LABELS = {
  0: 'Very Weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong'
} as const;

export const PASSWORD_STRENGTH_COLORS = {
  0: '#ff4444', // Red
  1: '#ff8800', // Orange
  2: '#ffbb33', // Yellow
  3: '#00C851', // Green
  4: '#007E33'  // Dark Green
} as const;

export const ACCOUNT_TYPE_CONFIGS: Record<string, AccountType> = {
  EMAIL_ONLY: {
    type: 'EMAIL_ONLY',
    description: 'Account uses email and password authentication',
    canSetPassword: false,
    canRemovePassword: false,
    canChangePassword: true
  },
  GOOGLE_ONLY: {
    type: 'GOOGLE_ONLY',
    description: 'Account uses Google authentication only',
    canSetPassword: true,
    canRemovePassword: false,
    canChangePassword: false
  },
  MIXED: {
    type: 'MIXED',
    description: 'Account uses both email/password and Google authentication',
    canSetPassword: false,
    canRemovePassword: true,
    canChangePassword: true
  }
} as const;
