'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../../../components/auth/LoginForm';
import GoogleOAuthRedirectButton from '../../../components/auth/GoogleOAuthRedirectButton';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';

// =====================================================
// LOGIN PAGE COMPONENT
// =====================================================
// Main login page with email/password and Google OAuth

const LoginPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { authState } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authState.isLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authState.isLoading, router]);

  // Handle successful login
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };

  // Handle login error
  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    // Error is already handled in the LoginForm component
  };

  // Don't render anything while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-space-4 border-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-light-1 dark:bg-gradient-dark-1 flex flex-col justify-center py-space-12 sm:px-space-6 lg:px-space-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-space-8">
          <h1 className="text-display font-sf-pro font-bold text-airvik-black dark:text-airvik-white">
            AirVikBook
          </h1>
          <p className="mt-space-2 text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Hotel Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-airvik-white dark:bg-gray-800 py-space-8 px-space-6 shadow-lg rounded-radius-lg">
          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            className="mb-space-6"
          />

          {/* Divider */}
          <div className="relative mb-space-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-caption">
              <span className="px-space-2 bg-airvik-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-sf-pro">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <GoogleOAuthRedirectButton
            type="login"
            redirectTo="/dashboard"
          >
            Sign in with Google
          </GoogleOAuthRedirectButton>
        </div>

        {/* Footer Links */}
        <div className="mt-space-8 text-center">
          <div className="space-y-space-2">
            <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
              Don't have an account?{' '}
              <a 
                href="/auth/register" 
                className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal font-medium"
              >
                Sign up for free
              </a>
            </p>
            
            <p className="text-caption text-gray-500 dark:text-gray-500 font-sf-pro">
              By signing in, you agree to our{' '}
              <a 
                href="/terms" 
                className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy" 
                className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;