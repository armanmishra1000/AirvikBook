'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
import { useToastHelpers } from '../../../components/common/Toast';
import { PrivacySettings } from '../../../components/profile/PrivacySettings';
import { UserProfile, isSuccessResponse } from '../../../types/userProfile.types';
import { UserProfileService } from '../../../services/userProfile.service';

// =====================================================
// PRIVACY SETTINGS PAGE
// =====================================================
// Privacy and visibility controls page

export default function PrivacyPage() {
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
      loadProfile();
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
  // SUCCESS HANDLER
  // =====================================================

  const handleSuccess = () => {
    // Reload profile to get updated privacy settings
    loadProfile();
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (authState.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
        <div className="container mx-auto px-space-4 py-space-8">
          <div className="flex items-center justify-center py-space-12">
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
                Loading your privacy settings...
              </p>
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
      <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
        <div className="container mx-auto px-space-4 py-space-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-lg p-space-6 text-center">
              <svg className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-space-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="text-h4 text-red-800 dark:text-red-200 mb-space-2">
                Failed to Load Privacy Settings
              </h3>
              <p className="text-body text-red-700 dark:text-red-300 mb-space-4">
                We couldn't load your privacy settings. Please try again.
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
    <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
      <div className="container mx-auto px-space-4 py-space-8">
        {/* Header with Breadcrumbs */}
        <div className="mb-space-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-space-2 mb-space-4">
            <Link
              href="/profile"
              className="text-caption text-gray-500 dark:text-gray-400 hover:text-airvik-blue dark:hover:text-airvik-blue transition-colors duration-normal"
            >
              Profile
            </Link>
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-caption text-airvik-black dark:text-airvik-white font-medium">
              Privacy Settings
            </span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 text-airvik-black dark:text-airvik-white font-bold">
                Privacy Settings
              </h1>
              <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
                Control who can see your profile information
              </p>
            </div>
            <Link
              href="/profile"
              className="px-space-4 py-space-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Back to Profile
            </Link>
          </div>
        </div>

        {/* Privacy Settings Component */}
        {profile && (
          <div className="max-w-2xl mx-auto">
            <PrivacySettings
              initialData={profile}
              onSuccess={handleSuccess}
              onError={(error) => showError(error)}
            />
          </div>
        )}

        {/* Privacy Information */}
        <div className="mt-space-8 max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-radius-lg p-space-6">
            <h3 className="text-h5 text-yellow-800 dark:text-yellow-200 mb-space-4">
              Privacy Information
            </h3>
            <div className="space-y-space-3">
              <div>
                <h4 className="text-body font-medium text-yellow-800 dark:text-yellow-200 mb-space-2">
                  Profile Visibility Levels
                </h4>
                <ul className="text-caption text-yellow-700 dark:text-yellow-300 space-y-space-1">
                  <li><strong>Public:</strong> Anyone can view your profile information</li>
                  <li><strong>Friends:</strong> Only your friends can view your profile</li>
                  <li><strong>Private:</strong> Only you can view your profile</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body font-medium text-yellow-800 dark:text-yellow-200 mb-space-2">
                  Contact Information
                </h4>
                <ul className="text-caption text-yellow-700 dark:text-yellow-300 space-y-space-1">
                  <li>• Email and phone visibility are controlled separately</li>
                  <li>• These settings only affect what other users can see</li>
                  <li>• Administrators may still access your information for support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Current Privacy Status */}
        {profile && (
          <div className="mt-space-6 max-w-2xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-radius-lg p-space-6">
              <h3 className="text-h5 text-airvik-black dark:text-airvik-white mb-space-4">
                Current Privacy Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
                <div>
                  <p className="text-body text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Profile Visibility:</span> {profile.privacy.profileVisibility}
                  </p>
                  <p className="text-body text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Email Visible:</span> {profile.privacy.showEmail ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-body text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Phone Visible:</span> {profile.privacy.showPhone ? 'Yes' : 'No'}
                  </p>
                  <p className="text-body text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Google Sync:</span> {profile.privacy.allowGoogleSync ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
