/**
 * Centralized Path Configuration for Backend
 * 
 * All authentication routes are defined here for easy maintenance.
 * This ensures consistency and makes URL changes simple.
 */

// API Base Path
export const API_PREFIX = '/api/v1';

// Authentication Paths (with /auth prefix)
export const AUTH_PATHS = {
  REGISTER: '/register',
  LOGIN: '/login',
  GOOGLE_AUTH: '/google',
  GOOGLE_REDIRECT: '/google/redirect',
  GOOGLE_CALLBACK: '/google/callback',
  GOOGLE_LOGIN: '/google-login',
  REFRESH: '/refresh',
  LOGOUT: '/logout',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',
  CHECK_EMAIL: '/check-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  RESET_TOKEN: '/reset-token',
  PASSWORD: '/password',
  SET_PASSWORD: '/set-password',
  PASSWORD_STATUS: '/password-status',
  SESSIONS: '/sessions',
  LINK_GOOGLE: '/link-google',
  RESET_STATISTICS: '/reset-statistics',
  CLEANUP_RESET_TOKENS: '/cleanup-reset-tokens',
  // Frontend redirect paths (used by backend for redirects)
  ERROR: '/error',
  CALLBACK_SUCCESS: '/callback/success',
} as const;

// Email Paths
export const EMAIL_PATHS = {
  VERIFY_EMAIL: '/verify-email',
} as const;

// Helper functions for dynamic paths
export const getAuthPath = (path: keyof typeof AUTH_PATHS) => `${API_PREFIX}/auth${AUTH_PATHS[path]}`;

export const getEmailPath = (path: keyof typeof EMAIL_PATHS) => `${API_PREFIX}/email${EMAIL_PATHS[path]}`;

export const getResetTokenPath = (token: string) => `${API_PREFIX}/auth${AUTH_PATHS.RESET_TOKEN}/${token}`;

export const getCheckEmailPath = (email: string) => `${API_PREFIX}/auth${AUTH_PATHS.CHECK_EMAIL}/${encodeURIComponent(email)}`;

// Type safety
export type AuthPathKey = keyof typeof AUTH_PATHS;
export type AuthPathValue = typeof AUTH_PATHS[AuthPathKey];
export type EmailPathKey = keyof typeof EMAIL_PATHS;
export type EmailPathValue = typeof EMAIL_PATHS[EmailPathKey];
