import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '../../services/jwt.service';
import { EmailService } from '../../services/email.service';

// Helper function to mask email addresses for security
const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

export class GoogleOAuthRedirectController {
  private static oAuth2Client: OAuth2Client;

  /**
   * Get Google OAuth2 client
   */
  private static getOAuth2Client(): OAuth2Client {
    if (!this.oAuth2Client) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`;
      
      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth configuration missing');
      }
      
      this.oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    }
    return this.oAuth2Client;
  }

  /**
   * Initiate Google OAuth flow - redirects to Google
   * GET /api/v1/auth/google/redirect
   */
  static async initiateOAuth(req: Request, res: Response) {
    try {
      const { type = 'login' } = req.query; // 'login' or 'register'
      
      const client = GoogleOAuthRedirectController.getOAuth2Client();
      
      // Generate the OAuth URL
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        state: JSON.stringify({ 
          type,
          timestamp: Date.now(),
          redirectTo: req.query.redirect_to || '/dashboard'
        }),
        prompt: 'consent' // Force consent screen to get refresh token
      });

      console.log(`🔗 Google OAuth initiated for ${type}:`, authUrl);
      
      // Redirect to Google OAuth
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error initiating Google OAuth:', error);
      
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/error?message=OAuth initialization failed`;
      res.redirect(errorUrl);
    }
  }

  /**
   * Handle Google OAuth callback
   * GET /api/v1/auth/google/callback
   */
  static async handleCallback(req: Request, res: Response) {
    try {
      const { code, state, error } = req.query;
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Handle OAuth error
      if (error) {
        console.error('Google OAuth error:', error);
        const errorUrl = `${frontendUrl}/error?message=Google OAuth was cancelled or failed`;
        return res.redirect(errorUrl);
      }
      
      // Validate required parameters
      if (!code || !state) {
        console.error('Missing code or state in OAuth callback');
        const errorUrl = `${frontendUrl}/error?message=Invalid OAuth callback`;
        return res.redirect(errorUrl);
      }

      // Parse state
      let stateData;
      try {
        stateData = JSON.parse(state as string);
      } catch (err) {
        console.error('Invalid state parameter:', state);
        const errorUrl = `${frontendUrl}/error?message=Invalid OAuth state`;
        return res.redirect(errorUrl);
      }

      const client = GoogleOAuthRedirectController.getOAuth2Client();
      
      // Exchange code for tokens
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);

      // Get user info from Google
      const { data: userInfo } = await client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });

      console.log('🔍 Google user info:', userInfo);

      // Process the OAuth result
      const result = await GoogleOAuthRedirectController.processOAuthUser(
        userInfo as any, 
        stateData.type || 'login'
      );

      if (!result.success) {
        const errorUrl = `${frontendUrl}/error?message=${encodeURIComponent(result.error || 'Authentication failed')}`;
        return res.redirect(errorUrl);
      }

      // Generate JWT tokens
      const tokenPayload = {
        userId: result.user!.id,
        email: result.user!.email,
        role: result.user!.role
      };

      const jwtTokens = JwtService.generateTokenPair(tokenPayload);

              // Send welcome email for new users
        if (result.isNewUser && result.user) {
          try {
            const emailService = new EmailService();
            await emailService.sendWelcomeEmail(
              result.user.email,
              result.user.fullName
            );
            console.log(`📧 Welcome email sent to ${maskEmail(result.user.email)}`);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the authentication for email issues
          }
        }

      // Redirect to frontend with success
      const redirectTo = stateData.redirectTo || '/dashboard';
      const successUrl = `${frontendUrl}/callback/success` +
        `?access_token=${jwtTokens.accessToken}` +
        `&refresh_token=${jwtTokens.refreshToken}` +
        `&user=${encodeURIComponent(JSON.stringify(result.user))}` +
        `&redirect_to=${encodeURIComponent(redirectTo)}` +
        `&is_new_user=${result.isNewUser || false}`;

      console.log(`✅ Google OAuth success, redirecting to: ${successUrl}`);
      res.redirect(successUrl);
      
    } catch (error) {
      console.error('Error handling Google OAuth callback:', error);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/error?message=Authentication processing failed`;
      res.redirect(errorUrl);
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
   * Process OAuth user data and handle registration/login
   */
  private static async processOAuthUser(
    userInfo: any, 
    _type: 'login' | 'register'
  ): Promise<{
    success: boolean;
    user?: any;
    isNewUser?: boolean;
    error?: string;
  }> {
    try {
      // We'll work directly with Prisma to handle user creation/authentication
      // since we already have the verified user data from Google
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const googleProfile = {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        emailVerified: userInfo.verified_email || false
      };

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: googleProfile.email },
            { googleId: googleProfile.googleId }
          ]
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          googleId: true,
          isEmailVerified: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          isActive: true
        }
      });

      let isNewUser = false;

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleProfile.email,
            fullName: googleProfile.name,
            googleId: googleProfile.googleId,
            isEmailVerified: googleProfile.emailVerified,
            profilePicture: GoogleOAuthRedirectController.validateProfilePictureUrl(googleProfile.picture),
            role: 'GUEST',
            isActive: true,
            lastLoginAt: new Date()
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            googleId: true,
            isEmailVerified: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            isActive: true
          }
        });
        isNewUser = true;
        console.log(`✅ New user created via Google OAuth: ${maskEmail(user.email)}`);
      } else {
        // Update existing user with Google ID if missing
        if (!user.googleId) {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              googleId: googleProfile.googleId,
              isEmailVerified: true, // Google accounts are verified
              lastLoginAt: new Date()
            }
          });
          user.googleId = googleProfile.googleId;
          user.isEmailVerified = true;
        } else {
          // Just update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });
        }
        console.log(`✅ Existing user authenticated via Google OAuth: ${maskEmail(user.email)}`);
      }

      return {
        success: true,
        user,
        isNewUser
      };

    } catch (error) {
      console.error('Error processing OAuth user:', error);
      return {
        success: false,
        error: 'Failed to process user data'
      };
    }
  }
}