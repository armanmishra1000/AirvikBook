'use client';

/**
 * Validation Message Component
 * 
 * BRAND COMPLIANCE REQUIREMENTS:
 * - ONLY use brand tokens (--airvik-*, --space-*, text-*)
 * - NO hardcoded colors, spacing, or typography
 * - All interactive states (hover, focus, active, disabled)
 * - Full dark mode support
 * 
 * ACCESSIBILITY REQUIREMENTS:
 * - Error messages announced by screen readers
 * - Proper ARIA attributes
 * - Clear visual hierarchy
 * - Support for assistive technologies
 */

import React from 'react';

interface ValidationMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  fieldId?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  onDismiss?: () => void;
}

interface ValidationSummaryProps {
  errors: Record<string, string>;
  className?: string;
  title?: string;
  maxErrorsToShow?: number;
}

interface FieldValidationProps {
  fieldName: string;
  error?: string;
  warning?: string;
  success?: string;
  isValidating?: boolean;
  showValidationIcons?: boolean;
  className?: string;
}

/**
 * Individual validation message component
 */
export function ValidationMessage({
  message,
  type = 'error',
  fieldId,
  className = '',
  showIcon = true,
  size = 'medium',
  onDismiss
}: ValidationMessageProps) {
  if (!message) return null;

  // Size-based styling
  const sizeClasses = {
    small: {
      text: 'text-caption',
      padding: 'p-space-2',
      iconSize: '12'
    },
    medium: {
      text: 'text-body',
      padding: 'p-space-3',
      iconSize: '16'
    },
    large: {
      text: 'text-body',
      padding: 'p-space-4',
      iconSize: '20'
    }
  };

  // Type-based styling
  const typeStyles = {
    error: {
      color: 'var(--error)',
      backgroundColor: 'var(--error-light)',
      borderColor: 'var(--error)',
      icon: (
        <svg width={sizeClasses[size].iconSize} height={sizeClasses[size].iconSize} viewBox="0 0 20 20" fill="none">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="currentColor" fillOpacity="0.1"/>
          <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    warning: {
      color: 'var(--warning)',
      backgroundColor: 'var(--warning-light)',
      borderColor: 'var(--warning)',
      icon: (
        <svg width={sizeClasses[size].iconSize} height={sizeClasses[size].iconSize} viewBox="0 0 20 20" fill="none">
          <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-.993.883L9 6v3a1 1 0 001.993.117L11 9V6a1 1 0 00-1-1z" fill="currentColor"/>
        </svg>
      )
    },
    success: {
      color: 'var(--success)',
      backgroundColor: 'var(--success-light)',
      borderColor: 'var(--success)',
      icon: (
        <svg width={sizeClasses[size].iconSize} height={sizeClasses[size].iconSize} viewBox="0 0 20 20" fill="none">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="currentColor" fillOpacity="0.1"/>
          <path d="M13 8L9 12L7 10M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    info: {
      color: 'var(--airvik-blue)',
      backgroundColor: 'var(--airvik-blue-light)',
      borderColor: 'var(--airvik-blue)',
      icon: (
        <svg width={sizeClasses[size].iconSize} height={sizeClasses[size].iconSize} viewBox="0 0 20 20" fill="none">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="currentColor" fillOpacity="0.1"/>
          <path d="M9 9H10V13H11M10 7H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  };

  const currentTypeStyle = typeStyles[type];
  const currentSizeClass = sizeClasses[size];

  return (
    <div
      className={`flex items-start gap-space-2 rounded-md border ${currentSizeClass.padding} ${className}`}
      style={{
        color: currentTypeStyle.color,
        backgroundColor: currentTypeStyle.backgroundColor,
        borderColor: currentTypeStyle.borderColor
      }}
      role="alert"
      aria-live="polite"
      aria-describedby={fieldId}
    >
      {showIcon && (
        <div className="flex-shrink-0" style={{ marginTop: '1px' }}>
          {currentTypeStyle.icon}
        </div>
      )}
      
      <div className={`flex-1 ${currentSizeClass.text}`}>
        {message}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-space-2 hover:opacity-70 transition-opacity duration-200"
          aria-label="Dismiss message"
          style={{ color: currentTypeStyle.color }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Field-specific validation component
 */
export function FieldValidation({
  fieldName,
  error,
  warning,
  success,
  isValidating,
  showValidationIcons = true,
  className = ''
}: FieldValidationProps) {
  // Show loading state
  if (isValidating) {
    return (
      <div className={`flex items-center gap-space-2 text-caption ${className}`}
           style={{ color: 'var(--text-tertiary)' }}>
        <div className="animate-spin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
        <span>Validating...</span>
      </div>
    );
  }

  // Show error first (highest priority)
  if (error) {
    return (
      <ValidationMessage
        message={error}
        type="error"
        fieldId={`${fieldName}-field`}
        size="small"
        showIcon={showValidationIcons}
        className={className}
      />
    );
  }

  // Show warning second
  if (warning) {
    return (
      <ValidationMessage
        message={warning}
        type="warning"
        fieldId={`${fieldName}-field`}
        size="small"
        showIcon={showValidationIcons}
        className={className}
      />
    );
  }

  // Show success last
  if (success) {
    return (
      <ValidationMessage
        message={success}
        type="success"
        fieldId={`${fieldName}-field`}
        size="small"
        showIcon={showValidationIcons}
        className={className}
      />
    );
  }

  return null;
}

/**
 * Summary of all validation errors
 */
export function ValidationSummary({
  errors,
  className = '',
  title = 'Please fix the following errors:',
  maxErrorsToShow = 5
}: ValidationSummaryProps) {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) {
    return null;
  }

  const errorsToShow = errorEntries.slice(0, maxErrorsToShow);
  const hasMoreErrors = errorEntries.length > maxErrorsToShow;

  return (
    <div
      className={`card p-space-4 ${className}`}
      style={{
        backgroundColor: 'var(--error-light)',
        border: '1px solid var(--error)',
        borderRadius: '8px'
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-space-3">
        {/* Error icon */}
        <div className="flex-shrink-0" style={{ color: 'var(--error)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="currentColor" fillOpacity="0.1"/>
            <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="flex-1">
          {/* Title */}
          <h4 className="text-label font-medium mb-space-2" style={{ color: 'var(--error)' }}>
            {title}
          </h4>

          {/* Error list */}
          <ul className="space-y-space-1">
            {errorsToShow.map(([fieldName, errorMessage]) => (
              <li key={fieldName} className="text-caption" style={{ color: 'var(--text-primary)' }}>
                <span className="font-medium">{formatFieldName(fieldName)}:</span> {errorMessage}
              </li>
            ))}
          </ul>

          {/* Show count if more errors */}
          {hasMoreErrors && (
            <p className="text-caption mt-space-2" style={{ color: 'var(--text-secondary)' }}>
              And {errorEntries.length - maxErrorsToShow} more error{errorEntries.length - maxErrorsToShow !== 1 ? 's' : ''}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline validation status indicator
 */
export function ValidationStatus({
  isValid,
  isValidating,
  hasError,
  className = ''
}: {
  isValid?: boolean;
  isValidating?: boolean;
  hasError?: boolean;
  className?: string;
}) {
  if (isValidating) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="animate-spin" style={{ color: 'var(--text-tertiary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex items-center ${className}`} style={{ color: 'var(--error)' }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className={`flex items-center ${className}`} style={{ color: 'var(--success)' }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M13 8L9 12L7 10M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  return null;
}

/**
 * Helper function to format field names for display
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

export default ValidationMessage;
