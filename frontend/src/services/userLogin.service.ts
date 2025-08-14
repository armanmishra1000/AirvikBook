// =====================================================
// USER LOGIN SERVICE - FRONTEND API CLIENT
// =====================================================
// CRITICAL: Follow exact token storage patterns
// - Access Token: sessionStorage.getItem('airvik_access_token')
// - Refresh Token: localStorage.getItem('airvik_refresh_token')
// - User Data: localStorage.getItem('airvik_user')

import {
  ApiResponse,
  LoginRequest,
  GoogleLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LinkGoogleAccountRequest,
  LoginApiResponse,
  GoogleLoginApiResponse,
  RefreshApiResponse,
  LogoutApiResponse,
  SessionsApiResponse,
  ForgotPasswordApiResponse,
  ResetPasswordApiResponse,
  TokenVerificationApiResponse,
  LinkAccountApiResponse,
  User,
  DeviceInfo,
  DeviceFingerprintResult,
  ApiError,
  isSuccessResponse,
  isErrorResponse,
  LOGIN_ERROR_CODES
} from '../types/userLogin.types';
import { AUTH_PATHS } from '../lib/paths';

// =====================================================
// TOKEN STORAGE UTILITIES
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
  static getUserData(): User | null {
    try {
      const userData = localStorage.getItem('airvik_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static setUserData(user: User): void {
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

  // Complete token and data management
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
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

// =====================================================
// DEVICE FINGERPRINTING UTILITIES
// =====================================================

class DeviceUtils {
  static generateDeviceFingerprint(): DeviceFingerprintResult {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const cookieEnabled = navigator.cookieEnabled;
    
    const screen = {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth
    };

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Generate device ID based on multiple factors
    const fingerprint = {
      userAgent,
      language,
      platform,
      cookieEnabled,
      screen,
      timezone
    };

    const fingerprintString = JSON.stringify(fingerprint);
    const deviceId = btoa(fingerprintString).substring(0, 32);
    const deviceName = this.parseDeviceName(userAgent);

    return {
      deviceId,
      deviceName,
      fingerprint,
      confidence: 0.8 // Basic confidence level
    };
  }

  static parseDeviceName(userAgent: string): string {
    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) {
      if (ua.includes('mobile')) return 'Android Phone';
      return 'Android Tablet';
    }

    // Desktop OS
    if (ua.includes('windows')) return 'Windows Device';
    if (ua.includes('mac')) return 'Mac Device';
    if (ua.includes('linux')) return 'Linux Device';

    // Browsers
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';

    return 'Unknown Device';
  }

  static getDeviceInfo(): DeviceInfo {
    const fingerprint = this.generateDeviceFingerprint();
    return {
      deviceId: fingerprint.deviceId,
      deviceName: fingerprint.deviceName,
      userAgent: navigator.userAgent,
      lastActivity: new Date().toISOString()
    };
  }
}

// =====================================================
// API CLIENT CONFIGURATION
// =====================================================

class ApiClient {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  private static readonly API_PREFIX = '/api/v1';
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  private static isRefreshing = false;
  private static refreshPromise: Promise<RefreshApiResponse> | null = null;

  /**
   * Make authenticated API request with automatic token refresh
   */
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
    const { requiresAuth = false, skipAuthRefresh = false, retryCount = 0, customHeaders = {} } = options;

    try {
      const url = `${this.BASE_URL}${this.API_PREFIX}/auth${endpoint}`;
      
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
            code: 'MISSING_TOKEN'
          };
        }
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(this.TIMEOUT)
      };

      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      // Handle token expiration with automatic refresh
      if (
        requiresAuth && 
        !skipAuthRefresh && 
        response.status === 401 && 
        responseData.code === 'TOKEN_EXPIRED'
      ) {
        const refreshResult = await this.refreshTokenWithQueue();
        
        if (isSuccessResponse(refreshResult)) {
          // Retry original request with new token
          return this.request<T>(method, endpoint, data, { 
            ...options, 
            skipAuthRefresh: true,
            retryCount: retryCount + 1
          });
        } else {
          // Refresh failed, clear tokens and redirect to login
          TokenStorage.clearAll();
          return {
            success: false,
            error: 'Session expired. Please log in again.',
            code: 'SESSION_EXPIRED'
          };
        }
      }

      // Handle network errors with retry logic
      if (!response.ok && retryCount < this.MAX_RETRY_ATTEMPTS) {
        // Don't retry on rate limit errors (429)
        if (response.status === 429) {
          return {
            success: false,
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          };
        }
        
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.request<T>(method, endpoint, data, {
          ...options,
          retryCount: retryCount + 1
        });
      }

      return responseData;

    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      
      // Network error - retry if applicable
      if (retryCount < this.MAX_RETRY_ATTEMPTS) {
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.request<T>(method, endpoint, data, {
          ...options,
          retryCount: retryCount + 1
        });
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Queue token refresh to prevent multiple simultaneous refresh requests
   */
  private static async refreshTokenWithQueue(): Promise<RefreshApiResponse> {
    if (this.refreshPromise) {
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

  /**
   * Perform actual token refresh
   */
  private static async performTokenRefresh(): Promise<RefreshApiResponse> {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
        code: 'NO_REFRESH_TOKEN'
      };
    }

    const response = await this.request<RefreshApiResponse['data']>(
      'POST',
      AUTH_PATHS.REFRESH,
      { refreshToken },
      { skipAuthRefresh: true }
    );

    if (isSuccessResponse(response) && response.data) {
      // Update stored access token
      TokenStorage.setAccessToken(response.data.accessToken);
      
      // Update user data if provided
      if (response.data.user) {
        TokenStorage.setUserData(response.data.user);
      }
    }

    return response as RefreshApiResponse;
  }

  /**
   * Utility delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =====================================================
// MAIN LOGIN SERVICE CLASS
// =====================================================

export class UserLoginService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginApiResponse> {
    try {
      // Ensure device info is included
      const deviceInfo = credentials.deviceInfo || DeviceUtils.getDeviceInfo();
      
      const requestData = {
        ...credentials,
        deviceInfo
      };

      const response = await ApiClient.request<LoginApiResponse['data']>(
        'POST',
        AUTH_PATHS.LOGIN,
        requestData
      );

      if (isSuccessResponse(response) && response.data) {
        // Store tokens and user data
        TokenStorage.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        TokenStorage.setUserData(response.data.user);
      }

      return response as LoginApiResponse;
      
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: 'Login request failed',
        code: 'REQUEST_FAILED'
      };
    }
  }

  /**
   * Authenticate user with Google OAuth
   */
  static async loginWithGoogle(credentials: GoogleLoginRequest): Promise<GoogleLoginApiResponse> {
    try {
      // Ensure device info is included
      const deviceInfo = credentials.deviceInfo || DeviceUtils.getDeviceInfo();
      
      const requestData = {
        ...credentials,
        deviceInfo
      };

      const response = await ApiClient.request<GoogleLoginApiResponse['data']>(
        'POST',
        AUTH_PATHS.GOOGLE_LOGIN,
        requestData
      );

      if (isSuccessResponse(response) && response.data) {
        // Store tokens and user data
        TokenStorage.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        TokenStorage.setUserData(response.data.user);
      }

      return response as GoogleLoginApiResponse;
      
    } catch (error) {
      console.error('Google login failed:', error);
      return {
        success: false,
        error: 'Google login request failed',
        code: 'REQUEST_FAILED'
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<RefreshApiResponse> {
    const refreshToken = TokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
        code: 'NO_REFRESH_TOKEN'
      };
    }

    const response = await ApiClient.request<RefreshApiResponse['data']>(
      'POST',
      AUTH_PATHS.REFRESH,
      { refreshToken }
    );
    return response as RefreshApiResponse;
  }

  /**
   * Logout user (single device or all devices)
   */
  static async logout(allDevices: boolean = false): Promise<LogoutApiResponse> {
    try {
      const refreshToken = TokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        // Clear local storage anyway
        TokenStorage.clearAll();
        return {
          success: true,
          data: {
            loggedOut: true,
            sessionsInvalidated: 0,
            message: 'Logged out locally'
          }
        };
      }

      let response: LogoutApiResponse;

      if (allDevices) {
        const apiResponse = await ApiClient.request<LogoutApiResponse['data']>(
          'DELETE',
          AUTH_PATHS.SESSIONS,
          undefined,
          { requiresAuth: true }
        );
        response = apiResponse as LogoutApiResponse;
      } else {
        const apiResponse = await ApiClient.request<LogoutApiResponse['data']>(
          'POST',
          AUTH_PATHS.LOGOUT,
          { refreshToken, logoutFromAllDevices: false },
          { requiresAuth: true }
        );
        response = apiResponse as LogoutApiResponse;
      }

      // Always clear local storage regardless of API response
      TokenStorage.clearAll();
      
      return response as LogoutApiResponse;
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local storage even if API call fails
      TokenStorage.clearAll();
      return {
        success: true,
        data: {
          loggedOut: true,
          sessionsInvalidated: 0,
          message: 'Logged out locally'
        }
      };
    }
  }

  /**
   * Get active sessions for current user
   */
  static async getSessions(): Promise<SessionsApiResponse> {
    try {
      const refreshToken = TokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token available',
          code: 'NO_REFRESH_TOKEN'
        };
      }

      const response = await ApiClient.request<SessionsApiResponse['data']>(
        'GET',
        AUTH_PATHS.SESSIONS,
        undefined,
        { 
          requiresAuth: true,
          customHeaders: { 'X-Refresh-Token': refreshToken }
        }
      );
      
      return response as SessionsApiResponse;
    } catch (error) {
      console.error('Error getting sessions:', error);
      return {
        success: false,
        error: 'Failed to get sessions',
        code: 'SESSION_ERROR'
      };
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutFromAllDevices(): Promise<LogoutApiResponse> {
    try {
      const response = await ApiClient.request<LogoutApiResponse['data']>(
        'DELETE',
        AUTH_PATHS.SESSIONS,
        undefined,
        { requiresAuth: true }
      );

      // Always clear local storage regardless of API response
      TokenStorage.clearAll();
      
      return response as LogoutApiResponse;
    } catch (error) {
      console.error('Logout from all devices failed:', error);
      // Clear local storage even if API call fails
      TokenStorage.clearAll();
      return {
        success: true,
        data: {
          loggedOut: true,
          sessionsInvalidated: 0,
          message: 'Logged out locally'
        }
      };
    }
  }

  /**
   * Logout from specific device/session
   */
  static async logoutFromDevice(sessionId: string): Promise<LogoutApiResponse> {
    const response = await ApiClient.request<LogoutApiResponse['data']>(
      'DELETE',
      `${AUTH_PATHS.SESSIONS}/${sessionId}`,
      undefined,
      { requiresAuth: true }
    );
    return response as LogoutApiResponse;
  }

  /**
   * Link Google account to current user
   */
  static async linkGoogleAccount(googleToken: string): Promise<LinkAccountApiResponse> {
    const response = await ApiClient.request<LinkAccountApiResponse['data']>(
      'POST',
      AUTH_PATHS.LINK_GOOGLE,
      { googleToken },
      { requiresAuth: true }
    );
    return response as LinkAccountApiResponse;
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<ForgotPasswordApiResponse> {
    const response = await ApiClient.request<ForgotPasswordApiResponse['data']>(
      'POST',
      AUTH_PATHS.FORGOT_PASSWORD,
      { email }
    );
    return response as ForgotPasswordApiResponse;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<ResetPasswordApiResponse> {
    const response = await ApiClient.request<ResetPasswordApiResponse['data']>(
      'POST',
      AUTH_PATHS.RESET_PASSWORD,
      { token, newPassword }
    );
    return response as ResetPasswordApiResponse;
  }

  /**
   * Verify password reset token
   */
  static async verifyResetToken(token: string): Promise<TokenVerificationApiResponse> {
    const response = await ApiClient.request<TokenVerificationApiResponse['data']>(
      'GET',
      `/auth/verify-reset-token/${token}`
    );
    return response as TokenVerificationApiResponse;
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return TokenStorage.hasValidTokens();
  }

  /**
   * Check if user has a refresh token (for authentication restoration)
   */
  static hasRefreshToken(): boolean {
    return !!TokenStorage.getRefreshToken();
  }

  /**
   * Get current user data from storage
   */
  static getCurrentUser(): User | null {
    return TokenStorage.getUserData();
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    TokenStorage.clearAll();
  }

  /**
   * Check if access token is expired (basic check)
   */
  static isTokenExpired(): boolean {
    const token = TokenStorage.getAccessToken();
    if (!token) return true;

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true; // Assume expired if we can't parse
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateLastActivity(): void {
    const user = TokenStorage.getUserData();
    if (user) {
      const updatedUser = {
        ...user,
        lastLoginAt: new Date().toISOString()
      };
      TokenStorage.setUserData(updatedUser);
    }
  }

  /**
   * Get device information for current device
   */
  static getDeviceInfo(): DeviceInfo {
    return DeviceUtils.getDeviceInfo();
  }

  /**
   * Check authentication status with server validation
   */
  static async validateAuthentication(): Promise<boolean> {
    try {
      const response = await this.getSessions();
      return isSuccessResponse(response);
    } catch {
      return false;
    }
  }
}

// =====================================================
// EXPORT DEFAULT SERVICE
// =====================================================

export default UserLoginService;