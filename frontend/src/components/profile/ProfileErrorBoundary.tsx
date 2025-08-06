'use client';

/**
 * Profile Error Boundary Component
 * 
 * BRAND COMPLIANCE REQUIREMENTS:
 * - ONLY use brand tokens (--airvik-*, --space-*, text-*)
 * - NO hardcoded colors, spacing, or typography
 * - All interactive states (hover, focus, active, disabled)
 * - Full dark mode support
 * 
 * ERROR HANDLING REQUIREMENTS:
 * - Catch all React errors in profile components
 * - Provide user-friendly error messages
 * - Log errors for debugging
 * - Offer recovery options
 */

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

interface ErrorTestProps {
  onTriggerError: () => void;
}

// Test component to intentionally trigger errors (for QA validation)
const ErrorTestTrigger: React.FC<ErrorTestProps> = ({ onTriggerError }) => (
  <button
    onClick={onTriggerError}
    className="btn-secondary text-caption"
    data-testid="error-trigger"
    style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      zIndex: 9999,
      fontSize: '10px',
      padding: '4px 8px'
    }}
  >
    [TEST] Trigger Error
  </button>
);

export default class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `profile_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging and monitoring
    console.error('Profile Error Boundary Caught:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  triggerTestError = () => {
    // This method is only for testing the error boundary
    throw new Error('Test error triggered for error boundary validation');
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with brand compliance
      return (
        <div className="min-h-screen flex items-center justify-center p-space-4" 
             style={{ backgroundColor: 'var(--airvik-white)' }}>
          <div className="card p-space-8 text-center max-w-md w-full"
               style={{ 
                 backgroundColor: 'var(--surface-primary)',
                 border: '1px solid var(--border-primary)',
                 borderRadius: '8px',
                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
               }}>
            
            {/* Error Icon */}
            <div className="mb-space-6 flex justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'var(--error-light)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                        fill="var(--error)" />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h3 className="text-h3 mb-space-4" 
                style={{ color: 'var(--error)', fontWeight: '600' }}>
              Something went wrong
            </h3>

            {/* Error Message */}
            <p className="text-body mb-space-6" 
               style={{ color: 'var(--text-secondary)' }}>
              We're sorry, there was an unexpected error with your profile. 
              This has been logged and our team will investigate.
            </p>

            {/* Error ID for support */}
            {this.state.errorId && (
              <p className="text-caption mb-space-6 p-space-3 rounded" 
                 style={{ 
                   backgroundColor: 'var(--surface-secondary)', 
                   color: 'var(--text-tertiary)',
                   fontFamily: 'monospace',
                   border: '1px solid var(--border-secondary)'
                 }}>
                Error ID: {this.state.errorId}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-space-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn-primary"
                style={{
                  backgroundColor: 'var(--airvik-blue)',
                  color: 'var(--airvik-white)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--airvik-purple)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--airvik-blue)';
                }}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="btn-secondary"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--airvik-blue)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: '8px',
                  border: '1px solid var(--airvik-blue)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--airvik-blue)';
                  e.currentTarget.style.color = 'var(--airvik-white)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--airvik-blue)';
                }}
              >
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn-secondary"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  padding: 'var(--space-3) var(--space-6)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Go Home
              </button>
            </div>

            {/* Developer info in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-space-6 text-left">
                <summary className="cursor-pointer text-caption" 
                         style={{ color: 'var(--text-tertiary)' }}>
                  Developer Details
                </summary>
                <pre className="mt-space-2 p-space-3 rounded text-xs overflow-auto"
                     style={{ 
                       backgroundColor: 'var(--surface-secondary)',
                       border: '1px solid var(--border-secondary)',
                       maxHeight: '200px'
                     }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // Render children normally, with test trigger in development
    return (
      <>
        {this.props.children}
        {process.env.NODE_ENV === 'development' && (
          <ErrorTestTrigger onTriggerError={this.triggerTestError} />
        )}
      </>
    );
  }
}

// Export for use in profile pages
export { ProfileErrorBoundary };
