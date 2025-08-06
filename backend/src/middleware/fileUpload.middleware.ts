import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.utils';
import ImageOptimization from '../utils/imageOptimization';

// Type definition for Multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// File validation configuration
const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  MIN_DIMENSIONS: { width: 100, height: 100 },
  MAX_DIMENSIONS: { width: 2000, height: 2000 }
};



/**
 * Multer configuration for profile picture uploads
 */
export const profilePictureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE_CONFIG.MAX_SIZE,
    files: 1 // Only allow one file at a time
  },
  fileFilter: async (_req: Request, file: MulterFile, cb: multer.FileFilterCallback) => {
    try {
      // Check file size
      if (file.size > FILE_CONFIG.MAX_SIZE) {
        return cb(new Error(`File size exceeds maximum limit of ${FILE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`));
      }

      // Check MIME type
      if (!FILE_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`File type not allowed. Allowed types: ${FILE_CONFIG.ALLOWED_MIME_TYPES.join(', ')}`));
      }

      // Check file extension
      const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        return cb(new Error(`File extension not allowed. Allowed extensions: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`));
      }

      // Validate image format using Sharp
      const isValidFormat = await ImageOptimization.validateImageFormat(file.buffer);
      if (!isValidFormat) {
        return cb(new Error('Invalid image format'));
      }

      // Validate image dimensions
      const dimensions = await ImageOptimization.getImageDimensions(file.buffer);
      if (!ImageOptimization.validateDimensions(
        dimensions,
        FILE_CONFIG.MIN_DIMENSIONS.width,
        FILE_CONFIG.MIN_DIMENSIONS.height,
        FILE_CONFIG.MAX_DIMENSIONS.width,
        FILE_CONFIG.MAX_DIMENSIONS.height
      )) {
        return cb(new Error(
          `Image dimensions must be between ${FILE_CONFIG.MIN_DIMENSIONS.width}x${FILE_CONFIG.MIN_DIMENSIONS.height} and ${FILE_CONFIG.MAX_DIMENSIONS.width}x${FILE_CONFIG.MAX_DIMENSIONS.height}`
        ));
      }

      cb(null, true);
    } catch (error) {
      cb(new Error('File validation failed'));
    }
  }
}).single('picture');

/**
 * Middleware to handle file upload errors
 */
export const handleFileUploadError = (error: any, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return ResponseUtil.error(res, 'File too large', 'FILE_TOO_LARGE', 413, {
          maxSize: `${FILE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`,
          currentSize: `${(req.file?.size || 0) / (1024 * 1024)}MB`
        });
      case 'LIMIT_FILE_COUNT':
        return ResponseUtil.error(res, 'Too many files', 'TOO_MANY_FILES', 413);
      case 'LIMIT_UNEXPECTED_FILE':
        return ResponseUtil.error(res, 'Unexpected file field', 'UNEXPECTED_FILE', 400);
      default:
        return ResponseUtil.error(res, 'File upload error', 'FILE_UPLOAD_ERROR', 400);
    }
  }

  if (error.message) {
    return ResponseUtil.error(res, error.message, 'FILE_VALIDATION_ERROR', 400);
  }

  return ResponseUtil.error(res, 'File upload failed', 'FILE_UPLOAD_FAILED', 500);
};

/**
 * Middleware to ensure file was uploaded
 */
export const requireFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return ResponseUtil.error(res, 'No file uploaded', 'NO_FILE_UPLOADED', 400);
  }
  return next();
};

/**
 * Middleware to validate uploaded file
 */
export const validateUploadedFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return ResponseUtil.error(res, 'No file uploaded', 'NO_FILE_UPLOADED', 400);
    }

    const file = req.file as MulterFile;

    // Additional validation if needed
    const metadata = await ImageOptimization.getImageMetadata(file.buffer);
    
    // Store metadata in request for later use
    (req as any).fileMetadata = metadata;

    return next();
  } catch (error) {
    return ResponseUtil.error(res, 'File validation failed', 'FILE_VALIDATION_ERROR', 400);
  }
};

/**
 * Complete file upload middleware chain
 */
export const profilePictureUploadMiddleware = [
  profilePictureUpload,
  handleFileUploadError,
  requireFileUpload,
  validateUploadedFile
];

export default {
  profilePictureUpload,
  handleFileUploadError,
  requireFileUpload,
  validateUploadedFile,
  profilePictureUploadMiddleware
};
