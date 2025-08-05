'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

// =====================================================
// ERROR BOUNDARY COMPONENT
// =====================================================
// Catches JavaScript errors anywhere in the child component tree

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center p-space-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-radius-full bg-red-100 dark:bg-red-900/20 mb-space-6">
              <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h1 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-8">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>

            {/* Error Details in Development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-space-8 p-space-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md text-left">
                <h3 className="text-label font-sf-pro text-error mb-space-2">
                  Error Details (Development Only):
                </h3>
                <pre className="text-caption text-error overflow-auto whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="space-y-space-4">
              <button
                onClick={this.handleReset}
                className="w-full py-space-3 px-space-6 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-purple transition-colors duration-normal font-sf-pro text-button"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full py-space-3 px-space-6 border border-gray-300 dark:border-gray-600 text-airvik-black dark:text-airvik-white rounded-radius-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-normal font-sf-pro text-button"
              >
                Refresh Page
              </button>
            </div>

            {/* Support Contact */}
            <div className="mt-space-8 p-space-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
              <p className="text-body text-airvik-blue">
                Need help? Contact our support team at{' '}
                <a 
                  href="mailto:support@airvikbook.com" 
                  className="font-medium hover:underline"
                >
                  support@airvikbook.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;