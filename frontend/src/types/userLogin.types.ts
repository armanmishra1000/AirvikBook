// =====================================================
// USER LOGIN TYPES - LOCAL INTERFACES ONLY
// =====================================================
// CRITICAL: NEVER import from shared/contracts/
// All types must be defined locally to avoid build failures

import {
  ChangePasswordApiResponse,
  SetPasswordApiResponse,
  RemovePasswordApiResponse,
  PasswordStatusApiResponse,
  ResetTokenValidationApiResponse
} from './passwordManagement.types';
import {
  ProfileUpdateRequest,
  PrivacyUpdateRequest,
  GetProfileApiResponse,
  UpdateProfileApiResponse,
  UpdatePrivacyApiResponse,
  UploadPictureApiResponse,
  SyncPictureApiResponse,
  DeletePictureApiResponse,
  ConnectGoogleApiResponse,
  DisconnectGoogleApiResponse
} from './userProfile.types';

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

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent?: string;
  lastActivity?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface GoogleLoginRequest {
  googleToken: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
  logoutFromAllDevices?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface LinkGoogleAccountRequest {
  googleToken: string;
}

// =====================================================
// RESPONSE DATA TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN' | 'OWNER';
  profilePicture?: string;
  googleId?: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface SessionInfo {
  id: string;
  deviceInfo: DeviceInfo;
  isNewDevice: boolean;
}

export interface SecurityAlert {
  newDeviceEmailSent: boolean;
  requiresAdditionalVerification: boolean;
}

export interface AccountStatus {
  isExistingUser: boolean;
  hasEmailAccount: boolean;
  accountLinked: boolean;
}

export interface ActiveSession {
  id: string;
  deviceInfo: DeviceInfo;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
  ipAddress?: string;
  location?: string;
}

// =====================================================
// COMPLETE RESPONSE TYPES
// =====================================================

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  session: SessionInfo;
  securityAlert?: SecurityAlert;
  accountStatus?: AccountStatus;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export interface LogoutResponse {
  loggedOut: boolean;
  sessionsInvalidated: number;
  message: string;
}

export interface ActiveSessionsResponse {
  sessions: ActiveSession[];
  totalSessions: number;
}

export interface ForgotPasswordResponse {
  emailSent: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  passwordReset: boolean;
  message: string;
}

export interface TokenVerificationResponse {
  tokenValid: boolean;
  email: string;
}

export interface LinkAccountResponse {
  user: User;
  accountStatus: AccountStatus;
}

// =====================================================
// TYPED API RESPONSE WRAPPERS
// =====================================================

export type LoginApiResponse = ApiResponse<LoginResponse>;
export type GoogleLoginApiResponse = ApiResponse<LoginResponse>;
export type RefreshApiResponse = ApiResponse<RefreshResponse>;
export type LogoutApiResponse = ApiResponse<LogoutResponse>;
export type SessionsApiResponse = ApiResponse<ActiveSessionsResponse>;
export type ForgotPasswordApiResponse = ApiResponse<ForgotPasswordResponse>;
export type ResetPasswordApiResponse = ApiResponse<ResetPasswordResponse>;
export type TokenVerificationApiResponse = ApiResponse<TokenVerificationResponse>;
export type LinkAccountApiResponse = ApiResponse<LinkAccountResponse>;

// =====================================================
// UI STATE TYPES
// =====================================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginFormState {
  data: LoginFormData;
  errors: LoginFormErrors;
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

// =====================================================
// AUTHENTICATION CONTEXT TYPES
// =====================================================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

export interface AuthContextValue {
  // State
  authState: AuthState;
  
  // Authentication Actions
  login: (credentials: LoginRequest) => Promise<LoginApiResponse>;
  loginWithGoogle: (credentials: GoogleLoginRequest) => Promise<GoogleLoginApiResponse>;
  logout: (allDevices?: boolean) => Promise<LogoutApiResponse>;
  refreshToken: () => Promise<RefreshApiResponse>;
  
  // Session Management
  getSessions: () => Promise<SessionsApiResponse>;
  logoutFromDevice: (sessionId: string) => Promise<LogoutApiResponse>;
  logoutFromAllDevices: () => Promise<LogoutApiResponse>;
  
  // Account Management
  linkGoogleAccount: (token: string) => Promise<LinkAccountApiResponse>;
  
  // Password Reset
  forgotPassword: (email: string) => Promise<ForgotPasswordApiResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<ResetPasswordApiResponse>;
  verifyResetToken: (token: string) => Promise<TokenVerificationApiResponse>;
  
  // Enhanced Password Management
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string, invalidateOtherSessions?: boolean) => Promise<ChangePasswordApiResponse>;
  setPassword: (newPassword: string, confirmPassword: string) => Promise<SetPasswordApiResponse>;
  removePassword: (currentPassword: string, confirmGoogleOnly: boolean) => Promise<RemovePasswordApiResponse>;
  getPasswordStatus: () => Promise<PasswordStatusApiResponse>;
  verifyResetTokenEnhanced: (token: string) => Promise<ResetTokenValidationApiResponse>;
  
  // Utilities
  isTokenExpired: () => boolean;
  clearAuthState: () => void;
  updateLastActivity: () => void;
  
  // Profile Management Methods
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<UpdateProfileApiResponse>;
  uploadProfilePicture: (file: File) => Promise<UploadPictureApiResponse>;
  syncGoogleProfilePicture: () => Promise<SyncPictureApiResponse>;
  updatePrivacySettings: (settings: PrivacyUpdateRequest) => Promise<UpdatePrivacyApiResponse>;
  connectGoogleAccount: (token: string) => Promise<ConnectGoogleApiResponse>;
  disconnectGoogleAccount: () => Promise<DisconnectGoogleApiResponse>;
  refreshUserData: () => Promise<GetProfileApiResponse>;
}

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

export interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface GoogleOAuthButtonProps {
  onSuccess: (credentials: GoogleLoginRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  text?: string;
  className?: string;
}

export interface SessionManagerProps {
  sessions: ActiveSession[];
  currentSessionId?: string;
  onLogoutFromDevice: (sessionId: string) => Promise<void>;
  onLogoutFromAllDevices: () => Promise<void>;
  isLoading: boolean;
  className?: string;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export interface ResetPasswordFormProps {
  token: string;
  onSubmit: (token: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

// =====================================================
// ERROR HANDLING TYPES
// =====================================================

export interface LoginError {
  code: string;
  message: string;
  details?: any;
}

export const LOGIN_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  GOOGLE_TOKEN_INVALID: 'GOOGLE_TOKEN_INVALID',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_ALREADY_USED: 'TOKEN_ALREADY_USED'
} as const;

export type LoginErrorCode = typeof LOGIN_ERROR_CODES[keyof typeof LOGIN_ERROR_CODES];

// =====================================================
// TOKEN STORAGE HELPER TYPES
// =====================================================

export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  getUserData: () => User | null;
  setUserData: (user: User) => void;
  clearUserData: () => void;
}

// =====================================================
// API SERVICE TYPES
// =====================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
}

// =====================================================
// VALIDATION TYPES
// =====================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// =====================================================
// DEVICE FINGERPRINTING TYPES
// =====================================================

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  webgl?: string;
}

export interface DeviceFingerprintResult {
  deviceId: string;
  deviceName: string;
  fingerprint: DeviceFingerprint;
  confidence: number;
}

// =====================================================
// ROUTE PROTECTION TYPES
// =====================================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  requiredRoles?: Array<User['role']>;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface RouteGuardConfig {
  requireAuth: boolean;
  requireEmailVerification: boolean;
  requiredRoles: Array<User['role']>;
  redirectTo: string;
}

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export type {
  // Core types are already exported above
};

// Default export for convenience
export default {
  isSuccessResponse,
  isErrorResponse,
  LOGIN_ERROR_CODES
};