'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export const FloatingLogout: React.FC = () => {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed z-50 bottom-space-6 right-space-6">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="transition-colors shadow-lg bg-error text-airvik-white p-space-3 rounded-radius-full hover:bg-red-700 duration-normal disabled:opacity-50 disabled:cursor-not-allowed"
        title="Emergency Logout"
      >
        {isLoggingOut ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-radius-full" />
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
      </button>
    </div>
  );
};
