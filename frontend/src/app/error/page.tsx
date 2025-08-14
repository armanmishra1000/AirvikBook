'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AUTH_PATHS } from '../../lib/paths';

// =====================================================
// AUTHENTICATION ERROR PAGE
// =====================================================
// Handles authentication errors from OAuth flows

const AuthErrorPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An authentication error occurred';

  return (
    <div className="flex items-center justify-center min-h-screen bg-airvik-white dark:bg-gray-900">
      <div className="max-w-md px-4 mx-auto text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full dark:bg-red-900">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Authentication Error
        </h1>
        
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {errorMessage}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push(AUTH_PATHS.LOGIN)}
            className="w-full px-6 py-3 font-medium transition-colors duration-200 rounded-md bg-airvik-blue text-airvik-white hover:bg-airvik-bluehover focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
          >
            Try Again
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-full gap-2 text-gray-600 transition-colors duration-200 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage;