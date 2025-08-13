'use client';

/**
 * Email Verification Pending Page
 * 
 * BRAND COMPLIANCE: Uses brand tokens and components
 * COMPLETE USER FLOW: Verification pending with resend functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSuccessResponse } from '../../types/userRegistration.types';
import UserRegistrationService from '../../services/userRegistration.service';
import { AUTH_PATHS } from '../../lib/paths';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const cooldownInterval = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);
  const verificationAttempted = useRef(false);

  // Sanitized logging functions for security
  const maskEmail = (email: string) => {
    if (!email) return 'no-email';
    const [local, domain] = email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  };

  const maskToken = (token: string) => {
    if (!token) return 'no-token';
    return token.substring(0, 8) + '...' + token.substring(token.length - 4);
  };

  // Get email and token from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    // Removed sensitive data logging for security
    
    if (emailParam) {
      // Decode the email parameter (handles %40 -> @)
      const decodedEmail = decodeURIComponent(emailParam);
      setEmail(decodedEmail);
    }
    
    if (tokenParam) {
      setToken(tokenParam);
    }
    
    // If no email provided, redirect to registration
    if (!emailParam) {
      router.push(AUTH_PATHS.REGISTER);
      return;
    }
    
    // If both token and email are provided, auto-verify (only once)
    if (tokenParam && emailParam && !verificationAttempted.current) {
      const decodedEmail = decodeURIComponent(emailParam);
      verificationAttempted.current = true;
      verifyEmailWithToken(tokenParam, decodedEmail);
    }
  }, [searchParams, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (cooldownInterval.current) {
        clearInterval(cooldownInterval.current);
      }
    };
  }, []);

  // Handle resend cooldown
  useEffect(() => {
    if (lastResendTime && resendCount >= 3) {
      // 5 minute cooldown after 3 resends
      const cooldownMs = 5 * 60 * 1000;
      const elapsed = Date.now() - lastResendTime;
      
      if (elapsed < cooldownMs) {
        setCanResend(false);
        setResendCooldown(Math.ceil((cooldownMs - elapsed) / 1000));
        
        cooldownInterval.current = setInterval(() => {
          if (!mounted.current) return;
          
          const newElapsed = Date.now() - lastResendTime;
          const remaining = Math.ceil((cooldownMs - newElapsed) / 1000);
          
          if (remaining <= 0) {
            setCanResend(true);
            setResendCooldown(0);
            setResendCount(0);
            if (cooldownInterval.current) {
              clearInterval(cooldownInterval.current);
            }
          } else {
            setResendCooldown(remaining);
          }
        }, 1000);
      }
    }
  }, [lastResendTime, resendCount]);

  /**
   * Verify email with token (called when clicking verification link)
   */
  const verifyEmailWithToken = async (verificationToken: string, userEmail: string) => {
    if (!mounted.current) return;
    
    // Prevent double verification
    if (isVerifying) {
      return;
    }
    
    setIsVerifying(true);
    setVerificationError('');
    setError('');
    setMessage('');

    try {
      const response = await UserRegistrationService.verifyEmail({
        token: verificationToken,
        email: userEmail
      });
      
      if (isSuccessResponse(response)) {
        // Only update state if component is still mounted
        if (mounted.current) {
          setIsVerified(true);
          setMessage('Email verified successfully! Redirecting to your account...');
        }
        
        // Always redirect, even if component unmounted (user will see success page)
        setTimeout(() => {
          router.push(AUTH_PATHS.SUCCESS);
        }, 2000);
      } else {
        // Only update state if component is still mounted
        if (mounted.current) {
          setVerificationError(response.error || 'Email verification failed');
          
          // Handle specific error codes
          if (response.code === 'VERIFICATION_TOKEN_EXPIRED') {
            setVerificationError('Verification link has expired. Please request a new one below.');
          } else if (response.code === 'VERIFICATION_TOKEN_INVALID') {
            setVerificationError('Invalid verification link. Please request a new one below.');
          } else if (response.code === 'EMAIL_NOT_FOUND') {
            setVerificationError('Email address not found. Please try registering again.');
          }
        }
      }
    } catch (error) {
      console.error('🚨 Verification error:', error);
      if (mounted.current) {
        setVerificationError('Network error. Please check your connection and try again.');
      }
    } finally {
      // Always set isVerifying to false, but check mounted status
      if (mounted.current) {
        setIsVerifying(false);
      }
    }
  };

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async () => {
    if (!email || isResending || !canResend) return;

    setIsResending(true);
    setError('');
    setMessage('');

    try {
      const response = await UserRegistrationService.resendVerification({ email });

      if (isSuccessResponse(response)) {
        setMessage('Verification email sent! Please check your inbox.');
        setResendCount(prev => prev + 1);
        setLastResendTime(Date.now());
        
        // Short cooldown between resends (1 minute)
        setCanResend(false);
        setTimeout(() => {
          if (mounted.current) {
            setCanResend(true);
          }
        }, 60000);
      } else {
        setError(response.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Format cooldown time
   */
  const formatCooldownTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-space-12 px-space-4 sm:px-space-6 lg:px-space-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800 p-space-8">
        {/* Header - Dynamic based on verification status */}
        <div className="text-center mb-space-8">
          {isVerifying ? (
            // Verifying state
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full dark:bg-blue-900 mb-space-4">
                <div className="w-8 h-8 border-2 border-blue-600 rounded-full animate-spin dark:border-blue-400 border-t-transparent" />
              </div>
              <h1 className="text-gray-900 text-h1 dark:text-white mb-space-2">
                Verifying Email...
              </h1>
              <p className="text-gray-600 text-body dark:text-gray-300">
                Please wait while we verify your email address
              </p>
            </>
          ) : isVerified ? (
            // Success state
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full dark:bg-green-900 mb-space-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-gray-900 text-h1 dark:text-white mb-space-2">
                Email Verified! 🎉
              </h1>
              <p className="text-gray-600 text-body dark:text-gray-300">
                Your account has been successfully verified
              </p>
            </>
          ) : verificationError ? (
            // Error state
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full dark:bg-red-900 mb-space-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-gray-900 text-h1 dark:text-white mb-space-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 text-body dark:text-gray-300">
                There was a problem verifying your email
              </p>
            </>
          ) : (
            // Default state (waiting for verification)
            <>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full dark:bg-blue-900 mb-space-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26c.3.16.65.16.95 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-gray-900 text-h1 dark:text-white mb-space-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 text-body dark:text-gray-300">
                We've sent a verification link to:
              </p>
              <p className="font-semibold text-gray-900 text-body dark:text-white mt-space-1">
                {email}
              </p>
            </>
          )}
        </div>

        {/* Instructions - Only show if not verifying or verified */}
        {!isVerifying && !isVerified && (
          <div className="mb-space-6">
            <div className="border border-blue-200 rounded-md bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-space-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-space-2">
                What to do next:
              </h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-space-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the verification link in the email</li>
                <li>3. You'll be redirected back to complete your registration</li>
              </ol>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className="border border-green-200 rounded-md mb-space-4 p-space-3 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          </div>
        )}

        {(error || verificationError) && (
          <div className="border border-red-200 rounded-md mb-space-4 p-space-3 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">
              {verificationError || error}
            </p>
          </div>
        )}

        {/* Resend Section - Only show if not verifying and not verified successfully */}
        {!isVerifying && !isVerified && (
          <div className="text-center mb-space-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-space-3">
              Didn't receive the email?
            </p>
          
          {canResend ? (
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="inline-flex items-center text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md px-space-4 py-space-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <div className="w-4 h-4 -ml-1 border-2 border-white rounded-full animate-spin mr-space-2 border-t-transparent" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-space-1">
                Please wait before requesting another email
              </p>
              <p className="font-mono text-sm text-gray-600 dark:text-gray-300">
                {formatCooldownTime(resendCooldown)}
              </p>
            </div>
          )}
          
          {resendCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-space-2">
              {resendCount}/3 resends used
            </p>
          )}
          </div>
        )}

        {/* Success Actions - Show when verified */}
        {isVerified && (
          <div className="text-center mb-space-6">
            <button
                              onClick={() => router.push(AUTH_PATHS.SUCCESS)}
              className="w-full font-medium text-white transition-colors duration-200 bg-green-600 rounded-md px-space-6 py-space-3 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {/* Help Section - Only show if not verified successfully */}
        {!isVerified && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-space-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-space-3">
                Still having trouble?
              </p>
              <div className="space-y-space-2">
                <button
                  onClick={() => router.push(AUTH_PATHS.REGISTER)}
                  className="block w-full text-sm text-blue-600 underline dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  Try registering again
                </button>
                <a
                  href="/contact"
                  className="block w-full text-sm text-blue-600 underline dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  Contact support
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="rounded-md mt-space-6 p-space-3 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-start space-x-space-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                <strong>Security Notice:</strong> The verification link will expire in 24 hours. 
                If you don't verify your email within this time, you'll need to register again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}