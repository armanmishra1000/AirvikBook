// =====================================================
// IMAGE OPTIMIZATION UTILITIES
// =====================================================
// Client-side image processing and validation

// =====================================================
// TYPES
// =====================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  type: string;
  lastModified: number;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Validate image file for upload
 */
export const validateImage = (file: File): ValidationResult => {
  // Size check (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum size is ${formatFileSize(maxSize)}` 
    };
  }
  
  // Type check
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file format. Please use JPG, PNG, or WebP' 
    };
  }
  
  return { valid: true };
};

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (
  dimensions: ImageDimensions,
  minWidth: number = 100,
  minHeight: number = 100,
  maxWidth: number = 2000,
  maxHeight: number = 2000
): ValidationResult => {
  const { width, height } = dimensions;
  
  if (width < minWidth || height < minHeight) {
    return {
      valid: false,
      error: `Image too small. Minimum dimensions are ${minWidth}x${minHeight} pixels`
    };
  }
  
  if (width > maxWidth || height > maxHeight) {
    return {
      valid: false,
      error: `Image too large. Maximum dimensions are ${maxWidth}x${maxHeight} pixels`
    };
  }
  
  return { valid: true };
};

// =====================================================
// IMAGE PROCESSING
// =====================================================

/**
 * Create a canvas element for image processing
 */
const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Resize image to fit within specified dimensions
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions
      const { width, height } = calculateAspectRatioFit(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      );
      
      // Create canvas and resize
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to create resized image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = url;
  });
};

/**
 * Crop image to square aspect ratio
 */
export const cropToSquare = (
  file: File,
  size: number = 400,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate crop dimensions
      const { x, y, cropSize } = calculateSquareCrop(
        img.naturalWidth,
        img.naturalHeight
      );
      
      // Create canvas and crop
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw cropped image
      ctx.drawImage(
        img,
        x, y, cropSize, cropSize, // Source rectangle
        0, 0, size, size // Destination rectangle
      );
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to create cropped image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = url;
  });
};

/**
 * Convert image to different format
 */
export const convertImageFormat = (
  file: File,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg',
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Determine MIME type
      const mimeType = `image/${format}`;
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const convertedFile = new File([blob], `${file.name.split('.')[0]}.${format}`, {
              type: mimeType,
              lastModified: Date.now()
            });
            resolve(convertedFile);
          } else {
            reject(new Error('Failed to convert image format'));
          }
        },
        mimeType,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for conversion'));
    };
    
    img.src = url;
  });
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate aspect ratio fit
 */
const calculateAspectRatioFit = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
};

/**
 * Calculate square crop dimensions
 */
const calculateSquareCrop = (
  width: number,
  height: number
): { x: number; y: number; cropSize: number } => {
  const cropSize = Math.min(width, height);
  const x = (width - cropSize) / 2;
  const y = (height - cropSize) / 2;
  
  return { x, y, cropSize };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get image metadata
 */
export const getImageMetadata = async (file: File): Promise<ImageMetadata> => {
  const dimensions = await getImageDimensions(file);
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
};

/**
 * Check if image is square
 */
export const isSquare = (width: number, height: number): boolean => {
  return Math.abs(width - height) < 1; // Allow for small floating point differences
};

/**
 * Get recommended crop area for non-square images
 */
export const getRecommendedCropArea = (
  width: number,
  height: number
): { x: number; y: number; size: number } => {
  const cropSize = Math.min(width, height);
  const x = (width - cropSize) / 2;
  const y = (height - cropSize) / 2;
  
  return { x, y, size: cropSize };
};
