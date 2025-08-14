import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useToastHelpers } from '../components/common/Toast';

/**
 * Hook to handle token expiration consistently across the app
 * Provides a centralized way to handle TOKEN_EXPIRED and SESSION_EXPIRED errors
 */
export const useTokenExpiration = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { showError } = useToastHelpers();

  const handleTokenExpiration = useCallback(async (
    errorCode: string,
    errorMessage?: string
  ) => {
    console.log(`Token expiration detected: ${errorCode}`);
    
    // Show user-friendly error message
    const message = errorMessage || 'Your session has expired. Please log in again.';
    showError(message);
    
    // Properly logout the user to clear authentication state
    try {
      await logout(false);
    } catch (logoutError) {
      console.error('Error during logout:', logoutError);
    }
    
    // Redirect to login page
    router.replace('/login');
  }, [logout, router, showError]);

  return {
    handleTokenExpiration
  };
};
