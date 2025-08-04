import { PrismaClient, User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export interface GoogleAuthResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  isNewUser?: boolean;
  error?: string;
  code?: string;
}

export interface AccountLinkingResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  linked?: boolean;
  error?: string;
  code?: string;
}

export class GoogleOAuthService {
  private static oAuth2Client: OAuth2Client;

  /**
   * Initialize Google OAuth client
   */
  private static getOAuth2Client(): OAuth2Client {
    if (!this.oAuth2Client) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth configuration missing');
      }
      
      this.oAuth2Client = new OAuth2Client(clientId, clientSecret);
    }
    return this.oAuth2Client;
  }

  /**
   * Verify Google OAuth token and extract profile data
   */
  static async verifyGoogleToken(token: string): Promise<GoogleProfile | null> {
    try {
      const client = this.getOAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      // Validate required fields
      if (!payload.sub || !payload.email || !payload.name) {
        throw new Error('Missing required profile data');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified || false
      };
    } catch (error) {
      console.error('Error verifying Google token:', error);
      return null;
    }
  }

  /**
   * Validate profile picture URL
   */
  private static validateProfilePictureUrl(url?: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      // Only allow HTTPS URLs from trusted domains
      if (urlObj.protocol !== 'https:') return null;
      
      const allowedDomains = [
        'lh3.googleusercontent.com',
        'lh4.googleusercontent.com',
        'lh5.googleusercontent.com',
        'lh6.googleusercontent.com'
      ];
      
      return allowedDomains.includes(urlObj.hostname) ? url : null;
    } catch {
      return null;
    }
  }

  /**
   * Register or login user via Google OAuth
   */
  static async authenticateWithGoogle(token: string): Promise<GoogleAuthResult> {
    try {
      // Verify Google token and get profile
      const profile = await this.verifyGoogleToken(token);
      if (!profile) {
        return {
          success: false,
          error: 'Invalid Google token',
          code: 'GOOGLE_TOKEN_INVALID'
        };
      }

      // Check if user already exists with this Google ID
      let existingUser = await prisma.user.findUnique({
        where: { googleId: profile.googleId }
      });

      if (existingUser) {
        // Update last login and profile picture if needed
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            lastLoginAt: new Date(),
            profilePicture: this.validateProfilePictureUrl(profile.picture) || existingUser.profilePicture
          }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return {
          success: true,
          user: userWithoutPassword,
          isNewUser: false
        };
      }

      // Check if user exists with this email (for account linking)
      existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: profile.email,
            mode: 'insensitive'
          }
        }
      });

      if (existingUser) {
        // Link Google account to existing user
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: profile.googleId,
            isEmailVerified: true, // Google emails are auto-verified
            profilePicture: this.validateProfilePictureUrl(profile.picture) || existingUser.profilePicture,
            lastLoginAt: new Date()
          }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return {
          success: true,
          user: userWithoutPassword,
          isNewUser: false
        };
      }

      // Create new user with Google account
      const newUser = await prisma.user.create({
        data: {
          email: profile.email.toLowerCase().trim(),
          fullName: profile.name.trim(),
          googleId: profile.googleId,
          profilePicture: this.validateProfilePictureUrl(profile.picture),
          isEmailVerified: true, // Google emails are auto-verified
          role: 'GUEST',
          isActive: true,
          lastLoginAt: new Date()
        }
      });

      const { password: _, ...userWithoutPassword } = newUser;
      return {
        success: true,
        user: userWithoutPassword,
        isNewUser: true
      };

    } catch (error) {
      console.error('Error authenticating with Google:', error);
      return {
        success: false,
        error: 'Internal server error during Google authentication',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Link Google account to existing user
   */
  static async linkGoogleAccount(token: string, userEmail: string): Promise<AccountLinkingResult> {
    try {
      // Verify Google token
      const profile = await this.verifyGoogleToken(token);
      if (!profile) {
        return {
          success: false,
          error: 'Invalid Google token',
          code: 'GOOGLE_TOKEN_INVALID'
        };
      }

      // Verify that Google email matches the user email
      if (profile.email.toLowerCase() !== userEmail.toLowerCase()) {
        return {
          success: false,
          error: 'Google account email does not match user email',
          code: 'EMAIL_MISMATCH'
        };
      }

      // Find the user by email
      const existingUser = await prisma.user.findFirst({
        where: {
          email: {
            equals: userEmail,
            mode: 'insensitive'
          }
        }
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Check if Google ID is already linked to another user
      const googleLinkedUser = await prisma.user.findUnique({
        where: { googleId: profile.googleId }
      });

      if (googleLinkedUser && googleLinkedUser.id !== existingUser.id) {
        return {
          success: false,
          error: 'Google account is already linked to another user',
          code: 'GOOGLE_ACCOUNT_LINKED'
        };
      }

      // Link Google account to existing user
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: profile.googleId,
          isEmailVerified: true, // Auto-verify email when linking Google
          profilePicture: this.validateProfilePictureUrl(profile.picture) || existingUser.profilePicture
        }
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return {
        success: true,
        user: userWithoutPassword,
        linked: true
      };

    } catch (error) {
      console.error('Error linking Google account:', error);
      return {
        success: false,
        error: 'Internal server error during account linking',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Unlink Google account from user
   */
  static async unlinkGoogleAccount(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleId: null,
          // Keep profile picture even after unlinking
        }
      });
      return true;
    } catch (error) {
      console.error('Error unlinking Google account:', error);
      return false;
    }
  }

  /**
   * Check if Google account is linked to any user
   */
  static async isGoogleAccountLinked(googleId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { googleId }
      });
      return !!user;
    } catch (error) {
      console.error('Error checking Google account link:', error);
      return false;
    }
  }

  /**
   * Get user by Google ID
   */
  static async getUserByGoogleId(googleId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { googleId }
      });

      if (!user) return null;

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error getting user by Google ID:', error);
      return null;
    }
  }

  /**
   * Validate Google OAuth configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.GOOGLE_CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID environment variable is missing');
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET environment variable is missing');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default GoogleOAuthService;