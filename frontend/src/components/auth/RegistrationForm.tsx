"use client";

/**
 * Registration Form Component
 *
 * BRAND COMPLIANCE REQUIREMENTS:
 * - ONLY use brand tokens (--airvik-*, --space-*, text-*)
 * - NO hardcoded colors, spacing, or typography
 * - All interactive states (hover, focus, active, disabled)
 * - Full dark mode support
 *
 * REACT PATTERN REQUIREMENTS:
 * - NO function dependencies in useEffect
 * - Use useRef for one-time operations
 * - Proper error handling and loading states
 */

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RegistrationFormData,
  FormErrors,
  isSuccessResponse,
} from "../../types/userRegistration.types";
import UserRegistrationService from "../../services/userRegistration.service";
import GoogleOAuthRedirectButton from "./GoogleOAuthRedirectButton";
import { useToastHelpers } from "../common/Toast";
import { Eye, EyeOff } from "lucide-react";
import Checkbox from "../common/Checkbox";

interface RegistrationFormProps {
  onSuccess?: (user: any, tokens: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function RegistrationForm({
  onSuccess,
  onError,
  className = "",
}: RegistrationFormProps) {
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    mobileNumber: "",
    acceptedTerms: false,
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast helpers
  const { showSuccess, showError } = useToastHelpers();

  // Enhanced password validation with specific error messages
  const validatePasswordWithDetails = (
    password: string
  ): { isValid: boolean; error?: string } => {
    if (!password) {
      return { isValid: false, error: "Password is required" };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        error: "Password must be at least 8 characters long",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one uppercase letter",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one lowercase letter",
      };
    }

    if (!/\d/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one number",
      };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        error:
          "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)",
      };
    }

    return { isValid: true };
  };

  // Refs for one-time operations
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (
    field: keyof RegistrationFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Handle password validation in real-time
    if (field === "password" || field === "confirmPassword") {
      const newFormData = { ...formData, [field]: value };

      // Real-time password validation
      if (field === "password" && typeof value === "string") {
        const passwordValidation = validatePasswordWithDetails(value);
        if (!passwordValidation.isValid) {
          setErrors((prev) => ({
            ...prev,
            password: passwordValidation.error,
          }));
        } else {
          setErrors((prev) => ({ ...prev, password: undefined }));
        }
      }

      // If both password fields have values, check if they match
      if (newFormData.password && newFormData.confirmPassword) {
        if (newFormData.password === newFormData.confirmPassword) {
          // Passwords match, clear confirm password error
          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        } else {
          // Passwords don't match, set confirm password error
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        }
      } else if (
        field === "confirmPassword" &&
        newFormData.confirmPassword &&
        !newFormData.password
      ) {
        // Only confirm password has value, set error
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      }
    }

    // Email availability check with debounce
    if (field === "email" && typeof value === "string") {
      setEmailAvailable(null);

      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      if (value && UserRegistrationService.validateEmail(value)) {
        emailCheckTimeoutRef.current = setTimeout(() => {
          checkEmailAvailability(value);
        }, 500);
      }
    }
  };

  /**
   * Check email availability
   */
  const checkEmailAvailability = async (email: string) => {
    if (!mounted.current) return;

    setIsCheckingEmail(true);

    try {
      const response = await UserRegistrationService.checkEmailAvailability(
        email
      );

      if (!mounted.current) return;

      if (isSuccessResponse(response)) {
        setEmailAvailable(response.data.available);
        if (!response.data.available) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered. Try logging in instead.",
          }));
        }
      }
    } catch (error) {
      console.error("Email availability check failed:", error);
    } finally {
      if (mounted.current) {
        setIsCheckingEmail(false);
      }
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!UserRegistrationService.validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (emailAvailable === false) {
      newErrors.email = "This email is already registered";
    }

    // Password validation
    const passwordValidation = validatePasswordWithDetails(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    } else if (!UserRegistrationService.validateFullName(formData.fullName)) {
      newErrors.fullName =
        "Please enter a valid full name (2-100 characters, letters only)";
    }

    // Mobile number validation (optional)
    if (
      formData.mobileNumber &&
      !UserRegistrationService.validateMobileNumber(formData.mobileNumber)
    ) {
      newErrors.mobileNumber =
        "Please enter a valid mobile number (+1234567890)";
    }

    // Terms acceptance validation
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle back button click
   */

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    setErrors({});

    try {
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim() || undefined,
        acceptedTerms: formData.acceptedTerms,
      };

      const response = await UserRegistrationService.register(registrationData);

      if (isSuccessResponse(response)) {
        showSuccess(
          "Account Created",
          "Your account has been created successfully!"
        );
        onSuccess?.(response.data.user, response.data.tokens);
      } else {
        const errorMessage =
          response.error || "Registration failed. Please try again.";
        showError("Registration Failed", errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      showError("Registration Error", errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto relative ${className}`}>
      {/* Header */}
      <div className="text-center mb-space-8">
        <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Create Account
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-400">
          Join AirVikBook to start booking amazing hotels
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg sm:shadow-lg sm:p-space-6 sm:card-auth">
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-space-4" noValidate>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
            >
              Email Address <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
                placeholder="your.email@example.com"
                disabled={isLoading}
                autoComplete="email"
              />

              {/* Email checking indicator */}
              {isCheckingEmail && (
                <div className="absolute right-space-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-airvik-blue border-t-transparent rounded-radius-full" />
                </div>
              )}

              {/* Email availability indicator */}
              {emailAvailable === true && (
                <div className="absolute right-space-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            {errors.email && (
              <p className="mt-space-1 text-caption text-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
            >
              Full Name <span className="text-error">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
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
                  errors.fullName
                    ? "border-error focus:ring-1 focus:ring-error"
                    : "border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
                }`}
              placeholder="John Doe"
              disabled={isLoading}
              autoComplete="name"
            />
            {errors.fullName && (
              <p className="mt-space-1 text-caption text-error">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Mobile Number Field */}
          <div>
            <label
              htmlFor="mobileNumber"
              className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
            >
              Mobile Number
              <span className="text-gray-400 text-caption ml-space-1">
                (optional)
              </span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) =>
                handleInputChange("mobileNumber", e.target.value)
              }
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
                  errors.mobileNumber
                    ? "border-error focus:ring-1 focus:ring-error"
                    : "border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
                }`}
              placeholder="+1234567890"
              disabled={isLoading}
              autoComplete="tel"
            />
            {errors.mobileNumber && (
              <p className="mt-space-1 text-caption text-error">
                {errors.mobileNumber}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
            >
              Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-space-4 pr-12 py-space-3 shadow-none
            text-body font-sf-pro 
            bg-airvik-white dark:bg-gray-100 
            rounded-radius-md 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-200 
            disabled:text-gray-500 dark:disabled:text-gray-400
            disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
                  ${
                    errors.password
                      ? "border-error focus:ring-1 focus:ring-error"
                      : "border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
                  }`}
                placeholder="Enter a strong password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-space-3 top-1/2 transform -translate-y-1/2
              p-space-2 rounded-radius-sm
              text-gray-500 dark:text-gray-400
              hover:text-gray-700 dark:hover:text-gray-200
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-normal"
                disabled={isLoading}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-space-1 text-caption text-error">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
            >
              Confirm Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-space-4 pr-12 py-space-3 shadow-none
            text-body font-sf-pro 
            bg-airvik-white dark:bg-gray-100 
            rounded-radius-md 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-200 
            disabled:text-gray-500 dark:disabled:text-gray-400
            disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
                  ${
                    errors.confirmPassword
                      ? "border-error focus:ring-1 focus:ring-error"
                      : "border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
                  }`}
                placeholder="Confirm your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-space-3 top-1/2 transform -translate-y-1/2
              p-space-2 rounded-radius-sm
              text-gray-500 dark:text-gray-400
              hover:text-gray-700 dark:hover:text-gray-200
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-normal"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-space-1 text-caption text-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div>
            <Checkbox
              id="acceptedTerms"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={(checked) =>
                handleInputChange("acceptedTerms", checked)
              }
              disabled={isLoading}
              required={true}
              error={!!errors.acceptedTerms}
              label={
                <>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-airvik-blue underline transition-colors duration-normal"
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-airvik-blue underline transition-colors duration-normal"
                  >
                    Privacy Policy
                  </a>
                </>
              }
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || emailAvailable === false}
            className="w-full bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-linear focus:outline-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-airvik-white border-t-transparent rounded-radius-full mr-space-2" />
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        
        {/* Divider */}
        <div className="relative my-space-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-space-2 bg-airvik-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-space-4">
          <GoogleOAuthRedirectButton
            type="register"
            redirectTo="/dashboard"
            disabled={isLoading}
          >
            Sign up with Google
          </GoogleOAuthRedirectButton>
        </div>


        {/* Login Link */}
        <div className="mt-space-4 text-center">
          <p className="text-body text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-airvik-blue transition-colors duration-normal"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
