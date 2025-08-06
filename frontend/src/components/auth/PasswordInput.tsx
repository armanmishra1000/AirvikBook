'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PasswordInputProps,
  PasswordValidationResult,
  PasswordStrength,
  PASSWORD_STRENGTH_LABELS,
  PASSWORD_STRENGTH_COLORS
} from '../../types/passwordManagement.types';

// =====================================================
// PASSWORD INPUT COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter your password',
  label = 'Password',
  error,
  showToggle = true,
  className = '',
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Focus back to input after toggle
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showToggle) {
      e.preventDefault();
      togglePasswordVisibility();
    }
  };

  // Auto-hide password after 30 seconds of inactivity
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  // Calculate password strength
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        label: 'Very Weak',
        color: PASSWORD_STRENGTH_COLORS[0],
        requirements: []
      };
    }

    let score = 0;
    const requirements = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
      requirements.push({
        type: 'length',
        label: 'At least 8 characters',
        met: true,
        required: true
      });
    } else {
      requirements.push({
        type: 'length',
        label: 'At least 8 characters',
        met: false,
        required: true
      });
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
      requirements.push({
        type: 'uppercase',
        label: 'Contains uppercase letter',
        met: true,
        required: true
      });
    } else {
      requirements.push({
        type: 'uppercase',
        label: 'Contains uppercase letter',
        met: false,
        required: true
      });
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
      requirements.push({
        type: 'lowercase',
        label: 'Contains lowercase letter',
        met: true,
        required: true
      });
    } else {
      requirements.push({
        type: 'lowercase',
        label: 'Contains lowercase letter',
        met: false,
        required: true
      });
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
      requirements.push({
        type: 'number',
        label: 'Contains number',
        met: true,
        required: true
      });
    } else {
      requirements.push({
        type: 'number',
        label: 'Contains number',
        met: false,
        required: true
      });
    }

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
      requirements.push({
        type: 'special',
        label: 'Contains special character',
        met: true,
        required: true
      });
    } else {
      requirements.push({
        type: 'special',
        label: 'Contains special character',
        met: false,
        required: true
      });
    }

    return {
      score: Math.min(score, 4),
      label: PASSWORD_STRENGTH_LABELS[score as keyof typeof PASSWORD_STRENGTH_LABELS] || 'Very Weak',
      color: PASSWORD_STRENGTH_COLORS[score as keyof typeof PASSWORD_STRENGTH_COLORS] || PASSWORD_STRENGTH_COLORS[0],
      requirements
    };
  };

  const strength = getPasswordStrength(value);

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor="password-input"
          className="block text-label font-sf-pro font-medium text-airvik-black dark:text-airvik-white mb-space-2"
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Password Input */}
        <input
          ref={inputRef}
          id="password-input"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-space-4 py-space-3 
            text-body font-sf-pro 
            bg-airvik-white dark:bg-gray-100 
            border border-gray-300 dark:border-gray-600 
            rounded-radius-md 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-200 
            disabled:text-gray-500 dark:disabled:text-gray-400
            disabled:cursor-not-allowed
            transition-all duration-normal
            ${error 
              ? 'border-error focus:ring-error' 
              : isFocused 
                ? 'border-airvik-blue' 
                : 'border-gray-300 dark:border-gray-600'
            }
            ${showToggle ? 'pr-12' : ''}
          `}
          aria-describedby={error ? 'password-error' : undefined}
          aria-invalid={!!error}
        />

        {/* Show/Hide Toggle Button */}
        {showToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`
              absolute right-space-3 top-1/2 transform -translate-y-1/2
              p-space-2 rounded-radius-sm
              text-gray-500 dark:text-gray-400
              hover:text-airvik-blue dark:hover:text-airvik-blue
              focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-normal
            `}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Strength Indicator */}
        {value && (
          <div className="absolute -bottom-space-6 left-0 right-0">
            <div className="flex items-center space-x-space-2">
              <div 
                className="w-2 h-2 rounded-radius-full"
                style={{ backgroundColor: strength.color }}
              />
              <span 
                className="text-caption font-sf-pro font-medium"
                style={{ color: strength.color }}
              >
                {strength.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div 
          id="password-error"
          className="mt-space-2 text-caption font-sf-pro text-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Accessibility Info */}
      <div className="sr-only" aria-live="polite">
        {value ? `Password strength: ${strength.label}` : 'No password entered'}
      </div>
    </div>
  );
};

export default PasswordInput;
