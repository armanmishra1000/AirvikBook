'use client';

import React from 'react';
import {
  PasswordRequirementsProps,
  PasswordPolicy,
  PasswordRequirement
} from '../../types/passwordManagement.types';

// =====================================================
// PASSWORD REQUIREMENTS COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  policy,
  className = ''
}) => {
  // Default password policy if not provided
  const defaultPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    historyLimit: 5
  };

  const currentPolicy = policy || defaultPolicy;

  // Generate requirements based on policy
  const generateRequirements = (password: string, policy: PasswordPolicy): PasswordRequirement[] => {
    const requirements: PasswordRequirement[] = [];

    // Length requirement
    requirements.push({
      type: 'length',
      label: `At least ${policy.minLength} characters`,
      met: password.length >= policy.minLength,
      required: policy.minLength > 0
    });

    // Uppercase requirement
    if (policy.requireUppercase) {
      requirements.push({
        type: 'uppercase',
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password),
        required: true
      });
    }

    // Lowercase requirement
    if (policy.requireLowercase) {
      requirements.push({
        type: 'lowercase',
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password),
        required: true
      });
    }

    // Number requirement
    if (policy.requireNumbers) {
      requirements.push({
        type: 'number',
        label: 'Contains number',
        met: /\d/.test(password),
        required: true
      });
    }

    // Special character requirement
    if (policy.requireSpecialChars) {
      requirements.push({
        type: 'special',
        label: 'Contains special character',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        required: true
      });
    }

    return requirements;
  };

  const requirements = generateRequirements(password, currentPolicy);
  const metRequirements = requirements.filter(req => req.met).length;
  const totalRequirements = requirements.filter(req => req.required).length;
  const completionPercentage = totalRequirements > 0 ? (metRequirements / totalRequirements) * 100 : 0;

  // Get completion status
  const getCompletionStatus = (): {
    status: 'none' | 'partial' | 'complete';
    message: string;
    color: string;
  } => {
    if (!password) {
      return {
        status: 'none',
        message: 'No password entered',
        color: 'text-gray-500'
      };
    }

    if (completionPercentage === 100) {
      return {
        status: 'complete',
        message: 'All requirements met',
        color: 'text-success'
      };
    }

    return {
      status: 'partial',
      message: `${metRequirements} of ${totalRequirements} requirements met`,
      color: 'text-warning'
    };
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-space-3">
        <h3 className="text-label font-sf-pro font-medium text-airvik-black dark:text-airvik-white">
          Password Requirements
        </h3>
        <span className={`text-caption font-sf-pro font-medium ${completionStatus.color}`}>
          {completionStatus.message}
        </span>
      </div>

      {/* Progress Bar */}
      {password && (
        <div className="mb-space-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-radius-full h-2">
            <div
              className={`h-2 rounded-radius-full transition-all duration-normal ${
                completionStatus.status === 'complete' 
                  ? 'bg-success' 
                  : completionStatus.status === 'partial'
                    ? 'bg-warning'
                    : 'bg-gray-300'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="space-y-space-2">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className={`flex items-center space-x-space-3 p-space-3 rounded-radius-sm transition-all duration-normal ${
              requirement.met
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : password
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'
            }`}
          >
            {/* Requirement Icon */}
            <div className={`flex-shrink-0 w-5 h-5 rounded-radius-full flex items-center justify-center transition-all duration-normal
              ${requirement.met 
                ? 'bg-success text-airvik-white' 
                : password 
                  ? 'bg-error text-airvik-white' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              {requirement.met ? (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : password ? (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-radius-full" />
              )}
            </div>
            
            {/* Requirement Text */}
            <div className="flex-1">
              <span className={`text-body font-sf-pro transition-colors duration-normal
                ${requirement.met 
                  ? 'text-success' 
                  : password 
                    ? 'text-error' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {requirement.label}
              </span>
              
              {/* Requirement Description */}
              {requirement.type === 'length' && (
                <p className="text-caption font-sf-pro text-gray-500 dark:text-gray-400 mt-space-1">
                  Longer passwords are harder to guess
                </p>
              )}
              {requirement.type === 'uppercase' && (
                <p className="text-caption font-sf-pro text-gray-500 dark:text-gray-400 mt-space-1">
                  Mix of upper and lowercase letters increases security
                </p>
              )}
              {requirement.type === 'lowercase' && (
                <p className="text-caption font-sf-pro text-gray-500 dark:text-gray-400 mt-space-1">
                  Lowercase letters are required for complexity
                </p>
              )}
              {requirement.type === 'number' && (
                <p className="text-caption font-sf-pro text-gray-500 dark:text-gray-400 mt-space-1">
                  Numbers make passwords harder to crack
                </p>
              )}
              {requirement.type === 'special' && (
                <p className="text-caption font-sf-pro text-gray-500 dark:text-gray-400 mt-space-1">
                  Special characters add extra security
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Security Info */}
      {password && (
        <div className="mt-space-4 p-space-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-airvik-blue mt-space-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-space-3">
              <p className="text-body font-sf-pro text-airvik-blue mb-space-2">
                <strong>Security Note:</strong>
              </p>
              <ul className="space-y-space-1 text-body font-sf-pro text-airvik-blue">
                <li>• Avoid using personal information (birthdays, names)</li>
                <li>• Don't reuse passwords from other accounts</li>
                <li>• Consider using a password manager for better security</li>
                <li>• Change your password regularly for maximum protection</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Info */}
      <div className="sr-only" aria-live="polite">
        {password 
          ? `Password requirements: ${metRequirements} out of ${totalRequirements} met. ${completionStatus.message}`
          : 'No password entered. Please enter a password to see requirements.'
        }
      </div>
    </div>
  );
};

export default PasswordRequirements;
