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
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSuccess,
  onError,
  className = '',
  initialData
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

  const validateField = (name: keyof ProfileFormData, value: any): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (value.trim().length > 100) return 'Full name must be less than 100 characters';
        return undefined;

      case 'mobileNumber':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        return undefined;

      case 'bio':
        if (value && value.length > 500) return 'Bio must be less than 500 characters';
        return undefined;

      case 'website':
        if (value && !/^https?:\/\/.+/.test(value)) {
          return 'Website must be a valid URL starting with http:// or https://';
        }
        return undefined;

      case 'dateOfBirth':
        if (value) {
          const date = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          if (age < 13 || age > 120) {
            return 'Date of birth must be for someone between 13 and 120 years old';
          }
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};
    
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof ProfileFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error && error.length > 0) newErrors[fieldName] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    const updateData: ProfileUpdateRequest = {
      fullName: formData.fullName.trim(),
      mobileNumber: formData.mobileNumber.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      nationality: formData.nationality || undefined,
      occupation: formData.occupation || undefined,
      website: formData.website.trim() || undefined,
      location: formData.location.trim() || undefined
    };

    // Validate with the enhanced hook
    const currentErrors = validateAllFields(updateData);
    if (Object.keys(currentErrors).length > 0) {
      showError('Please fix the errors in the form');
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
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'PROFILE_UPDATE_FAILED');
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to update profile. Please try again.';
      showError(errorMessage);
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
          <svg className="animate-spin h-8 w-8 text-airvik-blue" viewBox="0 0 24 24">
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
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
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
            className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
              focus:outline-none
              ${(errors.fullName || validationErrors.fullName)
                ? 'border-error focus:outline-none focus:ring-0 focus:border-error'  
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-airvik-blue'
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
            className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
              transition-colors duration-normal focus:outline-none
              ${errors.mobileNumber 
                ? 'border-error focus:outline-none focus:ring-0 focus:border-error' 
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-airvik-blue'
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
            className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
              transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue resize-none
              ${errors.bio 
                ? 'border-error focus:outline-none focus:ring-0 focus:border-error' 
                : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-airvik-blue'
              }`}
            placeholder="Tell us about yourself..."
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-space-1">
            {errors.bio && (
              <p className="text-caption text-error">
                {errors.bio}
              </p>
            )}
            <p className="text-caption text-gray-500 dark:text-gray-400 ml-auto">
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
              className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                ${errors.dateOfBirth 
                  ? 'border-error focus:outline-none focus:ring-0 focus:border-error' 
                  : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-airvik-blue'
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
              className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500`}
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
              className="w-full px-space-4 py-space-3 border border-gray-300 dark:border-gray-600 rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500"
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
              className="w-full px-space-4 py-space-3 border border-gray-300 dark:border-gray-600 rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500"
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
              className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                ${errors.website 
                  ? 'border-error focus:outline-none focus:ring-0 focus:border-error' 
                  : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-airvik-blue'
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
              className="w-full px-space-4 py-space-3 border border-gray-300 dark:border-gray-600 rounded-radius-md font-sf-pro text-body
                transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
                bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500"
              placeholder="e.g., San Francisco, CA"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-space-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting || authState.isLoading || (!isFormValid && submitAttemptedRef.current)}
            className={`px-space-6 py-space-3 rounded-radius-md font-sf-pro text-button
              transition-all duration-normal transform
              ${(isSubmitting || authState.isLoading || (!isFormValid && submitAttemptedRef.current))
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-airvik-blue text-airvik-white hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2'
              }`}
          >
            {isSubmitting || authState.isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-space-2" viewBox="0 0 24 24">
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
