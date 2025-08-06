import { Router } from 'express';
import { ProfileController } from '../../controllers/user/profile.controller';
import { ProfilePictureController } from '../../controllers/user/profilePicture.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { profilePictureUploadMiddleware } from '../../middleware/fileUpload.middleware';

const router = Router();

/**
 * User Profile Routes
 * Base path: /api/v1/user
 * All routes require authentication
 */

// ==================== PROFILE MANAGEMENT ROUTES ====================

// GET /api/v1/user/profile
// Retrieve user profile information
router.get(
  '/profile',
  AuthMiddleware.verifyToken,
  ProfileController.getProfile
);

// PUT /api/v1/user/profile
// Update user profile information
router.put(
  '/profile',
  ProfileController.profileUpdateLimiter,
  AuthMiddleware.verifyToken,
  ProfileController.validateProfileUpdate,
  ProfileController.updateProfile
);

// PUT /api/v1/user/profile/privacy
// Update privacy settings
router.put(
  '/profile/privacy',
  ProfileController.profileUpdateLimiter,
  AuthMiddleware.verifyToken,
  ProfileController.validatePrivacySettings,
  ProfileController.updatePrivacySettings
);

// ==================== PROFILE PICTURE ROUTES ====================

// POST /api/v1/user/profile/picture
// Upload profile picture
router.post(
  '/profile/picture',
  ProfilePictureController.pictureUploadLimiter,
  AuthMiddleware.verifyToken,
  ...profilePictureUploadMiddleware,
  ProfilePictureController.uploadPicture
);

// POST /api/v1/user/profile/picture/sync-google
// Sync profile picture from Google
router.post(
  '/profile/picture/sync-google',
  ProfilePictureController.googleSyncLimiter,
  AuthMiddleware.verifyToken,
  ProfilePictureController.syncFromGoogle
);

// DELETE /api/v1/user/profile/picture
// Delete profile picture
router.delete(
  '/profile/picture',
  AuthMiddleware.verifyToken,
  ProfilePictureController.deletePicture
);

// GET /api/v1/user/profile/picture/status
// Get profile picture status
router.get(
  '/profile/picture/status',
  AuthMiddleware.verifyToken,
  ProfilePictureController.getPictureStatus
);

// ==================== GOOGLE ACCOUNT MANAGEMENT ROUTES ====================

// POST /api/v1/user/profile/connect-google
// Connect Google account to user profile
router.post(
  '/profile/connect-google',
  ProfileController.googleOperationLimiter,
  AuthMiddleware.verifyToken,
  ProfileController.validateGoogleConnection,
  ProfileController.connectGoogle
);

// DELETE /api/v1/user/profile/disconnect-google
// Disconnect Google account from user profile
router.delete(
  '/profile/disconnect-google',
  ProfileController.googleOperationLimiter,
  AuthMiddleware.verifyToken,
  ProfileController.disconnectGoogle
);

export default router;
