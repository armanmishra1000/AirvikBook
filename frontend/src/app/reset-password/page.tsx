"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordManagementService } from "../../services/passwordManagement.service";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "../../components/auth/PasswordStrengthIndicator";
import { useToastHelpers } from "../../components/common/Toast";
import {
  isSuccessResponse,
  PASSWORD_ERROR_CODES,
} from "../../types/passwordManagement.types";
import { ArrowLeft } from "lucide-react";
import { AUTH_PATHS } from "../../lib/paths";

// =====================================================
// RESET PASSWORD PAGE COMPONENT (Query Parameter Version)
// =====================================================
// Allows users to reset their password using a token from query parameter

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showSuccess, showError } = useToastHelpers();

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isTokenVerifying, setIsTokenVerifying] = useState(true);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const submitAttemptedRef = useRef(false);

  // =====================================================
  // TOKEN VERIFICATION
  // =====================================================

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsTokenVerifying(false);
        return;
      }

      try {
        const result = await PasswordManagementService.verifyResetToken(token);

        if (isSuccessResponse(result)) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        setIsTokenValid(false);
      } finally {
        setIsTokenVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  // Enhanced password validation with specific error messages
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)";
    }
    
    return undefined;
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ): string | undefined => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ResetPasswordFormErrors = {};

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.newPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      newPassword: value,
    }));

    // Clear password error on change
    if (errors.newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: undefined,
      }));
    }

    // Real-time validation for password
    const passwordError = validatePassword(value);
    if (passwordError) {
      setErrors((prev) => ({
        ...prev,
        newPassword: passwordError,
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      confirmPassword: value,
    }));

    // Clear confirm password error on change if submit has been attempted
    if (submitAttemptedRef.current && errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: undefined,
      }));
    }

    // Real-time validation for confirm password
    if (submitAttemptedRef.current) {
      const confirmPasswordError = validateConfirmPassword(
        value,
        formData.newPassword
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitAttemptedRef.current = true;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await PasswordManagementService.resetPassword(
        token!,
        formData.newPassword,
        formData.confirmPassword
      );

      if (isSuccessResponse(result)) {
        // Show success toast
        showSuccess(
          "Password Reset Complete",
          "Your password has been successfully reset. You can now log in with your new password."
        );
        setIsResetComplete(true);
      } else {
        // Handle specific error cases and show error toasts
        let errorTitle = "Password Reset Failed";
        let errorMessage = result.error || "An error occurred. Please try again.";

        switch (result.code) {
          case PASSWORD_ERROR_CODES.INVALID_RESET_TOKEN:
            errorMessage = "The reset link is invalid or has expired. Please request a new one.";
            break;
          case PASSWORD_ERROR_CODES.RESET_TOKEN_EXPIRED:
            errorMessage = "The reset link has expired. Please request a new one.";
            break;
          case PASSWORD_ERROR_CODES.PASSWORD_TOO_WEAK:
            errorMessage = "Password does not meet security requirements.";
            break;
          case PASSWORD_ERROR_CODES.PASSWORD_REUSED:
            errorMessage = "Cannot reuse a recent password. Please choose a different password.";
            break;
          default:
            break;
        }

        showError(errorTitle, errorMessage);
      }
    } catch (error) {
      showError(
        "Connection Error",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (isTokenVerifying) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-space-4 border-4 border-airvik-blue border-t-transparent rounded-radius-full" />
          <p className="text-body text-gray-600 dark:text-gray-400 font-sf-pro">
            Verifying reset link...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // INVALID TOKEN STATE
  // =====================================================

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center lg:px-space-4">
        <div className="max-w-md w-full sm:card-auth">
          <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg sm:shadow-lg sm:p-space-6 p-space-4 text-center">
            {/* Error Icon */}
            <div className="mx-auto sm:size-16 size-12 bg-error text-airvik-white rounded-radius-full flex items-center justify-center mb-space-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="sm:text-h2 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Invalid Reset Link
            </h1>
            <p className="sm:text-body text-body-sm text-gray-600 dark:text-gray-400 mb-space-6">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>

            {/* Action Buttons */}
            <div className="space-y-space-3">
              <button
                onClick={() => router.push(AUTH_PATHS.FORGOT_PASSWORD)}
                className="w-full bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium transition-all ease-linear duration-100 focus:outline-none"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => router.push(AUTH_PATHS.LOGIN)}
                className="w-full bg-gray-200 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium transition-colors duration-normal focus:outline-none"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // SUCCESS STATE
  // =====================================================

  if (isResetComplete) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
        <div className="max-w-md w-full">
          <div className="bg-airvik-white dark:bg-gray-800 text-center rounded-radius-lg sm:shadow-lg sm:p-space-6 sm:card-auth">
            {/* Success Icon */}
            <div className="mx-auto sm:size-16 size-12 bg-success text-airvik-white rounded-radius-full flex items-center justify-center mb-space-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="sm:text-h2 text-h4 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
              Password Reset Complete
            </h1>
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>

            {/* Action Button */}
            <button
              onClick={() => router.push(AUTH_PATHS.LOGIN)}
              className="w-full bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium transition-colors duration-normal focus:outline-none"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM STATE
  // =====================================================

  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
      <div className="max-w-md w-full relative">
        {/* Header */}
        <div className="text-center mb-space-8">
          <h1 className="text-h1 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Reset Password
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-lg sm:p-space-6 p-space-4 card-auth">
          <form onSubmit={handleSubmit} className="space-y-space-6">
            {/* New Password Input */}
            <div>
              <PasswordInput
                value={formData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                label="New Password"
                error={errors.newPassword}
                disabled={isSubmitting}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your new password"
                label="Confirm Password"
                error={errors.confirmPassword}
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium transition-all duration-100 ease-linear focus:outline-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-airvik-white border-t-transparent rounded-radius-full mr-space-2" />
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-space-4 text-center">
            <button
              onClick={() => router.push(AUTH_PATHS.LOGIN)}
              className="font-medium font-sf-pro bg-gray-200 w-full py-space-3 text-gray-700 hover:text-airvik-blue-mid transition-colors duration-normal focus:outline-none rounded-radius-sm"
            >
              Back to Login
            </button>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default ResetPasswordPage;
