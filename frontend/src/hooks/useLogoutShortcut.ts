'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export const useLogoutShortcut = () => {
  const { authState, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + L for logout
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        
        if (authState.isAuthenticated) {
          try {
            await logout(false);
            router.push('/auth/login');
          } catch (error) {
            console.error('Keyboard logout error:', error);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [authState.isAuthenticated, logout, router]);
};
