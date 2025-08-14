'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AUTH_PATHS } from '../../lib/paths';

export const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(false); // Logout from current device only
      router.push(AUTH_PATHS.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOut(true);
    try {
      await logout(true); // Logout from all devices
      router.push(AUTH_PATHS.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  if (!authState.isAuthenticated) {
    return null; // Don't show header for unauthenticated users
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 shadow-sm bg-airvik-white dark:bg-gray-800 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-space-4 sm:px-space-6 lg:px-space-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-h4 font-sf-pro text-airvik-blue">
                AirVikBook
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-space-8">
            <Link href="/" className="text-gray-700 transition-colors dark:text-gray-300 hover:text-airvik-blue dark:hover:text-airvik-blue duration-normal">
              Dashboard
            </Link>
            <Link href="/profile" className="text-gray-700 transition-colors dark:text-gray-300 hover:text-airvik-blue dark:hover:text-airvik-blue duration-normal">
              Profile
            </Link>
            <Link href="/account/security" className="text-gray-700 transition-colors dark:text-gray-300 hover:text-airvik-blue dark:hover:text-airvik-blue duration-normal">
              Security
            </Link>
            <Link href="/account/sessions" className="text-gray-700 transition-colors dark:text-gray-300 hover:text-airvik-blue dark:hover:text-airvik-blue duration-normal">
              Sessions
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center text-gray-700 transition-colors space-x-space-3 dark:text-gray-300 hover:text-airvik-blue dark:hover:text-airvik-blue duration-normal"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-radius-full bg-airvik-blue text-airvik-white">
                {authState.user?.profilePicture ? (
                  <img
                    src={authState.user.profilePicture}
                    alt={authState.user.fullName}
                    className="object-cover w-8 h-8 rounded-radius-full"
                  />
                ) : (
                  <span className="text-caption font-sf-pro">
                    {authState.user?.fullName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-body font-sf-pro">
                {authState.user?.fullName || 'User'}
              </span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 w-56 border border-gray-200 shadow-lg mt-space-2 bg-airvik-white dark:bg-gray-800 rounded-radius-lg dark:border-gray-700">
                <div className="py-space-2">
                  {/* User Info */}
                  <div className="border-b border-gray-200 px-space-4 py-space-3 dark:border-gray-700">
                    <p className="text-body font-sf-pro text-airvik-black dark:text-airvik-white">
                      {authState.user?.fullName}
                    </p>
                    <p className="text-gray-600 text-caption dark:text-gray-400">
                      {authState.user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-space-1">
                    <Link
                      href="/profile"
                      className="block text-gray-700 transition-colors px-space-4 py-space-2 text-body dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 duration-normal"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/account/sessions"
                      className="block text-gray-700 transition-colors px-space-4 py-space-2 text-body dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 duration-normal"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Active Sessions
                    </Link>
                    <Link
                      href="/account/security"
                      className="block text-gray-700 transition-colors px-space-4 py-space-2 text-body dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 duration-normal"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Security Settings
                    </Link>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 py-space-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left text-gray-700 transition-colors px-space-4 py-space-2 text-body dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 duration-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                    <button
                      onClick={handleLogoutAllDevices}
                      disabled={isLoggingOut}
                      className="w-full text-left text-red-600 transition-colors px-space-4 py-space-2 text-body dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 duration-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout All Devices'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
