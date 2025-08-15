'use client';

import React from 'react';
import { AuthenticationMethods } from './AuthenticationMethods';
import { PasswordStatus } from './PasswordStatus';
import { SessionManager } from '../auth/SessionManager';

// =====================================================
// SECURITY DASHBOARD COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

interface SecurityDashboardProps {
  passwordStatus: any;
  onRefresh: () => Promise<void>;
  onShowChangePassword: () => void;
  onShowSetPassword: () => void;
  onShowRemovePassword: () => void;
  onSecurityRecommendationsChange: () => Promise<void>;
  isLoadingAction: boolean;
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  passwordStatus,
  onRefresh,
  onShowChangePassword,
  onShowSetPassword,
  onShowRemovePassword,
  onSecurityRecommendationsChange,
  isLoadingAction,
  error,
  success,
  setError,
  setSuccess,
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Error/Success Messages */}
      {error && (
        <div className="border border-red-200 mb-space-6 p-space-4 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-radius-md">
          <p className="text-body font-sf-pro text-error">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="border border-green-200 mb-space-6 p-space-4 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-radius-md">
          <p className="text-body font-sf-pro text-success">
            {success}
          </p>
        </div>
      )}

      {/* Authentication Methods and Password Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-8 mb-space-8">
        <AuthenticationMethods passwordStatus={passwordStatus} />
        <PasswordStatus 
          passwordStatus={passwordStatus} 
          onRefresh={onRefresh}
          onShowChangePassword={onShowChangePassword}
          onShowSetPassword={onShowSetPassword}
          onShowRemovePassword={onShowRemovePassword}
        />
      </div>

      {/* Session Management */}
              <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-sm p-space-6">
        <h2 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
          Active Sessions
        </h2>
        <SessionManager
          className="w-full"
          showCurrentSessionFirst={true}
          autoRefresh={false}
          refreshInterval={300000}
        />
      </div>
    </div>
  );
};

export default SecurityDashboard;
