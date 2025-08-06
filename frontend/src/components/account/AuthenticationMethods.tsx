'use client';

import React from 'react';

// =====================================================
// AUTHENTICATION METHODS COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

interface AuthenticationMethodsProps {
  passwordStatus: any;
  className?: string;
}

export const AuthenticationMethods: React.FC<AuthenticationMethodsProps> = ({
  passwordStatus,
  className = ''
}) => {
  return (
    <div className={`bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-sm p-space-6 ${className}`}>
      <h2 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
        Authentication Methods
      </h2>
      
      <div className="space-y-space-4">
        {/* Email Authentication */}
        <div className="flex items-center justify-between p-space-4 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
          <div className="flex items-center space-x-space-3">
            <div className="w-8 h-8 bg-airvik-blue text-airvik-white rounded-radius-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-label font-sf-pro text-airvik-black dark:text-airvik-white">
                Email & Password
              </p>
              <p className="text-caption text-gray-600 dark:text-gray-400">
                {passwordStatus.hasPassword ? 'Enabled' : 'Not set'}
              </p>
            </div>
          </div>
          {passwordStatus.hasPassword && (
            <span className="text-caption text-success font-medium">
              Active
            </span>
          )}
        </div>

        {/* Google Authentication */}
        <div className="flex items-center justify-between p-space-4 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
          <div className="flex items-center space-x-space-3">
            <div className="w-8 h-8 bg-airvik-purple text-airvik-white rounded-radius-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <p className="text-label font-sf-pro text-airvik-black dark:text-airvik-white">
                Google Sign-in
              </p>
              <p className="text-caption text-gray-600 dark:text-gray-400">
                {passwordStatus.hasGoogleAuth ? 'Enabled' : 'Not connected'}
              </p>
            </div>
          </div>
          {passwordStatus.hasGoogleAuth && (
            <span className="text-caption text-success font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Account Type */}
      <div className="mt-space-6 p-space-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
        <p className="text-body font-sf-pro text-airvik-blue">
          <strong>Account Type:</strong> {passwordStatus.accountType}
        </p>
        {passwordStatus.passwordLastChanged && (
          <p className="text-caption text-airvik-blue mt-space-1">
            Password last changed: {new Date(passwordStatus.passwordLastChanged).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthenticationMethods;
