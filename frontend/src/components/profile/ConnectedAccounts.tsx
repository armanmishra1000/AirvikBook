'use client';

import React, { useState, useEffect } from 'react';
import { useToastHelpers } from '../common/Toast';
import {
  UserProfile,
  isSuccessResponse,
  PROFILE_ERROR_CODES
} from '../../types/userProfile.types';
import { UserProfileService } from '../../services/userProfile.service';
import GoogleOAuthButton from '../auth/GoogleOAuthButton';
import GoogleOAuthRedirectButton from '../auth/GoogleOAuthRedirectButton';

// =====================================================
// BRAND-COMPLIANT CONNECTED ACCOUNTS COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface ConnectedAccountsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  initialData?: UserProfile;
}

export const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({
  onSuccess,
  onError,
  className = '',
  initialData
}) => {
  const { showSuccess, showError } = useToastHelpers();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // =====================================================
  // DATA LOADING
  // =====================================================

  useEffect(() => {
    if (initialData) {
      setProfileData(initialData);
    } else {
      loadProfileData();
    }
  }, [initialData]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await UserProfileService.getProfile();
      if (isSuccessResponse(response)) {
        setProfileData(response.data);
      } else {
        showError(response.error || 'Failed to load profile data');
      }
    } catch (error) {
      showError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };



  const handleDisconnectGoogle = async () => {
    setIsDisconnecting(true);

    try {
      const response = await UserProfileService.disconnectGoogle();

      if (isSuccessResponse(response)) {
        showSuccess('Google account disconnected successfully');
        onSuccess?.();
        // Reload profile data to get updated connection status
        await loadProfileData();
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'GOOGLE_DISCONNECTION_FAILED');
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to disconnect Google account. Please try again.';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (isLoading) {
    return (
      <div className={`bg-airvik-white-pure dark:bg-airvik-midnight rounded-radius-lg shadow-shadow-sm p-space-6 ${className}`}>
        <div className="flex items-center justify-center py-space-12">
          <svg className="w-8 h-8 animate-spin text-airvik-blue" viewBox="0 0 24 24">
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
          <span className="ml-space-3 text-body text-airvik-black dark:text-airvik-white">
            Loading connected accounts...
          </span>
        </div>
      </div>
    );
  }

  const googleConnected = profileData?.connectedAccounts?.google?.connected || false;
  const googleEmail = profileData?.connectedAccounts?.google?.email;
  const connectedAt = profileData?.connectedAccounts?.google?.connectedAt;

  return (
    <div className={`bg-airvik-white-pure dark:bg-airvik-midnight rounded-radius-lg border border-gray-200 dark:border-gray-400 shadow-shadow-sm ${className}`}>
      <div className="p-space-4 lg:p-space-8 space-y-space-8 lg:space-y-space-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4">
          <h3 className="text-h4 lg:text-h3 text-airvik-black dark:text-airvik-white">
            Connected Accounts
          </h3>
          <p className="text-gray-600 text-body-sm lg:text-body dark:text-gray-400 mt-space-2">
            Manage your connected third-party accounts
          </p>
        </div>

        {/* Google Account Section */}
        <div className="space-y-space-4">
          <div className="flex items-center space-x-space-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-radius-md shadow-shadow-sm">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-h6 lg:text-h5 text-airvik-black dark:text-airvik-white">
                Google Account
              </h4>
              <p className="text-gray-600 text-body-sm dark:text-gray-400">
                Connect your Google account for profile syncing
              </p>
            </div>
          </div>

          {/* Connection Status */}
          {googleConnected ? (
            <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-radius-md p-space-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-space-3">
                  <h5 className="font-medium text-green-800 text-body dark:text-green-200">
                    Connected
                  </h5>
                  <p className="text-green-700 text-body-sm dark:text-green-300">
                    {googleEmail && `Connected to ${googleEmail}`}
                    {connectedAt && ` • Connected on ${new Date(connectedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-radius-md p-space-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-space-3">
                  <h5 className="font-medium text-gray-800 text-body dark:text-gray-200">
                    Not Connected
                  </h5>
                  <p className="text-gray-600 text-body-sm dark:text-gray-400">
                    Connect your Google account to sync profile data and pictures
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-space-2 sm:space-y-0 sm:space-x-space-3">
            {googleConnected ? (
              <button
                onClick={handleDisconnectGoogle}
                disabled={isDisconnecting}
                className="transition-all bg-red-600 px-space-4 py-space-2 text-airvik-white rounded-radius-md font-sf-pro text-button duration-normal hover:bg-red-700 hover:shadow-lg  active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isDisconnecting ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 animate-spin mr-space-2" viewBox="0 0 24 24">
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
                    Disconnecting...
                  </div>
                ) : (
                  'Disconnect Google'
                )}
              </button>
            ) : (
              // Use redirect-based OAuth to avoid FedCM/CORS issues with One Tap on some setups
              <GoogleOAuthRedirectButton
                type="login"
                redirectTo="/profile/connections"
                className="px-space-4 py-space-2 bg-white text-airvik-black rounded-radius-md font-sf-pro text-button border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
              >
                Connect Google Account
              </GoogleOAuthRedirectButton>
            )}
          </div>
        </div>

        {/* Benefits Information */}
        <div className="bg-airvik-blue-light/20 dark:bg-airvik-blue/10 rounded-radius-md p-space-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-space-3">
              <h5 className="font-medium text-body-sm lg:text-body text-airvik-black dark:text-airvik-white">
                Benefits of Connecting
              </h5>
              <ul className="text-gray-600 text-body-sm dark:text-gray-400 mt-space-1 space-y-space-1">
                <li>• Automatically sync your profile picture from Google</li>
                <li>• Keep your profile information up to date</li>
                <li>• Faster login with Google OAuth</li>
                <li>• Enhanced security with two-factor authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-radius-md p-space-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-space-3">
              <h5 className="font-medium text-yellow-800 text-body-sm lg:text-body dark:text-yellow-200">
                Security Notice
              </h5>
              <p className="text-yellow-700 text-body-sm dark:text-yellow-300 mt-space-1">
                We only access your basic profile information and profile picture. We never access your emails, contacts, or other private Google data. You can disconnect your account at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
