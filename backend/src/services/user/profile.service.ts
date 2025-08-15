import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '../../utils/response.utils';
import { GoogleOAuthService } from '../googleOAuth.service';

const prisma = new PrismaClient();

// Type definitions for profile operations
export interface ProfileData {
  fullName?: string;
  mobileNumber?: string;
  bio?: string;
  // Accept either a Date object or a date string (e.g., 'YYYY-MM-DD') from the client
  dateOfBirth?: string | Date;
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  showEmail: boolean;
  showPhone: boolean;
  allowGoogleSync: boolean;
}

export interface ProfileResponse {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
  googleId?: string;
  profilePictureSource?: string;
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    allowGoogleSync: boolean;
  };
  connectedAccounts: {
    google: {
      connected: boolean;
      email?: string;
      connectedAt?: Date;
    };
  };
  lastUpdated: Date;
}

export interface ProfileUpdateResponse {
  user: ProfileResponse;
  changesApplied: string[];
}

export interface PrivacyUpdateResponse {
  privacy: PrivacySettings;
  updatedAt: Date;
}

export interface GoogleConnectionResponse {
  connectedAccounts: {
    google: {
      connected: boolean;
      email?: string;
      connectedAt?: Date;
    };
  };
  profileUpdates?: {
    profilePicture?: string;
    fullName?: string;
  };
}

export class ProfileService {
  /**
   * Get user profile information
   */
  static async getProfile(userId: string): Promise<ServiceResponse<ProfileResponse>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      const profileResponse: ProfileResponse = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber || undefined,
        profilePicture: user.profilePicture || undefined,
        bio: user.bio || undefined,
        dateOfBirth: user.dateOfBirth || undefined,
        gender: user.gender || undefined,
        nationality: user.nationality || undefined,
        occupation: user.occupation || undefined,
        website: user.website || undefined,
        location: user.location || undefined,
        googleId: user.googleId || undefined,
        profilePictureSource: user.profilePictureSource || undefined,
        privacy: {
          profileVisibility: user.profileVisibility as 'PUBLIC' | 'PRIVATE' | 'FRIENDS',
          showEmail: user.showEmail,
          showPhone: user.showPhone,
          allowGoogleSync: user.allowGoogleSync
        },
        connectedAccounts: {
          google: {
            connected: !!user.googleId,
            email: user.googleId ? user.email : undefined,
            connectedAt: user.googleId ? user.updatedAt : undefined
          }
        },
        lastUpdated: user.updatedAt
      };

      return {
        success: true,
        data: profileResponse
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Update user profile information
   */
  static async updateProfile(userId: string, profileData: ProfileData): Promise<ServiceResponse<ProfileUpdateResponse>> {
    try {
      // Validate input data
      const validationErrors = this.validateProfileData(profileData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        };
      }

      // Prepare update data
      const updateData: any = {};
      const changesApplied: string[] = [];

      // Check which fields are being updated
      if (profileData.fullName !== undefined) {
        updateData.fullName = profileData.fullName.trim();
        changesApplied.push('fullName');
      }
      if (profileData.mobileNumber !== undefined) {
        updateData.mobileNumber = profileData.mobileNumber || null;
        changesApplied.push('mobileNumber');
      }
      if (profileData.bio !== undefined) {
        updateData.bio = profileData.bio || null;
        changesApplied.push('bio');
      }
      if (profileData.dateOfBirth !== undefined) {
        if (!profileData.dateOfBirth) {
          updateData.dateOfBirth = null;
        } else {
          const dobInput = profileData.dateOfBirth;
          const dob = typeof dobInput === 'string' ? new Date(dobInput) : dobInput;
          const now = new Date();
          
          if (isNaN(dob.getTime())) {
            return {
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: ['dateOfBirth: Invalid date format']
            };
          }
          
          if (dob >= now) {
            return {
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: ['dateOfBirth: Date of birth must be in the past']
            };
          }
          
          // Check age restrictions (13-120 years old)
          const age = now.getFullYear() - dob.getFullYear();
          if (age < 13) {
            return {
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: ['dateOfBirth: You must be at least 13 years old to use this service']
            };
          }
          
          if (age > 120) {
            return {
              success: false,
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: ['dateOfBirth: Please enter a valid date of birth (maximum age: 120 years)']
            };
          }
          
          updateData.dateOfBirth = dob;
        }
        changesApplied.push('dateOfBirth');
      }
      if (profileData.gender !== undefined) {
        updateData.gender = profileData.gender || null;
        changesApplied.push('gender');
      }
      if (profileData.nationality !== undefined) {
        updateData.nationality = profileData.nationality || null;
        changesApplied.push('nationality');
      }
      if (profileData.occupation !== undefined) {
        updateData.occupation = profileData.occupation || null;
        changesApplied.push('occupation');
      }
      if (profileData.website !== undefined) {
        updateData.website = profileData.website || null;
        changesApplied.push('website');
      }
      if (profileData.location !== undefined) {
        updateData.location = profileData.location || null;
        changesApplied.push('location');
      }

      // Update user profile
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Get full profile response
      const profileResponse = await this.getProfile(userId);
      if (!profileResponse.success || !profileResponse.data) {
        return {
          success: false,
          error: 'Failed to retrieve updated profile',
          code: 'PROFILE_RETRIEVAL_ERROR'
        };
      }

      return {
        success: true,
        data: {
          user: profileResponse.data,
          changesApplied
        }
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<ServiceResponse<PrivacyUpdateResponse>> {
    try {
      // Validate privacy settings
      const validationErrors = this.validatePrivacySettings(settings);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: 'Invalid privacy setting',
          code: 'INVALID_PRIVACY_SETTING',
          details: validationErrors
        };
      }

      // Update privacy settings
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileVisibility: settings.profileVisibility,
          showEmail: settings.showEmail,
          showPhone: settings.showPhone,
          allowGoogleSync: settings.allowGoogleSync
        }
      });

      return {
        success: true,
        data: {
          privacy: {
            profileVisibility: updatedUser.profileVisibility as 'PUBLIC' | 'PRIVATE' | 'FRIENDS',
            showEmail: updatedUser.showEmail,
            showPhone: updatedUser.showPhone,
            allowGoogleSync: updatedUser.allowGoogleSync
          },
          updatedAt: updatedUser.updatedAt
        }
      };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Connect Google account to user profile
   */
  static async connectGoogle(userId: string, googleToken: string): Promise<ServiceResponse<GoogleConnectionResponse>> {
    try {
      // Get user to check current email
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Link Google account using existing service
      const linkResult = await GoogleOAuthService.linkGoogleAccount(googleToken, user.email);
      
      if (!linkResult.success || !linkResult.user) {
        return {
          success: false,
          error: linkResult.error || 'Failed to connect Google account',
          code: linkResult.code || 'GOOGLE_CONNECTION_ERROR'
        };
      }

      // Get updated user with Google data
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to retrieve updated user',
          code: 'USER_RETRIEVAL_ERROR'
        };
      }

      const response: GoogleConnectionResponse = {
        connectedAccounts: {
          google: {
            connected: !!updatedUser.googleId,
            email: updatedUser.googleId ? updatedUser.email : undefined,
            connectedAt: updatedUser.googleId ? updatedUser.updatedAt : undefined
          }
        }
      };

      // Check if profile was updated with Google data
      const profileUpdates: any = {};
      if (updatedUser.profilePicture !== user.profilePicture) {
        profileUpdates.profilePicture = updatedUser.profilePicture;
      }
      if (updatedUser.fullName !== user.fullName) {
        profileUpdates.fullName = updatedUser.fullName;
      }

      if (Object.keys(profileUpdates).length > 0) {
        response.profileUpdates = profileUpdates;
      }

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error connecting Google account:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Disconnect Google account from user profile
   */
  static async disconnectGoogle(userId: string): Promise<ServiceResponse<{ disconnected: boolean }>> {
    try {
      // Check if user has password set (required for disconnection)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, googleId: true }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      if (!user.googleId) {
        return {
          success: false,
          error: 'No Google account connected',
          code: 'GOOGLE_NOT_CONNECTED'
        };
      }

      if (!user.password) {
        return {
          success: false,
          error: 'Cannot disconnect Google account without password set',
          code: 'PASSWORD_REQUIRED'
        };
      }

      // Disconnect Google account
      const success = await GoogleOAuthService.unlinkGoogleAccount(userId);
      
      if (!success) {
        return {
          success: false,
          error: 'Failed to disconnect Google account',
          code: 'DISCONNECTION_ERROR'
        };
      }

      return {
        success: true,
        data: { disconnected: true }
      };
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
      return {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Validate profile data
   */
  private static validateProfileData(data: ProfileData): string[] {
    const errors: string[] = [];

    if (data.fullName !== undefined) {
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('fullName: Must be at least 2 characters');
      } else if (data.fullName.trim().length > 100) {
        errors.push('fullName: Must be less than 100 characters');
      } else if (!/^[a-zA-Z\s]+$/.test(data.fullName.trim())) {
        errors.push('fullName: Must contain only letters and spaces');
      }
    }

    if (data.mobileNumber !== undefined && data.mobileNumber) {
      if (!/^\+[1-9]\d{1,14}$/.test(data.mobileNumber)) {
        errors.push('mobileNumber: Must be valid international format (+1234567890)');
      }
    }

    if (data.bio !== undefined && data.bio && data.bio.length > 500) {
      errors.push('bio: Must be less than 500 characters');
    }

    if (data.website !== undefined && data.website) {
      try {
        const url = new URL(data.website);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          errors.push('website: Must be a valid URL');
        }
      } catch {
        errors.push('website: Must be a valid URL');
      }
    }

    if (data.location !== undefined && data.location) {
      if (data.location.length < 2 || data.location.length > 100) {
        errors.push('location: Must be between 2 and 100 characters');
      }
    }

    if (data.dateOfBirth !== undefined && data.dateOfBirth) {
      const now = new Date();
      if (data.dateOfBirth >= now) {
        errors.push('dateOfBirth: Must be in the past');
      }
    }

    return errors;
  }

  /**
   * Validate privacy settings
   */
  private static validatePrivacySettings(settings: PrivacySettings): string[] {
    const errors: string[] = [];

    const validVisibility = ['PUBLIC', 'PRIVATE', 'FRIENDS'];
    if (!validVisibility.includes(settings.profileVisibility)) {
      errors.push('profileVisibility: Must be PUBLIC, PRIVATE, or FRIENDS');
    }

    if (typeof settings.showEmail !== 'boolean') {
      errors.push('showEmail: Must be a boolean value');
    }

    if (typeof settings.showPhone !== 'boolean') {
      errors.push('showPhone: Must be a boolean value');
    }

    if (typeof settings.allowGoogleSync !== 'boolean') {
      errors.push('allowGoogleSync: Must be a boolean value');
    }

    return errors;
  }
}

export default ProfileService;
