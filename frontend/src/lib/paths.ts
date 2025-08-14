/**
 * Centralized Path Configuration
 * 
 * All authentication routes are defined here for easy maintenance.
 * This ensures consistency and makes URL changes simple.
 */

// Authentication Paths (without /auth prefix)
export const AUTH_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  SUCCESS: '/success',
  ERROR: '/error',
  CALLBACK_SUCCESS: '/callback/success',
  SESSIONS: '/sessions',
  LOGOUT: '/logout',
  LINK_GOOGLE: '/link-google',
  REFRESH: '/refresh',
  GOOGLE_LOGIN: '/google-login',
  GOOGLE_AUTH: '/google',
  PASSWORD: '/password',
  SET_PASSWORD: '/set-password',
  PASSWORD_STATUS: '/password-status',
  RESET_TOKEN: '/reset-token',
  RESEND_VERIFICATION: '/resend-verification',
  LINK_ACCOUNT: '/link-account',
} as const;

// Helper functions for dynamic paths
export const getResetPasswordPath = (token?: string) => 
  token ? `${AUTH_PATHS.RESET_PASSWORD}?token=${token}` : AUTH_PATHS.RESET_PASSWORD;

export const getVerifyEmailPath = (email?: string) => 
  email ? `${AUTH_PATHS.VERIFY_EMAIL}?email=${encodeURIComponent(email)}` : AUTH_PATHS.VERIFY_EMAIL;

export const getCallbackPath = (error?: string) => 
  error ? `${AUTH_PATHS.CALLBACK_SUCCESS}?error=${error}` : AUTH_PATHS.CALLBACK_SUCCESS;

// Type safety
export type AuthPathKey = keyof typeof AUTH_PATHS;
export type AuthPathValue = typeof AUTH_PATHS[AuthPathKey];
