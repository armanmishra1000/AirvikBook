import { PrismaClient } from '@prisma/client';
import { DeviceInfo } from './sessionManagement.service';

const prisma = new PrismaClient();

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
  location?: string;
}

export interface SecurityAlert {
  id: string;
  userId: string;
  type: 'NEW_DEVICE_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'FAILED_LOGIN_ATTEMPTS' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKOUT';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: any;
  resolved: boolean;
  createdAt: Date;
}

export interface SecurityEventResult {
  success: boolean;
  error?: string;
  code?: string;
}

export interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
  timestamp: Date;
}

export class SecurityMonitoringService {
  /**
   * Log security event
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // TODO: Implement when securityEvent model is available in Prisma
      // eslint-disable-next-line no-console
      console.log('Security event logged:', event);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Create security alert
   */
  static async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      // TODO: Implement when securityAlert model is available in Prisma
      // eslint-disable-next-line no-console
      console.log('Security alert created:', alert);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Get user security events
   */
  static async getUserSecurityEvents(userId: string): Promise<SecurityEvent[]> {
    try {
      // TODO: Implement when securityEvent model is available in Prisma
      console.log('Getting security events for user:', userId);
      return [];
    } catch (error) {
      console.error('Error getting user security events:', error);
      return [];
    }
  }

  /**
   * Get user security alerts
   */
  static async getUserSecurityAlerts(userId: string): Promise<SecurityAlert[]> {
    try {
      // TODO: Implement when securityAlert model is available in Prisma
      console.log('Getting security alerts for user:', userId);
      return [];
    } catch (error) {
      console.error('Error getting user security alerts:', error);
      return [];
    }
  }

  /**
   * Check for suspicious activity
   */
  static async checkSuspiciousActivity(userId: string, ipAddress: string): Promise<boolean> {
    try {
      // TODO: Implement when securityEvent model is available in Prisma
      console.log('Checking suspicious activity for user:', userId, 'IP:', ipAddress);
      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  }

  /**
   * Clean up old security events
   */
  static async cleanupOldEvents(): Promise<{ deletedCount: number }> {
    try {
      // TODO: Implement when securityEvent model is available in Prisma
      console.log('Cleaning up old security events');
      return { deletedCount: 0 };
    } catch (error) {
      console.error('Error cleaning up old security events:', error);
      return { deletedCount: 0 };
    }
  }

  /**
   * Send new device login alert
   */
  static async sendNewDeviceAlert(
    userId: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent?: string
  ): Promise<SecurityEventResult> {
    try {
      // Get user email for notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Create security alert
      await this.createSecurityAlert({
        id: 'temp-id',
        userId,
        type: 'NEW_DEVICE_LOGIN',
        message: `New device login detected for ${user.email}`,
        severity: 'MEDIUM',
        metadata: {
          deviceInfo,
          ipAddress,
          userAgent,
          location: 'Unknown Location'
        },
        resolved: false,
        createdAt: new Date()
      });

      // Send email notification using existing email service
      // This would integrate with the email service created in user registration
      try {
        // Import email service dynamically to avoid circular dependencies
        // const { emailService } = await import('../email.service');
        
        // TODO: Implement sendSecurityAlert method in EmailService
        // Sanitize email for logging
        const maskEmail = (email: string) => {
          const [local, domain] = email.split('@');
          return `${local.substring(0, 2)}***@${domain}`;
        };

        console.log('Security alert triggered for:', maskEmail(user.email), {
          alertType: 'New Device Login',
          deviceName: deviceInfo.deviceName,
          location: 'Unknown Location',
          timestamp: new Date().toISOString(),
          ipAddress: ipAddress.substring(0, 8) + '***' // Mask IP for privacy
        });
        
        /*
        const emailResult = await emailService.sendSecurityAlert(
          user.email,
          user.fullName,
          {
            alertType: 'New Device Login',
            deviceName: deviceInfo.deviceName,
            location: this.getLocationFromIP(ipAddress) || 'Unknown Location',
            timestamp: new Date().toISOString(),
            ipAddress
          }
        );

        if (!emailResult.success) {
          console.error('Failed to send new device alert email:', emailResult.error);
        }
        */

      } catch (emailError) {
        console.error('Error sending new device alert email:', emailError);
        // Don't fail the login process if email fails
      }

      return { success: true };

    } catch (error) {
      console.error('Error sending new device alert:', error);
      return {
        success: false,
        error: 'Failed to send new device alert',
        code: 'ALERT_ERROR'
      };
    }
  }

  /**
   * Monitor and alert on account lockouts
   */
  static async monitorAccountLockout(email: string, ipAddress: string): Promise<void> {
    try {
      // Get user for alert
      const user = await prisma.user.findFirst({
        where: { 
          email: { equals: email, mode: 'insensitive' }
        },
        select: { id: true, email: true, fullName: true }
      });

      if (user) {
        await this.createSecurityAlert({
          id: 'temp-id',
          userId: user.id,
          type: 'ACCOUNT_LOCKOUT',
          message: `Account locked due to multiple failed login attempts: ${email}`,
          severity: 'HIGH',
          metadata: {
            ipAddress,
            lockoutDuration: '15 minutes',
            maxAttempts: 5
          },
          resolved: false,
          createdAt: new Date()
        });

        // Send account lockout notification email
        try {
          // const { emailService } = await import('../email.service');
          
          // TODO: Implement sendSecurityAlert method in EmailService
          const maskEmail = (email: string) => {
            const [local, domain] = email.split('@');
            return `${local.substring(0, 2)}***@${domain}`;
          };

          console.log('Account lockout alert for:', maskEmail(user.email), {
            alertType: 'Account Lockout',
            deviceName: 'Multiple devices',
            location: 'Unknown Location',
            timestamp: new Date().toISOString(),
            ipAddress,
            additionalInfo: 'Your account has been temporarily locked due to multiple failed login attempts.'
          });
          
          /*
          await emailService.sendSecurityAlert(
            user.email,
            user.fullName,
            {
              alertType: 'Account Lockout',
              deviceName: 'Multiple devices',
              location: this.getLocationFromIP(ipAddress) || 'Unknown Location',
              timestamp: new Date().toISOString(),
              ipAddress,
              additionalInfo: 'Your account has been temporarily locked due to multiple failed login attempts.'
            }
          );
          */

        } catch (emailError) {
          console.error('Error sending account lockout email:', emailError);
        }
      }

    } catch (error) {
      console.error('Error monitoring account lockout:', error);
    }
  }

  /**
   * Enhanced device fingerprinting
   */
  static generateEnhancedDeviceFingerprint(
    _userAgent?: string,
    acceptLanguage?: string,
    timezone?: string,
    screenResolution?: string,
    additionalInfo?: any
  ): DeviceInfo {
    // Create a more comprehensive device fingerprint
    const fingerprint = {
      userAgent: _userAgent || 'unknown',
      language: acceptLanguage || 'unknown',
      timezone: timezone || 'unknown',
      screen: screenResolution || 'unknown',
      ...additionalInfo
    };

    const fingerprintString = JSON.stringify(fingerprint);
    const deviceId = Buffer.from(fingerprintString).toString('base64').substring(0, 32);
    const deviceName = this.parseDeviceName(_userAgent);

    return {
      deviceId,
      deviceName,
      userAgent: _userAgent,
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * Parse device name from user agent with more detailed detection
   */
  private static parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (ua.includes('iphone')) {
      if (ua.includes('iphone os 15')) return 'iPhone (iOS 15)';
      if (ua.includes('iphone os 16')) return 'iPhone (iOS 16)';
      return 'iPhone';
    }
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) {
      if (ua.includes('mobile')) return 'Android Phone';
      return 'Android Tablet';
    }

    // Desktop OS
    if (ua.includes('windows nt 10')) return 'Windows 10/11';
    if (ua.includes('windows nt 6')) return 'Windows 7/8';
    if (ua.includes('mac os x')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';

    // Browsers
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';
    if (ua.includes('opera')) return 'Opera Browser';

    return 'Unknown Device';
  }

  /**
   * Get security monitoring statistics
   */
  static async getSecurityStatistics(): Promise<{
    totalLoginAttempts: number;
    failedLoginAttempts: number;
    activeAlerts: number;
    topFailureReasons: Array<{ reason: string; count: number }>;
    topAttackIPs: Array<{ ip: string; attempts: number }>;
  }> {
    try {
      // Since rate limiting is disabled, return empty statistics
      return {
        totalLoginAttempts: 0,
        failedLoginAttempts: 0,
        activeAlerts: 0,
        topFailureReasons: [],
        topAttackIPs: []
      };

    } catch (error) {
      console.error('Error getting security statistics:', error);
      return {
        totalLoginAttempts: 0,
        failedLoginAttempts: 0,
        activeAlerts: 0,
        topFailureReasons: [],
        topAttackIPs: []
      };
    }
  }

  /**
   * Clean up old security data (should be run periodically)
   */
  static cleanupSecurityData(): void {
    // Since rate limiting is disabled, no cleanup needed
    console.log('[SECURITY] Rate limiting disabled - no cleanup needed');
  }

  /**
   * Schedule periodic security data cleanup
   */
  static scheduleSecurityCleanup(): void {
    // Since rate limiting is disabled, no cleanup scheduling needed
    console.log('Rate limiting disabled - no security cleanup scheduling needed');
  }
}

export default SecurityMonitoringService;