// =====================================================
// PASSWORD MANAGEMENT SERVICE - FRONTEND API CLIENT
// =====================================================
// CRITICAL: Follow exact token storage patterns
// - Access Token: sessionStorage.getItem('airvik_access_token')
// - Refresh Token: localStorage.getItem('airvik_refresh_token')
// - User Data: localStorage.getItem('airvik_user')

import {
  ApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  SetPasswordRequest,
  RemovePasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  SetPasswordResponse,
  RemovePasswordResponse,
  PasswordStatusResponse,
  ResetTokenValidationResponse,
  ForgotPasswordApiResponse,
  ResetPasswordApiResponse,
  ChangePasswordApiResponse,
  SetPasswordApiResponse,
  RemovePasswordApiResponse,
  PasswordStatusApiResponse,
  ResetTokenValidationApiResponse,
  PasswordManagementError,
  PASSWORD_ERROR_CODES,
  isSuccessResponse,
  isErrorResponse
} from '../types/passwordManagement.types';
import { AUTH_PATHS } from '../lib/paths';

// =====================================================
// TOKEN STORAGE UTILITIES (Reused from userLogin.service.ts)
// =====================================================

class TokenStorage {
  // Access token storage (sessionStorage - short-term)
  static getAccessToken(): string | null {
    try {
      return sessionStorage.getItem('airvik_access_token');
    } catch {
      return null;
    }
  }

  static setAccessToken(token: string): void {
    try {
      sessionStorage.setItem('airvik_access_token', token);
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  }

  static clearAccessToken(): void {
    try {
      sessionStorage.removeItem('airvik_access_token');
    } catch (error) {
      console.error('Failed to clear access token:', error);
    }
  }

  // Refresh token storage (localStorage - long-term)
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem('airvik_refresh_token');
    } catch {
      return null;
    }
  }

  static setRefreshToken(token: string): void {
    try {
      localStorage.setItem('airvik_refresh_token', token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  static clearRefreshToken(): void {
    try {
      localStorage.removeItem('airvik_refresh_token');
    } catch (error) {
      console.error('Failed to clear refresh token:', error);
    }
  }

  // User data storage (localStorage - persisted)
  static getUserData(): any {
    try {
      const userData = localStorage.getItem('airvik_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static setUserData(user: any): void {
    try {
      localStorage.setItem('airvik_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  static clearUserData(): void {
    try {
      localStorage.removeItem('airvik_user');
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  // Combined token operations
  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  static clearAll(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.clearUserData();
  }

  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }
}

// =====================================================
// API CLIENT (Reused from userLogin.service.ts)
// =====================================================

class ApiClient {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  private static readonly API_PREFIX = '/api/v1';
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  private static isRefreshing = false;
  private static refreshPromise: Promise<any> | null = null;

  static async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options: {
      requiresAuth?: boolean;
      skipAuthRefresh?: boolean;
      retryCount?: number;
      customHeaders?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = true, skipAuthRefresh = false, retryCount = 0, customHeaders = {} } = options;

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders
      };

      // Add authentication header if required
      if (requiresAuth) {
        const accessToken = TokenStorage.getAccessToken();
        if (!accessToken) {
          return {
            success: false,
            error: 'Authentication required',
            code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR
          };
        }
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Prepare request configuration
      const config: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(this.TIMEOUT),
      };

      // Add body for non-GET requests
      if (method !== 'GET' && data) {
        config.body = JSON.stringify(data);
      }

      // Make the request
      const response = await fetch(`${this.BASE_URL}${this.API_PREFIX}/auth${endpoint}`, config);

      // Handle response
      const responseData = await response.json();

      // Handle authentication errors and token refresh
      if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
        const refreshResult = await this.handleTokenRefresh();
        if (refreshResult.success) {
          // Retry the original request with new token
          return this.request(method, endpoint, data, {
            ...options,
            skipAuthRefresh: true,
            retryCount: retryCount + 1
          });
        } else {
          // Token refresh failed, clear auth data
          TokenStorage.clearAll();
          return {
            success: false,
            error: 'Authentication failed',
            code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR
          };
        }
      }

      // Handle network errors
      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || `HTTP ${response.status}`,
          code: responseData.code || 'UNKNOWN_ERROR',
          details: responseData.details
        };
      }

      return responseData;

    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            code: PASSWORD_ERROR_CODES.NETWORK_ERROR
          };
        }
        if (error.message.includes('fetch')) {
          return {
            success: false,
            error: 'Network error',
            code: PASSWORD_ERROR_CODES.NETWORK_ERROR
          };
        }
      }

      return {
        success: false,
        error: 'Unknown error occurred',
        code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR
      };
    }
  }

  private static async handleTokenRefresh(): Promise<ApiResponse<any>> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private static async performTokenRefresh(): Promise<ApiResponse<any>> {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
        code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR
      };
    }

    try {
      const response = await fetch(`${this.BASE_URL}${this.API_PREFIX}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        signal: AbortSignal.timeout(this.TIMEOUT),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store new tokens
        TokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
        if (data.data.user) {
          TokenStorage.setUserData(data.data.user);
        }
        return data;
      } else {
        // Refresh failed, clear auth data
        TokenStorage.clearAll();
        return {
          success: false,
          error: 'Token refresh failed',
          code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR
        };
      }
    } catch (error) {
      TokenStorage.clearAll();
      return {
        success: false,
        error: 'Token refresh failed',
        code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR
      };
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =====================================================
// PASSWORD MANAGEMENT SERVICE
// =====================================================

export class PasswordManagementService {
  // =====================================================
  // PASSWORD RESET OPERATIONS (Public)
  // =====================================================

  /**
   * Request password reset email
   */
  static async forgotPassword(email: string): Promise<ForgotPasswordApiResponse> {
    const request: ForgotPasswordRequest = { email };
    
    return ApiClient.request<ForgotPasswordResponse>(
      'POST',
      AUTH_PATHS.FORGOT_PASSWORD,
      request,
      { requiresAuth: false }
    );
  }

  /**
   * Complete password reset with token
   */
  static async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<ResetPasswordApiResponse> {
    const request: ResetPasswordRequest = {
      token,
      newPassword,
      confirmPassword
    };
    
    return ApiClient.request<ResetPasswordResponse>(
      'POST',
      AUTH_PATHS.RESET_PASSWORD,
      request,
      { requiresAuth: false }
    );
  }

  /**
   * Validate reset token before showing reset form
   */
  static async verifyResetToken(token: string): Promise<ResetTokenValidationApiResponse> {
    return ApiClient.request<ResetTokenValidationResponse>(
      'GET',
      `${AUTH_PATHS.RESET_TOKEN}/${token}`,
      undefined,
      { requiresAuth: false }
    );
  }

  // =====================================================
  // AUTHENTICATED PASSWORD OPERATIONS
  // =====================================================

  /**
   * Change password for authenticated user
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    invalidateOtherSessions: boolean = false
  ): Promise<ChangePasswordApiResponse> {
    const request: ChangePasswordRequest = {
      currentPassword,
      newPassword,
      confirmPassword,
      invalidateOtherSessions
    };
    
    return ApiClient.request<ChangePasswordResponse>(
      'PUT',
      AUTH_PATHS.PASSWORD,
      request,
      { requiresAuth: true }
    );
  }

  /**
   * Set password for Google-only users
   */
  static async setPassword(newPassword: string, confirmPassword: string): Promise<SetPasswordApiResponse> {
    const request: SetPasswordRequest = {
      newPassword,
      confirmPassword
    };
    
    return ApiClient.request<SetPasswordResponse>(
      'POST',
      AUTH_PATHS.SET_PASSWORD,
      request,
      { requiresAuth: true }
    );
  }

  /**
   * Remove password from mixed accounts
   */
  static async removePassword(currentPassword: string, confirmGoogleOnly: boolean): Promise<RemovePasswordApiResponse> {
    const request: RemovePasswordRequest = {
      currentPassword,
      confirmGoogleOnly
    };
    
    return ApiClient.request<RemovePasswordResponse>(
      'DELETE',
      AUTH_PATHS.PASSWORD,
      request,
      { requiresAuth: true }
    );
  }

  /**
   * Get password status for current user
   */
  static async getPasswordStatus(): Promise<PasswordStatusApiResponse> {
    return ApiClient.request<PasswordStatusResponse>(
      'GET',
      AUTH_PATHS.PASSWORD_STATUS,
      undefined,
      { requiresAuth: true }
    );
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenStorage.hasValidTokens();
  }

  /**
   * Get current user data
   */
  static getCurrentUser(): any {
    return TokenStorage.getUserData();
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    TokenStorage.clearAll();
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(): boolean {
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) return true;

    try {
      // Simple JWT expiration check (payload is base64 encoded)
      const payload = accessToken.split('.')[1];
      if (!payload) return true;

      const decoded = JSON.parse(atob(payload));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateLastActivity(): void {
    try {
      localStorage.setItem('airvik_last_activity', Date.now().toString());
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Validate authentication status
   */
  static async validateAuthentication(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isTokenExpired()) {
      // Try to refresh token
      const refreshResult = await ApiClient.request('POST', `/auth${AUTH_PATHS.REFRESH}`, {
        refreshToken: TokenStorage.getRefreshToken()
      });
      
      return refreshResult.success;
    }

    return true;
  }

  /**
   * Handle password operation errors
   */
  static handlePasswordError(error: any): PasswordManagementError {
    if (isErrorResponse(error)) {
      return {
        code: error.code || PASSWORD_ERROR_CODES.UNKNOWN_ERROR,
        message: error.error || 'An error occurred',
        details: error.details
      };
    }

    return {
      code: PASSWORD_ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
      details: error
    };
  }

  /**
   * Check if error is a specific type
   */
  static isSpecificError(error: PasswordManagementError, errorCode: string): boolean {
    return error.code === errorCode;
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(error: PasswordManagementError): string {
    const errorMessages: Record<string, string> = {
      [PASSWORD_ERROR_CODES.INVALID_RESET_TOKEN]: 'The reset link is invalid or has expired. Please request a new one.',
      [PASSWORD_ERROR_CODES.RESET_TOKEN_EXPIRED]: 'The reset link has expired. Please request a new one.',
      [PASSWORD_ERROR_CODES.INVALID_CURRENT_PASSWORD]: 'Current password is incorrect.',
      [PASSWORD_ERROR_CODES.NO_PASSWORD_EXISTS]: 'No password exists for this account.',
      [PASSWORD_ERROR_CODES.GOOGLE_ONLY_ACCOUNT]: 'This account uses Google sign-in only.',
      [PASSWORD_ERROR_CODES.PASSWORD_TOO_WEAK]: 'Password does not meet security requirements.',
      [PASSWORD_ERROR_CODES.PASSWORD_MISMATCH]: 'Passwords do not match.',
      [PASSWORD_ERROR_CODES.PASSWORD_REUSED]: 'Cannot reuse a recent password.',
      [PASSWORD_ERROR_CODES.ACCOUNT_DISABLED]: 'Account has been disabled.',
      [PASSWORD_ERROR_CODES.MIXED_AUTH_REQUIRED]: 'This operation requires mixed authentication.',
      [PASSWORD_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
      [PASSWORD_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
    };

    return errorMessages[error.code] || error.message || 'An error occurred';
  }
}
