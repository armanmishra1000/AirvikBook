'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useIsAuthenticated } from '../../../context/AuthContext';
import { AUTH_PATHS } from '../../../lib/paths';
import { PasswordManagementService } from '../../../services/passwordManagement.service';
import { PasswordInput } from '../../../components/auth/PasswordInput';
import { PasswordRequirements } from '../../../components/auth/PasswordRequirements';
import { PasswordStrengthIndicator } from '../../../components/auth/PasswordStrengthIndicator';
import { SecurityDashboard } from '../../../components/account/SecurityDashboard';
import { isSuccessResponse, PASSWORD_ERROR_CODES } from '../../../types/passwordManagement.types';

// =====================================================
// ACCOUNT SECURITY PAGE COMPONENT
// =====================================================
// Page for managing account security and authentication methods

const SecurityPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { authState } = useAuth();

  // Password management state
  const [passwordStatus, setPasswordStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showRemovePassword, setShowRemovePassword] = useState(false);

  // Change password form
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    invalidateOtherSessions: false
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState<any>({});

  // Set password form
  const [setPasswordForm, setSetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [setPasswordErrors, setSetPasswordErrors] = useState<any>({});

  // Remove password form
  const [removePasswordForm, setRemovePasswordForm] = useState({
    currentPassword: '',
    confirmGoogleOnly: false
  });
  const [removePasswordErrors, setRemovePasswordErrors] = useState<any>({});

  // =====================================================
  // INITIALIZATION
  // =====================================================

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !authState.isLoading) {
      router.replace(AUTH_PATHS.LOGIN);
      return;
    }

    // Load password status
    if (isAuthenticated) {
      loadPasswordStatus();
    }
  }, [isAuthenticated, authState.isLoading, router]);

  const loadPasswordStatus = async () => {
    try {
      setIsLoadingStatus(true);
      setError(null);

      const result = await PasswordManagementService.getPasswordStatus();
      
      if (isSuccessResponse(result)) {
        setPasswordStatus(result.data);
      } else {
        setError(result.error || 'Failed to load password status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return undefined;
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordErrors({});
    setError(null);
    setSuccess(null);

    // Validate form
    const errors: any = {};
    const passwordError = validatePassword(changePasswordForm.newPassword);
    if (passwordError) errors.newPassword = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(changePasswordForm.confirmPassword, changePasswordForm.newPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    if (Object.keys(errors).length > 0) {
      setChangePasswordErrors(errors);
      return;
    }

    setIsLoadingAction(true);

    try {
      const result = await PasswordManagementService.changePassword(
        changePasswordForm.currentPassword,
        changePasswordForm.newPassword,
        changePasswordForm.confirmPassword,
        changePasswordForm.invalidateOtherSessions
      );

      if (isSuccessResponse(result)) {
        setSuccess('Password changed successfully');
        setShowChangePassword(false);
        setChangePasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          invalidateOtherSessions: false
        });
        loadPasswordStatus(); // Refresh status
      } else {
        if (result.code === PASSWORD_ERROR_CODES.INVALID_CURRENT_PASSWORD) {
          setChangePasswordErrors({ currentPassword: 'Current password is incorrect' });
        } else if (result.code === PASSWORD_ERROR_CODES.PASSWORD_TOO_WEAK) {
          setChangePasswordErrors({ newPassword: 'Password does not meet security requirements' });
        } else if (result.code === PASSWORD_ERROR_CODES.PASSWORD_REUSED) {
          setChangePasswordErrors({ newPassword: 'Cannot reuse a recent password' });
        } else {
          setError(result.error || 'Failed to change password');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  // =====================================================
  // SET PASSWORD
  // =====================================================

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetPasswordErrors({});
    setError(null);
    setSuccess(null);

    // Validate form
    const errors: any = {};
    const passwordError = validatePassword(setPasswordForm.newPassword);
    if (passwordError) errors.newPassword = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(setPasswordForm.confirmPassword, setPasswordForm.newPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    if (Object.keys(errors).length > 0) {
      setSetPasswordErrors(errors);
      return;
    }

    setIsLoadingAction(true);

    try {
      const result = await PasswordManagementService.setPassword(
        setPasswordForm.newPassword,
        setPasswordForm.confirmPassword
      );

      if (isSuccessResponse(result)) {
        setSuccess('Password set successfully. You can now use email or Google to sign in');
        setShowSetPassword(false);
        setSetPasswordForm({
          newPassword: '',
          confirmPassword: ''
        });
        loadPasswordStatus(); // Refresh status
      } else {
        if (result.code === PASSWORD_ERROR_CODES.PASSWORD_ALREADY_EXISTS) {
          setError('Account already has a password. Use change password instead');
        } else if (result.code === PASSWORD_ERROR_CODES.PASSWORD_TOO_WEAK) {
          setSetPasswordErrors({ newPassword: 'Password does not meet security requirements' });
        } else {
          setError(result.error || 'Failed to set password');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  // =====================================================
  // REMOVE PASSWORD
  // =====================================================

  const handleRemovePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRemovePasswordErrors({});
    setError(null);
    setSuccess(null);

    if (!removePasswordForm.confirmGoogleOnly) {
      setRemovePasswordErrors({ confirmGoogleOnly: 'Please confirm you want to remove your password' });
      return;
    }

    setIsLoadingAction(true);

    try {
      const result = await PasswordManagementService.removePassword(
        removePasswordForm.currentPassword,
        removePasswordForm.confirmGoogleOnly
      );

      if (isSuccessResponse(result)) {
        setSuccess('Password removed. Account now uses Google sign-in only');
        setShowRemovePassword(false);
        setRemovePasswordForm({
          currentPassword: '',
          confirmGoogleOnly: false
        });
        loadPasswordStatus(); // Refresh status
      } else {
        if (result.code === PASSWORD_ERROR_CODES.INVALID_CURRENT_PASSWORD) {
          setRemovePasswordErrors({ currentPassword: 'Current password is incorrect' });
        } else if (result.code === PASSWORD_ERROR_CODES.NO_PASSWORD_EXISTS) {
          setError('No password exists for this account');
        } else {
          setError(result.error || 'Failed to remove password');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  // Show loading while checking authentication
  if (authState.isLoading || isLoadingStatus) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-space-4 border-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
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
      <div className="bg-airvik-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-space-4 sm:px-space-6 lg:px-space-8">
          <div className="flex items-center justify-between py-space-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-space-4 p-space-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-normal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
                  Account Security
                </h1>
                <p className="text-body text-gray-600 dark:text-gray-400 mt-space-1">
                  Manage your authentication methods and password
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
                <div className="w-10 h-10 bg-airvik-blue text-airvik-white rounded-radius-full flex items-center justify-center font-sf-pro font-medium">
                  {authState.user?.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-label font-sf-pro text-airvik-black dark:text-airvik-white">
                  {authState.user?.fullName}
                </p>
                <p className="text-caption text-gray-600 dark:text-gray-400">
                  {authState.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-space-4 sm:px-space-6 lg:px-space-8 py-space-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-space-6 p-space-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md">
            <p className="text-body font-sf-pro text-error">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-space-6 p-space-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-radius-md">
            <p className="text-body font-sf-pro text-success">
              {success}
            </p>
          </div>
        )}

        {/* Authentication Methods */}
        {passwordStatus && (
          <SecurityDashboard
            passwordStatus={passwordStatus}
            onRefresh={loadPasswordStatus}
            onShowChangePassword={() => setShowChangePassword(true)}
            onShowSetPassword={() => setShowSetPassword(true)}
            onShowRemovePassword={() => setShowRemovePassword(true)}
            onSecurityRecommendationsChange={loadPasswordStatus}
            isLoadingAction={isLoadingAction}
            error={error}
            success={success}
            setError={setError}
            setSuccess={setSuccess}
          />
        )}

        {/* Change Password Form */}
        {showChangePassword && (
          <div className="mt-space-8 bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-sm p-space-6">
            <h3 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-6">
              Change Password
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-space-6">
              {/* Current Password */}
              <div>
                <PasswordInput
                  value={changePasswordForm.currentPassword}
                  onChange={(value) => setChangePasswordForm(prev => ({ ...prev, currentPassword: value }))}
                  placeholder="Enter your current password"
                  label="Current Password"
                  error={changePasswordErrors.currentPassword}
                  disabled={isLoadingAction}
                />
              </div>

              {/* New Password */}
              <div>
                <PasswordInput
                  value={changePasswordForm.newPassword}
                  onChange={(value) => setChangePasswordForm(prev => ({ ...prev, newPassword: value }))}
                  placeholder="Enter your new password"
                  label="New Password"
                  error={changePasswordErrors.newPassword}
                  disabled={isLoadingAction}
                />
              </div>

              {/* Password Strength */}
              {changePasswordForm.newPassword && (
                <PasswordStrengthIndicator
                  password={changePasswordForm.newPassword}
                  showRequirements={true}
                />
              )}

              {/* Confirm Password */}
              <div>
                <PasswordInput
                  value={changePasswordForm.confirmPassword}
                  onChange={(value) => setChangePasswordForm(prev => ({ ...prev, confirmPassword: value }))}
                  placeholder="Confirm your new password"
                  label="Confirm Password"
                  error={changePasswordErrors.confirmPassword}
                  disabled={isLoadingAction}
                />
              </div>

              {/* Invalidate Other Sessions */}
              <div className="flex items-center space-x-space-3">
                <input
                  type="checkbox"
                  id="invalidateOtherSessions"
                  checked={changePasswordForm.invalidateOtherSessions}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, invalidateOtherSessions: e.target.checked }))}
                  className="w-4 h-4 text-airvik-blue border-gray-300 rounded focus:ring-airvik-blue"
                />
                <label htmlFor="invalidateOtherSessions" className="text-body font-sf-pro text-airvik-black dark:text-airvik-white">
                  Sign out from all other devices
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-space-4">
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-normal"
                >
                  {isLoadingAction ? 'Changing Password...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Set Password Form */}
        {showSetPassword && (
          <div className="mt-space-8 bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-sm p-space-6">
            <h3 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-6">
              Set Password
            </h3>
            
            <form onSubmit={handleSetPassword} className="space-y-space-6">
              {/* New Password */}
              <div>
                <PasswordInput
                  value={setPasswordForm.newPassword}
                  onChange={(value) => setSetPasswordForm(prev => ({ ...prev, newPassword: value }))}
                  placeholder="Enter your new password"
                  label="New Password"
                  error={setPasswordErrors.newPassword}
                  disabled={isLoadingAction}
                />
              </div>

              {/* Password Strength */}
              {setPasswordForm.newPassword && (
                <PasswordStrengthIndicator
                  password={setPasswordForm.newPassword}
                  showRequirements={true}
                />
              )}

              {/* Confirm Password */}
              <div>
                <PasswordInput
                  value={setPasswordForm.confirmPassword}
                  onChange={(value) => setSetPasswordForm(prev => ({ ...prev, confirmPassword: value }))}
                  placeholder="Confirm your new password"
                  label="Confirm Password"
                  error={setPasswordErrors.confirmPassword}
                  disabled={isLoadingAction}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-space-4">
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="bg-airvik-purple text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-normal"
                >
                  {isLoadingAction ? 'Setting Password...' : 'Set Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSetPassword(false)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Remove Password Form */}
        {showRemovePassword && (
          <div className="mt-space-8 bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-sm p-space-6">
            <h3 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-6">
              Remove Password
            </h3>
            
            <div className="mb-space-6 p-space-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-radius-md">
              <p className="text-body font-sf-pro text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Removing your password will make your account Google-only. You will need to use Google sign-in for all future logins.
              </p>
            </div>
            
            <form onSubmit={handleRemovePassword} className="space-y-space-6">
              {/* Current Password */}
              <div>
                <PasswordInput
                  value={removePasswordForm.currentPassword}
                  onChange={(value) => setRemovePasswordForm(prev => ({ ...prev, currentPassword: value }))}
                  placeholder="Enter your current password"
                  label="Current Password"
                  error={removePasswordErrors.currentPassword}
                  disabled={isLoadingAction}
                />
              </div>

              {/* Confirmation */}
              <div className="flex items-center space-x-space-3">
                <input
                  type="checkbox"
                  id="confirmGoogleOnly"
                  checked={removePasswordForm.confirmGoogleOnly}
                  onChange={(e) => setRemovePasswordForm(prev => ({ ...prev, confirmGoogleOnly: e.target.checked }))}
                  className="w-4 h-4 text-airvik-blue border-gray-300 rounded focus:ring-airvik-blue"
                />
                <label htmlFor="confirmGoogleOnly" className="text-body font-sf-pro text-airvik-black dark:text-airvik-white">
                  I understand that my account will become Google-only
                </label>
              </div>

              {removePasswordErrors.confirmGoogleOnly && (
                <p className="text-caption font-sf-pro text-error">
                  {removePasswordErrors.confirmGoogleOnly}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-space-4">
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="bg-error text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-normal"
                >
                  {isLoadingAction ? 'Removing Password...' : 'Remove Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRemovePassword(false)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPage;
