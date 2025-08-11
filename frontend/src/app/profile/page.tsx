'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../context/AuthContext';
import { useToastHelpers } from '../../components/common/Toast';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { ProfileErrorBoundary } from '../../components/profile/ProfileErrorBoundary';
import { UserProfile, isSuccessResponse } from '../../types/userProfile.types';
import { UserProfileService } from '../../services/userProfile.service';

// =====================================================
// MODERN PROFILE SETTINGS PAGE
// =====================================================
// Redesigned with modern UI/UX patterns and enhanced visual hierarchy

export default function ProfilePage() {
  const router = useRouter();
  const { authState } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const { showError } = useToastHelpers();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // =====================================================
  // AUTHENTICATION CHECK
  // =====================================================

  useEffect(() => {
    if (!authState.isLoading && !isAuthenticated) {
      router.replace('/auth/login');
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
        setIsError(true);
        showError(response.error || 'Failed to load profile');
      }
    } catch (error) {
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

  // =====================================================
  // MODERN SKELETON LOADER
  // =====================================================

  if (authState.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-airvik-blue/5 via-airvik-white to-airvik-purple/5 dark:from-airvik-blue/10 dark:via-airvik-midnight dark:to-airvik-purple/10">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute top-[-8rem] left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-airvik-blue to-airvik-purple blur-3xl" />
            <div className="absolute top-[4rem] right-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-airvik-cyan to-airvik-violet blur-3xl" />
          </div>
          <div className="container mx-auto px-space-4 pt-space-12 pb-space-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-6">
              <div className="space-y-space-3">
                <div className="h-12 bg-gray-200 w-80 dark:bg-gray-700 rounded-radius-lg animate-pulse" />
                <div className="h-6 bg-gray-200 w-96 dark:bg-gray-700 rounded-radius-md animate-pulse" />
              </div>
              <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-space-4 pb-space-16">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-space-8">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-space-6">
              <div className="bg-white h-80 dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm animate-pulse" />
                ))}
              </div>
            </div>
            {/* Sidebar */}
            <div className="space-y-space-6">
              <div className="h-64 bg-white dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm animate-pulse" />
              <div className="h-48 bg-white dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm animate-pulse" />
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
      <div className="min-h-screen bg-gradient-to-br from-airvik-blue/5 via-airvik-white to-airvik-purple/5 dark:from-airvik-blue/10 dark:via-airvik-midnight dark:to-airvik-purple/10">
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
                  className="transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-space-6 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm hover:shadow-shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
      <div className="min-h-screen bg-gradient-to-br from-airvik-blue/5 via-airvik-white to-airvik-purple/5 dark:from-airvik-blue/10 dark:via-airvik-midnight dark:to-airvik-purple/10">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute top-[-8rem] left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-airvik-blue to-airvik-purple blur-3xl" />
            <div className="absolute top-[4rem] right-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-airvik-cyan to-airvik-violet blur-3xl" />
            <div className="absolute bottom-[-4rem] left-1/3 h-48 w-48 rounded-full bg-gradient-to-r from-airvik-purple to-airvik-cyan blur-3xl" />
          </div>
          
          <div className="container mx-auto px-space-4 pt-space-12 pb-space-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-6">
              <div className="space-y-space-3">
                <h1 className="font-bold text-h1 text-airvik-black dark:text-airvik-white">
                  Profile Settings
                </h1>
                <p className="max-w-2xl text-gray-600 text-body-lg dark:text-gray-400">
                  Manage your personal information, privacy preferences, and account connections in one place
                </p>
              </div>
              <Link 
                href="/dashboard" 
                className="group inline-flex items-center gap-space-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-space-4 py-space-3 rounded-radius-lg shadow-shadow-sm hover:shadow-shadow-md  border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-space-4 pb-space-16">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-space-8">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-space-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-6">
                {/* Edit Profile */}
                <Link
                  href="/profile/edit"
                  className="relative overflow-hidden bg-white border border-gray-100 group dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700 p-space-6 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
                >
                  <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-airvik-blue/5 to-airvik-purple/5 group-hover:opacity-100" />
                  <div className="relative flex items-start space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-airvik-blue to-airvik-purple rounded-radius-lg shadow-shadow-sm">
                      <svg className="w-6 h-6 text-airvik-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h5 text-airvik-black dark:text-airvik-white mb-space-2 group-hover:text-airvik-blue dark:group-hover:text-airvik-blue">
                        Edit Profile
                      </h3>
                      <p className="text-gray-600 text-body-sm dark:text-gray-400">
                        Update your personal information and preferences
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* Profile Picture */}
                <Link
                  href="/profile/picture"
                  className="relative overflow-hidden bg-white border border-gray-100 group dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700 p-space-6 focus:outline-none focus:ring-2 focus:ring-airvik-purple focus:ring-offset-2"
                >
                  <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-airvik-purple/5 to-airvik-violet/5 group-hover:opacity-100" />
                  <div className="relative flex items-start space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-airvik-purple to-airvik-violet rounded-radius-lg shadow-shadow-sm">
                      <svg className="w-6 h-6 text-airvik-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h5 text-airvik-black dark:text-airvik-white mb-space-2 group-hover:text-airvik-purple dark:group-hover:text-airvik-purple">
                        Profile Picture
                      </h3>
                      <p className="text-gray-600 text-body-sm dark:text-gray-400">
                        Upload or sync your profile picture
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-airvik-purple" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* Privacy Settings */}
                <Link
                  href="/profile/privacy"
                  className="relative overflow-hidden bg-white border border-gray-100 group dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700 p-space-6 focus:outline-none focus:ring-2 focus:ring-airvik-cyan focus:ring-offset-2"
                >
                  <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-airvik-cyan/5 to-airvik-blue/5 group-hover:opacity-100" />
                  <div className="relative flex items-start space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-airvik-cyan to-airvik-blue rounded-radius-lg shadow-shadow-sm">
                      <svg className="w-6 h-6 text-airvik-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h5 text-airvik-black dark:text-airvik-white mb-space-2 group-hover:text-airvik-cyan dark:group-hover:text-airvik-cyan">
                        Privacy Settings
                      </h3>
                      <p className="text-gray-600 text-body-sm dark:text-gray-400">
                        Control your profile visibility and data sharing
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-airvik-cyan" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>

                {/* Connected Accounts */}
                <Link
                  href="/profile/connections"
                  className="relative overflow-hidden bg-white border border-gray-100 group dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700 p-space-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <div className="absolute inset-0 opacity-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 group-hover:opacity-100" />
                  <div className="relative flex items-start space-x-space-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-radius-lg shadow-shadow-sm">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-h5 text-airvik-black dark:text-airvik-white mb-space-2 group-hover:text-green-600 dark:group-hover:text-green-400">
                        Connected Accounts
                      </h3>
                      <p className="text-gray-600 text-body-sm dark:text-gray-400">
                        Manage your linked social accounts
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>


              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-space-6">
              {/* Profile Overview */}
              {profile && (
                <div className="bg-white border border-gray-100 dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700 p-space-6">
                  <div className="flex items-center space-x-space-3 mb-space-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-airvik-blue to-airvik-purple rounded-radius-lg">
                      <svg className="w-4 h-4 text-airvik-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-h5 text-airvik-black dark:text-airvik-white">Profile Overview</h3>
                  </div>
                  
                  <div className="space-y-space-4">
                    <div className="flex items-center justify-between border-b border-gray-100 py-space-2 dark:border-gray-700">
                      <span className="text-gray-600 text-body-sm dark:text-gray-400">Name</span>
                      <span className="text-body-sm font-medium text-airvik-black dark:text-airvik-white truncate max-w-[12rem]">{profile.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-space-2 dark:border-gray-700">
                      <span className="text-gray-600 text-body-sm dark:text-gray-400">Email</span>
                      <span className="text-body-sm font-medium text-airvik-black dark:text-airvik-white truncate max-w-[12rem]">{profile.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-space-2">
                      <span className="text-gray-600 text-body-sm dark:text-gray-400">Google</span>
                      {profile.connectedAccounts?.google?.connected ? (
                        <span className="inline-flex items-center text-xs font-medium text-green-800 bg-green-100 px-space-2 py-space-1 rounded-radius-full dark:bg-green-900/30 dark:text-green-200">
                          <svg className="w-3 h-3 mr-space-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-gray-800 bg-gray-100 px-space-2 py-space-1 rounded-radius-full dark:bg-gray-700 dark:text-gray-200">
                          Not Connected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white border border-gray-100 dark:bg-gray-800 rounded-radius-xl shadow-shadow-sm dark:border-gray-700 p-space-6">
                <div className="flex items-center space-x-space-3 mb-space-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-airvik-cyan to-airvik-blue rounded-radius-lg">
                    <svg className="w-4 h-4 text-airvik-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-h5 text-airvik-black dark:text-airvik-white">Quick Actions</h3>
                </div>
                
                <div className="space-y-space-3">
                  <button
                    onClick={handleEditProfile}
                    className="w-full bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white px-space-4 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm focus:outline-none  focus:ring-airvik-blue focus:ring-offset-2"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handlePictureChange}
                    className="w-full bg-airvik-blue hover:bg-airvik-purple text-airvik-white px-space-4 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm focus:outline-none  focus:ring-airvik-blue focus:ring-offset-2"
                  >
                    Change Picture
                  </button>
                  <Link
                    href="/profile/privacy"
                    className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-space-4 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm focus:outline-none  focus:ring-gray-500 focus:ring-offset-2 text-center"
                  >
                    Privacy Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileErrorBoundary>
  );
}
