'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { AUTH_PATHS } from '../../../lib/paths';

// =====================================================
// GOOGLE OAUTH CALLBACK SUCCESS PAGE
// =====================================================
// Handles the redirect from Google OAuth with tokens in URL

const GoogleOAuthCallbackSuccess: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract tokens and user data from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userParam = searchParams.get('user');
        const redirectTo = searchParams.get('redirect_to') || '/dashboard';
        const isNewUser = searchParams.get('is_new_user') === 'true';

        console.log('🔐 Processing Google OAuth callback...');

        // Validate required parameters
        if (!accessToken || !refreshToken || !userParam) {
          throw new Error('Missing required authentication parameters');
        }

        // Parse user data
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userParam));
        } catch (err) {
          throw new Error('Invalid user data format');
        }

        // Store tokens and user data directly
        sessionStorage.setItem('airvik_access_token', accessToken);
        localStorage.setItem('airvik_refresh_token', refreshToken);
        localStorage.setItem('airvik_user', JSON.stringify(user));
        
        // Set flag to indicate this is an OAuth redirect
        sessionStorage.setItem('oauth_redirect', 'true');

        // For OAuth, we don't need to call the login API since we already have valid tokens
        // Just update the auth context state directly
        console.log('✅ OAuth tokens stored successfully');
        
        // Trigger a page reload to ensure AuthContext picks up the new tokens
        // This is the safest way to ensure proper authentication state
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);

        // Don't show toast here - let the AuthContext handle it after page reload
        console.log('✅ OAuth authentication completed, redirecting...');

        console.log('✅ Google OAuth authentication completed successfully');

        // Redirect is handled by window.location.href above

      } catch (err) {
        console.error('❌ Error processing OAuth callback:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        
        // Redirect to login page after error
        setTimeout(() => {
          router.replace(AUTH_PATHS.LOGIN);
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

         processOAuthCallback();
   }, [searchParams, login, router]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-airvik-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full animate-spin border-airvik-blue border-t-transparent" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Completing Sign In...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we complete your Google sign-in.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-airvik-white dark:bg-gray-900">
        <div className="max-w-md px-4 mx-auto text-center">
          <div className="mb-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Authentication Failed
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-airvik-white dark:bg-gray-900">
      <div className="max-w-md px-4 mx-auto text-center">
        <div className="mb-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full dark:bg-green-900">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Sign In Successful!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallbackSuccess;