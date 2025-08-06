'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToastHelpers } from '../common/Toast';

// =====================================================
// GOOGLE CONNECT COMPONENT
// =====================================================
// Google account connection for profile management

interface GoogleConnectProps {
  isConnected: boolean;
  googleEmail?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleConnect: React.FC<GoogleConnectProps> = ({
  isConnected,
  googleEmail,
  onSuccess,
  onError,
  className = ''
}) => {
  // =====================================================
  // STATE
  // =====================================================

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const mounted = useRef(true);
  const googleInitialized = useRef(false);

  // =====================================================
  // HOOKS
  // =====================================================

  const { connectGoogleAccount, disconnectGoogleAccount } = useAuth();
  const { showSuccess, showError } = useToastHelpers();

  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // =====================================================
  // GOOGLE INITIALIZATION
  // =====================================================

  useEffect(() => {
    if (!googleInitialized.current) {
      googleInitialized.current = true;
      initializeGoogle();
    }
  }, []);

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
      const checkGoogleReady = (attempt = 1, maxAttempts = 3) => {
        if (window.google?.accounts?.id) {
          if (mounted.current) {
            setIsGoogleLoaded(true);
          }
          return;
        }
        
        if (attempt < maxAttempts) {
          setTimeout(() => checkGoogleReady(attempt + 1, maxAttempts), attempt * 500);
        } else {
          if (mounted.current) {
            onError?.('Google authentication failed to initialize. Please refresh the page.');
          }
        }
      };
      
      checkGoogleReady();
    };
    
    script.onerror = () => {
      onError?.('Failed to load Google authentication. Please check your internet connection.');
    };
    
    document.head.appendChild(script);
    
    // Timeout fallback
    setTimeout(() => {
      if (mounted.current && !isGoogleLoaded) {
        onError?.('Google authentication is taking too long to load. Please refresh the page.');
      }
    }, 10000);
  };

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleGoogleConnect = () => {
    if (!isGoogleLoaded || !window.google?.accounts || isLoading) {
      return;
    }

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'your-google-client-id') {
      onError?.('Google OAuth is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsLoading(false);
        }
      });
    } catch (error) {
      setIsLoading(false);
      onError?.('Failed to initialize Google sign-in. Please try again.');
    }
  };

  const handleGoogleResponse = async (response: any) => {
    if (!mounted.current) return;

    try {
      const googleToken = response.credential;
      
      if (!googleToken) {
        throw new Error('No Google token received');
      }

      await processGoogleConnection(googleToken);
    } catch (error) {
      setIsLoading(false);
      onError?.('Google authentication failed. Please try again.');
    }
  };

  const processGoogleConnection = async (googleToken: string) => {
    try {
      const response = await connectGoogleAccount(googleToken);

      if (response.success) {
        showSuccess('Google account connected successfully!');
        onSuccess?.();
      } else {
        onError?.(response.error || 'Failed to connect Google account');
      }
    } catch (error) {
      onError?.('Failed to connect Google account. Please try again.');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleDisconnect = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await disconnectGoogleAccount();

      if (response.success) {
        showSuccess('Google account disconnected successfully!');
        onSuccess?.();
      } else {
        onError?.(response.error || 'Failed to disconnect Google account');
      }
    } catch (error) {
      onError?.('Failed to disconnect Google account. Please try again.');
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-radius-lg p-space-6 shadow-shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-space-4">
        <div className="flex items-center space-x-space-3">
          <div className="w-10 h-10 bg-white rounded-radius-sm flex items-center justify-center shadow-shadow-sm">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
              Google Account
            </h3>
            {googleEmail && (
              <p className="text-caption text-gray-600 dark:text-gray-400">
                {googleEmail}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-space-2">
          {isConnected ? (
            <span className="inline-flex items-center px-space-2 py-space-1 rounded-radius-full text-caption font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-space-2 py-space-1 rounded-radius-full text-caption font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              Not Connected
            </span>
          )}
        </div>
      </div>

      <div className="space-y-space-3">
        {isConnected ? (
          <div className="space-y-space-3">
            <p className="text-body text-gray-600 dark:text-gray-400">
              Your Google account is connected. You can sync your profile picture and other data.
            </p>
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full px-space-4 py-space-2 bg-red-600 text-airvik-white rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-space-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Disconnecting...</span>
                </div>
              ) : (
                'Disconnect Google Account'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-space-3">
            <p className="text-body text-gray-600 dark:text-gray-400">
              Connect your Google account to sync your profile picture and other data automatically.
            </p>
            <button
              onClick={handleGoogleConnect}
              disabled={isLoading || !isGoogleLoaded}
              className="w-full flex justify-center items-center px-space-4 py-space-2 border border-gray-300 dark:border-gray-600 rounded-radius-md shadow-shadow-sm
                bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-airvik-blue
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-normal hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center space-x-space-2">
                  <svg className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-radius-full" />
                  <span className="text-sm font-medium">Connecting...</span>
                </div>
              ) : !isGoogleLoaded ? (
                <div className="flex items-center space-x-space-2">
                  <div className="animate-pulse w-4 h-4 bg-gray-300 rounded-radius-full" />
                  <span className="text-sm font-medium">Loading Google...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-space-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium">Connect Google Account</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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
      };
    };
  }
}
