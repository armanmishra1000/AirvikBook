import express from 'express';
import multer from 'multer';
import AuthMiddleware from '../middleware/auth.middleware';
import StorageFactoryService from '../services/storage/storageFactory.service';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Per-user rate limiter for uploads (optional)
const userUploadLimiter = AuthMiddleware.createUserRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
});

/**
 * @route POST /api/v1/storage/upload/profile-picture
 * @desc Upload user profile picture
 * @access Private
 */
router.post(
  '/upload/profile-picture',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      const result = await StorageFactoryService.uploadProfilePicture(req.file, userId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: 'Profile picture uploaded successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @route POST /api/v1/storage/upload/room-image
 * @desc Upload room image
 * @access Private
 */
router.post(
  '/upload/room-image',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  upload.single('roomImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      const { roomId, imageType = 'gallery' } = req.body;
      if (!roomId) {
        return res.status(400).json({
          success: false,
          error: 'Room ID is required',
          code: 'MISSING_ROOM_ID'
        });
      }

      const result = await StorageFactoryService.uploadRoomImage(
        req.file,
        roomId,
        imageType as 'main' | 'gallery'
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: 'Room image uploaded successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error uploading room image:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @route POST /api/v1/storage/upload/property-image
 * @desc Upload property image
 * @access Private
 */
router.post(
  '/upload/property-image',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  upload.single('propertyImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      const { propertyId, imageType = 'interior' } = req.body;
      if (!propertyId) {
        return res.status(400).json({
          success: false,
          error: 'Property ID is required',
          code: 'MISSING_PROPERTY_ID'
        });
      }

      const result = await StorageFactoryService.uploadPropertyImage(
        req.file,
        propertyId,
        imageType as 'logo' | 'exterior' | 'interior' | 'amenity'
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: 'Property image uploaded successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code,
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error uploading property image:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /api/v1/storage/delete
 * @desc Delete file from storage
 * @access Private
 */
router.delete(
  '/delete',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  async (req, res) => {
    try {
      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({
          success: false,
          error: 'File path is required',
          code: 'MISSING_FILE_PATH'
        });
      }

      const success = await StorageFactoryService.deleteFile(filePath);

      if (success) {
        return res.status(200).json({
          success: true,
          message: 'File deleted successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Failed to delete file',
          code: 'DELETE_FAILED'
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @route GET /api/v1/storage/stats
 * @desc Get storage statistics
 * @access Private
 */
router.get(
  '/stats',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  async (_req, res) => {
    try {
      const stats = await StorageFactoryService.getStorageStats();

      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Storage statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @route POST /api/v1/storage/presigned-url
 * @desc Generate presigned URL for direct upload
 * @access Private
 */
router.post(
  '/presigned-url',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  async (req, res) => {
    try {
      const { key, contentType, expiresIn = 3600 } = req.body;
      
      if (!key || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'Key and content type are required',
          code: 'MISSING_PARAMETERS'
        });
      }

      const presignedUrl = await StorageFactoryService.generatePresignedUploadUrl(
        key,
        contentType,
        expiresIn
      );

      return res.status(200).json({
        success: true,
        data: {
          presignedUrl,
          key,
          contentType,
          expiresIn
        },
        message: 'Presigned URL generated successfully'
      });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate presigned URL',
        code: 'PRESIGNED_URL_ERROR'
      });
    }
  }
);

/**
 * @route GET /api/v1/storage/file-exists
 * @desc Check if file exists
 * @access Private
 */
router.get(
  '/file-exists',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  async (req, res) => {
    try {
      const { filePath } = req.query;
      
      if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'File path is required',
          code: 'MISSING_FILE_PATH'
        });
      }

      const exists = await StorageFactoryService.fileExists(filePath);

      return res.status(200).json({
        success: true,
        data: {
          exists,
          filePath
        },
        message: 'File existence checked successfully'
      });
    } catch (error) {
      console.error('Error checking file existence:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * @route GET /api/v1/storage/file-metadata
 * @desc Get file metadata
 * @access Private
 */
router.get(
  '/file-metadata',
  AuthMiddleware.verifyToken,
  userUploadLimiter,
  async (req, res) => {
    try {
      const { filePath } = req.query;
      
      if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'File path is required',
          code: 'MISSING_FILE_PATH'
        });
      }

      const metadata = await StorageFactoryService.getFileMetadata(filePath);

      return res.status(200).json({
        success: true,
        data: metadata,
        message: 'File metadata retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

export default router;
