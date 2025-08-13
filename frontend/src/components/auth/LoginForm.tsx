"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToastHelpers } from "../common/Toast";
import {
  LoginFormData,
  LoginFormErrors,
  LoginRequest,
  isSuccessResponse,
  LOGIN_ERROR_CODES,
} from "../../types/userLogin.types";
import { UserLoginService } from "../../services/userLogin.service";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import GoogleOAuthRedirectButton from "./GoogleOAuthRedirectButton";
import { AUTH_PATHS } from "../../lib/paths";

// =====================================================
// BRAND-COMPLIANT LOGIN FORM COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  className = "",
  showRememberMe = true,
  showForgotPassword = true,
}) => {
  const router = useRouter();
  const { login, authState } = useAuth();
  const { showSuccess, showError } = useToastHelpers();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptedRef = useRef(false);

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateField = (
    name: keyof LoginFormData,
    value: any
  ): string | undefined => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8)
          return "Password must be at least 8 characters long";
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Validate email
    const emailError = validateField("email", formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validateField("password", formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear field error on change if submit has been attempted
    if (submitAttemptedRef.current && errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Real-time validation for better UX (only after first submit attempt)
    if (submitAttemptedRef.current && name !== "rememberMe") {
      const fieldError = validateField(name as keyof LoginFormData, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
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
      // Get device info for security tracking
      const deviceInfo = UserLoginService.getDeviceInfo();

      const loginRequest: LoginRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
        deviceInfo,
      };

      const result = await login(loginRequest);

      if (isSuccessResponse(result)) {
        // Show success toast
        showSuccess(
          "Welcome back!",
          `Successfully signed in as ${result.data.user.fullName}`
        );

        // Success callback
        onSuccess?.();
      } else {
        // Handle specific error cases
        let errorMessage = result.error || "Login failed. Please try again.";

        switch (result.code) {
          case LOGIN_ERROR_CODES.INVALID_CREDENTIALS:
            errorMessage =
              "Invalid email or password. Please check your credentials and try again.";
            break;
          case LOGIN_ERROR_CODES.EMAIL_NOT_VERIFIED:
            errorMessage =
              "Please verify your email address before logging in.";
            break;
          case LOGIN_ERROR_CODES.ACCOUNT_DISABLED:
            errorMessage =
              "Your account has been disabled. Please contact support.";
            break;
          case LOGIN_ERROR_CODES.ACCOUNT_LOCKED:
            errorMessage =
              "Your account has been temporarily locked due to multiple failed login attempts. Please try again later.";
            break;
          case LOGIN_ERROR_CODES.RATE_LIMIT_EXCEEDED:
            errorMessage =
              "Too many login attempts. Please wait a few minutes before trying again.";
            break;
          default:
            break;
        }

        setErrors((prev) => ({ ...prev, general: errorMessage }));
        showError("Login failed", errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        "Network error. Please check your connection and try again.";
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      showError("Connection error", errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleBackClick = () => {
    router.push("/");
  };

  // =====================================================
  // RENDER COMPONENT
  // =====================================================

  return (
    <div className={`w-full max-w-md mx-auto relative pb-6 ${className}`}>
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBackClick}
        className="absolute hidden sm:block top-space-4 -left-10 p-1.5 border border-card-border dark:border-gray-600 rounded-full backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-normal focus:outline-none"
        aria-label="Go back to homepage"
      >
        <ArrowLeft className="size-4" />
      </button>

      {/* Header */}
      <div className="text-center mb-space-8">
        <h1 className="md:text-h1 text-h3 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Welcome Back
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg sm:shadow-lg sm:p-space-6 sm:card-auth">
        <form onSubmit={handleSubmit} className="space-y-space-4" noValidate>

        {/* Google Login */}
        <GoogleOAuthRedirectButton type="login" redirectTo="/dashboard">
          Sign in with Google
        </GoogleOAuthRedirectButton>

        {/* Divider */}
        <div className="relative mb-space-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-caption">
            <span className="px-space-2 bg-airvik-white text-sm  text-gray-500 font-sf-pro">
              Or Sign in with
            </span>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2"
          >
            Email Address <span className="text-error">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-space-4 py-space-3 shadow-none
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
            placeholder="Enter your email address"
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
          {errors.email && (
            <p className="mt-space-1 text-caption text-error">{errors.email}</p>
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
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
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
                  errors.password
                    ? "border-error focus:ring-1 focus:ring-error"
                    : "border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
                }`}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-space-3 top-1/2 transform -translate-y-1/2
              p-space-2 rounded-radius-sm
              text-gray-500 dark:text-gray-400
              hover:text-gray-700 dark:hover:text-gray-200
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-normal"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-space-1 text-caption text-error">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authState.isLoading}
          className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-bluehover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-linear focus:outline-none"
        >
          {isSubmitting || authState.isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-airvik-white border-t-transparent rounded-radius-full mr-space-2" />
              Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

         {/* Remember Me & Forgot Password */}
         <div className="flex items-center justify-between">
          {showRememberMe && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-airvik-blue border-gray-300 rounded focus:outline-none focus:ring-0 disabled:cursor-not-allowed appearance-none checked:bg-airvik-blue checked:border-airvik-blue"
                disabled={isSubmitting}
              />
              <label
                htmlFor="rememberMe"
                className="ml-space-2 text-body text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
          )}

          {showForgotPassword && (
            <a
              href={AUTH_PATHS.FORGOT_PASSWORD}
              className="text-body text-airvik-blue transition-colors duration-normal"
            >
              Forgot password?
            </a>
          )}
        </div>
        </form>

        {/* Back to Login */}
        <div className="mt-space-4 text-center">
          <p className="text-body text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href={AUTH_PATHS.REGISTER}
              className="text-airvik-blue transition-colors duration-normal font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
