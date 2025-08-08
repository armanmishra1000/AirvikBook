// =====================================================
// USER PROFILE SERVICE - FRONTEND API CLIENT
// =====================================================
// CRITICAL: Follow exact patterns from userLogin.service.ts
// - Use ApiClient.request for all API calls
// - Implement automatic token refresh
// - Use type guards for all responses
// - Handle file uploads with multipart/form-data

import {
  ApiResponse,
  isSuccessResponse,
  isErrorResponse,
  UserProfile,
  ProfileUpdateRequest,
  PrivacyUpdateRequest,
  GoogleConnectionRequest,
  ProfilePictureUploadRequest,
  GetProfileApiResponse,
  UpdateProfileApiResponse,
  UpdatePrivacyApiResponse,
  UploadPictureApiResponse,
  SyncPictureApiResponse,
  DeletePictureApiResponse,
  PictureStatusApiResponse,
  ConnectGoogleApiResponse,
  DisconnectGoogleApiResponse,
  ProfilePictureUpload,
  ProfilePictureSync,
  ProfilePictureStatus,
  GoogleConnectionResponse,
  GoogleDisconnectionResponse,
  PROFILE_ERROR_CODES
} from '../types/userProfile.types';

// Import UserLoginService for API client functionality
import { UserLoginService } from './userLogin.service';

// =====================================================
// SHARED API CLIENT (following userLogin patterns)
// =====================================================

class ProfileApiClient {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  private static readonly API_PREFIX = '/api/v1';
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

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
    } = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = false, skipAuthRefresh = false, retryCount = 0 } = options;

    try {
      const url = `${this.BASE_URL}${this.API_PREFIX}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication header if required
      if (requiresAuth) {
        const accessToken = this.getAccessToken();
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
        const refreshResult = await UserLoginService.refreshToken();
        
        if (isSuccessResponse(refreshResult)) {
          // Retry original request with new token
          return this.request<T>(method, endpoint, data, { 
            ...options, 
            skipAuthRefresh: true,
            retryCount: retryCount + 1
          });
        } else {
          // Refresh failed, clear tokens and redirect to login
          UserLoginService.clearAuthData();
          return {
            success: false,
            error: 'Session expired. Please log in again.',
            code: 'SESSION_EXPIRED'
          };
        }
      }

      // Retry logic: only retry on transient errors (5xx or 408). Do NOT retry on 4xx (e.g., 400/401/429)
      if (!response.ok) {
        const status = response.status;

        // Respect 429 by not retrying immediately; surface error to UI
        if (status === 429) {
          return responseData;
        }

        // Transient server/network errors eligible for retry
        const isTransient = status >= 500 || status === 408;
        if (isTransient && retryCount < this.MAX_RETRY_ATTEMPTS) {
          await this.delay(this.RETRY_DELAY * (retryCount + 1));
          return this.request<T>(method, endpoint, data, {
            ...options,
            retryCount: retryCount + 1
          });
        }
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

  private static getAccessToken(): string | null {
    try {
      return sessionStorage.getItem('airvik_access_token');
    } catch {
      return null;
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =====================================================
// PROFILE API SERVICE
// =====================================================

export class UserProfileService {
  /**
   * Get user profile
   * Endpoint: GET /user/profile
   */
  static async getProfile(): Promise<GetProfileApiResponse> {
    try {
      const response = await ProfileApiClient.request<UserProfile>(
        'GET',
        '/user/profile',
        undefined,
        { requiresAuth: true }
      );

      // MANDATORY: Use type guards for safe response handling
      if (isSuccessResponse(response)) {
        return response as GetProfileApiResponse;
      }

      return response as GetProfileApiResponse;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return {
        success: false,
        error: 'Failed to load profile',
        code: 'PROFILE_LOAD_FAILED'
      };
    }
  }

  /**
   * Update user profile
   * Endpoint: PUT /user/profile
   */
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<UpdateProfileApiResponse> {
    try {
      const response = await ProfileApiClient.request<{
        user: UserProfile;
        changesApplied: string[];
      }>(
        'PUT',
        '/user/profile',
        profileData,
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as UpdateProfileApiResponse;
      }

      return response as UpdateProfileApiResponse;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return {
        success: false,
        error: 'Failed to update profile',
        code: 'PROFILE_UPDATE_FAILED'
      };
    }
  }

  /**
   * Update privacy settings
   * Endpoint: PUT /user/profile/privacy
   */
  static async updatePrivacy(privacyData: PrivacyUpdateRequest): Promise<UpdatePrivacyApiResponse> {
    try {
      const response = await ProfileApiClient.request<{
        privacy: {
          profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
          showEmail: boolean;
          showPhone: boolean;
          allowGoogleSync: boolean;
        };
        updatedAt: string;
      }>(
        'PUT',
        '/user/profile/privacy',
        privacyData,
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as UpdatePrivacyApiResponse;
      }

      return response as UpdatePrivacyApiResponse;
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      return {
        success: false,
        error: 'Failed to update privacy settings',
        code: 'PRIVACY_UPDATE_FAILED'
      };
    }
  }

  /**
   * Upload profile picture
   * Endpoint: POST /user/profile/picture
   * Special handling for multipart/form-data
   */
  static async uploadProfilePicture(file: File): Promise<UploadPictureApiResponse> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('picture', file);

      // Custom request for file upload (multipart/form-data)
      const response = await this.makeFileUploadRequest<ProfilePictureUpload>(
        'POST',
        '/user/profile/picture',
        formData
      );

      if (isSuccessResponse(response)) {
        return response as UploadPictureApiResponse;
      }

      return response as UploadPictureApiResponse;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      return {
        success: false,
        error: 'Failed to upload profile picture',
        code: 'FILE_UPLOAD_FAILED'
      };
    }
  }

  /**
   * Sync profile picture from Google
   * Endpoint: POST /user/profile/picture/sync-google
   */
  static async syncPictureFromGoogle(): Promise<SyncPictureApiResponse> {
    try {
      const response = await ProfileApiClient.request<ProfilePictureSync>(
        'POST',
        '/user/profile/picture/sync-google',
        {},
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as SyncPictureApiResponse;
      }

      return response as SyncPictureApiResponse;
    } catch (error) {
      console.error('Failed to sync picture from Google:', error);
      return {
        success: false,
        error: 'Failed to sync picture from Google',
        code: 'GOOGLE_SYNC_FAILED'
      };
    }
  }

  /**
   * Delete profile picture
   * Endpoint: DELETE /user/profile/picture
   */
  static async deleteProfilePicture(): Promise<DeletePictureApiResponse> {
    try {
      const response = await ProfileApiClient.request<{ deleted: boolean }>(
        'DELETE',
        '/user/profile/picture',
        undefined,
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as DeletePictureApiResponse;
      }

      return response as DeletePictureApiResponse;
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
      return {
        success: false,
        error: 'Failed to delete profile picture',
        code: 'FILE_DELETE_FAILED'
      };
    }
  }

  /**
   * Get profile picture status
   * Endpoint: GET /user/profile/picture/status
   */
  static async getPictureStatus(): Promise<PictureStatusApiResponse> {
    try {
      const response = await ProfileApiClient.request<ProfilePictureStatus>(
        'GET',
        '/user/profile/picture/status',
        undefined,
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as PictureStatusApiResponse;
      }

      return response as PictureStatusApiResponse;
    } catch (error) {
      console.error('Failed to get picture status:', error);
      return {
        success: false,
        error: 'Failed to get picture status',
        code: 'STATUS_LOAD_FAILED'
      };
    }
  }

  /**
   * Connect Google account
   * Endpoint: POST /user/profile/connect-google
   */
  static async connectGoogle(googleToken: string): Promise<ConnectGoogleApiResponse> {
    try {
      const requestData: GoogleConnectionRequest = { googleToken };
      
      const response = await ProfileApiClient.request<GoogleConnectionResponse>(
        'POST',
        '/user/profile/connect-google',
        requestData,
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as ConnectGoogleApiResponse;
      }

      return response as ConnectGoogleApiResponse;
    } catch (error) {
      console.error('Failed to connect Google account:', error);
      return {
        success: false,
        error: 'Failed to connect Google account',
        code: 'GOOGLE_CONNECTION_FAILED'
      };
    }
  }

  /**
   * Disconnect Google account
   * Endpoint: DELETE /user/profile/disconnect-google
   */
  static async disconnectGoogle(): Promise<DisconnectGoogleApiResponse> {
    try {
      const response = await ProfileApiClient.request<GoogleDisconnectionResponse>(
        'DELETE',
        '/user/profile/disconnect-google',
        {},
        { requiresAuth: true }
      );

      if (isSuccessResponse(response)) {
        return response as DisconnectGoogleApiResponse;
      }

      return response as DisconnectGoogleApiResponse;
    } catch (error) {
      console.error('Failed to disconnect Google account:', error);
      return {
        success: false,
        error: 'Failed to disconnect Google account',
        code: 'GOOGLE_DISCONNECTION_FAILED'
      };
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Make file upload request with multipart/form-data
   * Special handling for file uploads that can't use JSON
   */
  private static async makeFileUploadRequest<T>(
    method: 'POST' | 'PUT',
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const apiPrefix = '/api/v1';
      const url = `${baseUrl}${apiPrefix}${endpoint}`;
      
      // Get access token for authentication
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Authentication required',
          code: 'MISSING_TOKEN'
        };
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      };

      const requestOptions: RequestInit = {
        method,
        headers,
        body: formData,
        signal: AbortSignal.timeout(30000) // 30 seconds for file uploads
      };

      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      // Handle token expiration
      if (response.status === 401 && responseData.code === 'TOKEN_EXPIRED') {
        // For file uploads, we'll return the error and let the UI handle refresh
        return {
          success: false,
          error: 'Session expired. Please try again.',
          code: 'SESSION_EXPIRED'
        };
      }

      return responseData;

    } catch (error) {
      console.error(`File upload request failed: ${method} ${endpoint}`, error);
      return {
        success: false,
        error: 'File upload failed. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Get access token from storage
   */
  private static getAccessToken(): string | null {
    try {
      return sessionStorage.getItem('airvik_access_token');
    } catch {
      return null;
    }
  }

  /**
   * Validate file before upload
   */
  static validateProfilePictureFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB'
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File must be JPEG, PNG, or WebP format'
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get error message for profile error codes
   */
  static getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      [PROFILE_ERROR_CODES.AUTH_REQUIRED]: 'Authentication required. Please log in.',
      [PROFILE_ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
      [PROFILE_ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Maximum size is 5MB.',
      [PROFILE_ERROR_CODES.INVALID_FILE_FORMAT]: 'Invalid file format. Please use JPEG, PNG, or WebP.',
      [PROFILE_ERROR_CODES.INVALID_PRIVACY_SETTING]: 'Invalid privacy setting.',
      [PROFILE_ERROR_CODES.GOOGLE_NOT_CONNECTED]: 'No Google account connected.',
      [PROFILE_ERROR_CODES.GOOGLE_ACCOUNT_EXISTS]: 'Google account is already connected to another user.',
      [PROFILE_ERROR_CODES.NO_ALTERNATIVE_AUTH]: 'Cannot disconnect Google account without password.',
      [PROFILE_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait before trying again.',
      [PROFILE_ERROR_CODES.PROFILE_UPDATE_FAILED]: 'Failed to update profile. Please try again.',
      [PROFILE_ERROR_CODES.FILE_UPLOAD_FAILED]: 'Failed to upload file. Please try again.',
    };

    return errorMessages[code] || 'An unexpected error occurred.';
  }
}

export default UserProfileService;
