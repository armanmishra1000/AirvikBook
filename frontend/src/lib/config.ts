// =====================================================
// APPLICATION CONFIGURATION
// =====================================================

export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 20 * 60 * 1000, // 20 minutes in milliseconds
  REFRESH_BUFFER: 3 * 60 * 1000,       // 3 minutes before expiry
  MAX_REFRESH_ATTEMPTS: 3,
  REFRESH_RETRY_DELAY: 1000,           // 1 second
  IMMEDIATE_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
};

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  API_PREFIX: '/api/v1',
  TIMEOUT: 10000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const APP_CONFIG = {
  NAME: 'AirVikBook',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};
