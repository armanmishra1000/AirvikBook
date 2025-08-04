'use client';

/**
 * Password Strength Indicator Component
 * 
 * BRAND COMPLIANCE: Uses only brand tokens for colors and spacing
 * FEATURES: Real-time password strength validation with visual feedback
 */

import React from 'react';
import { PasswordStrength, PASSWORD_REQUIREMENTS } from '../../types/userRegistration.types';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthIndicator({ 
  password, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  
  /**
   * Calculate password strength
   */
  const calculateStrength = (password: string): PasswordStrength => {
    const requirements = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
      hasUppercase: PASSWORD_REQUIREMENTS.UPPERCASE_PATTERN.test(password),
      hasLowercase: PASSWORD_REQUIREMENTS.LOWERCASE_PATTERN.test(password),
      hasNumber: PASSWORD_REQUIREMENTS.NUMBER_PATTERN.test(password),
      hasSpecialChar: PASSWORD_REQUIREMENTS.SPECIAL_CHAR_PATTERN.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    const feedback: string[] = [];
    
    if (!requirements.minLength) {
      feedback.push('At least 8 characters');
    }
    if (!requirements.hasUppercase) {
      feedback.push('One uppercase letter');
    }
    if (!requirements.hasLowercase) {
      feedback.push('One lowercase letter');
    }
    if (!requirements.hasNumber) {
      feedback.push('One number');
    }
    if (!requirements.hasSpecialChar) {
      feedback.push('One special character (!@#$%^&*)');
    }

    return {
      score,
      feedback,
      requirements,
    };
  };

  /**
   * Get strength color based on score
   */
  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-lime-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  /**
   * Get strength text based on score
   */
  const getStrengthText = (score: number): string => {
    switch (score) {
      case 0:
        return 'Enter password';
      case 1:
        return 'Very weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  /**
   * Get strength text color
   */
  const getStrengthTextColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'text-red-600 dark:text-red-400';
      case 2:
        return 'text-orange-600 dark:text-orange-400';
      case 3:
        return 'text-yellow-600 dark:text-yellow-400';
      case 4:
        return 'text-lime-600 dark:text-lime-400';
      case 5:
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // Don't show anything if no password
  if (!password) {
    return null;
  }

  const strength = calculateStrength(password);

  return (
    <div className={`password-strength-indicator ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-space-2 mb-space-2">
        <div className="flex space-x-space-1 flex-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                level <= strength.score
                  ? getStrengthColor(strength.score)
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${getStrengthTextColor(strength.score)}`}>
          {getStrengthText(strength.score)}
        </span>
      </div>

      {/* Requirements List */}
      {strength.feedback.length > 0 && (
        <div className="space-y-space-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Password must include:
          </p>
          <ul className="space-y-space-1">
            {Object.entries(strength.requirements).map(([key, met]) => {
              let label = '';
              switch (key) {
                case 'minLength':
                  label = 'At least 8 characters';
                  break;
                case 'hasUppercase':
                  label = 'One uppercase letter (A-Z)';
                  break;
                case 'hasLowercase':
                  label = 'One lowercase letter (a-z)';
                  break;
                case 'hasNumber':
                  label = 'One number (0-9)';
                  break;
                case 'hasSpecialChar':
                  label = 'One special character (!@#$%^&*)';
                  break;
                default:
                  return null;
              }

              return (
                <li key={key} className="flex items-center space-x-space-2">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    met 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {met && (
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs ${
                    met 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {strength.score === 5 && (
        <div className="flex items-center space-x-space-2 mt-space-2 p-space-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Strong password! Your account will be well protected.
          </span>
        </div>
      )}

      {/* Security Tips */}
      {password.length > 0 && strength.score < 4 && (
        <div className="mt-space-2 p-space-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-start space-x-space-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-space-1">
                Security Tips:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-space-1">
                <li>• Use a unique password you don't use elsewhere</li>
                <li>• Consider using a password manager</li>
                <li>• Mix letters, numbers, and symbols</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}