'use client';

import React, { useState } from 'react';
import { useImageUpload, useDragAndDrop, useFileInput } from '../../hooks/useImageUpload';
import { formatFileSize } from '../../utils/imageOptimization';

// =====================================================
// IMAGE UPLOADER COMPONENT
// =====================================================
// Drag-and-drop image upload with progress tracking

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  className?: string;
  maxSize?: number;
  acceptedTypes?: string[];
  showPreview?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  onError,
  currentImageUrl,
  className = '',
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showPreview = true
}) => {
  // =====================================================
  // STATE
  // =====================================================

  const [isHovered, setIsHovered] = useState(false);

  // =====================================================
  // HOOKS
  // =====================================================

  const {
    uploadState,
    selectFile,
    uploadFile,
    clearUpload,
    setError,
    isFileSelected,
    canUpload
  } = useImageUpload({
    autoResize: true,
    maxWidth: 800,
    maxHeight: 800,
    autoCrop: false,
    quality: 0.8
  });

  const {
    isDragOver,
    dragError,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragAndDrop(selectFile, acceptedTypes.join(','));

  const {
    fileInputRef,
    openFileDialog,
    handleFileChange
  } = useFileInput(selectFile);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleUpload = async () => {
    if (!canUpload) return;

    try {
      await uploadFile(onUpload);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleRemove = () => {
    clearUpload();
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderUploadArea = () => {
    const isActive = isDragOver || isHovered;
    const hasError = uploadState.error || dragError;
    const hasPreview = uploadState.previewUrl || currentImageUrl;

    return (
      <div
        className={`
          relative border-2 border-dashed rounded-radius-lg p-space-8 text-center
          transition-all duration-normal cursor-pointer
          ${isActive 
            ? 'border-airvik-purple bg-airvik-blue-light/10 dark:border-airvik-cyan dark:bg-airvik-cyan/10' 
            : 'border-airvik-blue dark:border-airvik-cyan'
          }
          ${hasError 
            ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20' 
            : ''
          }
          ${hasPreview 
            ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20' 
            : ''
          }
          hover:border-airvik-purple hover:bg-airvik-blue-light/10
          dark:hover:border-airvik-cyan dark:hover:bg-airvik-cyan/10
          focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
          dark:focus:ring-airvik-cyan
          ${className}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        tabIndex={0}
        role="button"
        aria-label="Upload image"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Icon */}
        <div className="mb-space-4">
          {hasPreview ? (
            <div className="w-16 h-16 mx-auto rounded-radius-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          ) : uploadState.isUploading ? (
            <div className="w-16 h-16 mx-auto rounded-radius-full bg-airvik-blue-light dark:bg-airvik-blue/20 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-airvik-blue" viewBox="0 0 24 24">
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
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto rounded-radius-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload Text */}
        <div className="mb-space-4">
          {hasPreview ? (
            <h3 className="text-h5 text-green-800 dark:text-green-200 font-medium">
              Image Ready
            </h3>
          ) : uploadState.isUploading ? (
            <h3 className="text-h5 text-airvik-blue dark:text-airvik-cyan font-medium">
              Uploading...
            </h3>
          ) : (
            <h3 className="text-h5 text-airvik-black dark:text-airvik-white font-medium">
              Upload Profile Picture
            </h3>
          )}
          
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-1">
            {hasPreview 
              ? 'Click to change or drag a new image'
              : uploadState.isUploading
              ? 'Please wait while we upload your image'
              : 'Click to browse or drag and drop an image'
            }
          </p>
        </div>

        {/* File Requirements */}
        {!hasPreview && !uploadState.isUploading && (
          <div className="text-caption text-gray-500 dark:text-gray-400">
            <p>Maximum size: {formatFileSize(maxSize)}</p>
            <p>Formats: JPG, PNG, WebP</p>
          </div>
        )}

        {/* Error Message */}
        {(uploadState.error || dragError) && (
          <div className="mt-space-4 p-space-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md">
            <p className="text-caption text-red-700 dark:text-red-300">
              {uploadState.error || dragError}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {uploadState.isUploading && (
          <div className="mt-space-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-radius-full h-2">
              <div
                className="bg-airvik-blue dark:bg-airvik-cyan h-2 rounded-radius-full transition-all duration-normal"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-caption text-gray-600 dark:text-gray-400 mt-space-2">
              {uploadState.progress}% complete
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {hasPreview && !uploadState.isUploading && (
          <div className="mt-space-4 flex items-center justify-center space-x-space-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={!canUpload}
              className="px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-airvik-blue-dark hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
                dark:bg-airvik-cyan dark:text-airvik-midnight dark:hover:bg-airvik-cyan-dark"
            >
              Upload Image
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="px-space-4 py-space-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-radius-md font-sf-pro text-button
                transition-all duration-normal hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-lg hover:-translate-y-1 
                active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    if (!showPreview || (!uploadState.previewUrl && !currentImageUrl)) return null;

    const imageUrl = uploadState.previewUrl || currentImageUrl;
    const isNewUpload = Boolean(uploadState.previewUrl);

    return (
      <div className="mt-space-6">
        <h4 className="text-h6 text-airvik-black dark:text-airvik-white font-medium mb-space-3">
          {isNewUpload ? 'Preview' : 'Current Image'}
        </h4>
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Profile preview"
            className="w-32 h-32 rounded-radius-full object-cover border-4 border-gray-200 dark:border-gray-600
                     shadow-shadow-md"
          />
          {isNewUpload && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-radius-full">
              <span className="text-caption text-white font-medium">New</span>
            </div>
          )}
        </div>
        
        {/* Image Metadata */}
        {uploadState.metadata && (
          <div className="mt-space-3 text-caption text-gray-600 dark:text-gray-400">
            <p>Size: {formatFileSize(uploadState.metadata.size)}</p>
            <p>Dimensions: {uploadState.metadata.width} × {uploadState.metadata.height}</p>
            <p>Type: {uploadState.metadata.type.split('/')[1].toUpperCase()}</p>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <div className="w-full">
      {renderUploadArea()}
      {renderPreview()}
    </div>
  );
};
