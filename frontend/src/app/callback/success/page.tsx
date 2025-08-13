'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_PATHS, getCallbackPath } from '../../../lib/paths';
import { useAuth } from '../../../context/AuthContext';

/**
 * Google OAuth Callback Success Page
 * 
 * Handles the successful OAuth callback from Google,
 * extracts tokens from URL parameters, sets up authentication,
 * and redirects to the intended destination.
 */
export default function OAuthCallbackSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your login...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract parameters from URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userStr = searchParams.get('user');
        const redirectTo = searchParams.get('redirect_to') || '/dashboard';
        const isNewUser = searchParams.get('is_new_user') === 'true';

        // Validate required parameters
        if (!accessToken || !refreshToken || !userStr) {
          throw new Error('Missing authentication data in callback');
        }

        let user;
        try {
          user = JSON.parse(decodeURIComponent(userStr));
        } catch (parseError) {
          throw new Error('Invalid user data in callback');
        }

        console.log('🔄 Processing OAuth callback:', { 
          hasTokens: !!accessToken && !!refreshToken,
          hasUser: !!user,
          isNewUser,
          redirectTo 
        });

        // Store tokens in local storage (as per AuthContext pattern)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Set user in auth context (simulate login)
        // Note: AuthContext will validate these tokens with the backend
        await new Promise(resolve => {
          // Give a moment for localStorage to be set
          setTimeout(resolve, 100);
        });

        setStatus('success');
        setMessage(isNewUser ? 
          'Welcome! Your account has been created successfully.' :
          'Welcome back! You have been signed in successfully.'
        );

        // Show success message briefly, then redirect
        setTimeout(() => {
          console.log(`🔀 Redirecting to: ${redirectTo}`);
          router.push(redirectTo);
          
          // Trigger a page reload to ensure AuthContext picks up the new tokens
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }, 2000);

      } catch (error) {
        console.error('❌ OAuth callback processing error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        // Redirect to login page after showing error
        setTimeout(() => {
          router.push(getCallbackPath('oauth_callback_failed'));
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router, authLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-airvik-gray-50 dark:bg-airvik-gray-900">
      <div className="max-w-md w-full space-y-space-6 p-space-6">
        <div className="text-center">
          {/* Loading/Success/Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-space-4">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airvik-blue"></div>
            )}
            {status === 'success' && (
              <div className="bg-airvik-green-100 dark:bg-airvik-green-900/20 rounded-full h-12 w-12 flex items-center justify-center">
                <svg className="h-6 w-6 text-airvik-green-600 dark:text-airvik-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-airvik-red-100 dark:bg-airvik-red-900/20 rounded-full h-12 w-12 flex items-center justify-center">
                <svg className="h-6 w-6 text-airvik-red-600 dark:text-airvik-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-h2 text-airvik-gray-900 dark:text-airvik-white mb-space-2">
            {status === 'processing' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>

          {/* Message */}
          <p className="text-airvik-gray-600 dark:text-airvik-gray-300 mb-space-6">
            {message}
          </p>

          {/* Additional messaging */}
          {status === 'processing' && (
            <p className="text-sm text-airvik-gray-500 dark:text-airvik-gray-400">
              Please wait while we set up your account...
            </p>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-airvik-gray-500 dark:text-airvik-gray-400">
              You will be redirected shortly...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-space-2">
              <p className="text-sm text-airvik-gray-500 dark:text-airvik-gray-400">
                You will be redirected to the login page.
              </p>
              <button
                onClick={() => router.push(AUTH_PATHS.LOGIN)}
                className="text-airvik-blue hover:text-airvik-purple underline text-sm"
              >
                Go to Login Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}