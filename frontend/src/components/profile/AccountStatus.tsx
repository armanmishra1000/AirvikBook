'use client';

import React from 'react';

// =====================================================
// ACCOUNT STATUS COMPONENT
// =====================================================
// Display connection status and account information

interface AccountStatusProps {
  isConnected: boolean;
  googleEmail?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  syncEnabled: boolean;
  className?: string;
}

export const AccountStatus: React.FC<AccountStatusProps> = ({
  isConnected,
  googleEmail,
  connectedAt,
  lastSyncAt,
  syncEnabled,
  className = ''
}) => {
  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (): string => {
    if (!isConnected) return 'text-gray-500 dark:text-gray-400';
    if (syncEnabled) return 'text-green-600 dark:text-green-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getStatusText = (): string => {
    if (!isConnected) return 'Not Connected';
    if (syncEnabled) return 'Connected & Syncing';
    return 'Connected (Sync Disabled)';
  };

  const getStatusIcon = () => {
    if (!isConnected) {
      return (
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (syncEnabled) {
      return (
        <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-radius-lg p-space-6 shadow-shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-space-3 mb-space-4">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-radius-sm flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
          Account Status
        </h3>
      </div>

      <div className="space-y-space-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-space-3 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
          <div className="flex items-center space-x-space-2">
            {getStatusIcon()}
            <span className={`text-body font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Account Information */}
        {isConnected && (
          <div className="space-y-space-3">
            {googleEmail && (
              <div className="flex items-center justify-between p-space-3 bg-blue-50 dark:bg-blue-900/20 rounded-radius-md">
                <div className="flex items-center space-x-space-2">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-body text-blue-800 dark:text-blue-200">
                    Connected Email
                  </span>
                </div>
                <span className="text-body text-blue-700 dark:text-blue-300 font-medium">
                  {googleEmail}
                </span>
              </div>
            )}

            {connectedAt && (
              <div className="flex items-center justify-between p-space-3 bg-green-50 dark:bg-green-900/20 rounded-radius-md">
                <div className="flex items-center space-x-space-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-body text-green-800 dark:text-green-200">
                    Connected Since
                  </span>
                </div>
                <span className="text-body text-green-700 dark:text-green-300 font-medium">
                  {formatDate(connectedAt)}
                </span>
              </div>
            )}

            {lastSyncAt && (
              <div className="flex items-center justify-between p-space-3 bg-purple-50 dark:bg-purple-900/20 rounded-radius-md">
                <div className="flex items-center space-x-space-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="text-body text-purple-800 dark:text-purple-200">
                    Last Sync
                  </span>
                </div>
                <span className="text-body text-purple-700 dark:text-purple-300 font-medium">
                  {formatDate(lastSyncAt)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sync Status */}
        {isConnected && (
          <div className="mt-space-4 p-space-3 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
            <div className="flex items-center justify-between mb-space-2">
              <h4 className="text-body font-medium text-gray-800 dark:text-gray-200">
                Sync Status
              </h4>
              <span className={`inline-flex items-center px-space-2 py-space-1 rounded-radius-full text-caption font-medium ${
                syncEnabled 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
              }`}>
                {syncEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-caption text-gray-600 dark:text-gray-400">
              {syncEnabled 
                ? 'Your profile data is automatically synced from Google.'
                : 'Automatic sync is disabled. You can manually sync your data.'
              }
            </p>
          </div>
        )}

        {/* Not Connected Message */}
        {!isConnected && (
          <div className="mt-space-4 p-space-4 bg-gray-50 dark:bg-gray-700 rounded-radius-md text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-space-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-body text-gray-600 dark:text-gray-400">
              No Google account connected. Connect your account to enable data synchronization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

