'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { UserLoginService } from '../services/userLogin.service';
import { PasswordManagementService } from '../services/passwordManagement.service';
import { useToastHelpers } from '../components/common/Toast';
import {
  AuthState,
  AuthContextValue,
  LoginRequest,
  GoogleLoginRequest,
  User,
  LoginApiResponse,
  GoogleLoginApiResponse,
  RefreshApiResponse,
  LogoutApiResponse,
  SessionsApiResponse,
  LinkAccountApiResponse,
  ForgotPasswordApiResponse,
  ResetPasswordApiResponse,
  TokenVerificationApiResponse,
  isSuccessResponse,
  LOGIN_ERROR_CODES
} from '../types/userLogin.types';
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
} from '../types/userProfile.types';
import { UserProfileService } from '../services/userProfile.service';
import {
  ChangePasswordApiResponse,
  SetPasswordApiResponse,
  RemovePasswordApiResponse,
  PasswordStatusApiResponse,
  ResetTokenValidationApiResponse
} from '../types/passwordManagement.types';

// =====================================================
// AUTH REDUCER ACTIONS
// =====================================================

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'TOKEN_REFRESH'; payload: { accessToken: string; user?: User } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_LAST_ACTIVITY' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'PROFILE_UPDATE'; payload: { user: User; profilePicture?: string } }
  | { type: 'PRIVACY_UPDATE'; payload: { privacySettings: any } }
  | { type: 'GOOGLE_CONNECTION_UPDATE'; payload: { connectedAccounts: any } };

// =====================================================
// AUTH REDUCER
// =====================================================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        error: null,
        lastActivity: new Date()
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: action.payload,
        lastActivity: null
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        lastActivity: null
      };

    case 'TOKEN_REFRESH':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        user: action.payload.user || state.user,
        lastActivity: new Date(),
        error: null
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date()
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'PROFILE_UPDATE':
      return {
        ...state,
        user: action.payload.user,
        lastActivity: new Date()
      };

    case 'PRIVACY_UPDATE':
      return {
        ...state,
        lastActivity: new Date()
      };

    case 'GOOGLE_CONNECTION_UPDATE':
      return {
        ...state,
        lastActivity: new Date()
      };

    default:
      return state;
  }
};

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true, // Start as loading to check existing authentication
  error: null,
  lastActivity: null
};

// =====================================================
// AUTH CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =====================================================
// AUTH PROVIDER COMPONENT
// =====================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);
  const initializationRef = useRef(false);
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showSuccess } = useToastHelpers();

  // =====================================================
  // INITIALIZATION EFFECT
  // =====================================================

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        // Check if user has refresh token (even if access token is missing)
        const hasRefreshToken = UserLoginService.hasRefreshToken();
        const user = UserLoginService.getCurrentUser();
        
        if (hasRefreshToken && user) {
          console.log('Found refresh token, attempting to restore authentication...');
          // Try to refresh token to restore authentication
          const refreshResult = await UserLoginService.refreshToken();
          
          if (isSuccessResponse(refreshResult)) {
            console.log('Authentication restored successfully');
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: refreshResult.data.user,
                accessToken: refreshResult.data.accessToken,
                refreshToken: UserLoginService.getCurrentUser()?.id || '' // We don't expose refresh token
              }
            });
            
            // Show welcome message for OAuth users (only if coming from OAuth callback)
            const isFromOAuth = sessionStorage.getItem('oauth_redirect');
            if (isFromOAuth) {
              sessionStorage.removeItem('oauth_redirect'); // Clear the flag
              showSuccess(
                'Welcome to AirVikBook!',
                `Successfully signed in as ${refreshResult.data.user.fullName}`
              );
            }
            
            // Setup automatic token refresh
            setupTokenRefresh();
          } else {
            console.log('Failed to restore authentication, clearing storage');
            // Invalid authentication, clear storage
            UserLoginService.clearAuthData();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          console.log('No refresh token found, user not authenticated');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        UserLoginService.clearAuthData();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // =====================================================
  // TOKEN REFRESH MANAGEMENT
  // =====================================================

  const setupTokenRefresh = () => {
    // Clear existing timeout
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
    }

    // Setup automatic refresh 2 minutes before expiration (13 minutes)
    const refreshTimeout = 13 * 60 * 1000; // 13 minutes
    
    console.log(`Setting up token refresh in ${refreshTimeout / 1000 / 60} minutes`);
    
    tokenRefreshTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Executing automatic token refresh...');
        const refreshResult = await UserLoginService.refreshToken();
        
        if (isSuccessResponse(refreshResult)) {
          console.log('Automatic token refresh successful');
          dispatch({
            type: 'TOKEN_REFRESH',
            payload: {
              accessToken: refreshResult.data.accessToken,
              user: refreshResult.data.user
            }
          });
          
          // Setup next refresh
          setupTokenRefresh();
        } else {
          console.log('Automatic token refresh failed:', refreshResult.error);
          // Refresh failed, logout user
          await handleLogout();
          // Redirect to login
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        await handleLogout();
        window.location.href = '/auth/login';
      }
    }, refreshTimeout);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
    };
  }, []);

  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  const login = async (credentials: LoginRequest): Promise<LoginApiResponse> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await UserLoginService.login(credentials);
      
      if (isSuccessResponse(result)) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.data.user,
            accessToken: result.data.tokens.accessToken,
            refreshToken: result.data.tokens.refreshToken
          }
        });
        
        // Setup automatic token refresh
        setupTokenRefresh();
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: result.error || 'Login failed' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'Network error during login';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        code: 'NETWORK_ERROR'
      };
    }
  };

  const loginWithGoogle = async (credentials: GoogleLoginRequest): Promise<GoogleLoginApiResponse> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await UserLoginService.loginWithGoogle(credentials);
      
      if (isSuccessResponse(result)) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.data.user,
            accessToken: result.data.tokens.accessToken,
            refreshToken: result.data.tokens.refreshToken
          }
        });
        
        // Setup automatic token refresh
        setupTokenRefresh();
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: result.error || 'Google login failed' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'Network error during Google login';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      return {
        success: false,
        error: errorMessage,
        code: 'NETWORK_ERROR'
      };
    }
  };

  const logout = async (allDevices: boolean = false): Promise<LogoutApiResponse> => {
    try {
      const result = await UserLoginService.logout(allDevices);
      await handleLogout();
      return result;
    } catch (error) {
      // Even if API call fails, logout locally
      await handleLogout();
      return {
        success: true,
        data: {
          loggedOut: true,
          sessionsInvalidated: 0,
          message: 'Logged out locally'
        }
      };
    }
  };

  const handleLogout = async () => {
    // Clear token refresh timeout
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
      tokenRefreshTimeoutRef.current = null;
    }
    
    // Clear auth data
    UserLoginService.clearAuthData();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const refreshToken = async (): Promise<RefreshApiResponse> => {
    try {
      const result = await UserLoginService.refreshToken();
      
      if (isSuccessResponse(result)) {
        dispatch({
          type: 'TOKEN_REFRESH',
          payload: {
            accessToken: result.data.accessToken,
            user: result.data.user
          }
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'Token refresh failed';
      return {
        success: false,
        error: errorMessage,
        code: 'REFRESH_FAILED'
      };
    }
  };

  // =====================================================
  // SESSION MANAGEMENT METHODS
  // =====================================================

  const getSessions = async (): Promise<SessionsApiResponse> => {
    try {
      return await UserLoginService.getSessions();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get sessions',
        code: 'SESSION_ERROR'
      };
    }
  };

  const logoutFromDevice = async (sessionId: string): Promise<LogoutApiResponse> => {
    try {
      return await UserLoginService.logoutFromDevice(sessionId);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to logout from device',
        code: 'LOGOUT_ERROR'
      };
    }
  };

  const logoutFromAllDevices = async (): Promise<LogoutApiResponse> => {
    try {
      const result = await UserLoginService.logout(true);
      await handleLogout();
      return result;
    } catch (error) {
      await handleLogout();
      return {
        success: true,
        data: {
          loggedOut: true,
          sessionsInvalidated: 0,
          message: 'Logged out locally'
        }
      };
    }
  };

  // =====================================================
  // ACCOUNT MANAGEMENT METHODS
  // =====================================================

  const linkGoogleAccount = async (token: string): Promise<LinkAccountApiResponse> => {
    try {
      const result = await UserLoginService.linkGoogleAccount(token);
      
      if (isSuccessResponse(result)) {
        dispatch({ type: 'UPDATE_USER', payload: result.data.user });
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to link Google account',
        code: 'LINK_ERROR'
      };
    }
  };

  // =====================================================
  // PASSWORD RESET METHODS
  // =====================================================

  const forgotPassword = async (email: string): Promise<ForgotPasswordApiResponse> => {
    try {
      return await UserLoginService.forgotPassword(email);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to request password reset',
        code: 'RESET_REQUEST_ERROR'
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<ResetPasswordApiResponse> => {
    try {
      return await UserLoginService.resetPassword(token, newPassword);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reset password',
        code: 'RESET_ERROR'
      };
    }
  };

  const verifyResetToken = async (token: string): Promise<TokenVerificationApiResponse> => {
    try {
      return await UserLoginService.verifyResetToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify reset token',
        code: 'TOKEN_VERIFICATION_ERROR'
      };
    }
  };

  // =====================================================
  // ENHANCED PASSWORD MANAGEMENT METHODS
  // =====================================================

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    invalidateOtherSessions: boolean = false
  ): Promise<ChangePasswordApiResponse> => {
    try {
      return await PasswordManagementService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
        invalidateOtherSessions
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to change password',
        code: 'PASSWORD_CHANGE_ERROR'
      };
    }
  };

  const setPassword = async (newPassword: string, confirmPassword: string): Promise<SetPasswordApiResponse> => {
    try {
      return await PasswordManagementService.setPassword(newPassword, confirmPassword);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to set password',
        code: 'PASSWORD_SET_ERROR'
      };
    }
  };

  const removePassword = async (currentPassword: string, confirmGoogleOnly: boolean): Promise<RemovePasswordApiResponse> => {
    try {
      return await PasswordManagementService.removePassword(currentPassword, confirmGoogleOnly);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to remove password',
        code: 'PASSWORD_REMOVE_ERROR'
      };
    }
  };

  const getPasswordStatus = async (): Promise<PasswordStatusApiResponse> => {
    try {
      return await PasswordManagementService.getPasswordStatus();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get password status',
        code: 'PASSWORD_STATUS_ERROR'
      };
    }
  };

  const verifyResetTokenEnhanced = async (token: string): Promise<ResetTokenValidationApiResponse> => {
    try {
      return await PasswordManagementService.verifyResetToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify reset token',
        code: 'TOKEN_VERIFICATION_ERROR'
      };
    }
  };

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  const isTokenExpired = (): boolean => {
    return UserLoginService.isTokenExpired();
  };

  const clearAuthState = (): void => {
    UserLoginService.clearAuthData();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const updateLastActivity = (): void => {
    UserLoginService.updateLastActivity();
    dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
  };

  // =====================================================
  // PROFILE MANAGEMENT METHODS
  // =====================================================

  const updateProfile = async (profileData: ProfileUpdateRequest): Promise<UpdateProfileApiResponse> => {
    try {
      const response = await UserProfileService.updateProfile(profileData);
      
      if (isSuccessResponse(response)) {
        // Update user data in context - convert UserProfile to User
        const updatedUser: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          mobileNumber: response.data.user.mobileNumber,
          role: authState.user?.role || 'GUEST',
          profilePicture: response.data.user.profilePicture,
          googleId: response.data.user.googleId,
          isEmailVerified: authState.user?.isEmailVerified || false,
          lastLoginAt: authState.user?.lastLoginAt,
          createdAt: authState.user?.createdAt || new Date().toISOString(),
          isActive: authState.user?.isActive || true
        };
        
        dispatch({ 
          type: 'PROFILE_UPDATE', 
          payload: { 
            user: updatedUser,
            profilePicture: response.data.user.profilePicture 
          } 
        });
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR'
      };
    }
  };

  const uploadProfilePicture = async (file: File): Promise<UploadPictureApiResponse> => {
    try {
      const response = await UserProfileService.uploadProfilePicture(file);
      
      if (isSuccessResponse(response)) {
        // Update user data with new profile picture
        if (authState.user) {
          dispatch({ 
            type: 'PROFILE_UPDATE', 
            payload: { 
              user: { ...authState.user, profilePicture: response.data.profilePicture },
              profilePicture: response.data.profilePicture 
            } 
          });
        }
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to upload profile picture',
        code: 'PICTURE_UPLOAD_ERROR'
      };
    }
  };

  const syncGoogleProfilePicture = async (): Promise<SyncPictureApiResponse> => {
    try {
      const response = await UserProfileService.syncPictureFromGoogle();
      
      if (isSuccessResponse(response)) {
        // Update user data with synced profile picture
        if (authState.user) {
          dispatch({ 
            type: 'PROFILE_UPDATE', 
            payload: { 
              user: { ...authState.user, profilePicture: response.data.profilePicture },
              profilePicture: response.data.profilePicture 
            } 
          });
        }
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sync Google profile picture',
        code: 'GOOGLE_SYNC_ERROR'
      };
    }
  };

  const updatePrivacySettings = async (settings: PrivacyUpdateRequest): Promise<UpdatePrivacyApiResponse> => {
    try {
      const response = await UserProfileService.updatePrivacy(settings);
      
      if (isSuccessResponse(response)) {
        dispatch({ type: 'PRIVACY_UPDATE', payload: { privacySettings: response.data } });
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update privacy settings',
        code: 'PRIVACY_UPDATE_ERROR'
      };
    }
  };

  const connectGoogleAccount = async (token: string): Promise<ConnectGoogleApiResponse> => {
    try {
      const response = await UserProfileService.connectGoogle(token);
      
      if (isSuccessResponse(response)) {
        dispatch({ type: 'GOOGLE_CONNECTION_UPDATE', payload: { connectedAccounts: response.data.connectedAccounts } });
        
        // Update user data if profile updates were included
        if (response.data.profileUpdates && authState.user) {
          const updatedUser = { ...authState.user };
          if (response.data.profileUpdates.profilePicture) {
            updatedUser.profilePicture = response.data.profileUpdates.profilePicture;
          }
          if (response.data.profileUpdates.fullName) {
            updatedUser.fullName = response.data.profileUpdates.fullName;
          }
          dispatch({ type: 'PROFILE_UPDATE', payload: { user: updatedUser } });
        }
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect Google account',
        code: 'GOOGLE_CONNECTION_ERROR'
      };
    }
  };

  const disconnectGoogleAccount = async (): Promise<DisconnectGoogleApiResponse> => {
    try {
      const response = await UserProfileService.disconnectGoogle();
      
      if (isSuccessResponse(response)) {
        dispatch({ type: 'GOOGLE_CONNECTION_UPDATE', payload: { connectedAccounts: response.data.connectedAccounts } });
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to disconnect Google account',
        code: 'GOOGLE_DISCONNECTION_ERROR'
      };
    }
  };

  const refreshUserData = async (): Promise<GetProfileApiResponse> => {
    try {
      const response = await UserProfileService.getProfile();
      
      if (isSuccessResponse(response)) {
        // Update user data with fresh profile information - convert UserProfile to User
        const updatedUser: User = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          mobileNumber: response.data.mobileNumber,
          role: authState.user?.role || 'GUEST',
          profilePicture: response.data.profilePicture,
          googleId: response.data.googleId,
          isEmailVerified: authState.user?.isEmailVerified || false,
          lastLoginAt: authState.user?.lastLoginAt,
          createdAt: authState.user?.createdAt || new Date().toISOString(),
          isActive: authState.user?.isActive || true
        };
        
        dispatch({ type: 'PROFILE_UPDATE', payload: { user: updatedUser } });
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to refresh user data',
        code: 'USER_DATA_REFRESH_ERROR'
      };
    }
  };

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const contextValue: AuthContextValue = {
    // State
    authState,
    
    // Authentication Actions
    login,
    loginWithGoogle,
    logout,
    refreshToken,
    
    // Session Management
    getSessions,
    logoutFromDevice,
    logoutFromAllDevices,
    
    // Account Management
    linkGoogleAccount,
    
    // Password Reset
    forgotPassword,
    resetPassword,
    verifyResetToken,
    
    // Enhanced Password Management
    changePassword,
    setPassword,
    removePassword,
    getPasswordStatus,
    verifyResetTokenEnhanced,
    
    // Utilities
    isTokenExpired,
    clearAuthState,
    updateLastActivity,
    
    // Profile Management Methods
    updateProfile,
    uploadProfilePicture,
    syncGoogleProfilePicture,
    updatePrivacySettings,
    connectGoogleAccount,
    disconnectGoogleAccount,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// CUSTOM HOOK
// =====================================================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// =====================================================
// UTILITY HOOKS
// =====================================================

export const useAuthUser = (): User | null => {
  const { authState } = useAuth();
  return authState.user;
};

export const useIsAuthenticated = (): boolean => {
  const { authState } = useAuth();
  return authState.isAuthenticated;
};

export const useAuthLoading = (): boolean => {
  const { authState } = useAuth();
  return authState.isLoading;
};

export const useAuthError = (): string | null => {
  const { authState } = useAuth();
  return authState.error;
};

// Default export
export default AuthProvider;