'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { isSuccessResponse, LOGIN_ERROR_CODES } from '../../../types/userLogin.types';

// =====================================================
// FORGOT PASSWORD PAGE COMPONENT
// =====================================================
// Allows users to request password reset emails

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: ''
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitAttemptedRef = useRef(false);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email);
    const newErrors: ForgotPasswordFormErrors = {};
    
    if (emailError) newErrors.email = emailError;
    
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
    if (submitAttemptedRef.current && errors[name as keyof ForgotPasswordFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Real-time validation for email
    if (submitAttemptedRef.current && name === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({
        ...prev,
        email: emailError
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
      const result = await forgotPassword(formData.email.trim().toLowerCase());

      if (isSuccessResponse(result)) {
        setIsSubmitted(true);
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Failed to send reset email. Please try again.';
        
        switch (result.code) {
          case LOGIN_ERROR_CODES.USER_NOT_FOUND:
            errorMessage = 'No account found with this email address.';
            break;
          case LOGIN_ERROR_CODES.RATE_LIMIT_EXCEEDED:
            errorMessage = 'Too many reset requests. Please wait a few minutes before trying again.';
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
  // SUCCESS STATE
  // =====================================================

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-light-1 dark:bg-gradient-dark-1 flex flex-col justify-center py-space-12 sm:px-space-6 lg:px-space-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Success Card */}
          <div className="bg-airvik-white dark:bg-gray-800 py-space-8 px-space-6 shadow-lg rounded-radius-lg text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-radius-full bg-green-100 dark:bg-green-900/20 mb-space-6">
              <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Check Your Email
            </h2>
            
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
              We've sent password reset instructions to <strong>{formData.email}</strong>
            </p>

            <div className="space-y-space-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full py-space-3 px-space-6 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-purple transition-colors duration-normal font-sf-pro text-button"
              >
                Back to Login
              </button>

              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ email: '' });
                  submitAttemptedRef.current = false;
                }}
                className="w-full py-space-3 px-space-6 border border-gray-300 dark:border-gray-600 text-airvik-black dark:text-airvik-white rounded-radius-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-normal font-sf-pro text-button"
              >
                Try Different Email
              </button>
            </div>

            <div className="mt-space-8 p-space-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-airvik-blue mt-space-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-space-3">
                  <p className="text-body text-airvik-blue">
                    <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes. The reset link expires in 1 hour.
                  </p>
                </div>
              </div>
            </div>
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
            Reset your password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-airvik-white dark:bg-gray-800 py-space-8 px-space-6 shadow-lg rounded-radius-lg">
          <div className="mb-space-6">
            <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white text-center">
              Forgot Password?
            </h2>
            <p className="text-body text-gray-600 dark:text-gray-400 text-center mt-space-2">
              Enter your email address and we'll send you a link to reset your password.
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
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
                  transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                  ${errors.email 
                    ? 'border-error bg-red-50 dark:bg-red-900/20 text-error' 
                    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                placeholder="Enter your email address"
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
              {errors.email && (
                <p className="mt-space-1 text-caption text-error">
                  {errors.email}
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
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
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

        {/* Footer */}
        <div className="mt-space-8 text-center">
          <p className="text-caption text-gray-500 dark:text-gray-500 font-sf-pro">
            Remember your password?{' '}
            <a 
              href="/auth/login" 
              className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;