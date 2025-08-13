'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useToastHelpers } from '../common/Toast';
import {
  isSuccessResponse,
  PROFILE_ERROR_CODES
} from '../../types/userProfile.types';
import { UserProfileService } from '../../services/userProfile.service';

// =====================================================
// BRAND-COMPLIANT PROFILE PICTURE UPLOAD COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface ProfilePictureUploadProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  currentPictureUrl?: string;
  onPictureChange?: (url: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  onSuccess,
  onError,
  className = '',
  currentPictureUrl,
  onPictureChange
}) => {
  const { showSuccess, showError } = useToastHelpers();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =====================================================
  // FILE HANDLING
  // =====================================================

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    return UserProfileService.validateProfilePictureFile(file);
  };

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      showError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [showError]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // =====================================================
  // DRAG AND DROP HANDLERS
  // =====================================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      showError('Please select an image file');
    }
  }, [handleFileSelect, showError]);

  // =====================================================
  // UPLOAD HANDLERS
  // =====================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const response = await UserProfileService.uploadProfilePicture(selectedFile);

      if (isSuccessResponse(response)) {
        showSuccess('Profile picture uploaded successfully');
        onPictureChange?.(response.data.profilePicture);
        onSuccess?.();
        
        // Reset state
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'FILE_UPLOAD_FAILED');
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to upload profile picture. Please try again.';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSyncFromGoogle = async () => {
    const now = Date.now();
    if (isUploading || now < cooldownUntil) {
      return;
    }
    setIsUploading(true);

    try {
      const response = await UserProfileService.syncPictureFromGoogle();

      if (isSuccessResponse(response)) {
        showSuccess('Profile picture synced from Google successfully');
        onPictureChange?.(response.data.profilePicture);
        onSuccess?.();
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'GOOGLE_SYNC_FAILED');
        // If rate limited, apply a short local cooldown to prevent spam clicks
        if (response.code === 'RATE_LIMIT_EXCEEDED') {
          setCooldownUntil(Date.now() + 15000); // 15s client cooldown
        }
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to sync picture from Google. Please try again.';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);

    try {
      const response = await UserProfileService.deleteProfilePicture();

      if (isSuccessResponse(response)) {
        showSuccess('Profile picture removed successfully');
        onPictureChange?.('');
        onSuccess?.();
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'FILE_DELETE_FAILED');
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to remove profile picture. Please try again.';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  const displayUrl = previewUrl || currentPictureUrl;

  return (
    <div className={`bg-airvik-white dark:bg-airvik-midnight rounded-radius-lg  border border-gray-200 dark:border-gray-400 shadow-shadow-sm ${className}`}>
      <div className="p-space-4 lg:p-space-8 space-y-space-8 lg:space-y-space-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4">
          <h3 className="text-h4 lg:text-h3 text-airvik-black dark:text-airvik-white">
            Profile Picture
          </h3>
          <p className="text-gray-600 text-body-sm lg:text-body dark:text-gray-400 mt-space-2">
            Upload or sync your profile picture
          </p>
        </div>

        {/* Current Picture Display */}
        {displayUrl && (
          <div className="flex flex-col items-center space-y-space-4">
            <div className="relative">
              <img
                src={displayUrl}
                alt="Profile picture"
                className="object-cover w-24 h-24 sm:w-32 sm:h-32 border-4 border-gray-200 rounded-radius-full dark:border-gray-700"
              />
              {previewUrl && (
                <div className="absolute -top-2 -right-2 bg-airvik-blue text-airvik-white rounded-radius-full p-space-1">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {previewUrl && (
              <div className="flex flex-col sm:flex-row space-y-space-2 sm:space-y-0 sm:space-x-space-3">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="transition-all px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button duration-normal hover:bg-airvik-purple hover:shadow-lg  active:translate-y-0 focus:outline-none  focus:ring-airvik-blue focus:ring-offset-2 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUploading ? 'Uploading...' : 'Upload Picture'}
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="text-gray-700 transition-all bg-gray-200 px-space-4 py-space-2 dark:bg-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg  active:translate-y-0 focus:outline-none  focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Area */}
        {!previewUrl && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-radius-lg p-space-6 lg:p-space-8 text-center transition-colors duration-normal
              ${isDragOver
                ? 'border-airvik-blue bg-airvik-blue-light/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
          >
            <div className="space-y-space-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-radius-full">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <div>
                <p className="text-body-sm lg:text-body text-airvik-black dark:text-airvik-white">
                  Drag and drop your image here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-medium transition-colors text-airvik-blue hover:text-airvik-purple duration-normal"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-gray-500 text-caption dark:text-gray-400 mt-space-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap border-t border-gray-200 gap-space-3 pt-space-4 dark:border-gray-700">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="transition-all px-space-4 py-space-2 bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button duration-normal focus:outline-none  focus:ring-airvik-blue focus:ring-offset-2 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
          >
            Choose File
          </button>
          
          <button
            onClick={handleSyncFromGoogle}
            disabled={isUploading || Date.now() < cooldownUntil}
            className="transition-all px-space-4 py-space-2 bg-airvik-blue hover:bg-airvik-purple text-airvik-white rounded-radius-md font-sf-pro text-button duration-normal  focus:outline-none  focus:ring-airvik-purple focus:ring-offset-2 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
          >
            {Date.now() < cooldownUntil ? 'Please wait...' : 'Sync from Google'}
          </button>
          
          {currentPictureUrl && !previewUrl && (
            <button
              onClick={handleDelete}
              disabled={isUploading}
              className="transition-all bg-red-600 px-space-4 py-space-2 text-airvik-white rounded-radius-md font-sf-pro text-button duration-normal hover:bg-red-700  focus:outline-none  focus:ring-red-500  disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
            >
              Remove Picture
            </button>
          )}
        </div>

        {/* Loading State */}
        {isUploading && (
          <div className="flex items-center justify-center py-space-4">
            <svg className="w-6 h-6 animate-spin text-airvik-blue mr-space-2" viewBox="0 0 24 24">
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
            <span className="text-body text-airvik-black dark:text-airvik-white">
              Processing...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
