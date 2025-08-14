'use client';

import React from 'react';

// =====================================================
// PASSWORD STATUS COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

interface PasswordStatusProps {
  passwordStatus: any;
  onRefresh: () => Promise<void>;
  onShowChangePassword: () => void;
  onShowSetPassword: () => void;
  onShowRemovePassword: () => void;
  className?: string;
}

export const PasswordStatus: React.FC<PasswordStatusProps> = ({
  passwordStatus,
  onRefresh,
  onShowChangePassword,
  onShowSetPassword,
  onShowRemovePassword,
  className = ''
}) => {
  return (
    <div className={`bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm p-space-6 ${className}`}>
      <h2 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
        Password Actions
      </h2>
      
      <div className="space-y-space-4">
        {/* Change Password */}
        {passwordStatus.hasPassword && (
          <button
            onClick={onShowChangePassword}
            className="w-full text-left p-space-4 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-blue-mid transition-colors duration-normal"
          >
            <div className="flex items-center justify-between">
              <span className="text-body font-sf-pro font-medium">
                Change Password
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {/* Set Password */}
        {!passwordStatus.hasPassword && passwordStatus.hasGoogleAuth && (
          <button
            onClick={onShowSetPassword}
            className="w-full text-left p-space-4 bg-airvik-purple text-airvik-white rounded-radius-md hover:bg-airvik-purple-light transition-colors duration-normal"
          >
            <div className="flex items-center justify-between">
              <span className="text-body font-sf-pro font-medium">
                Set Password
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {/* Remove Password */}
        {passwordStatus.hasPassword && passwordStatus.hasGoogleAuth && (
          <button
            onClick={onShowRemovePassword}
            className="w-full text-left p-space-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal"
          >
            <div className="flex items-center justify-between">
              <span className="text-body font-sf-pro font-medium">
                Remove Password
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {/* Security Recommendations */}
        {passwordStatus.securityRecommendations && passwordStatus.securityRecommendations.length > 0 && (
          <div className="mt-space-6">
            <h3 className="text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-3">
              Security Recommendations
            </h3>
            <div className="space-y-space-2">
              {passwordStatus.securityRecommendations.map((rec: any, index: number) => (
                <div key={index} className="p-space-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-radius-md">
                  <p className="text-body font-sf-pro text-yellow-800 dark:text-yellow-200">
                    {rec.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-full p-space-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal"
        >
          <div className="flex items-center justify-center space-x-space-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-body font-sf-pro font-medium">
              Refresh Status
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PasswordStatus;
