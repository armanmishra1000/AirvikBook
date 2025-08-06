'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
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
    // Reload profile to get updated connection status
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
                Loading your connected accounts...
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
                Failed to Load Connected Accounts
              </h3>
              <p className="text-body text-red-700 dark:text-red-300 mb-space-4">
                We couldn't load your connected accounts. Please try again.
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
              Connected Accounts
            </span>
          </nav>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h2 text-airvik-black dark:text-airvik-white font-bold">
                Connected Accounts
              </h1>
              <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
                Manage your linked third-party accounts
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

        {/* Connected Accounts Component */}
        {profile && (
          <div className="max-w-2xl mx-auto">
            <ConnectedAccounts
              initialData={profile}
              onSuccess={handleSuccess}
              onError={(error) => showError(error)}
            />
          </div>
        )}

        {/* Connection Benefits */}
        <div className="mt-space-8 max-w-2xl mx-auto">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-radius-lg p-space-6">
            <h3 className="text-h5 text-green-800 dark:text-green-200 mb-space-4">
              Benefits of Connected Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
              <div>
                <h4 className="text-body font-medium text-green-800 dark:text-green-200 mb-space-2">
                  Google Integration
                </h4>
                <ul className="text-caption text-green-700 dark:text-green-300 space-y-space-1">
                  <li>• Automatic profile picture sync</li>
                  <li>• Faster login with Google OAuth</li>
                  <li>• Enhanced security with 2FA</li>
                  <li>• Keep profile data up to date</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body font-medium text-green-800 dark:text-green-200 mb-space-2">
                  Security Features
                </h4>
                <ul className="text-caption text-green-700 dark:text-green-300 space-y-space-1">
                  <li>• OAuth 2.0 secure authentication</li>
                  <li>• No password sharing with third parties</li>
                  <li>• Easy account recovery options</li>
                  <li>• Revoke access at any time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Current Connection Status */}
        {profile && (
          <div className="mt-space-6 max-w-2xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-radius-lg p-space-6">
              <h3 className="text-h5 text-airvik-black dark:text-airvik-white mb-space-4">
                Connection Status
              </h3>
              <div className="space-y-space-3">
                <div className="flex items-center justify-between p-space-3 bg-white dark:bg-gray-700 rounded-radius-md">
                  <div className="flex items-center space-x-space-3">
                    <div className="w-8 h-8 bg-white rounded-radius-sm flex items-center justify-center shadow-shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-body font-medium text-airvik-black dark:text-airvik-white">
                        Google Account
                      </p>
                      {profile.connectedAccounts?.google?.email && (
                        <p className="text-caption text-gray-600 dark:text-gray-400">
                          {profile.connectedAccounts.google.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-space-2">
                    {profile.connectedAccounts?.google?.connected ? (
                      <>
                        <span className="inline-flex items-center px-space-2 py-space-1 rounded-radius-full text-caption font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                          Connected
                        </span>
                        {profile.connectedAccounts.google.connectedAt && (
                          <span className="text-caption text-gray-500 dark:text-gray-400">
                            {new Date(profile.connectedAccounts.google.connectedAt).toLocaleDateString()}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center px-space-2 py-space-1 rounded-radius-full text-caption font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
