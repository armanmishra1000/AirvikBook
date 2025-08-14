/**
 * User Registration API Service
 * 
 * CRITICAL RULES:
 * 1. NO imports from shared/contracts/ - use local types only
 * 2. ALWAYS use type guards before accessing response.data
 * 3. Follow exact token storage patterns from integration docs
 */

import {
  ApiResponse,
  User,
  AuthTokens,
  UserRegistrationRequest,
  GoogleAuthRequest,
  EmailVerificationRequest,
  ResendVerificationRequest,
  RegistrationResponse,
  EmailVerificationResponse,
  EmailAvailabilityResponse,
  ResendVerificationResponse,
  isSuccessResponse,
  isErrorResponse
} from '../types/userRegistration.types';
import { AUTH_PATHS } from '../lib/paths';

export class UserRegistrationService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  private static readonly API_PREFIX = '/api/v1';

  /**
   * Get auth headers with current access token
   */
  private static getAuthHeaders(): Record<string, string> {
    const accessToken = sessionStorage.getItem('airvik_access_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  /**
   * Store authentication tokens following project patterns
   */
  private static storeTokens(tokens: AuthTokens): void {
    // Access token in sessionStorage (short-lived)
    sessionStorage.setItem('airvik_access_token', tokens.accessToken);
    
    // Refresh token in localStorage (long-lived)
    localStorage.setItem('airvik_refresh_token', tokens.refreshToken);
  }

  /**
   * Store user data in localStorage
   */
  private static storeUser(user: User): void {
    localStorage.setItem('airvik_user', JSON.stringify(user));
  }

  /**
   * Clear stored authentication data
   */
  private static clearAuthData(): void {
    sessionStorage.removeItem('airvik_access_token');
    localStorage.removeItem('airvik_refresh_token');
    localStorage.removeItem('airvik_user');
  }

  /**
   * Make API request with proper error handling and retry logic
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.API_BASE_URL}${this.API_PREFIX}/auth${endpoint}`;
    
    const requestOptions: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Handle non-JSON responses (like HTML error pages)
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse<T> = await response.json();
      
      // The API always returns JSON with success property
      // No need to check response.ok since API handles HTTP status internally
      return data;
      
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Network error or parsing error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        code: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Register new user with email/password
   */
  static async register(userData: UserRegistrationRequest): Promise<ApiResponse<RegistrationResponse>> {
    const response = await this.makeRequest<RegistrationResponse>(AUTH_PATHS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store auth data if registration successful
    if (isSuccessResponse(response)) {
      this.storeTokens(response.data.tokens);
      this.storeUser(response.data.user);
    }

    return response;
  }

  /**
   * Register/login with Google OAuth
   */
  static async registerWithGoogle(
    googleData: GoogleAuthRequest
  ): Promise<ApiResponse<RegistrationResponse>> {
    const response = await this.makeRequest<RegistrationResponse>(AUTH_PATHS.GOOGLE_AUTH, {
      method: 'POST',
      body: JSON.stringify(googleData),
    });

    // Store auth data if Google auth successful
    if (isSuccessResponse(response)) {
      this.storeTokens(response.data.tokens);
      this.storeUser(response.data.user);
    }

    return response;
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(
    verificationData: EmailVerificationRequest
  ): Promise<ApiResponse<EmailVerificationResponse>> {
    const response = await this.makeRequest<EmailVerificationResponse>(AUTH_PATHS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });

    // Update stored user data and tokens if verification successful
    if (isSuccessResponse(response)) {
      this.storeUser(response.data.user);
      
      // Store new tokens after email verification
      if (response.data.tokens) {
        sessionStorage.setItem('airvik_access_token', response.data.tokens.accessToken);
        localStorage.setItem('airvik_refresh_token', response.data.tokens.refreshToken);
      }
    }

    return response;
  }

  /**
   * Resend email verification
   */
  static async resendVerification(
    resendData: ResendVerificationRequest
  ): Promise<ApiResponse<ResendVerificationResponse>> {
    return this.makeRequest<ResendVerificationResponse>(AUTH_PATHS.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify(resendData),
    });
  }

  /**
   * Check email availability
   */
  static async checkEmailAvailability(email: string): Promise<ApiResponse<EmailAvailabilityResponse>> {
    const encodedEmail = encodeURIComponent(email);
    return this.makeRequest<EmailAvailabilityResponse>(`/check-email/${encodedEmail}`, {
      method: 'GET',
    });
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
    const refreshToken = localStorage.getItem('airvik_refresh_token');
    
    if (!refreshToken) {
      return { success: false, error: 'No refresh token found' };
    }

    try {
      const response = await this.makeRequest<{ accessToken: string }>(AUTH_PATHS.REFRESH, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (isSuccessResponse(response)) {
        sessionStorage.setItem('airvik_access_token', response.data.accessToken);
        return { success: true };
      } else {
        // Refresh token expired or invalid, clear auth data
        this.clearAuthData();
        return { success: false, error: response.error };
      }
    } catch (error) {
      this.clearAuthData();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      };
    }
  }

  /**
   * Logout user (clear tokens and optionally notify server)
   */
  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('airvik_refresh_token');
    
    // Clear local auth data immediately
    this.clearAuthData();
    
    // Optionally notify server to blacklist token
    if (refreshToken) {
      try {
        await this.makeRequest(AUTH_PATHS.LOGOUT, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Logout locally even if server request fails
        console.warn('Server logout failed, but local logout completed:', error);
      }
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem('airvik_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const accessToken = sessionStorage.getItem('airvik_access_token');
    const user = this.getCurrentUser();
    return !!(accessToken && user);
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return sessionStorage.getItem('airvik_access_token');
  }

  /**
   * API request wrapper with automatic token refresh
   */
  static async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure: boolean = true
  ): Promise<ApiResponse<T>> {
    let response = await this.makeRequest<T>(endpoint, options);

    // If authentication failed and we haven't retried yet, try refreshing token
    if (
      retryOnAuthFailure &&
      isErrorResponse(response) &&
      (response.code === 'TOKEN_EXPIRED' || response.code === 'MISSING_TOKEN')
    ) {
      const refreshResult = await this.refreshAccessToken();
      
      if (refreshResult.success) {
        // Retry the original request with new token
        response = await this.makeRequest<T>(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            ...this.getAuthHeaders(),
          },
        });
      }
    }

    return response;
  }

  /**
   * Validate email format (client-side)
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength (client-side)
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate full name format (client-side)
   */
  static validateFullName(fullName: string): boolean {
    return (
      fullName.length >= 2 &&
      fullName.length <= 100 &&
      /^[a-zA-Z\s\-']+$/.test(fullName.trim())
    );
  }

  /**
   * Validate mobile number format (client-side)
   */
  static validateMobileNumber(mobileNumber: string): boolean {
    if (!mobileNumber.trim()) return true; // Optional field
    return /^\+[1-9]\d{6,14}$/.test(mobileNumber);
  }

  /**
   * Get API base URL (for debugging)
   */
  static getApiBaseUrl(): string {
    return this.API_BASE_URL;
  }

  /**
   * Health check for API connectivity
   */
  static async healthCheck(): Promise<{ isHealthy: boolean; error?: string }> {
    try {
      const response = await this.makeRequest('/health', { method: 'GET' });
      return { isHealthy: isSuccessResponse(response) };
    } catch (error) {
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

export default UserRegistrationService;