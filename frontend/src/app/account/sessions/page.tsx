'use client';

import React, { useState } from 'react';
import { SessionManager } from '../../../components/auth/SessionManager';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
import { AUTH_PATHS } from '../../../lib/paths';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// =====================================================
// SESSIONS MANAGEMENT PAGE
// =====================================================
// Page for managing active sessions across devices

const SessionsPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { authState } = useAuth();
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authState.isLoading) {
      router.replace(AUTH_PATHS.LOGIN);
    }
  }, [isAuthenticated, authState.isLoading, router]);

  // Show loading while checking authentication
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-airvik-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-4 animate-spin mb-space-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-gray-600 text-body dark:text-gray-400 font-sf-pro">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="shadow-sm bg-airvik-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-space-4 sm:px-space-6 lg:px-space-8">
          <div className="flex items-center justify-between py-space-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="text-gray-400 transition-colors mr-space-4 p-space-2 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 duration-normal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
                  Active Sessions
                </h1>
                <p className="text-gray-600 text-body dark:text-gray-400 mt-space-1">
                  Manage your active sessions and account security
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-space-4">
              {authState.user?.profilePicture ? (
                <img
                  src={authState.user.profilePicture}
                  alt={authState.user.fullName}
                  className="w-10 h-10 rounded-radius-full"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 font-medium bg-airvik-blue text-airvik-white rounded-radius-full font-sf-pro">
                  {authState.user?.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-label font-sf-pro text-airvik-black dark:text-airvik-white">
                  {authState.user?.fullName}
                </p>
                <p className="text-gray-600 text-caption dark:text-gray-400">
                  {authState.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-space-4 sm:px-space-6 lg:px-space-8 py-space-8">
        {/* Connection Status Alert */}
        {sessionError && (
          <div className="border border-yellow-200 mb-space-6 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-radius-lg p-space-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 mt-space-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-space-3">
                <h3 className="text-yellow-800 text-label font-sf-pro dark:text-yellow-200 mb-space-1">
                  Connection Issue
                </h3>
                <p className="text-yellow-700 text-body dark:text-yellow-300">
                  {sessionError}
                </p>
                <div className="mt-space-3">
                  <button
                    onClick={() => setSessionError(null)}
                    className="text-sm text-yellow-800 underline dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8">
          {/* Main Session Manager */}
          <div className="lg:col-span-2">
            <SessionManager
              autoRefresh={true}
              refreshInterval={30000}
              showCurrentSessionFirst={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-space-6">
            {/* Security Tips */}
            <div className="shadow-sm bg-airvik-white dark:bg-gray-800 rounded-radius-lg p-space-6">
              <h3 className="text-h5 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
                Security Tips
              </h3>
              
              <div className="space-y-space-4">
                <div className="flex items-start space-x-space-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-radius-full mt-space-1">
                    <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-body font-sf-pro text-airvik-black dark:text-airvik-white">
                      Review Active Sessions
                    </p>
                    <p className="text-gray-600 text-caption dark:text-gray-400 mt-space-1">
                      Check for any unfamiliar devices or locations
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-space-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-radius-full mt-space-1">
                    <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-body font-sf-pro text-airvik-black dark:text-airvik-white">
                      Logout Unused Sessions
                    </p>
                    <p className="text-gray-600 text-caption dark:text-gray-400 mt-space-1">
                      End sessions on devices you no longer use
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-space-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-radius-full mt-space-1">
                    <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-body font-sf-pro text-airvik-black dark:text-airvik-white">
                      Monitor Email Alerts
                    </p>
                    <p className="text-gray-600 text-caption dark:text-gray-400 mt-space-1">
                      We'll notify you of new device logins
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="shadow-sm bg-airvik-white dark:bg-gray-800 rounded-radius-lg p-space-6">
              <h3 className="text-h5 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
                Account Actions
              </h3>
              
              <div className="space-y-space-3">
                <button
                  onClick={() => router.push(AUTH_PATHS.FORGOT_PASSWORD)}
                  className="w-full text-left transition-colors border border-gray-300 px-space-4 py-space-3 dark:border-gray-600 rounded-radius-md text-airvik-black dark:text-airvik-white hover:bg-gray-50 dark:hover:bg-gray-700 duration-normal"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body font-sf-pro">Security Settings</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/account/profile')}
                  className="w-full text-left transition-colors border border-gray-300 px-space-4 py-space-3 dark:border-gray-600 rounded-radius-md text-airvik-black dark:text-airvik-white hover:bg-gray-50 dark:hover:bg-gray-700 duration-normal"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body font-sf-pro">Account Settings</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/contact')}
                  className="w-full text-left transition-colors border border-gray-300 px-space-4 py-space-3 dark:border-gray-600 rounded-radius-md text-airvik-black dark:text-airvik-white hover:bg-gray-50 dark:hover:bg-gray-700 duration-normal"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body font-sf-pro">Contact Support</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Security Status */}
            <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-radius-lg p-space-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-success mt-space-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-space-3">
                  <h4 className="text-label font-sf-pro text-success mb-space-1">
                    Account Secure
                  </h4>
                  <p className="text-body text-success">
                    Your account security is up to date. We'll continue monitoring for any suspicious activity.
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting Section */}
            <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-radius-lg p-space-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-airvik-blue mt-space-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-space-3">
                  <h4 className="text-label font-sf-pro text-airvik-blue mb-space-1">
                    Having Issues?
                  </h4>
                  <p className="text-body text-airvik-blue mb-space-3">
                    If you're having trouble viewing your sessions, try refreshing the page or check your internet connection.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm underline text-airvik-blue hover:text-blue-700"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;