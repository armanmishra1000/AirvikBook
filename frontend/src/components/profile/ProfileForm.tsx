'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToastHelpers } from '../common/Toast';
import {
  ProfileFormData,
  ProfileFormErrors,
  ProfileUpdateRequest,
  UserProfile,
  isSuccessResponse,
  PROFILE_ERROR_CODES
} from '../../types/userProfile.types';
import { UserProfileService } from '../../services/userProfile.service';
import useProfileValidation from '../../hooks/useProfileValidation';
import { FieldValidation, ValidationSummary } from './ValidationMessage';

// =====================================================
// BRAND-COMPLIANT PROFILE FORM COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface ProfileFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  initialData?: UserProfile;
  // Optional: bubble current form data to parent for live preview/analytics
  onChange?: (data: ProfileFormData) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSuccess,
  onError,
  className = '',
  initialData,
  onChange
}) => {
  const { authState } = useAuth();
  const { showSuccess, showError } = useToastHelpers();
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    mobileNumber: '',
    bio: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    occupation: '',
    website: '',
    location: ''
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const submitAttemptedRef = useRef(false);

  // Enhanced validation hook
  const {
    errors: validationErrors,
    isValid: isFormValid,
    isValidating,
    hasChanges,
    validateField: validateFieldHook,
    validateAllFields,
    clearErrors: clearValidationErrors,
    sanitizeData
  } = useProfileValidation({
    initialData: initialData as any,
    enableRealTimeValidation: true,
    debounceMs: 300
  });

  // =====================================================
  // INITIAL DATA LOADING
  // =====================================================

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        mobileNumber: initialData.mobileNumber || '',
        bio: initialData.bio || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        occupation: initialData.occupation || '',
        website: initialData.website || '',
        location: initialData.location || ''
      });
      // Notify parent with initial values for live preview
      onChange?.({
        fullName: initialData.fullName || '',
        mobileNumber: initialData.mobileNumber || '',
        bio: initialData.bio || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: initialData.gender || '',
        nationality: initialData.nationality || '',
        occupation: initialData.occupation || '',
        website: initialData.website || '',
        location: initialData.location || ''
      });
    } else {
      loadProfileData();
    }
  }, [initialData]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await UserProfileService.getProfile();
      if (isSuccessResponse(response)) {
        const profile = response.data;
        setFormData({
          fullName: profile.fullName || '',
          mobileNumber: profile.mobileNumber || '',
          bio: profile.bio || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
          gender: profile.gender || '',
          nationality: profile.nationality || '',
          occupation: profile.occupation || '',
          website: profile.website || '',
          location: profile.location || ''
        });
        onChange?.({
          fullName: profile.fullName || '',
          mobileNumber: profile.mobileNumber || '',
          bio: profile.bio || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
          gender: profile.gender || '',
          nationality: profile.nationality || '',
          occupation: profile.occupation || '',
          website: profile.website || '',
          location: profile.location || ''
        });
      } else {
        showError(response.error || 'Failed to load profile data');
      }
    } catch (error) {
      showError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  // Note: Validation is now handled by the useProfileValidation hook
  // This local validation function is kept for backward compatibility but not used
  const validateField = (name: keyof ProfileFormData, value: any): string | undefined => {
    return undefined; // All validation is handled by the hook
  };

  // Note: Form validation is now handled by the useProfileValidation hook
  const validateForm = (): boolean => {
    return isFormValid; // Use the validation state from the hook
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Notify parent of changes for live preview
    onChange?.({
      ...formData,
      [name]: value
    });

    // Real-time validation with the new hook
    validateFieldHook(name as keyof ProfileUpdateRequest, value);

    // Clear field error on change if submit has been attempted
    if (submitAttemptedRef.current && errors[name as keyof ProfileFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitAttemptedRef.current = true;

    // Prevent duplicate submissions while a request is in flight
    if (isSubmitting) {
      return;
    }

    // Create update data from form
    const normalizeDate = (value?: string): string | undefined => {
      if (!value) return undefined;
      // Accept both YYYY-MM-DD and DD-MM-YYYY; convert the latter to ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; // already ISO
      if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        const [dd, mm, yyyy] = value.split('-');
        return `${yyyy}-${mm}-${dd}`;
      }
      return value; // fallback; backend will validate
    };
    const updateData: ProfileUpdateRequest = {
      fullName: formData.fullName.trim(),
      mobileNumber: formData.mobileNumber.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      dateOfBirth: normalizeDate(formData.dateOfBirth),
      gender: formData.gender || undefined,
      nationality: formData.nationality || undefined,
      occupation: formData.occupation || undefined,
      website: formData.website.trim() || undefined,
      location: formData.location.trim() || undefined
    };

    // Validate with the enhanced hook
    const currentErrors = validateAllFields(updateData);
    if (Object.keys(currentErrors).length > 0) {
      onError?.('Please fix the errors in the form');
      return;
    }

    // Sanitize data before submission
    const sanitizedData = sanitizeData(updateData);

    setIsSubmitting(true);

    try {
      // Ensure dateOfBirth is sent as 'YYYY-MM-DD' (string) to align with backend parsing
      const normalizedData = {
        ...sanitizedData,
        dateOfBirth: sanitizedData.dateOfBirth || undefined
      };
      
      const response = await UserProfileService.updateProfile(normalizedData);

      if (isSuccessResponse(response)) {
        showSuccess('Profile updated successfully');
        onSuccess?.();
      } else {
        // Use the specific error message from the response if available
        const errorMessage = response.error || UserProfileService.getErrorMessage(response.code || 'PROFILE_UPDATE_FAILED');
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to update profile. Please try again.';
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (isLoading) {
    return (
      <div className={`bg-airvik-white dark:bg-airvik-midnight rounded-radius-lg shadow-shadow-sm p-space-6 ${className}`}>
        <div className="flex items-center justify-center py-space-12">
          <svg className="w-8 h-8 animate-spin text-airvik-blue" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-space-3 text-body text-airvik-black dark:text-airvik-white">
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-airvik-white dark:bg-airvik-midnight rounded-radius-lg shadow-shadow-sm ${className}`}>
      <form onSubmit={handleSubmit} className="p-space-6 space-y-space-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4">
          <h3 className="text-h3 text-airvik-black dark:text-airvik-white">
            Profile Information
          </h3>
          <p className="text-gray-600 text-body dark:text-gray-400 mt-space-2">
            Update your personal information and preferences
          </p>
        </div>



        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
              ${(errors.fullName || validationErrors.fullName)
                ? 'border-error focus:ring-1 focus:ring-error'  
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400'
              }`}
            placeholder="Enter your full name"
            disabled={isSubmitting}
            required
          />
          {(errors.fullName || validationErrors.fullName) && (
            <p className="mt-space-1 text-caption text-error">
              {errors.fullName || validationErrors.fullName}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNumber" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            className={`w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
              ${errors.mobileNumber 
                ? 'border-error focus:ring-1 focus:ring-error' 
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400'
              }`}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          {errors.mobileNumber && (
            <p className="mt-space-1 text-caption text-error">
              {errors.mobileNumber}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue resize-none
              ${errors.bio 
                ? 'border-error focus:ring-1 focus:ring-error' 
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400'
              }`}
            placeholder="Tell us about yourself..."
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-space-1">
            {errors.bio && (
              <p className="text-caption text-error">
                {errors.bio}
              </p>
            )}
            <p className="ml-auto text-gray-500 text-caption dark:text-gray-400">
              {formData.bio.length}/500
            </p>
          </div>
        </div>

        {/* Date of Birth and Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
          <div>
            <label htmlFor="dateOfBirth" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
                ${errors.dateOfBirth 
                  ? 'border-error focus:ring-1 focus:ring-error' 
                  : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400'
                }`}
              disabled={isSubmitting}
            />
            {errors.dateOfBirth && (
              <p className="mt-space-1 text-caption text-error">
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
                border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400`}
              disabled={isSubmitting}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Nationality and Occupation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
          <div>
            <label htmlFor="nationality" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Nationality
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className="w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
              placeholder="e.g., United States"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="occupation" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Occupation
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
              placeholder="e.g., Software Engineer"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Website and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4">
          <div>
            <label htmlFor="website" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={`w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue
                ${errors.website 
                  ? 'border-error focus:ring-1 focus:ring-error' 
                  : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400'
                }`}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="mt-space-1 text-caption text-error">
                {errors.website}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-space-4 py-space-3 shadow-none text-body font-sf-pro bg-airvik-white dark:bg-gray-100 rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed focus:border-airvik-blue focus:ring-2 focus:ring-airvik-blue border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400"
              placeholder="e.g., San Francisco, CA"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end border-t border-gray-200 pt-space-4 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting || authState.isLoading || (!isFormValid && submitAttemptedRef.current)}
            className={`px-space-6 py-space-3 rounded-radius-md font-sf-pro text-button
              ${(isSubmitting || authState.isLoading || (!isFormValid && submitAttemptedRef.current))
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white  focus:outline-none  focus:ring-airvik-blue focus:ring-offset-2'
              }`}
          >
            {isSubmitting || authState.isLoading ? (
              <div className="flex items-center">
                <svg className="w-4 h-4 animate-spin mr-space-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
