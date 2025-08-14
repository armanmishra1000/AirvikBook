/**
 * Authentication Contract
 * Token storage: 
 * - Access token: sessionStorage
 * - Refresh token: localStorage
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN' | 'OWNER';
  profilePicture?: string;
  googleId?: string;
}

export const TOKEN_KEYS = {
  ACCESS: 'airvik_access_token',
  REFRESH: 'airvik_refresh_token',
  USER: 'airvik_user',
} as const;

// Note: These endpoints are now managed by the centralized path configuration
// in frontend/src/lib/paths.ts and backend/src/lib/paths.ts
// This is kept for backward compatibility but should be updated to use the centralized paths
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  GOOGLE_AUTH: '/auth/google',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
} as const;