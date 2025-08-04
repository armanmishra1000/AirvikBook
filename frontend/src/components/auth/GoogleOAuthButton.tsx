'use client';

/**
 * Google OAuth Button Component
 * 
 * BRAND COMPLIANCE: Uses brand tokens for colors, spacing, typography
 * REACT PATTERNS: Proper useRef for one-time operations, no function deps in useEffect
 */

import React, { useState, useRef, useEffect } from 'react';
import { isSuccessResponse } from '../../types/userRegistration.types';
import UserRegistrationService from '../../services/userRegistration.service';

interface GoogleOAuthButtonProps {
  onSuccess?: (user: any, tokens: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  linkToEmail?: string; // For account linking
}

export default function GoogleOAuthButton({
  onSuccess,
  onError,
  disabled = false,
  className = '',
  linkToEmail
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const mounted = useRef(true);
  const googleInitialized = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Initialize Google OAuth (one-time operation)
  useEffect(() => {
    if (!googleInitialized.current) {
      googleInitialized.current = true;
      initializeGoogle();
    }
  }, []);

  /**
   * Load and initialize Google OAuth
   */
  const initializeGoogle = () => {
    // Check if Google script is already loaded
    if (window.google?.accounts) {
      setIsGoogleLoaded(true);
      return;
    }

    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (mounted.current && window.google?.accounts) {
        setIsGoogleLoaded(true);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Google OAuth script');
      onError?.('Failed to load Google authentication. Please try again.');
    };
    
    document.head.appendChild(script);
  };

  /**
   * Handle Google OAuth button click
   */
  const handleGoogleSignIn = () => {
    if (!isGoogleLoaded || !window.google?.accounts || isLoading || disabled) {
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Google OAuth client
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Show the Google sign-in prompt
              window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if prompt is not displayed
          if (window.google?.accounts?.oauth2) {
            window.google.accounts.oauth2.initTokenClient({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
              scope: 'openid email profile',
              callback: handleTokenResponse,
            }).requestAccessToken();
          }
        }
      });
    } catch (error) {
      console.error('Google sign-in initialization error:', error);
      setIsLoading(false);
      onError?.('Failed to initialize Google sign-in. Please try again.');
    }
  };

  /**
   * Handle Google OAuth response (JWT token)
   */
  const handleGoogleResponse = async (response: any) => {
    if (!mounted.current) return;

    try {
      const googleToken = response.credential;
      
      if (!googleToken) {
        throw new Error('No Google token received');
      }

      await processGoogleAuth(googleToken);
    } catch (error) {
      console.error('Google response handling error:', error);
      setIsLoading(false);
      onError?.('Google authentication failed. Please try again.');
    }
  };

  /**
   * Handle Google OAuth token response (OAuth2)
   */
  const handleTokenResponse = async (response: any) => {
    if (!mounted.current) return;

    try {
      const accessToken = response.access_token;
      
      if (!accessToken) {
        throw new Error('No Google access token received');
      }

      // For OAuth2 tokens, we need to get user info separately
      const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      const userInfo = await userInfoResponse.json();
      
      // Create a JWT-like token for our backend (this is a simplified approach)
      await processGoogleAuth(accessToken, userInfo);
    } catch (error) {
      console.error('Google token response handling error:', error);
      setIsLoading(false);
      onError?.('Google authentication failed. Please try again.');
    }
  };

  /**
   * Process Google authentication with backend
   */
  const processGoogleAuth = async (googleToken: string, userInfo?: any) => {
    try {
      const authData = {
        googleToken,
        ...(linkToEmail && { linkToEmail })
      };

      const response = await UserRegistrationService.registerWithGoogle(authData);

      if (isSuccessResponse(response)) {
        onSuccess?.(response.data.user, response.data.tokens);
      } else {
        onError?.(response.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth processing error:', error);
      onError?.('Authentication failed. Please try again.');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading || !isGoogleLoaded}
      className={`
        w-full flex justify-center items-center px-space-4 py-space-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
        bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin -ml-1 mr-space-2 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
          <span className="text-sm font-medium">
            {linkToEmail ? 'Linking Account...' : 'Signing in...'}
          </span>
        </div>
      ) : !isGoogleLoaded ? (
        <div className="flex items-center">
          <div className="animate-pulse -ml-1 mr-space-2 h-4 w-4 bg-gray-300 rounded-full" />
          <span className="text-sm font-medium">Loading Google...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {/* Google Logo SVG */}
          <svg className="w-4 h-4 mr-space-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">
            {linkToEmail ? 'Link Google Account' : 'Continue with Google'}
          </span>
        </div>
      )}
    </button>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: Element, options: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}