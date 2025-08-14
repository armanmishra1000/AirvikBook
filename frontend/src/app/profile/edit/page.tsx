'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
import { AUTH_PATHS } from '../../../lib/paths';
import { useToastHelpers } from '../../../components/common/Toast';
import { ProfileForm } from '../../../components/profile/ProfileForm';
import { UserProfile, isSuccessResponse } from '../../../types/userProfile.types';
import { UserProfileService } from '../../../services/userProfile.service';

// =====================================================
// EDIT PROFILE PAGE
// =====================================================
// Profile editing page with comprehensive form

export default function EditProfilePage() {
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
      router.replace(AUTH_PATHS.LOGIN);
      return;
    }

    if (isAuthenticated) {
      loadProfile();
    }
  }, [authState.isLoading, isAuthenticated, router]);

  // =====================================================
  // PROFILE LOADING
  // =====================================================

  const loadProfile = async (cacheBust = false) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await UserProfileService.getProfile(cacheBust);
      
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
    // Reload the profile data to reflect the changes with cache-busting
    loadProfile(true);
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
              <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-md animate-pulse" />
            </div>
            
            {/* Header Content Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-4">
              <div className="space-y-space-2">
                <div className="h-8 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-lg animate-pulse" />
                <div className="h-5 bg-gray-200 w-80 dark:bg-gray-700 rounded-radius-md animate-pulse" />
              </div>
              <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-space-4 pb-space-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
            {/* Form Skeleton */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-400 shadow-shadow-sm p-space-4 lg:p-space-6">
                {/* Form Header Skeleton */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4 mb-space-6">
                  <div className="h-6 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                  <div className="h-4 bg-gray-200 w-80 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
                
                {/* Form Fields Skeleton */}
                <div className="space-y-space-6">
                  {/* Full Name Field */}
                  <div>
                    <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                  </div>
                  
                  {/* Mobile Number Field */}
                  <div>
                    <div className="h-4 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                  </div>
                  
                  {/* Bio Field */}
                  <div>
                    <div className="h-4 bg-gray-200 w-12 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                  </div>
                  
                  {/* Date of Birth and Gender Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
                    <div>
                      <div className="h-4 bg-gray-200 w-28 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 w-16 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Nationality and Occupation Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
                    <div>
                      <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Website and Location Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
                    <div>
                      <div className="h-4 bg-gray-200 w-20 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 w-20 dark:bg-gray-700 rounded-radius-sm animate-pulse mb-space-2" />
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Submit Button Skeleton */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-space-4">
                    <div className="flex flex-col sm:flex-row sm:justify-end">
                      <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-space-6">
              {/* Profile Guidelines Skeleton */}
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
                <div className="h-5 bg-gray-200 w-40 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="space-y-space-1">
                  <div className="h-3 bg-gray-200 w-full dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-3/4 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-2/3 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
              
              {/* Pro Tip Skeleton */}
              <div className="border border-gray-200 rounded-radius-lg dark:border-gray-700 bg-white dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
                <div className="h-5 bg-gray-200 w-20 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="h-3 bg-gray-200 w-full dark:bg-gray-700 rounded-radius-sm animate-pulse" />
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
                onClick={() => loadProfile()}
                  className="transition-all bg-airvik-blue hover:bg-airvik-purple text-airvik-white px-space-6 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm hover:shadow-shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
              >
                Try Again
              </button>
                <Link
                  href="/profile"
                  className="transition-all bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-space-6 py-space-3 rounded-radius-lg font-medium text-button shadow-shadow-sm hover:shadow-shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-airvik-black dark:border-gray-300"
                >
                  Back to Profile
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
    <div className="min-h-screen bg-white dark:bg-airvik-midnight">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-space-4 pt-space-10 pb-space-6">
          <nav className="flex items-center text-gray-500 space-x-space-2 mb-space-4 dark:text-gray-400">
            <Link href="/profile" className="hover:text-airvik-blue">Profile</Link>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-airvik-blue dark:text-airvik-white">Edit Profile</span>
          </nav>
          <div>
            <h1 className="font-bold text-h3 lg:text-h2 text-airvik-black dark:text-airvik-white">Edit Profile</h1>
            <p className="text-gray-600 mt-space-2 text-body-sm lg:text-body dark:text-gray-400">Update your personal information and preferences</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-space-4 pb-space-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
          {/* Form */}
          <div className="xl:col-span-2">
            {profile && (
              <ProfileForm
                initialData={profile}
                onSuccess={handleSuccess}
                onError={(error) => showError(error)}
              />
            )}
          </div>

        {/* Tips */}
          <aside className="space-y-space-4 lg:space-y-space-6">
            <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
              <h3 className="text-h6 mb-space-2 text-airvik-black dark:text-airvik-white">Profile Guidelines</h3>
              <ul className="text-gray-600 text-body-sm dark:text-gray-400 space-y-space-1">
                <li>• Full Name should be 2-100 characters</li>
                <li>• Keep your bio concise and professional</li>
                <li>• Use a valid website URL if provided</li>
              </ul>
            </div>
            <div className="border border-green-200 rounded-radius-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-space-4 lg:p-space-5">
              <h3 className="text-green-800 text-h6 mb-space-2 dark:text-green-200">Pro Tip</h3>
              <p className="text-green-700 text-body-sm dark:text-green-300">Use a recent, clear profile photo and keep your occupation and location updated to help teammates recognize you.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
