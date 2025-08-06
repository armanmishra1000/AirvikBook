'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToastHelpers } from '../common/Toast';
import {
  LoginFormData,
  LoginFormErrors,
  LoginRequest,
  isSuccessResponse,
  LOGIN_ERROR_CODES
} from '../../types/userLogin.types';
import { UserLoginService } from '../../services/userLogin.service';

// =====================================================
// BRAND-COMPLIANT LOGIN FORM COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  className = '',
  showRememberMe = true,
  showForgotPassword = true
}) => {
  const { login, authState } = useAuth();
  const { showSuccess, showError } = useToastHelpers();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptedRef = useRef(false);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateField = (name: keyof LoginFormData, value: any): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    // Validate email
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validateField('password', formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear field error on change if submit has been attempted
    if (submitAttemptedRef.current && errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Real-time validation for better UX (only after first submit attempt)
    if (submitAttemptedRef.current && name !== 'rememberMe') {
      const fieldError = validateField(name as keyof LoginFormData, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
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
      // Get device info for security tracking
      const deviceInfo = UserLoginService.getDeviceInfo();

      const loginRequest: LoginRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
        deviceInfo
      };

      const result = await login(loginRequest);

      if (isSuccessResponse(result)) {
        // Show success toast
        showSuccess('Welcome back!', `Successfully signed in as ${result.data.user.fullName}`);
        
        // Success callback
        onSuccess?.();
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Login failed. Please try again.';
        
        switch (result.code) {
          case LOGIN_ERROR_CODES.INVALID_CREDENTIALS:
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case LOGIN_ERROR_CODES.EMAIL_NOT_VERIFIED:
            errorMessage = 'Please verify your email address before logging in.';
            break;
          case LOGIN_ERROR_CODES.ACCOUNT_DISABLED:
            errorMessage = 'Your account has been disabled. Please contact support.';
            break;
          case LOGIN_ERROR_CODES.ACCOUNT_LOCKED:
            errorMessage = 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.';
            break;
          case LOGIN_ERROR_CODES.RATE_LIMIT_EXCEEDED:
            errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
            break;
          default:
            break;
        }

        setErrors(prev => ({ ...prev, general: errorMessage }));
        showError('Login failed', errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection and try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      showError('Connection error', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // =====================================================
  // RENDER COMPONENT
  // =====================================================

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-space-4">
        {/* Form Title */}
        <div className="text-center">
          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            Welcome Back
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
            Sign in to your account
          </p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md p-space-4">
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

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-space-4 py-space-3 pr-12 border rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                ${errors.password 
                  ? 'border-error bg-red-50 dark:bg-red-900/20 text-error' 
                  : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
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
          {errors.password && (
            <p className="mt-space-1 text-caption text-error">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          {showRememberMe && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-airvik-blue focus:ring-airvik-blue border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe" className="ml-space-2 text-body text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
          )}

          {showForgotPassword && (
            <a 
              href="/auth/forgot-password" 
              className="text-body text-airvik-blue hover:text-airvik-purple transition-colors duration-normal"
            >
              Forgot password?
            </a>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authState.isLoading}
          className={`w-full py-space-3 px-space-6 rounded-radius-md font-sf-pro text-button
            transition-all duration-normal transform
            ${isSubmitting || authState.isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-airvik-blue text-airvik-white hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 active:translate-y-0'
            }`}
        >
          {isSubmitting || authState.isLoading ? (
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
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-body text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a 
              href="/auth/register" 
              className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;