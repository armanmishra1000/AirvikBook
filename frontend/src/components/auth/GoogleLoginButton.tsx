'use client';

/**
 * Google OAuth Login Button Component
 * 
 * BRAND COMPLIANCE: Uses brand tokens for colors, spacing, typography
 * EXTENDS: Existing GoogleOAuthButton functionality for login flow
 * REACT PATTERNS: Proper useRef for one-time operations, no function deps in useEffect
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GoogleLoginRequest,
  isSuccessResponse,
  LOGIN_ERROR_CODES
} from '../../types/userLogin.types';
import { UserLoginService } from '../../services/userLogin.service';
import { AUTH_PATHS } from '../../lib/paths';

interface GoogleLoginButtonProps {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  text?: string;
  showAccountLinking?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = '',
  text = 'Continue with Google',
  showAccountLinking = false
}) => {
  const { loginWithGoogle, authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showLinkingPrompt, setShowLinkingPrompt] = useState(false);
  const [linkingEmail, setLinkingEmail] = useState<string>('');
  const mounted = useRef(true);
  const googleInitialized = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true;
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
    console.log('🚀 Initializing Google OAuth for Login...');
    
    // Check if Google script is already loaded
    if (window.google?.accounts) {
      console.log('✅ Google script already loaded');
      setIsGoogleLoaded(true);
      return;
    }

    console.log('📡 Loading Google OAuth script...');
    
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('📦 Google script loaded for login');
      
      // Check if Google OAuth is ready with multiple verification attempts
      const checkGoogleReady = (attempt = 1, maxAttempts = 3) => {
        console.log(`🔍 Login - Attempt ${attempt}: Checking Google OAuth readiness...`);
        console.log('🔍 mounted.current:', mounted.current);
        console.log('🔍 window.google:', !!window.google);
        console.log('🔍 window.google?.accounts:', !!window.google?.accounts);
        console.log('🔍 window.google?.accounts?.id:', !!window.google?.accounts?.id);
        
        if (window.google?.accounts?.id) {
          if (mounted.current) {
            console.log('✅ Google OAuth ready for login!');
            setIsGoogleLoaded(true);
          } else {
            console.log('⚠️ Google OAuth ready but login component unmounted');
          }
          return;
        }
        
        if (attempt < maxAttempts) {
          console.log(`⏳ Google OAuth not ready, retrying in ${attempt * 500}ms...`);
          setTimeout(() => checkGoogleReady(attempt + 1, maxAttempts), attempt * 500);
        } else {
          console.error('❌ Google OAuth failed to initialize after multiple attempts');
          if (mounted.current) {
            onError?.('Google authentication failed to initialize. Please refresh the page.');
          }
        }
      };
      
      checkGoogleReady();
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Google OAuth script:', error);
      onError?.('Failed to load Google authentication. Please check your internet connection.');
    };
    
    document.head.appendChild(script);
    
    // Timeout fallback
    setTimeout(() => {
      if (mounted.current && !isGoogleLoaded) {
        console.error('⏰ Google OAuth script loading timeout (10s)');
        onError?.('Google authentication is taking too long to load. Please refresh the page.');
      }
    }, 10000);
  };

  /**
   * Handle Google OAuth button click
   */
  const handleGoogleSignIn = () => {
    if (!isGoogleLoaded || !window.google?.accounts || isLoading || disabled || authState.isLoading) {
      return;
    }

    // Check if Google client ID is configured
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'your-google-client-id') {
      console.error('Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.');
      onError?.('Google OAuth is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Google OAuth client for ID token flow
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true as any,
      });

      // Trigger the Google sign-in prompt
      window.google.accounts.id.prompt();
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

      await processGoogleLogin(googleToken);
    } catch (error) {
      console.error('Google response handling error:', error);
      setIsLoading(false);
      onError?.('Google authentication failed. Please try again.');
    }
  };



  /**
   * Process Google login with backend
   */
  const processGoogleLogin = async (googleToken: string) => {
    try {
      // Get device info for security tracking
      const deviceInfo = UserLoginService.getDeviceInfo();

      const loginRequest: GoogleLoginRequest = {
        googleToken,
        rememberMe: false, // Can be made configurable
        deviceInfo
      };

      const result = await loginWithGoogle(loginRequest);

      if (isSuccessResponse(result)) {
        // Check if account linking is needed
        if (showAccountLinking && result.data.accountStatus && !result.data.accountStatus.accountLinked) {
          setLinkingEmail(result.data.user.email);
          setShowLinkingPrompt(true);
        }

        onSuccess?.(result);
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Google login failed. Please try again.';
        
        switch (result.code) {
          case LOGIN_ERROR_CODES.GOOGLE_TOKEN_INVALID:
            errorMessage = 'Invalid Google authentication. Please try signing in again.';
            break;
          case LOGIN_ERROR_CODES.ACCOUNT_DISABLED:
            errorMessage = 'Your account has been disabled. Please contact support.';
            break;
          case LOGIN_ERROR_CODES.RATE_LIMIT_EXCEEDED:
            errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
            break;
          default:
            break;
        }

        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Google login processing error:', error);
      onError?.(error instanceof Error ? error.message : 'Google login failed. Please try again.');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  /**
   * Handle account linking confirmation
   */
  const handleAccountLinking = async (shouldLink: boolean) => {
    setShowLinkingPrompt(false);
    
    if (shouldLink) {
      // Navigate to account linking flow
      window.location.href = `/auth${AUTH_PATHS.LINK_ACCOUNT}`;
    }
    // If not linking, continue with separate Google account
  };

  return (
    <>
      {/* Main Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={disabled || isLoading || !isGoogleLoaded || authState.isLoading}
        className={`
          w-full flex justify-center items-center px-space-4 py-space-3 border border-gray-300 dark:border-gray-600 rounded-radius-md
          bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white
          hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-normal transform hover:shadow-md
          font-sf-pro text-button
          ${className}
        `}
      >
        {isLoading || authState.isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 animate-spin mr-space-3 border-airvik-blue border-t-transparent rounded-radius-full" />
            <span>Signing in with Google...</span>
          </div>
        ) : !isGoogleLoaded ? (
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-300 animate-pulse mr-space-3 dark:bg-gray-600 rounded-radius-full" />
            <span>Loading Google...</span>
          </div>
        ) : (
          <div className="flex items-center">
            {/* Google Logo SVG */}
            <svg className="w-5 h-5 mr-space-3" viewBox="0 0 24 24">
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
            <span>{text}</span>
          </div>
        )}
      </button>

      {/* Account Linking Modal */}
      {showLinkingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-space-4">
          <div className="w-full max-w-md bg-airvik-white dark:bg-gray-800 rounded-radius-lg p-space-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-radius-full dark:bg-blue-900/20 mb-space-4">
                <svg className="w-6 h-6 text-airvik-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-1.102 1.102m-1.102 1.102l-2.828 2.828" />
                </svg>
              </div>
              
              <h3 className="text-h4 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                Link Your Accounts
              </h3>
              
              <p className="text-gray-600 text-body dark:text-gray-400 mb-space-6">
                We found an existing account with the email <strong>{linkingEmail}</strong>. 
                Would you like to link your Google account with your existing account?
              </p>
              
              <div className="flex space-x-space-4">
                <button
                  onClick={() => handleAccountLinking(false)}
                  className="flex-1 transition-colors border border-gray-300 px-space-4 py-space-2 dark:border-gray-600 rounded-radius-md text-airvik-black dark:text-airvik-white hover:bg-gray-50 dark:hover:bg-gray-700 duration-normal font-sf-pro text-button"
                >
                  Keep Separate
                </button>
                <button
                  onClick={() => handleAccountLinking(true)}
                  className="flex-1 transition-colors px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-purple duration-normal font-sf-pro text-button"
                >
                  Link Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Extend window interface for TypeScript (if not already declared)
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: Element, options: any) => void;
        };

      };
    };
  }
}

export default GoogleLoginButton;