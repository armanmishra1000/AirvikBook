'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';

interface GoogleOAuthRedirectButtonProps {
  type?: 'login' | 'register';
  redirectTo?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Google OAuth Redirect Button
 * 
 * Uses redirect-based OAuth flow instead of popup.
 * Opens Google OAuth in the same window/tab for better UX.
 */
export default function GoogleOAuthRedirectButton({
  type = 'login',
  redirectTo = '/dashboard',
  disabled = false,
  className = '',
  children
}: GoogleOAuthRedirectButtonProps) {

  /**
   * Handle Google OAuth redirect
   */
  const handleGoogleOAuth = () => {
    if (disabled) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    
    // Build OAuth URL with parameters
    const params = new URLSearchParams({
      type,
      redirect_to: redirectTo
    });
    
    const oauthUrl = `${baseUrl}${apiPrefix}/auth/google/redirect?${params.toString()}`;
    
    console.log(`🔗 Initiating Google OAuth ${type} redirect:`, oauthUrl);
    
    // Redirect to backend OAuth endpoint
    window.location.href = oauthUrl;
  };

  return (
    <button
      onClick={handleGoogleOAuth}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center px-space-4 py-space-3 
        border border-airvik-gray-300 rounded-radius-md shadow-elevation-sm
        bg-airvik-white hover:bg-airvik-gray-50 
        text-airvik-gray-700 font-sf-pro text-button
        transition-all duration-normal
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-0
        dark:border-airvik-gray-600 dark:bg-airvik-gray-800 dark:hover:bg-airvik-gray-700
        dark:text-airvik-gray-200
        ${className}
      `}
      type="button"
    >
      <FcGoogle className="w-5 h-5 mr-space-3" />
      {children || (
        <>
          {type === 'register' ? 'Sign up' : 'Sign in'} with Google
        </>
      )}
    </button>
  );
}