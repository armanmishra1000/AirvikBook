'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { PasswordStrengthIndicator } from '../../../../components/auth/PasswordStrengthIndicator';
import { isSuccessResponse, LOGIN_ERROR_CODES } from '../../../../types/userLogin.types';

// =====================================================
// RESET PASSWORD PAGE COMPONENT
// =====================================================
// Allows users to reset their password using a token

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
  const params = useParams();
  const { resetPassword, verifyResetToken } = useAuth();
  const token = params.token as string;

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenVerifying, setIsTokenVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        const result = await verifyResetToken(token);
        
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
  }, [token, verifyResetToken]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error on change if submit has been attempted
    if (submitAttemptedRef.current && errors[name as keyof ResetPasswordFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Real-time validation for better UX (only after first submit attempt)
    if (submitAttemptedRef.current) {
      if (name === 'newPassword') {
        const passwordError = validatePassword(value);
        setErrors(prev => ({
          ...prev,
          newPassword: passwordError
        }));
      } else if (name === 'confirmPassword') {
        const confirmPasswordError = validateConfirmPassword(value, formData.newPassword);
        setErrors(prev => ({
          ...prev,
          confirmPassword: confirmPasswordError
        }));
      }
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
      const result = await resetPassword(token, formData.newPassword);

      if (isSuccessResponse(result)) {
        setIsResetComplete(true);
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Failed to reset password. Please try again.';
        
        switch (result.code) {
          case LOGIN_ERROR_CODES.TOKEN_EXPIRED:
            errorMessage = 'This password reset link has expired. Please request a new one.';
            break;
          case LOGIN_ERROR_CODES.TOKEN_INVALID:
            errorMessage = 'This password reset link is invalid. Please request a new one.';
            break;
          case LOGIN_ERROR_CODES.TOKEN_ALREADY_USED:
            errorMessage = 'This password reset link has already been used. Please request a new one.';
            break;
          default:
            break;
        }

        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Network error. Please check your connection and try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (isTokenVerifying) {
    return (
      <div className="min-h-screen bg-gradient-light-1 dark:bg-gradient-dark-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-space-4 border-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Verifying reset token...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INVALID TOKEN STATE
  // =====================================================

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-light-1 dark:bg-gradient-dark-1 flex flex-col justify-center py-space-12 sm:px-space-6 lg:px-space-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-airvik-white dark:bg-gray-800 py-space-8 px-space-6 shadow-lg rounded-radius-lg text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-radius-full bg-red-100 dark:bg-red-900/20 mb-space-6">
              <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Invalid Reset Link
            </h2>
            
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>

            <div className="space-y-space-4">
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full py-space-3 px-space-6 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-purple transition-colors duration-normal font-sf-pro text-button"
              >
                Request New Reset Link
              </button>

              <button
                onClick={() => router.push('/auth/login')}
                className="w-full py-space-3 px-space-6 border border-gray-300 dark:border-gray-600 text-airvik-black dark:text-airvik-white rounded-radius-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-normal font-sf-pro text-button"
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
      <div className="min-h-screen bg-gradient-light-1 dark:bg-gradient-dark-1 flex flex-col justify-center py-space-12 sm:px-space-6 lg:px-space-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-airvik-white dark:bg-gray-800 py-space-8 px-space-6 shadow-lg rounded-radius-lg text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-radius-full bg-green-100 dark:bg-green-900/20 mb-space-6">
              <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Password Reset Complete
            </h2>
            
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-space-3 px-space-6 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-purple transition-colors duration-normal font-sf-pro text-button"
            >
              Sign In Now
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
    <div className="min-h-screen bg-gradient-light-1 dark:bg-gradient-dark-1 flex flex-col justify-center py-space-12 sm:px-space-6 lg:px-space-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-space-8">
          <h1 className="text-display font-sf-pro font-bold text-airvik-black dark:text-airvik-white">
            AirVikBook
          </h1>
          <p className="mt-space-2 text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Create a new password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-airvik-white dark:bg-gray-800 py-space-8 px-space-6 shadow-lg rounded-radius-lg">
          <div className="mb-space-6">
            <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white text-center">
              Reset Your Password
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-400 text-center mt-space-2">
              Enter a new password for your account.
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-space-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md p-space-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-space-3">
                  <p className="text-body text-error">
                    {errors.general}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-space-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-space-4 py-space-3 pr-12 border rounded-radius-md font-sf-pro text-body
                    transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                    ${errors.newPassword 
                      ? 'border-error bg-red-50 dark:bg-red-900/20 text-error' 
                      : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-space-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-normal"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-space-1 text-caption text-error">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={formData.newPassword} />

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-space-4 py-space-3 pr-12 border rounded-radius-md font-sf-pro text-body
                    transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                    ${errors.confirmPassword 
                      ? 'border-error bg-red-50 dark:bg-red-900/20 text-error' 
                      : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-space-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-normal"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-space-1 text-caption text-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-space-3 px-space-6 rounded-radius-md font-sf-pro text-button
                transition-all duration-normal transform
                ${isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-airvik-blue text-airvik-white hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 active:translate-y-0'
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-space-2" viewBox="0 0 24 24">
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-body text-airvik-blue hover:text-airvik-purple transition-colors duration-normal font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;