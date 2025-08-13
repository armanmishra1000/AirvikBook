'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useIsAuthenticated } from '../../context/AuthContext';
import { AUTH_PATHS } from '../../lib/paths';

// =====================================================
// PROTECTED ROUTE COMPONENT
// =====================================================
// Wraps components that require authentication

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerification?: boolean;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = AUTH_PATHS.LOGIN,
  requireEmailVerification = false,
  allowedRoles = [],
  fallback
}) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { authState } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (authState.isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // Check email verification if required
    if (requireEmailVerification && authState.user && !authState.user.isEmailVerified) {
      router.replace(AUTH_PATHS.VERIFY_EMAIL);
      return;
    }

    // Check user roles if specified
    if (allowedRoles.length > 0 && authState.user) {
      const userRole = authState.user.role;
      if (!allowedRoles.includes(userRole)) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [
    isAuthenticated,
    authState.isLoading,
    authState.user,
    requireEmailVerification,
    allowedRoles,
    router,
    redirectTo
  ]);

  // Show loading state
  if (authState.isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-space-4 border-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Check email verification
  if (requireEmailVerification && authState.user && !authState.user.isEmailVerified) {
    return null;
  }

  // Check user roles
  if (allowedRoles.length > 0 && authState.user) {
    const userRole = authState.user.role;
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;