'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../../components/auth/LoginForm';
import GoogleOAuthRedirectButton from '../../components/auth/GoogleOAuthRedirectButton';
import { useAuth, useIsAuthenticated } from '../../context/AuthContext';

// =====================================================
// LOGIN PAGE COMPONENT
// =====================================================
// Main login page with email/password and Google OAuth

const LoginPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { authState } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // Track initial loading completion
  useEffect(() => {
    if (!authState.isLoading) {
      setIsInitialLoad(false);
    }
  }, [authState.isLoading]);

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

  // Don't render anything while checking authentication (but not during login submission)
  if (isInitialLoad && authState.isLoading) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 bg-pattern-subtle flex items-center justify-center">
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
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
      <div className="max-w-md w-full">
        {/* Login Form */}
        <LoginForm
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      </div>
    </div>
  );
};

export default LoginPage;