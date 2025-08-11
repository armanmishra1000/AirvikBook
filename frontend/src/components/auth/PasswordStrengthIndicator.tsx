'use client';

import React from 'react';
import { PASSWORD_STRENGTH_LABELS } from '../../types/passwordManagement.types';

// =====================================================
// PASSWORD STRENGTH INDICATOR COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'minLength',
    label: 'At least 8 characters long',
    test: (password: string) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'Contains at least one uppercase letter',
    test: (password: string) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'Contains at least one lowercase letter',
    test: (password: string) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'Contains at least one number',
    test: (password: string) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'Contains at least one special character',
    test: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
];

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
  className = ''
}) => {
  // Calculate password strength (consistent with PasswordInput)
  const fulfilledRequirements = PASSWORD_REQUIREMENTS.filter(req => req.test(password));
  const strengthScore = Math.min(fulfilledRequirements.length, 4); // Cap at 4 like PasswordInput
  const strengthPercentage = (strengthScore / 4) * 100; // Use 4 as max for percentage

  // Get strength level and color (consistent with PasswordInput)
  const getStrengthInfo = () => {
    if (strengthScore === 0) {
      return { level: 'No password', color: 'bg-gray-300', textColor: 'text-gray-500' };
    } else if (strengthScore <= 2) {
      return { level: 'Weak', color: 'bg-error', textColor: 'text-error' };
    } else if (strengthScore <= 3) {
      return { level: 'Fair', color: 'bg-warning', textColor: 'text-warning' };
    } else if (strengthScore <= 4) {
      return { level: 'Strong', color: 'bg-success', textColor: 'text-success' };
    } else {
      return { level: 'Strong', color: 'bg-success', textColor: 'text-success' };
    }
  };

  const strengthInfo = getStrengthInfo();
  const allRequirementsMet = password && fulfilledRequirements.length === PASSWORD_REQUIREMENTS.length;

  if (!password && !showRequirements) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Strength Bar */}
      {password && (
        <div className="mb-space-4">
          <div className="flex items-center justify-between mb-space-2">
            <span className="text-label font-sf-pro text-airvik-black dark:text-airvik-white">
              Password Strength
            </span>
            <span className={`text-caption font-sf-pro font-medium ${strengthInfo.textColor}`}>
              {strengthInfo.level}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-radius-full h-2">
            <div
              className={`h-2 rounded-radius-full transition-all duration-normal ${strengthInfo.color}`}
              style={{ width: `${strengthPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements List - Only show if not all requirements are met */}
      {showRequirements && !allRequirementsMet && (
        <div className="space-y-space-2">
          <p className="text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-3">
            Password Requirements:
          </p>
          
          <ul className="space-y-space-0">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const isMetOrNoPassword = !password || requirement.test(password);
              const isMet = password && requirement.test(password);
              
              return (
                <li
                  key={requirement.id}
                  className="flex items-center space-x-space-2"
                >
                  {/* Requirement Icon */}
                  <div className={`flex-shrink-0 w-4 h-4 rounded-radius-full flex items-center justify-center transition-all duration-normal
                    ${isMet 
                      ? 'bg-success text-airvik-white' 
                      : password 
                        ? 'bg-error text-airvik-white' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    {isMet ? (
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
                  <span className={`text-body font-sf-pro transition-colors duration-normal
                    ${isMet 
                      ? 'text-success' 
                      : password 
                        ? 'text-error' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {requirement.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}


    </div>
  );
};

export default PasswordStrengthIndicator;