// =====================================================
// IMAGE UPLOAD HOOK
// =====================================================
// State management for image uploads with progress tracking

import { useState, useCallback, useRef } from 'react';
import { 
  validateImage, 
  validateImageDimensions, 
  getImageDimensions, 
  resizeImage, 
  cropToSquare,
  formatFileSize,
  ImageMetadata 
} from '../utils/imageOptimization';

// =====================================================
// TYPES
// =====================================================

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  metadata: ImageMetadata | null;
  previewUrl: string | null;
}

export interface UploadOptions {
  autoResize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  autoCrop?: boolean;
  cropSize?: number;
  quality?: number;
}

export interface UseImageUploadReturn {
  // State
  uploadState: UploadState;
  
  // Actions
  selectFile: (file: File) => Promise<boolean>;
  uploadFile: (onUpload: (file: File) => Promise<void>) => Promise<void>;
  clearUpload: () => void;
  setError: (error: string) => void;
  
  // Utilities
  isFileSelected: boolean;
  canUpload: boolean;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export const useImageUpload = (options: UploadOptions = {}): UseImageUploadReturn => {
  const {
    autoResize = true,
    maxWidth = 800,
    maxHeight = 800,
    autoCrop = false,
    cropSize = 400,
    quality = 0.8
  } = options;

  // =====================================================
  // STATE
  // =====================================================

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    metadata: null,
    previewUrl: null
  });

  const selectedFileRef = useRef<File | null>(null);
  const processedFileRef = useRef<File | null>(null);

  // =====================================================
  // FILE SELECTION
  // =====================================================

  const selectFile = useCallback(async (file: File): Promise<boolean> => {
    try {
      // Clear previous state
      setUploadState(prev => ({
        ...prev,
        error: null,
        progress: 0
      }));

      // Validate file
      const validation = validateImage(file);
      if (!validation.valid) {
        setUploadState(prev => ({
          ...prev,
          error: validation.error || 'Invalid file'
        }));
        return false;
      }

      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Validate dimensions
      const dimensionValidation = validateImageDimensions(dimensions);
      if (!dimensionValidation.valid) {
        setUploadState(prev => ({
          ...prev,
          error: dimensionValidation.error || 'Invalid image dimensions'
        }));
        return false;
      }

      // Store original file
      selectedFileRef.current = file;

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Get metadata
      const metadata: ImageMetadata = {
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };

      // Process file if needed
      let processedFile = file;
      
      if (autoResize && (dimensions.width > maxWidth || dimensions.height > maxHeight)) {
        processedFile = await resizeImage(file, maxWidth, maxHeight, quality);
      }
      
      if (autoCrop && dimensions.width !== dimensions.height) {
        processedFile = await cropToSquare(processedFile, cropSize, quality);
      }

      // Store processed file
      processedFileRef.current = processedFile;

      // Update state
      setUploadState(prev => ({
        ...prev,
        metadata,
        previewUrl,
        error: null
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      setUploadState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return false;
    }
  }, [autoResize, maxWidth, maxHeight, autoCrop, cropSize, quality]);

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const uploadFile = useCallback(async (onUpload: (file: File) => Promise<void>): Promise<void> => {
    const file = processedFileRef.current || selectedFileRef.current;
    
    if (!file) {
      setUploadState(prev => ({
        ...prev,
        error: 'No file selected for upload'
      }));
      return;
    }

    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null
      }));

      // Simulate upload progress (in real implementation, this would come from XMLHttpRequest or fetch)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      // Perform upload
      await onUpload(file);

      // Complete progress
      clearInterval(progressInterval);
      setUploadState(prev => ({
        ...prev,
        progress: 100,
        isUploading: false
      }));

      // Clear preview URL after successful upload
      setTimeout(() => {
        if (uploadState.previewUrl) {
          URL.revokeObjectURL(uploadState.previewUrl);
        }
        setUploadState(prev => ({
          ...prev,
          previewUrl: null,
          metadata: null
        }));
        selectedFileRef.current = null;
        processedFileRef.current = null;
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }));
    }
  }, [uploadState.previewUrl]);

  // =====================================================
  // UTILITIES
  // =====================================================

  const clearUpload = useCallback(() => {
    // Clear preview URL
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }

    // Reset state
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      metadata: null,
      previewUrl: null
    });

    // Clear file references
    selectedFileRef.current = null;
    processedFileRef.current = null;
  }, [uploadState.previewUrl]);

  const setError = useCallback((error: string) => {
    setUploadState(prev => ({
      ...prev,
      error
    }));
  }, []);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const isFileSelected = Boolean(selectedFileRef.current);
  const canUpload = isFileSelected && !uploadState.isUploading && !uploadState.error;

  // =====================================================
  // RETURN VALUE
  // =====================================================

  return {
    uploadState,
    selectFile,
    uploadFile,
    clearUpload,
    setError,
    isFileSelected,
    canUpload
  };
};

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook for drag and drop functionality
 */
export const useDragAndDrop = (
  onFileSelect: (file: File) => Promise<boolean>,
  accept: string = 'image/*'
) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setDragError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
      setDragError('No files dropped');
      return;
    }

    if (files.length > 1) {
      setDragError('Please drop only one file');
      return;
    }

    const file = files[0];
    
    // Check if file type is accepted
    if (!file.type.match(accept.replace('*', '.*'))) {
      setDragError('Invalid file type');
      return;
    }

    try {
      const success = await onFileSelect(file);
      if (!success) {
        setDragError('Failed to process file');
      }
    } catch (error) {
      setDragError('Error processing file');
    }
  }, [onFileSelect, accept]);

  return {
    isDragOver,
    dragError,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};

/**
 * Hook for file input handling
 */
export const useFileInput = (onFileSelect: (file: File) => Promise<boolean>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await onFileSelect(file);

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelect]);

  return {
    fileInputRef,
    openFileDialog,
    handleFileChange
  };
};
