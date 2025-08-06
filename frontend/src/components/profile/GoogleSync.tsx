'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToastHelpers } from '../common/Toast';

// =====================================================
// GOOGLE SYNC COMPONENT
// =====================================================
// Google data synchronization controls

interface GoogleSyncProps {
  isConnected: boolean;
  allowGoogleSync: boolean;
  onSyncToggle: (enabled: boolean) => Promise<void>;
  onSyncPicture: () => Promise<void>;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleSync: React.FC<GoogleSyncProps> = ({
  isConnected,
  allowGoogleSync,
  onSyncToggle,
  onSyncPicture,
  onError,
  className = ''
}) => {
  // =====================================================
  // STATE
  // =====================================================

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingPicture, setIsSyncingPicture] = useState(false);

  // =====================================================
  // HOOKS
  // =====================================================

  const { syncGoogleProfilePicture } = useAuth();
  const { showSuccess, showError } = useToastHelpers();

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleSyncToggle = async (enabled: boolean) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await onSyncToggle(enabled);
      showSuccess(enabled ? 'Google sync enabled' : 'Google sync disabled');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sync settings';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncPicture = async () => {
    if (isSyncingPicture) return;

    setIsSyncingPicture(true);

    try {
      const response = await syncGoogleProfilePicture();

      if (response.success) {
        showSuccess('Profile picture synced from Google successfully!');
        onSyncPicture();
      } else {
        const errorMessage = response.error || 'Failed to sync profile picture';
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync profile picture';
      showError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSyncingPicture(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (!isConnected) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-radius-lg p-space-6 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center space-x-space-3 mb-space-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-radius-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-h5 text-gray-600 dark:text-gray-400 font-medium">
            Data Sync
          </h3>
        </div>
        
        <p className="text-body text-gray-500 dark:text-gray-400">
          Connect your Google account to enable data synchronization.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-radius-lg p-space-6 shadow-shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-space-3 mb-space-4">
        <div className="w-8 h-8 bg-airvik-blue-light dark:bg-airvik-blue/20 rounded-radius-sm flex items-center justify-center">
          <svg className="w-4 h-4 text-airvik-blue dark:text-airvik-cyan" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
          Data Sync
        </h3>
      </div>

      <div className="space-y-space-4">
        {/* Sync Toggle */}
        <div className="flex items-center justify-between p-space-3 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
          <div>
            <h4 className="text-body font-medium text-airvik-black dark:text-airvik-white">
              Automatic Sync
            </h4>
            <p className="text-caption text-gray-600 dark:text-gray-400">
              Automatically sync your profile data from Google
            </p>
          </div>
          <button
            onClick={() => handleSyncToggle(!allowGoogleSync)}
            disabled={isLoading}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-radius-full transition-colors duration-normal
              focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${allowGoogleSync 
                ? 'bg-airvik-blue dark:bg-airvik-cyan' 
                : 'bg-gray-200 dark:bg-gray-600'
              }
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-radius-full bg-white transition-transform duration-normal
                ${allowGoogleSync ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Sync Picture Button */}
        <div className="flex items-center justify-between p-space-3 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
          <div>
            <h4 className="text-body font-medium text-airvik-black dark:text-airvik-white">
              Profile Picture
            </h4>
            <p className="text-caption text-gray-600 dark:text-gray-400">
              Sync your profile picture from Google
            </p>
          </div>
          <button
            onClick={handleSyncPicture}
            disabled={isSyncingPicture || !allowGoogleSync}
            className="px-space-3 py-space-1 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-caption
              transition-all duration-normal hover:bg-airvik-blue-dark hover:shadow-lg hover:-translate-y-1 
              active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
              dark:bg-airvik-cyan dark:text-airvik-midnight dark:hover:bg-airvik-cyan-dark"
          >
            {isSyncingPicture ? (
              <div className="flex items-center space-x-space-1">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
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
                <span>Syncing...</span>
              </div>
            ) : (
              'Sync Now'
            )}
          </button>
        </div>

        {/* Sync Status */}
        <div className="mt-space-4 p-space-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
          <div className="flex items-start space-x-space-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-caption font-medium text-blue-800 dark:text-blue-200">
                Sync Status
              </h4>
              <p className="text-caption text-blue-700 dark:text-blue-300 mt-space-1">
                {allowGoogleSync 
                  ? 'Automatic sync is enabled. Your profile data will be updated from Google periodically.'
                  : 'Automatic sync is disabled. You can manually sync your profile picture.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Sync Info */}
        <div className="mt-space-4 p-space-3 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
          <h4 className="text-caption font-medium text-gray-800 dark:text-gray-200 mb-space-2">
            What gets synced:
          </h4>
          <ul className="text-caption text-gray-600 dark:text-gray-400 space-y-space-1">
            <li>• Profile picture from Google account</li>
            <li>• Name and basic profile information</li>
            <li>• Email address (if different from current)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
