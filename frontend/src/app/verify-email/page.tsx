"use client";

/**
 * Email Verification Pending Page
 *
 * BRAND COMPLIANCE: Uses brand tokens and components
 * COMPLETE USER FLOW: Verification pending with resend functionality
 * DESIGN CONSISTENCY: Matches LoginForm design pattern
 * TOAST NOTIFICATIONS: Uses toast system for success/error messages
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSuccessResponse } from '../../types/userRegistration.types';
import UserRegistrationService from '../../services/userRegistration.service';
import { AUTH_PATHS } from '../../lib/paths';
import { useToastHelpers } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToastHelpers();
  const { handleEmailVerificationAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownInterval = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);
  const verificationAttempted = useRef(false);

  // Sanitized logging functions for security
  const maskEmail = (email: string) => {
    if (!email) return "no-email";
    const [local, domain] = email.split("@");
    return `${local.substring(0, 2)}***@${domain}`;
  };

  const maskToken = (token: string) => {
    if (!token) return "no-token";
    return token.substring(0, 8) + "..." + token.substring(token.length - 4);
  };

  // Get email and token from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

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
  const verifyEmailWithToken = async (
    verificationToken: string,
    userEmail: string
  ) => {
    if (!mounted.current) return;

    // Prevent double verification
    if (isVerifying) {
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const response = await UserRegistrationService.verifyEmail({
        token: verificationToken,
        email: userEmail,
      });

      if (isSuccessResponse(response)) {
        // Only update state if component is still mounted
        if (mounted.current) {
          setIsVerified(true);
          showSuccess(
            "Email Verified! 🎉",
            "Your account has been successfully verified. Redirecting to your account..."
          );
        }

        // Handle authentication after email verification
        try {
          await handleEmailVerificationAuth();
        } catch (error) {
          console.error('Failed to authenticate after email verification:', error);
        }

        // Always redirect, even if component unmounted (user will see success page)
        setTimeout(() => {
          router.push(AUTH_PATHS.SUCCESS);
        }, 2000);
      } else {
        // Only update state if component is still mounted
        if (mounted.current) {
          let errorMessage = response.error || "Email verification failed";

          // Handle specific error codes
          if (response.code === "VERIFICATION_TOKEN_EXPIRED") {
            errorMessage =
              "Verification link has expired. Please request a new one below.";
          } else if (response.code === "VERIFICATION_TOKEN_INVALID") {
            errorMessage =
              "Invalid verification link. Please request a new one below.";
          } else if (response.code === "EMAIL_NOT_FOUND") {
            errorMessage =
              "Email address not found. Please try registering again.";
          }

          setVerificationError(errorMessage);
          showError("Verification Failed", errorMessage);
        }
      }
    } catch (error) {
      console.error("🚨 Verification error:", error);
      if (mounted.current) {
        const errorMessage =
          "Network error. Please check your connection and try again.";
        setVerificationError(errorMessage);
        showError("Connection Error", errorMessage);
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

    try {
      const response = await UserRegistrationService.resendVerification({
        email,
      });

      if (isSuccessResponse(response)) {
        showSuccess(
          "Verification Email Sent",
          "Please check your inbox for the verification link."
        );
        setResendCount((prev) => prev + 1);
        setLastResendTime(Date.now());

        // Short cooldown between resends (1 minute)
        setCanResend(false);
        setTimeout(() => {
          if (mounted.current) {
            setCanResend(true);
          }
        }, 60000);
      } else {
        const errorMessage = response.error || "Failed to resend verification email";
        showError("Resend Failed", errorMessage);
      }
    } catch (error) {
      showError("Resend Failed", "Failed to resend verification email. Please try again.");
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
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-space-12 px-space-4 sm:px-space-6 lg:px-space-8">
      <div className="relative w-full max-w-md pb-6 mx-auto">
        {/* Main Card */}
        <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg sm:shadow-lg sm:p-space-6 sm:card-auth">
          <div className="space-y-space-4">
            {/* Header */}
            <div className="text-center mb-space-8">
              {isVerifying ? (
                // Verifying state
                <>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full dark:bg-blue-900 mb-space-4">
                    <div className="w-8 h-8 border-2 border-blue-600 rounded-full animate-spin dark:border-blue-400 border-t-transparent" />
                  </div>
                  <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                    Verifying Email...
                  </h1>
                  <p className="text-gray-600 text-body dark:text-gray-400">
                    Please wait while we verify your email address
                  </p>
                </>
              ) : isVerified ? (
                // Success state
                <>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full dark:bg-green-900 mb-space-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                    Email Verified! 🎉
                  </h1>
                  <p className="text-gray-600 text-body dark:text-gray-400">
                    Your account has been successfully verified
                  </p>
                </>
              ) : verificationError ? (
                // Error state
                <>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full dark:bg-red-900 mb-space-4">
                    <svg
                      className="w-8 h-8 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                    Verification Failed
                  </h1>
                  <p className="text-gray-600 text-body dark:text-gray-400">
                    There was a problem verifying your email
                  </p>
                </>
              ) : (
                // Default state (waiting for verification)
                <>
                  <div className="flex items-center justify-center mx-auto bg-blue-100 rounded-full sm:size-16 size-12 dark:bg-blue-900 mb-space-4">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26c.3.16.65.16.95 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                    Check Your Email
                  </h1>
                  <p className="text-gray-600 text-body dark:text-gray-400">
                    We've sent a verification link to:
                  </p>
                  <p className="font-semibold text-airvik-black dark:text-airvik-white text-body mt-space-1">
                    {email}
                  </p>
                </>
              )}
            </div>

            {/* Resend Section - Only show if not verifying and not verified successfully */}
            {!isVerifying && !isVerified && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-space-3">
                  Didn't receive the email?
                </p>

                {canResend ? (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full font-medium transition-all duration-100 ease-linear bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  >
                    {isResending ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 animate-spin border-airvik-white border-t-transparent rounded-radius-full mr-space-2" />
                        Sending...
                      </div>
                    ) : (
                      "Resend Verification Email"
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
              <button
                onClick={() => router.push(AUTH_PATHS.SUCCESS)}
                className="w-full font-medium transition-all duration-100 ease-linear bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                Continue to Dashboard
              </button>
            )}

            {/* Help Section - Only show if not verified successfully */}
            {!isVerified && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-space-2">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-space-2">
                    Still having trouble?
                  </p>
                  <div className="space-y-space-2">
                    <button
                      onClick={() => router.push(AUTH_PATHS.REGISTER)}
                      className="block w-full text-sm underline transition-colors text-airvik-blue dark:text-airvik-blue hover:text-airvik-bluehover dark:hover:text-airvik-blue duration-normal"
                    >
                      Try registering again
                    </button>
                    <a
                      href="/contact"
                      className="block w-full text-sm underline transition-colors text-airvik-blue dark:text-airvik-blue hover:text-airvik-bluehover dark:hover:text-airvik-blue duration-normal"
                    >
                      Contact support
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="rounded-radius-md bg-gray-50">
              <div className="flex items-start space-x-space-2">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    <strong>Security Notice:</strong> The verification link will
                    expire in 24 hours. If you don't verify your email within this
                    time, you'll need to register again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
