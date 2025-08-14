'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
import { AUTH_PATHS } from '../../../lib/paths';
import { useToastHelpers } from '../../../components/common/Toast';
import { ProfilePictureUpload } from '../../../components/profile/ProfilePictureUpload';
import { UserProfile, isSuccessResponse } from '../../../types/userProfile.types';
import { UserProfileService } from '../../../services/userProfile.service';

// =====================================================
// PROFILE PICTURE MANAGEMENT PAGE
// =====================================================
// Profile picture upload and management page

export default function ProfilePicturePage() {
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
    // Reload profile to get updated picture
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
              <div className="h-4 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-space-4 pb-space-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
            {/* Upload Card Skeleton */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-400 shadow-shadow-sm p-space-4 lg:p-space-6">
                {/* Upload Card Header Skeleton */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4 mb-space-6">
                  <div className="h-6 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                  <div className="h-4 bg-gray-200 w-80 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
                
                {/* Current Picture Section Skeleton */}
                <div className="space-y-space-6">
                  <div className="flex items-center space-x-space-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                    <div className="space-y-space-2">
                      <div className="h-5 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                      <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Upload Area Skeleton */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-radius-lg p-space-6 lg:p-space-8">
                    <div className="text-center space-y-space-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse mx-auto" />
                      <div className="space-y-space-2">
                        <div className="h-4 bg-gray-200 w-64 dark:bg-gray-700 rounded-radius-sm animate-pulse mx-auto" />
                        <div className="h-3 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse mx-auto" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons Skeleton */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-space-3 border-t border-gray-200 dark:border-gray-700 pt-space-4">
                    <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-space-4 lg:space-y-space-6">
              {/* File Requirements Skeleton */}
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
                <div className="h-5 bg-gray-200 w-40 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="space-y-space-1">
                  <div className="h-3 bg-gray-200 w-full dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-3/4 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-2/3 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
              
              {/* Pro Tips Skeleton */}
              <div className="border border-green-200 rounded-radius-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-space-4 lg:p-space-5">
                <div className="h-5 bg-green-200 w-20 dark:bg-green-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="space-y-space-1">
                  <div className="h-3 bg-green-200 w-full dark:bg-green-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-green-200 w-3/4 dark:bg-green-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-green-200 w-2/3 dark:bg-green-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
              
              {/* Current Picture Info Skeleton */}
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5">
                <div className="h-5 bg-gray-200 w-36 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="flex items-center space-x-space-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                  <div className="space-y-space-1">
                    <div className="h-3 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                    <div className="h-3 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  </div>
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
                Failed to Load Profile
              </h3>
              <p className="text-red-700 text-body dark:text-red-300 mb-space-4">
                We couldn't load your profile information. Please try again.
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
            <span className="font-medium text-airvik-blue dark:text-airvik-white">Profile Picture</span>
          </nav>
          {/* <div>
            <h1 className="font-bold text-h3 lg:text-h2 text-airvik-black dark:text-airvik-white">Profile Picture</h1>
            <p className="text-gray-600 mt-space-2 text-body-sm lg:text-body dark:text-gray-400">Upload or sync your profile picture</p>
          </div> */}
        </div>
      </div>

      <div className="container mx-auto px-space-4 pb-space-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
          {/* Upload card */}
          <div className="xl:col-span-2">
            {profile && (
              <ProfilePictureUpload
                currentPictureUrl={profile.profilePicture}
                onSuccess={handleSuccess}
                onError={(error) => showError(error)}
              />
            )}
          </div>
          {/* Guidelines */}
          <aside className="space-y-space-4 lg:space-y-space-6">
            <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
              <h3 className="text-h6 mb-space-2 text-airvik-black dark:text-airvik-white">File Requirements</h3>
              <ul className="text-gray-600 text-body-sm dark:text-gray-400 space-y-space-1">
                <li>• Max size: 5MB</li>
                <li>• Formats: JPG, PNG, WebP</li>
                <li>• 100×100 to 2000×2000 px</li>
              </ul>
            </div>
            <div className="border border-green-200 rounded-radius-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-space-4 lg:p-space-5">
              <h3 className="text-green-800 text-h6 mb-space-2 dark:text-green-200">Pro Tips</h3>
              <ul className="text-green-700 text-body-sm dark:text-green-300 space-y-space-1">
                <li>• Use a recent, clear headshot</li>
                <li>• Prefer square images for best fit</li>
                <li>• Sync from Google for auto-updates</li>
              </ul>
            </div>
            {profile?.profilePicture && (
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5">
                <h3 className="text-h6 mb-space-2 text-airvik-black dark:text-airvik-white">Current Picture</h3>
                <div className="flex items-center space-x-space-4">
                  <img src={profile.profilePicture} alt="Current profile" className="object-cover w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-200 rounded-radius-full dark:border-gray-600" />
                  <div>
                    <p className="text-gray-700 text-body-sm lg:text-body dark:text-gray-300"><span className="font-medium">Source:</span> {profile.profilePictureSource || 'DEFAULT'}</p>
                    {profile.lastUpdated && (
                      <p className="text-gray-500 text-caption dark:text-gray-400">Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
