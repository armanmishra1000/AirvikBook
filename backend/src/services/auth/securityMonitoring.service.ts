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

export interface RateLimitInfo {
  allowed: boolean;
  attempts: number;
  resetTime?: Date;
  lockoutUntil?: Date;
}

export interface SecurityEventResult {
  success: boolean;
  error?: string;
  code?: string;
}

export class SecurityMonitoringService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 10; // Failed attempts from different IPs

  // In-memory storage for rate limiting (in production, use Redis)
  private static loginAttempts = new Map<string, Array<{ timestamp: number; success: boolean; ip: string }>>();
  private static ipAttempts = new Map<string, Array<{ timestamp: number; success: boolean; email: string }>>();

  /**
   * Check rate limiting for login attempts
   */
  static async checkRateLimit(email: string, ipAddress: string): Promise<RateLimitInfo> {
    try {
      const now = Date.now();
      const windowStart = now - this.RATE_LIMIT_WINDOW_MS;

      // Clean old attempts
      this.cleanOldAttempts(email, ipAddress, windowStart);

      // Check email-based rate limiting
      const emailAttempts = this.loginAttempts.get(email) || [];
      const emailFailures = emailAttempts.filter(attempt => 
        !attempt.success && attempt.timestamp > windowStart
      ).length;

      // Check IP-based rate limiting
      const ipAttempts = this.ipAttempts.get(ipAddress) || [];
      const ipFailures = ipAttempts.filter(attempt => 
        !attempt.success && attempt.timestamp > windowStart
      ).length;

      // Apply stricter limit for email (to prevent account-specific attacks)
      const maxEmailAttempts = 3;
      const maxIpAttempts = this.MAX_LOGIN_ATTEMPTS;

      if (emailFailures >= maxEmailAttempts || ipFailures >= maxIpAttempts) {
        const lockoutUntil = new Date(now + this.LOCKOUT_DURATION_MS);
        return {
          allowed: false,
          attempts: Math.max(emailFailures, ipFailures),
          lockoutUntil
        };
      }

      return {
        allowed: true,
        attempts: Math.max(emailFailures, ipFailures)
      };

    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Allow on error to prevent blocking legitimate users
      return { allowed: true, attempts: 0 };
    }
  }

  /**
   * Log login attempt for security monitoring
   */
  static async logLoginAttempt(
    email: string,
    ipAddress: string,
    _userAgent?: string,
    success: boolean = false,
    failureReason?: string
  ): Promise<SecurityEventResult> {
    try {
      const now = Date.now();
      
      // Store in memory (in production, use database or Redis)
      const emailAttempts = this.loginAttempts.get(email) || [];
      emailAttempts.push({ timestamp: now, success, ip: ipAddress });
      this.loginAttempts.set(email, emailAttempts);

      const ipAttempts = this.ipAttempts.get(ipAddress) || [];
      ipAttempts.push({ timestamp: now, success, email });
      this.ipAttempts.set(ipAddress, ipAttempts);

      // Log to console (in production, log to security audit system)
      const logMessage = `Login attempt: ${email} from ${ipAddress} - ${success ? 'SUCCESS' : 'FAILED'}`;
      console.log(`[SECURITY] ${logMessage} ${failureReason ? `(${failureReason})` : ''}`);

      // Detect suspicious activity
      if (!success) {
        await this.detectSuspiciousActivity(email, ipAddress);
      }

      return { success: true };

    } catch (error) {
      console.error('Error logging login attempt:', error);
      return {
        success: false,
        error: 'Failed to log login attempt',
        code: 'LOGGING_ERROR'
      };
    }
  }

  /**
   * Detect and alert on suspicious activity
   */
  private static async detectSuspiciousActivity(email: string, ipAddress: string): Promise<void> {
    try {
      const now = Date.now();
      const windowStart = now - (60 * 60 * 1000); // 1 hour window

      // Check for rapid failed attempts from multiple IPs for same email
      const emailAttempts = this.loginAttempts.get(email) || [];
      const recentFailures = emailAttempts.filter(attempt => 
        !attempt.success && attempt.timestamp > windowStart
      );

      const uniqueIPs = new Set(recentFailures.map(attempt => attempt.ip));
      
      if (recentFailures.length >= this.SUSPICIOUS_ACTIVITY_THRESHOLD || uniqueIPs.size >= 3) {
        await this.createSecurityAlert({
          userId: email, // Will need to resolve to actual user ID
          type: 'SUSPICIOUS_ACTIVITY',
          message: `Suspicious login activity detected for ${email}: ${recentFailures.length} failed attempts from ${uniqueIPs.size} different IPs`,
          severity: 'HIGH',
          metadata: {
            failedAttempts: recentFailures.length,
            uniqueIPs: Array.from(uniqueIPs),
            timeWindow: '1 hour'
          }
        });
      }

      // Check for rapid attempts from same IP to multiple accounts
      const ipAttempts = this.ipAttempts.get(ipAddress) || [];
      const ipFailures = ipAttempts.filter(attempt => 
        !attempt.success && attempt.timestamp > windowStart
      );

      const uniqueEmails = new Set(ipFailures.map(attempt => attempt.email));
      
      if (ipFailures.length >= this.SUSPICIOUS_ACTIVITY_THRESHOLD || uniqueEmails.size >= 5) {
        await this.createSecurityAlert({
          userId: 'SYSTEM',
          type: 'SUSPICIOUS_ACTIVITY',
          message: `Suspicious activity from IP ${ipAddress}: ${ipFailures.length} failed attempts across ${uniqueEmails.size} accounts`,
          severity: 'HIGH',
          metadata: {
            ipAddress,
            failedAttempts: ipFailures.length,
            uniqueAccounts: uniqueEmails.size,
            timeWindow: '1 hour'
          }
        });
      }

    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
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
        userId,
        type: 'NEW_DEVICE_LOGIN',
        message: `New device login detected for ${user.email}`,
        severity: 'MEDIUM',
        metadata: {
          deviceInfo,
          ipAddress,
          userAgent,
          location: this.getLocationFromIP(ipAddress)
        }
      });

      // Send email notification using existing email service
      // This would integrate with the email service created in user registration
      try {
        // Import email service dynamically to avoid circular dependencies
        // const { emailService } = await import('../email.service');
        
        // TODO: Implement sendSecurityAlert method in EmailService
        console.log('Security alert triggered for:', user.email, {
          alertType: 'New Device Login',
          deviceName: deviceInfo.deviceName,
          location: this.getLocationFromIP(ipAddress) || 'Unknown Location',
          timestamp: new Date().toISOString(),
          ipAddress
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
   * Create security alert record
   */
  private static async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'resolved' | 'createdAt'>): Promise<void> {
    try {
      // In production, store alerts in database
      // For now, log to console and could store in a dedicated alerts table
      console.log(`[SECURITY ALERT - ${alert.severity}] ${alert.type}: ${alert.message}`, alert.metadata);

      // Could store in database:
      // await prisma.securityAlert.create({ data: alert });

    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Clean old login attempts from memory
   */
  private static cleanOldAttempts(email: string, ipAddress: string, windowStart: number): void {
    // Clean email attempts
    const emailAttempts = this.loginAttempts.get(email) || [];
    const validEmailAttempts = emailAttempts.filter(attempt => attempt.timestamp > windowStart);
    if (validEmailAttempts.length > 0) {
      this.loginAttempts.set(email, validEmailAttempts);
    } else {
      this.loginAttempts.delete(email);
    }

    // Clean IP attempts
    const ipAttempts = this.ipAttempts.get(ipAddress) || [];
    const validIpAttempts = ipAttempts.filter(attempt => attempt.timestamp > windowStart);
    if (validIpAttempts.length > 0) {
      this.ipAttempts.set(ipAddress, validIpAttempts);
    } else {
      this.ipAttempts.delete(ipAddress);
    }
  }

  /**
   * Get approximate location from IP address
   */
  private static getLocationFromIP(ipAddress: string): string | undefined {
    // Placeholder for IP geolocation
    // In production, use a service like MaxMind GeoIP or ip-api.com
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
      return 'Local Network';
    }
    
    if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return 'Localhost';
    }
    
    return 'Unknown Location';
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
          userId: user.id,
          type: 'ACCOUNT_LOCKOUT',
          message: `Account locked due to multiple failed login attempts: ${email}`,
          severity: 'HIGH',
          metadata: {
            ipAddress,
            lockoutDuration: '15 minutes',
            maxAttempts: this.MAX_LOGIN_ATTEMPTS
          }
        });

        // Send account lockout notification email
        try {
          // const { emailService } = await import('../email.service');
          
          // TODO: Implement sendSecurityAlert method in EmailService
          console.log('Account lockout alert for:', user.email, {
            alertType: 'Account Lockout',
            deviceName: 'Multiple devices',
            location: this.getLocationFromIP(ipAddress) || 'Unknown Location',
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
      const now = Date.now();
      const last24Hours = now - (24 * 60 * 60 * 1000);

      let totalAttempts = 0;
      let failedAttempts = 0;
      const failureReasons = new Map<string, number>();
      const attackIPs = new Map<string, number>();

      // Analyze in-memory data
      for (const [_email, attempts] of this.loginAttempts.entries()) {
        const recentAttempts = attempts.filter(attempt => attempt.timestamp > last24Hours);
        totalAttempts += recentAttempts.length;
        
        for (const attempt of recentAttempts) {
          if (!attempt.success) {
            failedAttempts++;
            attackIPs.set(attempt.ip, (attackIPs.get(attempt.ip) || 0) + 1);
          }
        }
      }

      // Convert maps to sorted arrays
      const topFailureReasons = Array.from(failureReasons.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topAttackIPs = Array.from(attackIPs.entries())
        .map(([ip, attempts]) => ({ ip, attempts }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 10);

      return {
        totalLoginAttempts: totalAttempts,
        failedLoginAttempts: failedAttempts,
        activeAlerts: 0, // Would query from alerts table in production
        topFailureReasons,
        topAttackIPs
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
    const now = Date.now();
    const cutoff = now - (7 * 24 * 60 * 60 * 1000); // 7 days

    // Clean login attempts older than 7 days
    for (const [key, attempts] of this.loginAttempts.entries()) {
      const validAttempts = attempts.filter(attempt => attempt.timestamp > cutoff);
      if (validAttempts.length > 0) {
        this.loginAttempts.set(key, validAttempts);
      } else {
        this.loginAttempts.delete(key);
      }
    }

    for (const [key, attempts] of this.ipAttempts.entries()) {
      const validAttempts = attempts.filter(attempt => attempt.timestamp > cutoff);
      if (validAttempts.length > 0) {
        this.ipAttempts.set(key, validAttempts);
      } else {
        this.ipAttempts.delete(key);
      }
    }

    console.log('[SECURITY] Cleaned up old security monitoring data');
  }

  /**
   * Schedule periodic security data cleanup
   */
  static scheduleSecurityCleanup(): void {
    setInterval(() => {
      this.cleanupSecurityData();
    }, 24 * 60 * 60 * 1000); // Run daily

    console.log('Security data cleanup scheduled to run daily');
  }
}

export default SecurityMonitoringService;