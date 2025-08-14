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
  // MODERN SKELETON LOADER
  // =====================================================

  if (authState.isLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-airvik-midnight">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden">
          <div className="container mx-auto px-space-4 pt-space-10 pb-space-6">
            {/* Navigation Skeleton */}
            <div className="flex items-center space-x-space-2 mb-space-4">
              <div className="h-4 bg-gray-200 w-16 dark:bg-gray-700 rounded-radius-md animate-pulse" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
              <div className="h-4 bg-gray-200 w-40 dark:bg-gray-700 rounded-radius-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-space-4 pb-space-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
            {/* Privacy Settings Form Skeleton */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-400 shadow-shadow-sm p-space-4 lg:p-space-6">
                {/* Form Header Skeleton */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4 mb-space-6">
                  <div className="h-6 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                  <div className="h-4 bg-gray-200 w-80 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
                
                {/* Profile Visibility Section Skeleton */}
                <div className="space-y-space-6">
                  <div>
                    <div className="h-5 bg-gray-200 w-40 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                  </div>
                  
                  {/* Contact Information Section Skeleton */}
                  <div>
                    <div className="h-5 bg-gray-200 w-44 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-3" />
                    <div className="space-y-space-4">
                      {/* Show Email Toggle Skeleton */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-space-1">
                          <div className="h-4 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                          <div className="h-3 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                        </div>
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                      </div>
                      
                      {/* Show Phone Toggle Skeleton */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-space-1">
                          <div className="h-4 bg-gray-200 w-36 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                          <div className="h-3 bg-gray-200 w-52 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                        </div>
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Google Integration Section Skeleton */}
                  <div>
                    <div className="h-5 bg-gray-200 w-36 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-3" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-space-1">
                        <div className="h-4 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                        <div className="h-3 bg-gray-200 w-56 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                      </div>
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Privacy Information Section Skeleton */}
                  <div className="bg-airvik-blue-light/20 dark:bg-airvik-blue/10 rounded-radius-md p-space-4">
                    <div className="flex items-start space-x-space-3">
                      <div className="w-5 h-5 bg-airvik-blue rounded-radius-sm animate-pulse" />
                      <div className="space-y-space-1">
                        <div className="h-4 bg-airvik-blue w-40 dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                        <div className="h-3 bg-airvik-blue w-full dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button Skeleton */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-space-4">
                    <div className="flex flex-col sm:flex-row sm:justify-end">
                      <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-space-4 lg:space-y-space-6">
              {/* Visibility Levels Skeleton */}
              <div className="border border-yellow-200 rounded-radius-lg dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-space-4 lg:p-space-5">
                <div className="h-5 bg-yellow-200 w-36 dark:bg-yellow-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="space-y-space-1">
                  <div className="h-3 bg-yellow-200 w-full dark:bg-yellow-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-yellow-200 w-3/4 dark:bg-yellow-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-yellow-200 w-2/3 dark:bg-yellow-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
              
              {/* Current Status Skeleton */}
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
                <div className="h-5 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="space-y-space-1">
                  <div className="h-3 bg-gray-200 w-full dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-3/4 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-2/3 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-1/2 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
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
      <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
        <div className="container mx-auto px-space-4 py-space-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-radius-lg p-space-6">
              <svg className="w-12 h-12 mx-auto text-red-600 dark:text-red-400 mb-space-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="text-red-800 text-h4 dark:text-red-200 mb-space-2">
                Failed to Load Privacy Settings
              </h3>
              <p className="text-red-700 text-body dark:text-red-300 mb-space-4">
                We couldn't load your privacy settings. Please try again.
              </p>
              <button
                onClick={loadProfile}
                className="transition-all bg-red-600 px-space-4 py-space-2 text-airvik-white rounded-radius-md font-sf-pro text-button duration-normal hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
    <div className="min-h-screen bg-white dark:bg-airvik-midnight">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-space-4 pt-space-10 pb-space-6">
          <nav className="flex items-center text-gray-500 space-x-space-2 mb-space-4 dark:text-gray-400">
            <Link href="/profile" className="hover:text-airvik-blue">Profile</Link>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-airvik-blue dark:text-airvik-white">Privacy Settings</span>
          </nav>
          {/* <div>
            <h1 className="font-bold text-h3 lg:text-h2 text-airvik-black dark:text-airvik-white">Privacy Settings</h1>
            <p className="text-gray-600 mt-space-2 text-body-sm lg:text-body dark:text-gray-400">Control who can see your profile information</p>
          </div> */}
        </div>
      </div>

      <div className="container mx-auto px-space-4 pb-space-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
          {/* Main settings */}
          <div className="xl:col-span-2">
            {profile && (
              <PrivacySettings
                initialData={profile}
                onSuccess={handleSuccess}
                onError={(error) => showError(error)}
              />
            )}
          </div>

          {/* Informational sidebar */}
          <aside className="space-y-space-4 lg:space-y-space-6">
            <div className="border border-yellow-200 rounded-radius-lg dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-space-4 lg:p-space-5">
              <h3 className="text-yellow-800 text-h6 mb-space-2 dark:text-yellow-200">Visibility Levels</h3>
              <ul className="text-yellow-700 text-body-sm dark:text-yellow-300 space-y-space-1">
                <li><strong>Public:</strong> Anyone can view your profile</li>
                <li><strong>Friends:</strong> Only your friends can view</li>
                <li><strong>Private:</strong> Only you can view</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
              <h3 className="text-h6 mb-space-2 text-airvik-black dark:text-airvik-white">Current Status</h3>
              {profile && (
                <ul className="text-gray-700 text-body-sm dark:text-gray-300 space-y-space-1">
                  <li>Profile Visibility: <strong>{profile.privacy.profileVisibility}</strong></li>
                  <li>Email Visible: <strong>{profile.privacy.showEmail ? 'Yes' : 'No'}</strong></li>
                  <li>Phone Visible: <strong>{profile.privacy.showPhone ? 'Yes' : 'No'}</strong></li>
                  <li>Google Sync: <strong>{profile.privacy.allowGoogleSync ? 'Enabled' : 'Disabled'}</strong></li>
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
