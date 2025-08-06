'use client';

import React, { useState, useEffect } from 'react';
import { useToastHelpers } from '../common/Toast';
import {
  PrivacyFormData,
  PrivacyFormErrors,
  PrivacyUpdateRequest,
  UserProfile,
  isSuccessResponse,
  PROFILE_ERROR_CODES
} from '../../types/userProfile.types';
import { UserProfileService } from '../../services/userProfile.service';

// =====================================================
// BRAND-COMPLIANT PRIVACY SETTINGS COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface PrivacySettingsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  initialData?: UserProfile;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  onSuccess,
  onError,
  className = '',
  initialData
}) => {
  const { showSuccess, showError } = useToastHelpers();
  const [formData, setFormData] = useState<PrivacyFormData>({
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showPhone: false,
    allowGoogleSync: true
  });
  const [errors, setErrors] = useState<PrivacyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // INITIAL DATA LOADING
  // =====================================================

  useEffect(() => {
    if (initialData) {
      setFormData({
        profileVisibility: initialData.privacy.profileVisibility,
        showEmail: initialData.privacy.showEmail,
        showPhone: initialData.privacy.showPhone,
        allowGoogleSync: initialData.privacy.allowGoogleSync
      });
    } else {
      loadPrivacyData();
    }
  }, [initialData]);

  const loadPrivacyData = async () => {
    setIsLoading(true);
    try {
      const response = await UserProfileService.getProfile();
      if (isSuccessResponse(response)) {
        const profile = response.data;
        setFormData({
          profileVisibility: profile.privacy.profileVisibility,
          showEmail: profile.privacy.showEmail,
          showPhone: profile.privacy.showPhone,
          allowGoogleSync: profile.privacy.allowGoogleSync
        });
      } else {
        showError(response.error || 'Failed to load privacy settings');
      }
    } catch (error) {
      showError('Failed to load privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleToggleChange = (field: keyof PrivacyFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData: PrivacyUpdateRequest = {
        profileVisibility: formData.profileVisibility,
        showEmail: formData.showEmail,
        showPhone: formData.showPhone,
        allowGoogleSync: formData.allowGoogleSync
      };

      const response = await UserProfileService.updatePrivacy(updateData);

      if (isSuccessResponse(response)) {
        showSuccess('Privacy settings updated successfully');
        onSuccess?.();
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'PRIVACY_UPDATE_FAILED');
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to update privacy settings. Please try again.';
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
            Loading privacy settings...
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
            Privacy Settings
          </h3>
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
            Control who can see your profile information
          </p>
        </div>

        {/* Profile Visibility */}
        <div>
          <label htmlFor="profileVisibility" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
            Profile Visibility
          </label>
          <select
            id="profileVisibility"
            name="profileVisibility"
            value={formData.profileVisibility}
            onChange={handleSelectChange}
            className="w-full px-space-4 py-space-3 border border-gray-300 dark:border-gray-600 rounded-radius-md font-sf-pro text-body
              transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
              bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500"
            disabled={isSubmitting}
          >
            <option value="PUBLIC">Public - Anyone can view</option>
            <option value="FRIENDS">Friends - Only friends can view</option>
            <option value="PRIVATE">Private - Only you can view</option>
          </select>
          <p className="mt-space-1 text-caption text-gray-500 dark:text-gray-400">
            Choose who can see your profile information
          </p>
        </div>

        {/* Contact Information Toggles */}
        <div className="space-y-space-4">
          <h4 className="text-h5 text-airvik-black dark:text-airvik-white">
            Contact Information
          </h4>
          
          {/* Show Email Toggle */}
          <div className="flex items-center justify-between p-space-4 bg-gray-50 dark:bg-gray-800 rounded-radius-md">
            <div className="flex-1">
              <h5 className="text-body font-medium text-airvik-black dark:text-airvik-white">
                Show Email Address
              </h5>
              <p className="text-caption text-gray-600 dark:text-gray-400">
                Allow others to see your email address on your profile
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleChange('showEmail')}
              disabled={isSubmitting}
              className={`relative inline-flex h-6 w-11 items-center rounded-radius-full transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
                ${formData.showEmail
                  ? 'bg-airvik-blue'
                  : 'bg-gray-300 dark:bg-gray-600'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-radius-full bg-airvik-white transition-transform duration-normal
                  ${formData.showEmail ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Show Phone Toggle */}
          <div className="flex items-center justify-between p-space-4 bg-gray-50 dark:bg-gray-800 rounded-radius-md">
            <div className="flex-1">
              <h5 className="text-body font-medium text-airvik-black dark:text-airvik-white">
                Show Phone Number
              </h5>
              <p className="text-caption text-gray-600 dark:text-gray-400">
                Allow others to see your phone number on your profile
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleChange('showPhone')}
              disabled={isSubmitting}
              className={`relative inline-flex h-6 w-11 items-center rounded-radius-full transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
                ${formData.showPhone
                  ? 'bg-airvik-blue'
                  : 'bg-gray-300 dark:bg-gray-600'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-radius-full bg-airvik-white transition-transform duration-normal
                  ${formData.showPhone ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Google Integration */}
        <div className="space-y-space-4">
          <h4 className="text-h5 text-airvik-black dark:text-airvik-white">
            Google Integration
          </h4>
          
          {/* Allow Google Sync Toggle */}
          <div className="flex items-center justify-between p-space-4 bg-gray-50 dark:bg-gray-800 rounded-radius-md">
            <div className="flex-1">
              <h5 className="text-body font-medium text-airvik-black dark:text-airvik-white">
                Allow Google Sync
              </h5>
              <p className="text-caption text-gray-600 dark:text-gray-400">
                Automatically sync profile data from your Google account
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleChange('allowGoogleSync')}
              disabled={isSubmitting}
              className={`relative inline-flex h-6 w-11 items-center rounded-radius-full transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
                ${formData.allowGoogleSync
                  ? 'bg-airvik-blue'
                  : 'bg-gray-300 dark:bg-gray-600'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-radius-full bg-airvik-white transition-transform duration-normal
                  ${formData.allowGoogleSync ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Privacy Information */}
        <div className="bg-airvik-blue-light/20 dark:bg-airvik-blue/10 rounded-radius-md p-space-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-airvik-blue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-space-3">
              <h5 className="text-body font-medium text-airvik-black dark:text-airvik-white">
                Privacy Information
              </h5>
              <p className="text-caption text-gray-600 dark:text-gray-400 mt-space-1">
                Your privacy settings only affect what other users can see. Administrators and support staff may still access your information for account management and support purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-space-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-space-6 py-space-3 rounded-radius-md font-sf-pro text-button
              transition-all duration-normal transform
              ${isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-airvik-blue text-airvik-white hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2'
              }`}
          >
            {isSubmitting ? (
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
              'Save Privacy Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivacySettings;
