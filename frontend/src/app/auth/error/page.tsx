'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * OAuth Error Page
 * 
 * Displays OAuth-related errors in a user-friendly way
 */
export default function OAuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-airvik-gray-50 dark:bg-airvik-gray-900">
      <div className="max-w-md w-full space-y-space-6 p-space-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-airvik-red-100 dark:bg-airvik-red-900/20 mb-space-4">
            <svg className="h-6 w-6 text-airvik-red-600 dark:text-airvik-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-airvik-gray-900 dark:text-airvik-white mb-space-2">
            Authentication Error
          </h2>

          {/* Error Message */}
          <p className="text-airvik-gray-600 dark:text-airvik-gray-300 mb-space-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-space-3">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-space-3 px-space-4 border border-transparent rounded-radius-md shadow-elevation-sm text-button font-sf-pro text-airvik-white bg-airvik-blue hover:bg-airvik-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-airvik-blue transition-colors duration-normal"
            >
              Try Again
            </Link>
            
            <Link
              href="/auth/register"
              className="w-full flex justify-center py-space-3 px-space-4 border border-airvik-gray-300 dark:border-airvik-gray-600 rounded-radius-md shadow-elevation-sm text-button font-sf-pro text-airvik-gray-700 dark:text-airvik-gray-200 bg-airvik-white dark:bg-airvik-gray-800 hover:bg-airvik-gray-50 dark:hover:bg-airvik-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-airvik-blue transition-colors duration-normal"
            >
              Create New Account
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-space-4 text-sm text-airvik-gray-500 dark:text-airvik-gray-400">
            If you continue to experience issues, please{' '}
            <Link href="/contact" className="text-airvik-blue hover:text-airvik-purple underline">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}