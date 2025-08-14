import React from 'react';
import { useTokenExpiration } from '../hooks/useTokenExpiration';

/**
 * Global API error handler utility
 * Provides consistent error handling for API responses
 */
export class ApiErrorHandler {
  private static handleTokenExpiration: ((errorCode: string, errorMessage?: string) => Promise<void>) | null = null;

  /**
   * Initialize the error handler with token expiration handler
   */
  static initialize(handleTokenExpiration: (errorCode: string, errorMessage?: string) => Promise<void>) {
    this.handleTokenExpiration = handleTokenExpiration;
  }

  /**
   * Handle API response errors consistently
   */
  static async handleApiError(response: any): Promise<boolean> {
    // Check for token expiration errors
    if (response.code === 'TOKEN_EXPIRED' || response.code === 'SESSION_EXPIRED') {
      if (this.handleTokenExpiration) {
        await this.handleTokenExpiration(response.code, response.error);
        return true; // Error was handled
      }
    }

    return false; // Error was not handled
  }

  /**
   * Check if an error is a token expiration error
   */
  static isTokenExpirationError(error: any): boolean {
    return error?.code === 'TOKEN_EXPIRED' || error?.code === 'SESSION_EXPIRED';
  }

  /**
   * Get user-friendly error message for common error codes
   */
  static getErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred';

    switch (error.code) {
      case 'TOKEN_EXPIRED':
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please log in again.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'VALIDATION_ERROR':
        return error.error || 'Please check your input and try again.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.';
      default:
        return error.error || 'An unexpected error occurred. Please try again.';
    }
  }
}

/**
 * Hook to use the API error handler
 */
export const useApiErrorHandler = () => {
  const { handleTokenExpiration } = useTokenExpiration();

  // Initialize the error handler
  React.useEffect(() => {
    ApiErrorHandler.initialize(handleTokenExpiration);
  }, [handleTokenExpiration]);

  return {
    handleApiError: ApiErrorHandler.handleApiError.bind(ApiErrorHandler),
    isTokenExpirationError: ApiErrorHandler.isTokenExpirationError.bind(ApiErrorHandler),
    getErrorMessage: ApiErrorHandler.getErrorMessage.bind(ApiErrorHandler)
  };
};
