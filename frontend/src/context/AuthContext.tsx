'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { UserLoginService } from '../services/userLogin.service';
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
  | { type: 'SET_LOADING'; payload: boolean };

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

  // =====================================================
  // INITIALIZATION EFFECT
  // =====================================================

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        const isAuthenticated = UserLoginService.isAuthenticated();
        const user = UserLoginService.getCurrentUser();
        
        if (isAuthenticated && user) {
          // Try to refresh token to verify authentication
          const refreshResult = await UserLoginService.refreshToken();
          
          if (isSuccessResponse(refreshResult)) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: refreshResult.data.user,
                accessToken: refreshResult.data.accessToken,
                refreshToken: UserLoginService.getCurrentUser()?.id || '' // We don't expose refresh token
              }
            });
            
            // Setup automatic token refresh
            setupTokenRefresh();
          } else {
            // Invalid authentication, clear storage
            UserLoginService.clearAuthData();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
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
    
    tokenRefreshTimeoutRef.current = setTimeout(async () => {
      try {
        const refreshResult = await UserLoginService.refreshToken();
        
        if (isSuccessResponse(refreshResult)) {
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
          // Refresh failed, logout user
          await handleLogout();
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        await handleLogout();
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
    
    // Utilities
    isTokenExpired,
    clearAuthState,
    updateLastActivity
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