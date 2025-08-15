import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.utils';
import ImageOptimization from '../utils/imageOptimization';
import AntivirusService from '../services/antivirus.service';
import { StorageConfig } from '../config/storage.config';

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

import crypto from 'crypto';
import path from 'path';

/**
 * Generate unique filename to prevent conflicts and path traversal
 */
const generateUniqueFilename = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  const name = path.basename(originalname, ext);
  return `${name}_${timestamp}_${randomString}${ext}`;
};

/**
 * Validate file path to prevent path traversal attacks
 */
const validateFilePath = (filePath: string): boolean => {
  if (!filePath) return false;
  
  // Check for path traversal attempts
  const normalizedPath = filePath.replace(/\\/g, '/');
  return !normalizedPath.includes('..') && 
         !normalizedPath.includes('~') && 
         !normalizedPath.startsWith('/') &&
         !normalizedPath.includes('//');
};

/**
 * Sanitize filename to prevent security issues
 */
const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

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
  MAX_DIMENSIONS: { width: 2000, height: 2000 },
  // Enhanced security configurations
  SCAN_FOR_MALWARE: true,
  VALIDATE_CONTENT: true,
  PREVENT_PATH_TRAVERSAL: true,
  GENERATE_UNIQUE_FILENAMES: true,
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
  fileFilter: (_req: Request, file: MulterFile, cb: multer.FileFilterCallback) => {
    try {
      // Log storage type for debugging
      const storageType = StorageConfig.getStorageType();
      console.log(`📁 File upload using ${storageType} storage: ${file.originalname}`);
      
      // Check MIME type
      if (!FILE_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`File type not allowed. Allowed types: ${FILE_CONFIG.ALLOWED_MIME_TYPES.join(', ')}`));
      }

      // Check file extension
      const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        return cb(new Error(`File extension not allowed. Allowed extensions: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`));
      }

      // Validate file path to prevent path traversal
      if (FILE_CONFIG.PREVENT_PATH_TRAVERSAL && !validateFilePath(file.originalname)) {
        return cb(new Error('Invalid file path detected'));
      }

      // Sanitize filename
      if (FILE_CONFIG.GENERATE_UNIQUE_FILENAMES) {
        file.originalname = sanitizeFilename(file.originalname);
      }

      // Basic validation passed - buffer validation will happen in validateUploadedFile middleware
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
 * Middleware to validate uploaded file with enhanced security
 */
export const validateUploadedFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return ResponseUtil.error(res, 'No file uploaded', 'NO_FILE_UPLOADED', 400);
    }

    const file = req.file as MulterFile;

    // 1. Validate file path (prevent path traversal)
    if (FILE_CONFIG.PREVENT_PATH_TRAVERSAL) {
      const normalizedPath = path.normalize(file.originalname);
      if (normalizedPath.includes('..') || !validateFilePath(file.originalname)) {
        return ResponseUtil.error(res, 'Invalid file path', 'INVALID_FILE_PATH', 400);
      }
    }

    // 2. Generate unique filename for security
    if (FILE_CONFIG.GENERATE_UNIQUE_FILENAMES) {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      req.file.filename = uniqueFilename;
    }

    // 3. Validate image format using Sharp
    const isValidFormat = await ImageOptimization.validateImageFormat(file.buffer);
    if (!isValidFormat) {
      return ResponseUtil.error(res, 'Invalid image format', 'INVALID_IMAGE_FORMAT', 400);
    }

    // 4. Validate image dimensions
    const dimensions = await ImageOptimization.getImageDimensions(file.buffer);
    if (!ImageOptimization.validateDimensions(
      dimensions,
      FILE_CONFIG.MIN_DIMENSIONS.width,
      FILE_CONFIG.MIN_DIMENSIONS.height,
      FILE_CONFIG.MAX_DIMENSIONS.width,
      FILE_CONFIG.MAX_DIMENSIONS.height
    )) {
      return ResponseUtil.error(res, 
        `Image dimensions must be between ${FILE_CONFIG.MIN_DIMENSIONS.width}x${FILE_CONFIG.MIN_DIMENSIONS.height} and ${FILE_CONFIG.MAX_DIMENSIONS.width}x${FILE_CONFIG.MAX_DIMENSIONS.height}`,
        'INVALID_IMAGE_DIMENSIONS', 
        400,
        { 
          current: dimensions,
          required: {
            min: FILE_CONFIG.MIN_DIMENSIONS,
            max: FILE_CONFIG.MAX_DIMENSIONS
          }
        }
      );
    }

    // 5. Enhanced security checks
    if (FILE_CONFIG.VALIDATE_CONTENT) {
      // Check for suspicious file headers
      const fileHeader = file.buffer.slice(0, 8).toString('hex').toUpperCase();
      const suspiciousHeaders = ['FFD8FF', '89504E47', '52494646']; // JPEG, PNG, RIFF
      const isSuspicious = !suspiciousHeaders.some(header => fileHeader.startsWith(header));
      
      if (isSuspicious) {
        return ResponseUtil.error(res, 'Suspicious file content detected', 'SUSPICIOUS_FILE_CONTENT', 400);
      }
    }

    // 6. MALWARE SCANNING - NEW SECURITY FEATURE
    if (FILE_CONFIG.SCAN_FOR_MALWARE) {
      try {
        console.log('🔍 Scanning file for malware...');
        const scanResult = await AntivirusService.scanFile(file.buffer, file.originalname);
        
        if (!scanResult.isClean) {
          console.error('🚨 Malware detected:', scanResult.threats);
          return ResponseUtil.error(res, 
            'File contains malware and cannot be uploaded', 
            'MALWARE_DETECTED', 
            400,
            {
              threats: scanResult.threats,
              scanMethod: scanResult.scanMethod,
              scanTime: scanResult.scanTime
            }
          );
        }
        
        console.log(`✅ File scanned successfully (${scanResult.scanMethod}, ${scanResult.scanTime}ms)`);
        
        // Store scan result in request for later use
        (req as any).scanResult = scanResult;
      } catch (scanError) {
        console.error('⚠️ Malware scan failed:', scanError);
        // In production, you might want to reject files when scan fails
        // For now, we'll allow the file but log the error
        if (process.env.NODE_ENV === 'production') {
          return ResponseUtil.error(res, 
            'File security scan failed', 
            'SECURITY_SCAN_FAILED', 
            400
          );
        }
      }
    }

    // 7. Get additional metadata
    const metadata = await ImageOptimization.getImageMetadata(file.buffer);
    
    // Store metadata in request for later use
    (req as any).fileMetadata = metadata;

    // 8. Log file upload for audit
    console.log(`✅ File uploaded successfully: ${req.file.filename}, size: ${file.size} bytes, type: ${file.mimetype}`);

    return next();
  } catch (error) {
    console.error('File validation error:', error);
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
