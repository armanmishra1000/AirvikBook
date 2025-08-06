/**
 * Profile Validation Hook
 * 
 * REACT PATTERN REQUIREMENTS:
 * - NO function dependencies in useEffect
 * - Use useRef for one-time operations
 * - Proper error handling and loading states
 * - Real-time validation feedback
 * 
 * ACCESSIBILITY REQUIREMENTS:
 * - Error messages announced by screen readers
 * - Clear validation states
 * - Debounced validation for performance
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ProfileUpdateRequest, 
  PrivacySettings,
  ProfileValidationErrors,
  FileValidationResult
} from '../types/userProfile.types';
import {
  validateProfileData,
  validatePrivacySettings,
  validateProfilePictureFile,
  sanitizeProfileData,
  hasProfileDataChanged,
  getValidationSummary
} from '../utils/profileValidation';

interface UseProfileValidationProps {
  initialData?: ProfileUpdateRequest;
  enableRealTimeValidation?: boolean;
  debounceMs?: number;
}

interface UseProfileValidationReturn {
  errors: ProfileValidationErrors;
  isValid: boolean;
  isValidating: boolean;
  errorCount: number;
  firstError?: string;
  hasChanges: boolean;
  
  // Validation methods
  validateField: (fieldName: keyof ProfileUpdateRequest, value: any) => void;
  validateAllFields: (data: ProfileUpdateRequest) => ProfileValidationErrors;
  validatePrivacy: (settings: PrivacySettings) => { isValid: boolean; errors: Partial<PrivacySettings> };
  validateFile: (file: File) => Promise<FileValidationResult>;
  clearErrors: () => void;
  clearFieldError: (fieldName: keyof ProfileUpdateRequest) => void;
  sanitizeData: (data: ProfileUpdateRequest) => ProfileUpdateRequest;
  checkForChanges: (originalData: any, newData: ProfileUpdateRequest) => boolean;
}

export default function useProfileValidation({
  initialData,
  enableRealTimeValidation = true,
  debounceMs = 300
}: UseProfileValidationProps = {}): UseProfileValidationReturn {
  
  // State for validation errors and status
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Refs for debouncing and preventing unnecessary re-renders
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialDataRef = useRef(initialData);
  const validationInProgressRef = useRef(false);

  // Update initial data ref when prop changes
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  /**
   * Clear debounce timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Validate a single field
   */
  const validateField = useCallback((fieldName: keyof ProfileUpdateRequest, value: any) => {
    if (!enableRealTimeValidation) return;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce validation
    debounceTimeoutRef.current = setTimeout(() => {
      if (validationInProgressRef.current) return;
      
      validationInProgressRef.current = true;
      setIsValidating(true);

      // Create partial data object for validation
      const partialData = { [fieldName]: value } as Partial<ProfileUpdateRequest>;
      const fieldErrors = validateProfileData(partialData as ProfileUpdateRequest);

      setErrors((prevErrors: ProfileValidationErrors) => {
        const newErrors = { ...prevErrors };
        
        // Clear or set error for this field
        if (fieldErrors[fieldName]) {
          newErrors[fieldName] = fieldErrors[fieldName];
        } else {
          delete newErrors[fieldName];
        }

        return newErrors;
      });

      setIsValidating(false);
      validationInProgressRef.current = false;
    }, debounceMs);
  }, [enableRealTimeValidation, debounceMs]);

  /**
   * Validate all fields at once
   */
  const validateAllFields = useCallback((data: ProfileUpdateRequest): ProfileValidationErrors => {
    setIsValidating(true);
    
    const validationErrors = validateProfileData(data);
    setErrors(validationErrors);
    
    // Check for changes if initial data is available
    if (initialDataRef.current) {
      const dataChanged = hasProfileDataChanged(initialDataRef.current, data);
      setHasChanges(dataChanged);
    }
    
    setIsValidating(false);
    return validationErrors;
  }, []);

  /**
   * Validate privacy settings
   */
  const validatePrivacy = useCallback((settings: PrivacySettings) => {
    return validatePrivacySettings(settings);
  }, []);

  /**
   * Validate uploaded file
   */
  const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = await validateProfilePictureFile(file);
      setIsValidating(false);
      return result;
    } catch (error) {
      setIsValidating(false);
      return {
        isValid: false,
        error: 'Failed to validate file. Please try again.',
        code: 'VALIDATION_ERROR'
      };
    }
  }, []);

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setHasChanges(false);
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: keyof ProfileUpdateRequest) => {
    setErrors((prevErrors: ProfileValidationErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Sanitize profile data
   */
  const sanitizeData = useCallback((data: ProfileUpdateRequest): ProfileUpdateRequest => {
    return sanitizeProfileData(data);
  }, []);

  /**
   * Check if data has changed from initial values
   */
  const checkForChanges = useCallback((originalData: any, newData: ProfileUpdateRequest): boolean => {
    const dataChanged = hasProfileDataChanged(originalData, newData);
    setHasChanges(dataChanged);
    return dataChanged;
  }, []);

  // Calculate derived values
  const validationSummary = getValidationSummary(errors);
  const isValid = validationSummary.isValid;
  const errorCount = validationSummary.errorCount;
  const firstError = validationSummary.firstError;

  return {
    // State
    errors,
    isValid,
    isValidating,
    errorCount,
    firstError,
    hasChanges,
    
    // Methods
    validateField,
    validateAllFields,
    validatePrivacy,
    validateFile,
    clearErrors,
    clearFieldError,
    sanitizeData,
    checkForChanges
  };
}

/**
 * Hook for validating privacy settings specifically
 */
export function usePrivacyValidation() {
  const [errors, setErrors] = useState<Partial<PrivacySettings>>({});
  const [isValid, setIsValid] = useState(true);

  const validateSettings = useCallback((settings: PrivacySettings) => {
    const validation = validatePrivacySettings(settings);
    setErrors(validation.errors);
    setIsValid(validation.isValid);
    return validation;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  return {
    errors,
    isValid,
    validateSettings,
    clearErrors
  };
}

/**
 * Hook for file upload validation with progress tracking
 */
export function useFileValidation() {
  const [validation, setValidation] = useState<FileValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
    setIsValidating(true);
    setValidation(null);

    try {
      const result = await validateProfilePictureFile(file);
      setValidation(result);
      setIsValidating(false);
      return result;
    } catch (error) {
      const errorResult: FileValidationResult = {
        isValid: false,
        error: 'Failed to validate file. Please try again.',
        code: 'VALIDATION_ERROR'
      };
      setValidation(errorResult);
      setIsValidating(false);
      return errorResult;
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidation(null);
    setIsValidating(false);
  }, []);

  return {
    validation,
    isValidating,
    validateFile,
    clearValidation,
    isValid: validation?.isValid ?? false,
    error: validation?.error
  };
}
