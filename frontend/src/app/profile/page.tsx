'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../context/AuthContext';
import { AUTH_PATHS } from '../../lib/paths';
import { useToastHelpers } from '../../components/common/Toast';
import { useTokenExpiration } from '../../hooks/useTokenExpiration';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileErrorBoundary } from '../../components/profile/ProfileErrorBoundary';
import { UserProfile, isSuccessResponse } from '../../types/userProfile.types';
import { UserProfileService } from '../../services/userProfile.service';
import { UserLoginService } from '../../services/userLogin.service';

// =====================================================
// MODERN PROFILE SETTINGS PAGE
// =====================================================
// Redesigned with modern UI/UX patterns and enhanced visual hierarchy

export default function ProfilePage() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const { showError } = useToastHelpers();
  const { handleTokenExpiration } = useTokenExpiration();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // =====================================================
  // AUTHENTICATION CHECK
  // =====================================================

  useEffect(() => {
    if (!authState.isLoading && !isAuthenticated) {
      router.replace(AUTH_PATHS.LOGIN);
      return;
    }

    if (isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldRefresh = urlParams.get('refresh') === 'true';
      
      if (shouldRefresh) {
        loadProfile();
        router.replace('/profile');
      } else {
        loadProfile();
      }
    }
  }, [authState.isLoading, isAuthenticated, router]);

  // =====================================================
  // PROFILE LOADING
  // =====================================================

  const loadProfile = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await UserProfileService.getProfile();
      
      if (isSuccessResponse(response)) {
        setProfile(response.data);
      } else {
        // Handle specific error codes
        if (response.code === 'SESSION_EXPIRED') {
          await handleTokenExpiration('SESSION_EXPIRED');
          return;
        }
        
        if (response.code === 'TOKEN_EXPIRED') {
          console.log('Token expired, attempting refresh...');
          // Try to refresh token and retry
          const refreshResult = await UserLoginService.refreshToken();
          if (isSuccessResponse(refreshResult)) {
            // Retry loading profile
            const retryResponse = await UserProfileService.getProfile();
            if (isSuccessResponse(retryResponse)) {
              setProfile(retryResponse.data);
              return;
            }
          } else {
            // Refresh failed, properly logout the user
            await handleTokenExpiration('TOKEN_EXPIRED');
            return;
          }
        }
        
        setIsError(true);
        showError(response.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      setIsError(true);
      showError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // NAVIGATION HANDLERS
  // =====================================================

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handlePictureChange = () => {
    router.push('/profile/picture');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(false);
      router.push(`/auth${AUTH_PATHS.LOGIN}`);
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOut(true);
    try {
      await logout(true);
      router.push(`/auth${AUTH_PATHS.LOGIN}`);
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // =====================================================
  // MODERN SKELETON LOADER
  // =====================================================

  if (authState.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-airvik-midnight">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden">
          <div className="container mx-auto px-space-4 pt-space-8 lg:pt-space-12 pb-space-6 lg:pb-space-8">
            {/* Header Content Skeleton */}
            <div className="space-y-space-2 lg:space-y-space-3">
              <div className="h-8 lg:h-10 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-lg animate-pulse" />
              <div className="h-5 lg:h-6 bg-gray-200 w-80 lg:w-96 dark:bg-gray-700 rounded-radius-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-space-4 pb-space-12">
          <div className="space-y-space-6 lg:space-y-space-8">
            {/* Profile Card Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-400 shadow-shadow-sm p-space-4 lg:p-space-6">
              {/* Profile Card Header Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-4 mb-space-6">
                <div className="flex items-center space-x-space-4">
                  {/* Avatar Skeleton */}
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                  <div className="space-y-space-2">
                    <div className="h-6 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="h-4 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  </div>
                </div>
                <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-lg animate-pulse" />
              </div>
              
              {/* Profile Info Skeleton */}
              <div className="space-y-space-4">
                <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
                  <div className="h-3 bg-gray-200 w-full dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-3/4 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
            </div>

            {/* Settings Navigation Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-4 lg:gap-space-6">
              {/* Profile Picture Box Skeleton */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-400 rounded-radius-xl shadow-shadow-sm p-space-4 lg:p-space-6">
                <div className="flex items-start space-x-space-3 lg:space-x-space-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-radius-md shadow-shadow-sm animate-pulse" />
                  <div className="flex-1 min-w-0 space-y-space-2">
                    <div className="h-5 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="h-3 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  </div>
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>

              {/* Privacy Settings Box Skeleton */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-400 rounded-radius-xl shadow-shadow-sm p-space-4 lg:p-space-6">
                <div className="flex items-start space-x-space-3 lg:space-x-space-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-radius-md shadow-shadow-sm animate-pulse" />
                  <div className="flex-1 min-w-0 space-y-space-2">
                    <div className="h-5 bg-gray-200 w-36 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="h-3 bg-gray-200 w-56 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  </div>
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>

              {/* Connected Accounts Box Skeleton */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-400 rounded-radius-xl shadow-shadow-sm p-space-4 lg:p-space-6">
                <div className="flex items-start space-x-space-3 lg:space-x-space-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-radius-md shadow-shadow-sm animate-pulse" />
                  <div className="flex-1 min-w-0 space-y-space-2">
                    <div className="h-5 bg-gray-200 w-40 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="h-3 bg-gray-200 w-44 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  </div>
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (isError) {
    return (
      <div className="min-h-screen bg-white dark:bg-airvik-midnight">
        <div className="container mx-auto px-space-4 py-space-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center bg-white border border-red-200 dark:bg-gray-800 dark:border-red-800 rounded-radius-xl p-space-8 shadow-shadow-sm">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 mb-space-4 dark:bg-red-900/30 rounded-radius-full">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-h4 text-airvik-black dark:text-airvik-white mb-space-3">
                Failed to Load Profile
              </h3>
              <p className="text-gray-600 text-body dark:text-gray-400 mb-space-6">
                We couldn't load your profile information. Please try again or contact support if the problem persists.
              </p>
              <div className="flex flex-col justify-center sm:flex-row gap-space-3">
                <button
                  onClick={loadProfile}
                  className="transition-all bg-airvik-blue hover:bg-airvik-purple text-airvik-white px-space-6 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm hover:shadow-shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
                >
                  Try Again
                </button>
                <Link
                  href="/dashboard"
                  className="transition-all bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-space-6 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm hover:shadow-shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-airvik-black dark:border-gray-300"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN CONTENT
  // =====================================================

  return (
    <ProfileErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Profile page error:', error, errorInfo);
        showError('An unexpected error occurred. Please reload the page.');
      }}
    >
      <div className="min-h-screen bg-white dark:bg-airvik-midnight">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden">

          
          <div className="container mx-auto px-space-4 pt-space-8 lg:pt-space-12 pb-space-6 lg:pb-space-8">
            <div className="space-y-space-2 lg:space-y-space-3">
              <h1 className="font-bold text-h2 lg:text-h1 text-airvik-black dark:text-airvik-white">
                Profile Settings
              </h1>
              <p className="max-w-2xl text-gray-600 text-body lg:text-body-lg dark:text-gray-400">
                Manage your personal information, privacy preferences, and account connections in one place
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-space-4 pb-space-16">
          {/* Main Content Area */}
          <div className="space-y-space-6 lg:space-y-space-8">
              {/* Profile Card */}
              {profile && (
                <div className="overflow-hidden bg-white border border-gray-100 dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700">
                  <ProfileCard
                    profile={profile}
                    showActions={true}
                    onEdit={handleEditProfile}
                    onPictureChange={handlePictureChange}
                  />
                </div>
              )}

              {/* Settings Navigation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-4 lg:gap-space-6">
                
                {/* Profile Picture */}
                <Link
                  href="/profile/picture"
                  className="relative overflow-hidden transition-all border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-400 group rounded-radius-xl shadow-shadow-sm p-space-4 lg:p-space-6 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2 hover:shadow-shadow-md duration-normal"
                >
                  <div className="relative flex items-start space-x-space-3 lg:space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white lg:w-14 lg:h-14 rounded-radius-md shadow-shadow-sm">
                      <svg className="w-7 h-7 text-airvik-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h6 lg:text-h5 text-airvik-black dark:text-airvik-white mb-space-1 lg:mb-space-2 group-hover:text-airvik-blue dark:group-hover:text-airvik-blue">
                        Profile Picture
                      </h3>
                      <p className="text-gray-600 text-caption lg:text-body-sm dark:text-gray-400">
                        Upload or sync your profile picture
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* Privacy Settings */}
                <Link
                  href="/profile/privacy"
                  className="relative overflow-hidden transition-all border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-400 group rounded-radius-xl shadow-shadow-sm p-space-4 lg:p-space-6 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2 hover:shadow-shadow-md duration-normal"
                >
                  <div className="relative flex items-start space-x-space-3 lg:space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white lg:w-14 lg:h-14 rounded-radius-md shadow-shadow-sm">
                      <svg className="w-7 h-7 text-airvik-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h6 lg:text-h5 text-airvik-black dark:text-airvik-white mb-space-1 lg:mb-space-2 group-hover:text-airvik-blue dark:group-hover:text-airvik-blue">
                        Privacy Settings
                      </h3>
                      <p className="text-gray-600 text-caption lg:text-body-sm dark:text-gray-400">
                        Control your profile visibility and data sharing
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* Connected Accounts */}
                <Link
                  href="/profile/connections"
                  className="relative overflow-hidden transition-all border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-400 group rounded-radius-xl shadow-shadow-sm p-space-4 lg:p-space-6 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2 hover:shadow-shadow-md duration-normal"
                >
                  <div className="relative flex items-start space-x-space-3 lg:space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white lg:w-14 lg:h-14 rounded-radius-md shadow-shadow-sm">
                      <svg className="w-7 h-7 text-airvik-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h6 lg:text-h5 text-airvik-black dark:text-airvik-white mb-space-1 lg:mb-space-2 group-hover:text-airvik-blue dark:group-hover:text-airvik-blue">
                        Connected Accounts
                      </h3>
                      <p className="text-gray-600 text-caption lg:text-body-sm dark:text-gray-400">
                        Manage your linked social accounts
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>


              </div>
            </div>
          </div>
        </div>
    
    </ProfileErrorBoundary>
  );
}
