"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PasswordManagementService } from "../../../services/passwordManagement.service";
import {
  isSuccessResponse,
  PASSWORD_ERROR_CODES,
} from "../../../types/passwordManagement.types";
import { useToastHelpers } from "../../../components/common/Toast";

// =====================================================
// FORGOT PASSWORD PAGE COMPONENT
// =====================================================
// Allows users to request password reset emails

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useToastHelpers();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitAttemptedRef = useRef(false);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address";
    return undefined;
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email);
    const newErrors: ForgotPasswordFormErrors = {};

    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error on change if submit has been attempted
    if (
      submitAttemptedRef.current &&
      errors[name as keyof ForgotPasswordFormErrors]
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Real-time validation for email
    if (submitAttemptedRef.current && name === "email") {
      const emailError = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: emailError,
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
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      const result = await PasswordManagementService.forgotPassword(
        formData.email.trim().toLowerCase()
      );

      if (isSuccessResponse(result)) {
        // Show success toast
        showSuccess(
          "Reset link sent!",
          "If an account with this email exists, you will receive password reset instructions."
        );
        setIsSubmitted(true);
      } else {
        // Handle specific error cases
        let errorMessage =
          result.error || "An error occurred. Please try again.";

        if (result.code === PASSWORD_ERROR_CODES.GOOGLE_ONLY_ACCOUNT) {
          errorMessage =
            'This account uses Google sign-in. Please use "Sign in with Google" instead.';
        } else if (result.code === PASSWORD_ERROR_CODES.RATE_LIMIT_EXCEEDED) {
          errorMessage = "Too many attempts. Please try again in 5 minutes.";
        }

        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
        showError("Reset failed", errorMessage);
      }
    } catch (error) {
      const errorMessage =
        "Network error. Please check your connection and try again.";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
      showError("Connection error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-lg p-space-8 card-auth">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-success text-airvik-white rounded-radius-full flex items-center justify-center mb-space-6">
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
              <h1 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-4">
                Check Your Email
              </h1>
              <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
                If an account with this email exists, you will receive password
                reset instructions.
              </p>

              {/* Action Buttons */}
              <div className="space-y-space-3">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-airvik-blue hover:bg-airvik-bluehover text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium transition-all duration-100 ease-linear focus:outline-none"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ email: "" });
                    setErrors({});
                  }}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium dark:hover:bg-gray-600 transition-colors duration-normal focus:outline-none"
                >
                  Try Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-space-8">
          <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Forgot Password
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg sm:shadow-lg sm:p-space-6 sm:card-auth">
          <form onSubmit={handleSubmit} className="space-y-space-4" noValidate>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={`w-full px-space-4 py-space-3  shadow-none
            text-body font-sf-pro 
            bg-airvik-white dark:bg-gray-100 
            rounded-radius-md 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-200 
            disabled:text-gray-500 dark:disabled:text-gray-400
            disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
                  ${
                    errors.email
                      ? "border-error focus:ring-1 focus:ring-error"
                      : "border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
                  }`}
                disabled={isSubmitting}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-space-1 text-caption text-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-bluehover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-linear focus:outline-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-airvik-white border-t-transparent rounded-radius-full mr-space-2" />
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-space-4 text-center">
            <button
              onClick={() => router.push("/auth/login")}
              className="text-body font-sf-pro bg-gray-200 w-full py-2.5 text-airvik-blue transition-colors duration-normal focus:outline-none rounded-radius-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
