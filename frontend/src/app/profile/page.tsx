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
// PROFILE OVERVIEW PAGE
// =====================================================
// Main profile page with navigation to all profile sections

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
        // Force refresh of profile data
        loadProfile();
        // Clean up the URL
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
  // LOADING STATE
  // =====================================================

  if (authState.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-space-4 text-airvik-blue" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-body text-airvik-black dark:text-airvik-white font-sf-pro">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (isError) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
        <div className="container mx-auto px-space-4 py-space-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-lg p-space-6 text-center">
              <svg className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-space-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="text-h4 text-red-800 dark:text-red-200 mb-space-2">
                Failed to Load Profile
              </h3>
              <p className="text-body text-red-700 dark:text-red-300 mb-space-4">
                We couldn't load your profile information. Please try again.
              </p>
              <button
                onClick={loadProfile}
                className="px-space-4 py-space-2 bg-red-600 text-airvik-white rounded-radius-md font-sf-pro text-button
                  transition-all duration-normal hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 
                  active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
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
      <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
      <div className="container mx-auto px-space-4 py-space-8">
        {/* Header */}
        <div className="mb-space-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 text-airvik-black dark:text-airvik-white font-bold">
                Profile Settings
              </h1>
              <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
                Manage your profile information and preferences
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-space-4 py-space-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="mb-space-8">
            <ProfileCard
              profile={profile}
              showActions={true}
              onEdit={handleEditProfile}
              onPictureChange={handlePictureChange}
            />
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-6">
          {/* Edit Profile */}
          <Link
            href="/profile/edit"
            className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm p-space-6 border border-gray-200 dark:border-gray-700
              transition-all duration-normal hover:shadow-shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
          >
            <div className="flex items-center space-x-space-4">
              <div className="w-12 h-12 bg-airvik-blue/10 rounded-radius-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <div>
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
                  Edit Profile
                </h3>
                <p className="text-caption text-gray-600 dark:text-gray-400">
                  Update your personal information
                </p>
              </div>
            </div>
          </Link>

          {/* Profile Picture */}
          <Link
            href="/profile/picture"
            className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm p-space-6 border border-gray-200 dark:border-gray-700
              transition-all duration-normal hover:shadow-shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
          >
            <div className="flex items-center space-x-space-4">
              <div className="w-12 h-12 bg-airvik-purple/10 rounded-radius-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-airvik-purple" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
                  Profile Picture
                </h3>
                <p className="text-caption text-gray-600 dark:text-gray-400">
                  Upload or sync your profile picture
                </p>
              </div>
            </div>
          </Link>

          {/* Privacy Settings */}
          <Link
            href="/profile/privacy"
            className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm p-space-6 border border-gray-200 dark:border-gray-700
              transition-all duration-normal hover:shadow-shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
          >
            <div className="flex items-center space-x-space-4">
              <div className="w-12 h-12 bg-airvik-cyan/10 rounded-radius-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-airvik-cyan" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
                  Privacy Settings
                </h3>
                <p className="text-caption text-gray-600 dark:text-gray-400">
                  Control your profile visibility
                </p>
              </div>
            </div>
          </Link>

          {/* Connected Accounts */}
          <Link
            href="/profile/connections"
            className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm p-space-6 border border-gray-200 dark:border-gray-700
              transition-all duration-normal hover:shadow-shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
          >
            <div className="flex items-center space-x-space-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-radius-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
                  Connected Accounts
                </h3>
                <p className="text-caption text-gray-600 dark:text-gray-400">
                  Manage your linked accounts
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-space-8 bg-airvik-blue-light/20 dark:bg-airvik-blue/10 rounded-radius-lg p-space-6">
          <h3 className="text-h5 text-airvik-black dark:text-airvik-white mb-space-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-space-3">
            <button
              onClick={handleEditProfile}
              className="px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
            >
              Edit Profile
            </button>
            <button
              onClick={handlePictureChange}
              className="px-space-4 py-space-2 bg-airvik-purple text-airvik-white rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-airvik-purple-light hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-purple focus:ring-offset-2"
            >
              Change Picture
            </button>
            <Link
              href="/profile/privacy"
              className="px-space-4 py-space-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Privacy Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
    </ProfileErrorBoundary>
  );
}
