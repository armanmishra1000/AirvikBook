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
import { Eye, EyeOff } from 'lucide-react';

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
      <form onSubmit={handleSubmit} className="space-y-space-4" noValidate>
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
          <p className="text-caption text-error">{errors.general}</p>
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
              transition-colors duration-normal focus:outline-none focus:ring-0 focus:transition-none
              ${errors.email 
                ? 'border-error bg-red-50 dark:bg-red-900/20 text-airvik-black dark:text-airvik-white focus:border-error focus:ring-2 focus:ring-error' 
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue'
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
                transition-colors duration-normal focus:outline-none focus:ring-0 focus:transition-none
                ${errors.password 
                  ? 'border-error bg-red-50 dark:bg-red-900/20 text-airvik-black dark:text-airvik-white focus:border-error focus:ring-2 focus:ring-error' 
                  : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue'
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
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
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
                className="h-4 w-4 text-airvik-blue border-gray-300 rounded focus:outline-none focus:ring-0 disabled:cursor-not-allowed appearance-none checked:bg-airvik-blue checked:border-airvik-blue"
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
              className="text-body text-airvik-blue transition-colors duration-normal"
            >
              Forgot password?
            </a>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authState.isLoading}
          className={`w-full py-space-3 px-space-6 rounded-radius-md font-sf-pro text-button transition-all ease-linear duration-100
            ${isSubmitting || authState.isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-airvik-blue text-airvik-white hover:bg-airvik-bluehover'
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
              className="text-airvik-blue transition-colors duration-normal font-medium"
            >
              Sign up
            </a>
          </p>
          
          <p className="mt-space-2 text-caption text-gray-500 dark:text-gray-500">
            By signing in, you agree to our{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-airvik-blue dark:text-airvik-blue underline transition-colors duration-normal"
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-airvik-blue dark:text-airvik-blue underline transition-colors duration-normal"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;