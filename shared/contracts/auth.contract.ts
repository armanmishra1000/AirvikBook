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
  role: 'guest' | 'staff' | 'admin' | 'owner';
  profilePicture?: string;
  googleId?: string;
}

export const TOKEN_KEYS = {
  ACCESS: 'airvik_access_token',
  REFRESH: 'airvik_refresh_token',
  USER: 'airvik_user',
} as const;

export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  GOOGLE_AUTH: '/auth/google',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
} as const;