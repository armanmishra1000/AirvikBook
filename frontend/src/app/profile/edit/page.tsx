'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
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
  // LOADING STATE
  // =====================================================

  if (authState.isLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-airvik-white dark:bg-airvik-midnight">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto animate-spin mb-space-4 text-airvik-blue" viewBox="0 0 24 24">
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
                onClick={() => loadProfile()}
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
    <div className="min-h-screen bg-gradient-to-b from-airvik-blue/5 via-transparent to-transparent dark:from-airvik-blue/10 dark:bg-airvik-midnight">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 blur-3xl">
          <div className="absolute top-[-4rem] left-1/3 h-64 w-64 rounded-full bg-airvik-blue" />
          <div className="absolute top-[6rem] left-[10%] h-40 w-40 rounded-full bg-airvik-purple" />
        </div>
        <div className="container mx-auto px-space-4 pt-space-10 pb-space-6">
          <nav className="flex items-center text-gray-500 space-x-space-2 mb-space-4 dark:text-gray-400">
            <Link href="/profile" className="hover:text-airvik-blue">Profile</Link>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-airvik-black dark:text-airvik-white">Edit Profile</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-4">
            <div>
              <h1 className="font-bold text-h2 text-airvik-black dark:text-airvik-white">Edit Profile</h1>
              <p className="text-gray-600 mt-space-2 text-body dark:text-gray-400">Update your personal information and preferences</p>
            </div>
            <Link href="/profile" className="self-start text-gray-800 transition bg-gray-200 md:self-auto px-space-4 py-space-2 rounded-radius-md dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Back to Profile</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-space-4 pb-space-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {profile && (
              <ProfileForm
                initialData={profile}
                onSuccess={handleSuccess}
                onError={(error) => showError(error)}
              />
            )}
          </div>

        {/* Tips */}
          <aside className="space-y-space-6">
            <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-5 shadow-shadow-sm">
              <h3 className="text-h6 mb-space-2 text-airvik-black dark:text-airvik-white">Profile Guidelines</h3>
              <ul className="text-gray-600 text-caption dark:text-gray-400 space-y-space-1">
                <li>• Full Name should be 2-100 characters</li>
                <li>• Keep your bio concise and professional</li>
                <li>• Use a valid website URL if provided</li>
              </ul>
            </div>
            <div className="border border-green-200 rounded-radius-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-space-5">
              <h3 className="text-green-800 text-h6 mb-space-2 dark:text-green-200">Pro Tip</h3>
              <p className="text-green-700 text-caption dark:text-green-300">Use a recent, clear profile photo and keep your occupation and location updated to help teammates recognize you.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
