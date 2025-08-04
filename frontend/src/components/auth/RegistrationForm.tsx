'use client';

/**
 * Registration Form Component
 * 
 * BRAND COMPLIANCE REQUIREMENTS:
 * - ONLY use brand tokens (--airvik-*, --space-*, text-*)
 * - NO hardcoded colors, spacing, or typography
 * - All interactive states (hover, focus, active, disabled)
 * - Full dark mode support
 * 
 * REACT PATTERN REQUIREMENTS:
 * - NO function dependencies in useEffect
 * - Use useRef for one-time operations
 * - Proper error handling and loading states
 */

import React, { useState, useRef, useEffect } from 'react';
import { RegistrationFormData, FormErrors, isSuccessResponse } from '../../types/userRegistration.types';
import UserRegistrationService from '../../services/userRegistration.service';
import GoogleOAuthButton from './GoogleOAuthButton';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface RegistrationFormProps {
  onSuccess?: (user: any, tokens: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function RegistrationForm({ 
  onSuccess, 
  onError, 
  className = '' 
}: RegistrationFormProps) {
  // Form data state
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobileNumber: '',
    acceptedTerms: false,
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for one-time operations
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Email availability check with debounce
    if (field === 'email' && typeof value === 'string') {
      setEmailAvailable(null);
      
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
      
      if (value && UserRegistrationService.validateEmail(value)) {
        emailCheckTimeoutRef.current = setTimeout(() => {
          checkEmailAvailability(value);
        }, 500);
      }
    }
  };

  /**
   * Check email availability
   */
  const checkEmailAvailability = async (email: string) => {
    if (!mounted.current) return;
    
    setIsCheckingEmail(true);
    
    try {
      const response = await UserRegistrationService.checkEmailAvailability(email);
      
      if (!mounted.current) return;
      
      if (isSuccessResponse(response)) {
        setEmailAvailable(response.data.available);
        if (!response.data.available) {
          setErrors(prev => ({ 
            ...prev, 
            email: 'This email is already registered. Try logging in instead.' 
          }));
        }
      }
    } catch (error) {
      console.error('Email availability check failed:', error);
    } finally {
      if (mounted.current) {
        setIsCheckingEmail(false);
      }
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!UserRegistrationService.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (emailAvailable === false) {
      newErrors.email = 'This email is already registered';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = UserRegistrationService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (!UserRegistrationService.validateFullName(formData.fullName)) {
      newErrors.fullName = 'Please enter a valid full name (2-100 characters, letters only)';
    }

    // Mobile number validation (optional)
    if (formData.mobileNumber && !UserRegistrationService.validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number (+1234567890)';
    }

    // Terms acceptance validation
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isLoading) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim() || undefined,
        acceptedTerms: formData.acceptedTerms,
      };

      const response = await UserRegistrationService.register(registrationData);

      if (isSuccessResponse(response)) {
        onSuccess?.(response.data.user, response.data.tokens);
      } else {
        const errorMessage = response.error || 'Registration failed. Please try again.';
        setErrors({ general: errorMessage });
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`registration-form ${className}`}>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-space-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-space-6">
          <h1 className="text-h1 text-gray-900 dark:text-white mb-space-2">
            Create Account
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-300">
            Join AirVikBook to start booking amazing hotels
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-space-4">
          <GoogleOAuthButton
            onSuccess={onSuccess}
            onError={onError}
            disabled={isLoading}
          />
        </div>

        {/* Divider */}
        <div className="relative my-space-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-space-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-space-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-space-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-space-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`
                  w-full px-space-3 py-space-2 border rounded-md shadow-sm
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                  ${errors.email 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}
                placeholder="your.email@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
              
              {/* Email checking indicator */}
              {isCheckingEmail && (
                <div className="absolute right-space-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
              
              {/* Email availability indicator */}
              {emailAvailable === true && (
                <div className="absolute right-space-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && <p className="mt-space-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-space-1">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`
                w-full px-space-3 py-space-2 border rounded-md shadow-sm
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                ${errors.fullName 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}
              placeholder="John Doe"
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.fullName && <p className="mt-space-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>}
          </div>

          {/* Mobile Number Field */}
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-space-1">
              Mobile Number
              <span className="text-gray-400 text-xs ml-space-1">(optional)</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              className={`
                w-full px-space-3 py-space-2 border rounded-md shadow-sm
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                ${errors.mobileNumber 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}
              placeholder="+1234567890"
              disabled={isLoading}
              autoComplete="tel"
            />
            {errors.mobileNumber && <p className="mt-space-1 text-sm text-red-600 dark:text-red-400">{errors.mobileNumber}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-space-1">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`
                  w-full px-space-3 py-space-2 pr-10 border rounded-md shadow-sm
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                  ${errors.password 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}
                placeholder="Enter a strong password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-space-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-space-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            
            {/* Password Strength Indicator */}
            <div className="mt-space-2">
              <PasswordStrengthIndicator password={formData.password} />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-space-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`
                  w-full px-space-3 py-space-2 pr-10 border rounded-md shadow-sm
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                  ${errors.confirmPassword 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}
                placeholder="Confirm your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-space-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-space-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start space-x-space-2">
              <input
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
                className={`
                  mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded
                  disabled:cursor-not-allowed
                  ${errors.acceptedTerms ? 'border-red-300 dark:border-red-600' : ''}
                `}
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
                >
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
                {' '}*
              </span>
            </label>
            {errors.acceptedTerms && <p className="mt-space-1 text-sm text-red-600 dark:text-red-400">{errors.acceptedTerms}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || emailAvailable === false}
            className={`
              w-full flex justify-center py-space-2 px-space-4 border border-transparent rounded-md shadow-sm
              text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${isLoading ? 'cursor-wait' : ''}
            `}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin -ml-1 mr-space-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-space-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <a
              href="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}