'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { AUTH_PATHS } from '../../lib/paths';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  logoutAllDevices?: boolean;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'primary',
  size = 'md',
  logoutAllDevices = false,
  className = '',
  children,
  showIcon = true
}) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(logoutAllDevices);
      router.push(AUTH_PATHS.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-airvik-blue hover:bg-airvik-purple text-airvik-white focus:ring-airvik-blue';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-airvik-white focus:ring-gray-500';
      case 'danger':
        return 'bg-error hover:bg-red-700 text-airvik-white focus:ring-red-500';
      case 'emergency':
        return 'bg-red-800 hover:bg-red-900 text-airvik-white focus:ring-red-500';
      default:
        return 'bg-airvik-blue hover:bg-airvik-purple text-airvik-white focus:ring-airvik-blue';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-space-3 py-space-2 text-caption';
      case 'md':
        return 'px-space-4 py-space-2 text-button';
      case 'lg':
        return 'px-space-6 py-space-3 text-body';
      default:
        return 'px-space-4 py-space-2 text-button';
    }
  };

  const getDefaultText = () => {
    if (children) return children;
    
    if (isLoggingOut) {
      return 'Logging out...';
    }
    
    if (logoutAllDevices) {
      return 'Logout All Devices';
    }
    
    return 'Logout';
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        font-sf-pro font-medium rounded-radius-md shadow-shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition-colors duration-normal
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-space-2">
        {showIcon && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
        <span>{getDefaultText()}</span>
      </div>
    </button>
  );
};
