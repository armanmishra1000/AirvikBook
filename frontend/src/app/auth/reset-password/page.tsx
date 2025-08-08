'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordManagementService } from '../../../services/passwordManagement.service';
import { PasswordInput } from '../../../components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '../../../components/auth/PasswordStrengthIndicator';
import { isSuccessResponse, PASSWORD_ERROR_CODES } from '../../../types/passwordManagement.types';

// =====================================================
// RESET PASSWORD PAGE COMPONENT (Query Parameter Version)
// =====================================================
// Allows users to reset their password using a token from query parameter

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenVerifying, setIsTokenVerifying] = useState(true);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const submitAttemptedRef = useRef(false);

  // =====================================================
  // TOKEN VERIFICATION
  // =====================================================

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsTokenVerifying(false);
        return;
      }

      try {
        const result = await PasswordManagementService.verifyResetToken(token);
        
        if (isSuccessResponse(result)) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        setIsTokenValid(false);
      } finally {
        setIsTokenVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

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

  const validateForm = (): boolean => {
    const newErrors: ResetPasswordFormErrors = {};
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.newPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      newPassword: value
    }));

    // Clear password error on change if submit has been attempted
    if (submitAttemptedRef.current && errors.newPassword) {
      setErrors(prev => ({
        ...prev,
        newPassword: undefined
      }));
    }

    // Real-time validation for password
    if (submitAttemptedRef.current) {
      const passwordError = validatePassword(value);
      setErrors(prev => ({
        ...prev,
        newPassword: passwordError
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      confirmPassword: value
    }));

    // Clear confirm password error on change if submit has been attempted
    if (submitAttemptedRef.current && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }));
    }

    // Real-time validation for confirm password
    if (submitAttemptedRef.current) {
      const confirmPasswordError = validateConfirmPassword(value, formData.newPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitAttemptedRef.current = true;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, general: undefined }));

    try {
      const result = await PasswordManagementService.resetPassword(
        token!,
        formData.newPassword,
        formData.confirmPassword
      );

      if (isSuccessResponse(result)) {
        setIsResetComplete(true);
      } else {
        // Handle specific error cases
        if (result.code === PASSWORD_ERROR_CODES.INVALID_RESET_TOKEN) {
          setErrors(prev => ({
            ...prev,
            general: 'The reset link is invalid or has expired. Please request a new one.'
          }));
        } else if (result.code === PASSWORD_ERROR_CODES.RESET_TOKEN_EXPIRED) {
          setErrors(prev => ({
            ...prev,
            general: 'The reset link has expired. Please request a new one.'
          }));
        } else if (result.code === PASSWORD_ERROR_CODES.PASSWORD_TOO_WEAK) {
          setErrors(prev => ({
            ...prev,
            general: 'Password does not meet security requirements.'
          }));
        } else if (result.code === PASSWORD_ERROR_CODES.PASSWORD_REUSED) {
          setErrors(prev => ({
            ...prev,
            general: 'Cannot reuse a recent password. Please choose a different password.'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: result.error || 'An error occurred. Please try again.'
          }));
        }
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: 'Network error. Please check your connection and try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (isTokenVerifying) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-space-4 border-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INVALID TOKEN STATE
  // =====================================================

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
        <div className="max-w-md w-full">
          <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-lg p-space-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-error text-airvik-white rounded-radius-full flex items-center justify-center mb-space-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Invalid Reset Link
            </h1>
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            {/* Action Buttons */}
            <div className="space-y-space-3">
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid transition-colors duration-normal focus:outline-none"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // SUCCESS STATE
  // =====================================================

  if (isResetComplete) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
        <div className="max-w-md w-full">
          <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-lg p-space-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-success text-airvik-white rounded-radius-full flex items-center justify-center mb-space-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Password Reset Complete
            </h1>
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            {/* Action Button */}
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid transition-colors duration-normal focus:outline-none"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM STATE
  // =====================================================

  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-space-8">
          <h1 className="text-h1 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Reset Password
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-lg p-space-8">
          <form onSubmit={handleSubmit} className="space-y-space-6">
            {/* New Password Input */}
            <div>
              <PasswordInput
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                label="New Password"
                error={errors.newPassword}
                disabled={isSubmitting}
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <PasswordStrengthIndicator
                password={formData.newPassword}
                showRequirements={true}
                className="mt-space-4"
              />
            )}

            {/* Confirm Password Input */}
            <div>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your new password"
                label="Confirm Password"
                error={errors.confirmPassword}
                disabled={isSubmitting}
              />
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-space-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md">
                <p className="text-body font-sf-pro text-error">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal focus:outline-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-airvik-white border-t-transparent rounded-radius-full mr-space-2" />
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-space-6 text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-body font-sf-pro text-airvik-blue hover:text-airvik-blue-mid transition-colors duration-normal focus:outline-none rounded-radius-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
