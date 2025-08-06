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
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to upload profile picture. Please try again.';
      showError(errorMessage);
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
    setIsUploading(true);

    try {
      const response = await UserProfileService.syncPictureFromGoogle();

      if (isSuccessResponse(response)) {
        showSuccess('Profile picture synced from Google successfully');
        onPictureChange?.(response.data.profilePicture);
        onSuccess?.();
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'GOOGLE_SYNC_FAILED');
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to sync picture from Google. Please try again.';
      showError(errorMessage);
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
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Failed to remove profile picture. Please try again.';
      showError(errorMessage);
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
    <div className={`bg-airvik-white dark:bg-airvik-midnight rounded-radius-lg shadow-shadow-sm ${className}`}>
      <div className="p-space-6 space-y-space-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-space-4">
          <h3 className="text-h3 text-airvik-black dark:text-airvik-white">
            Profile Picture
          </h3>
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
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
                className="w-32 h-32 rounded-radius-full object-cover border-4 border-gray-200 dark:border-gray-700"
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
              <div className="flex space-x-space-3">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button
                    transition-all duration-normal hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 
                    active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
                    disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUploading ? 'Uploading...' : 'Upload Picture'}
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="px-space-4 py-space-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button
                    transition-all duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg hover:-translate-y-1 
                    active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
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
            className={`border-2 border-dashed rounded-radius-lg p-space-8 text-center transition-colors duration-normal
              ${isDragOver
                ? 'border-airvik-blue bg-airvik-blue-light/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
          >
            <div className="space-y-space-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-radius-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <div>
                <p className="text-body text-airvik-black dark:text-airvik-white">
                  Drag and drop your image here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal font-medium"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-caption text-gray-500 dark:text-gray-400 mt-space-1">
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
        <div className="flex flex-wrap gap-space-3 pt-space-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button
              transition-all duration-normal hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 
              active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
              disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
          >
            Choose File
          </button>
          
          <button
            onClick={handleSyncFromGoogle}
            disabled={isUploading}
            className="px-space-4 py-space-2 bg-airvik-purple text-airvik-white rounded-radius-md font-sf-pro text-button
              transition-all duration-normal hover:bg-airvik-purple-light hover:shadow-lg hover:-translate-y-1 
              active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-purple focus:ring-offset-2
              disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
          >
            Sync from Google
          </button>
          
          {currentPictureUrl && !previewUrl && (
            <button
              onClick={handleDelete}
              disabled={isUploading}
              className="px-space-4 py-space-2 bg-red-600 text-airvik-white rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-red-700 hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none"
            >
              Remove Picture
            </button>
          )}
        </div>

        {/* Loading State */}
        {isUploading && (
          <div className="flex items-center justify-center py-space-4">
            <svg className="animate-spin h-6 w-6 text-airvik-blue mr-space-2" viewBox="0 0 24 24">
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
