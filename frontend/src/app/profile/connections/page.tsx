'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
import { AUTH_PATHS } from '../../../lib/paths';
import { useToastHelpers } from '../../../components/common/Toast';
import { ConnectedAccounts } from '../../../components/profile/ConnectedAccounts';
import { UserProfile, isSuccessResponse } from '../../../types/userProfile.types';
import { UserProfileService } from '../../../services/userProfile.service';

// =====================================================
// CONNECTED ACCOUNTS PAGE
// =====================================================
// Connected accounts management page

export default function ConnectionsPage() {
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
    // Reload profile to get updated connection status
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
              <div className="h-4 bg-gray-200 w-44 dark:bg-gray-700 rounded-radius-md animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto px-space-4 pb-space-12">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
            {/* Connected Accounts Form Skeleton */}
            <div className="xl:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-400 shadow-shadow-sm p-space-4 lg:p-space-8">
                {/* Form Header Skeleton */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4 mb-space-6">
                  <div className="h-6 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-2" />
                  <div className="h-4 bg-gray-200 w-80 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
                
                {/* Google Account Section Skeleton */}
                <div className="space-y-space-6">
                  {/* Google Account Header Skeleton */}
                  <div className="flex items-center space-x-space-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                    <div className="space-y-space-1">
                      <div className="h-5 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                      <div className="h-4 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Connection Status Skeleton */}
                  <div className="border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-radius-md p-space-4">
                    <div className="flex items-start">
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                      <div className="ml-space-3 space-y-space-1">
                        <div className="h-4 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                        <div className="h-3 bg-gray-200 w-40 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button Skeleton */}
                  <div className="flex flex-col sm:flex-row space-y-space-2 sm:space-y-0 sm:space-x-space-3">
                    <div className="w-40 h-10 bg-gray-200 dark:bg-gray-700 rounded-radius-md animate-pulse" />
                  </div>
                </div>
                
                {/* Benefits Information Section Skeleton */}
                <div className="bg-airvik-blue-light/20 dark:bg-airvik-blue/10 rounded-radius-md p-space-4">
                  <div className="flex items-start">
                    <div className="w-5 h-5 bg-airvik-blue rounded-radius-sm animate-pulse" />
                    <div className="ml-space-3 space-y-space-1">
                      <div className="h-4 bg-airvik-blue w-40 dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                      <div className="space-y-space-1">
                        <div className="h-3 bg-airvik-blue w-full dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                        <div className="h-3 bg-airvik-blue w-3/4 dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                        <div className="h-3 bg-airvik-blue w-2/3 dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                        <div className="h-3 bg-airvik-blue w-1/2 dark:bg-airvik-blue rounded-radius-sm animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Security Notice Section Skeleton */}
                <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-radius-md p-space-4">
                  <div className="flex items-start">
                    <div className="w-5 h-5 bg-yellow-600 rounded-radius-sm animate-pulse" />
                    <div className="ml-space-3 space-y-space-1">
                      <div className="h-4 bg-yellow-600 w-32 dark:bg-yellow-600 rounded-radius-sm animate-pulse" />
                      <div className="h-3 bg-yellow-600 w-full dark:bg-yellow-600 rounded-radius-sm animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-space-4 lg:space-y-space-6">
              {/* Overview Card Skeleton */}
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
                <div className="h-5 bg-gray-200 w-24 dark:bg-gray-700 rounded-radius-md animate-pulse mb-space-3" />
                <div className="space-y-space-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 w-16 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                    <div className="h-5 bg-gray-200 w-20 dark:bg-gray-700 rounded-radius-full animate-pulse" />
                  </div>
                  <div className="h-3 bg-gray-200 w-48 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-gray-200 w-32 dark:bg-gray-700 rounded-radius-sm animate-pulse" />
                </div>
              </div>
              
              {/* Benefits Card Skeleton */}
              <div className="border border-green-200 rounded-radius-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-space-4 lg:p-space-5">
                <div className="h-5 bg-green-200 w-20 dark:bg-green-700 rounded-radius-md animate-pulse mb-space-2" />
                <div className="space-y-space-1">
                  <div className="h-3 bg-green-200 w-full dark:bg-green-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-green-200 w-3/4 dark:bg-green-700 rounded-radius-sm animate-pulse" />
                  <div className="h-3 bg-green-200 w-2/3 dark:bg-green-700 rounded-radius-sm animate-pulse" />
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
                Failed to Load Connected Accounts
              </h3>
              <p className="text-gray-600 text-body dark:text-gray-400 mb-space-6">
                We couldn't load your connected accounts. Please try again or contact support if the problem persists.
              </p>
              <div className="flex flex-col justify-center sm:flex-row gap-space-3">
              <button
                onClick={loadProfile}
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
            <span className="font-medium text-airvik-blue dark:text-airvik-white">Connected Accounts</span>
          </nav>
          {/* <div>
            <h1 className="font-bold text-h3 lg:text-h2 text-airvik-black dark:text-airvik-white">Connected Accounts</h1>
            <p className="text-gray-600 mt-space-2 text-body-sm lg:text-body dark:text-gray-400">Manage your linked third‑party accounts</p>
          </div> */}
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-space-4 pb-space-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-6">
          {/* Main card */}
          <div className="xl:col-span-2">
            {profile && (
              <ConnectedAccounts
                initialData={profile}
                onSuccess={handleSuccess}
                onError={(error) => showError(error)}
              />
            )}
          </div>

          {/* Side card: Overview */}
          <aside className="space-y-space-4 lg:space-y-space-6">
            {profile && (
              <div className="bg-white border border-gray-200 rounded-radius-lg dark:border-gray-700 dark:bg-gray-800 p-space-4 lg:p-space-5 shadow-shadow-sm">
                <h3 className="text-h5 mb-space-3 text-airvik-black dark:text-airvik-white">Overview</h3>
                <div className="space-y-space-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-body-sm dark:text-gray-400">Google</span>
                    {profile.connectedAccounts?.google?.connected ? (
                      <span className="text-body-sm px-space-2 py-[2px] rounded-radius-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">Connected</span>
                    ) : (
                      <span className="text-body-sm px-space-2 py-[2px] rounded-radius-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Not Connected</span>
                    )}
                  </div>
                  {profile.connectedAccounts?.google?.email && (
                    <div className="text-gray-600 truncate text-body-sm dark:text-gray-400">{profile.connectedAccounts.google.email}</div>
                  )}
                  {profile.connectedAccounts?.google?.connectedAt && (
                    <div className="text-gray-500 text-body-sm dark:text-gray-400">Since {new Date(profile.connectedAccounts.google.connectedAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )}

            {/* Benefits card */}
            <div className="border border-green-200 rounded-radius-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-space-4 lg:p-space-5">
              <h3 className="text-green-800 text-h6 mb-space-2 dark:text-green-200">Benefits</h3>
              <ul className="text-green-700 text-body-sm dark:text-green-300 space-y-space-1">
                <li>• Faster sign‑in with OAuth</li>
                <li>• Keep profile data up‑to‑date</li>
                <li>• Easy revoke at any time</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
