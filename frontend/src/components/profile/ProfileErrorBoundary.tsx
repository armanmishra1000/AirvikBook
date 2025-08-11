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
      // Example: sendToErrorTrackingService(error, errorInfo, this.state.errorId);
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

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with brand compliance
      return (
        <div className="flex items-center justify-center min-h-screen p-space-4" 
             style={{ backgroundColor: 'var(--airvik-white)' }}>
          <div className="w-full max-w-md text-center card p-space-8"
               style={{ 
                 backgroundColor: 'var(--surface-primary)',
                 border: '1px solid var(--border-primary)',
                 borderRadius: '8px',
                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
               }}>
            
            {/* Error Icon */}
            <div className="flex justify-center mb-space-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full"
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
              <p className="rounded text-caption mb-space-6 p-space-3" 
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
            <div className="flex flex-col justify-center sm:flex-row gap-space-3">
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
              <details className="text-left mt-space-6">
                <summary className="cursor-pointer text-caption" 
                         style={{ color: 'var(--text-tertiary)' }}>
                  Developer Details
                </summary>
                <pre className="overflow-auto text-xs rounded mt-space-2 p-space-3"
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

    // Render children normally
    return this.props.children;
  }
}

// Export for use in profile pages
export { ProfileErrorBoundary };
