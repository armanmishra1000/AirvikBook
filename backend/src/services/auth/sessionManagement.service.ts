import { PrismaClient } from '@prisma/client';
import { JwtService } from '../jwt.service';

const prisma = new PrismaClient();

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent?: string;
  lastActivity?: string;
}

export interface SessionData {
  id: string;
  deviceInfo: DeviceInfo;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
  ipAddress?: string;
  location?: string;
}

export interface SessionManagementResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}

export interface ActiveSessionsResult extends SessionManagementResult {
  data?: {
    sessions: SessionData[];
    totalSessions: number;
  };
}

export interface LogoutResult extends SessionManagementResult {
  data?: {
    loggedOut: boolean;
    sessionsInvalidated: number;
    message: string;
  };
}

export class SessionManagementService {
  private static readonly MAX_SESSIONS_PER_USER = 10;
  private static readonly SESSION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get all active sessions for a user
   */
  static async getActiveSessions(
    userId: string,
    currentRefreshToken?: string
  ): Promise<ActiveSessionsResult> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        select: {
          id: true,
          userId: true,
          token: true,
          refreshToken: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          deviceInfo: true,
          ipAddress: true,
          userAgent: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const sessionData: SessionData[] = sessions.map(session => {
        let deviceInfo: DeviceInfo;
        try {
          deviceInfo = session.deviceInfo ? 
            JSON.parse(session.deviceInfo as string) : 
            { deviceId: 'unknown', deviceName: 'Unknown Device' };
        } catch {
          deviceInfo = { deviceId: 'unknown', deviceName: 'Unknown Device' };
        }

        return {
          id: session.id,
          deviceInfo: {
            ...deviceInfo,
            lastActivity: session.updatedAt.toISOString()
          },
          createdAt: session.createdAt.toISOString(),
          lastActivity: session.updatedAt.toISOString(),
          isCurrent: session.refreshToken === currentRefreshToken,
          ipAddress: session.ipAddress || undefined,
          location: this.getLocationFromIP(session.ipAddress || '')
        };
      });

      return {
        success: true,
        data: {
          sessions: sessionData,
          totalSessions: sessionData.length
        }
      };

    } catch (error) {
      console.error('Error getting active sessions:', error);
      return {
        success: false,
        error: 'Failed to retrieve active sessions',
        code: 'SESSION_RETRIEVAL_ERROR'
      };
    }
  }

  /**
   * Invalidate a specific session (logout from specific device)
   */
  static async invalidateSession(
    sessionId: string,
    userId: string
  ): Promise<LogoutResult> {
    try {
      // Verify session belongs to user
      const session = await prisma.session.findFirst({
        where: {
          id: sessionId,
          userId,
          isActive: true
        }
      });

      if (!session) {
        return {
          success: false,
          error: 'Session not found or already inactive',
          code: 'SESSION_NOT_FOUND'
        };
      }

      // Invalidate the session
      await prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false }
      });

      // Also invalidate the refresh token in JWT service
      await JwtService.invalidateRefreshToken(session.refreshToken);

      return {
        success: true,
        data: {
          loggedOut: true,
          sessionsInvalidated: 1,
          message: 'Successfully logged out from device'
        }
      };

    } catch (error) {
      console.error('Error invalidating session:', error);
      return {
        success: false,
        error: 'Failed to invalidate session',
        code: 'SESSION_INVALIDATION_ERROR'
      };
    }
  }

  /**
   * Invalidate all sessions for a user (logout from all devices)
   */
  static async invalidateAllUserSessions(userId: string): Promise<LogoutResult> {
    try {
      // Get all active sessions for the user
      const activeSessions = await prisma.session.findMany({
        where: {
          userId,
          isActive: true
        }
      });

      // Invalidate all sessions
      await prisma.session.updateMany({
        where: {
          userId,
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      // Invalidate all refresh tokens
      await JwtService.invalidateAllUserTokens(userId);

      return {
        success: true,
        data: {
          loggedOut: true,
          sessionsInvalidated: activeSessions.length,
          message: 'Logged out from all devices'
        }
      };

    } catch (error) {
      console.error('Error invalidating all user sessions:', error);
      return {
        success: false,
        error: 'Failed to invalidate all sessions',
        code: 'ALL_SESSIONS_INVALIDATION_ERROR'
      };
    }
  }

  /**
   * Update session activity (for tracking last activity)
   */
  static async updateSessionActivity(
    refreshToken: string,
    ipAddress?: string
  ): Promise<SessionManagementResult> {
    try {
      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          isActive: true
        }
      });

      if (!session) {
        return {
          success: false,
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        };
      }

      await prisma.session.update({
        where: { id: session.id },
        data: {
          updatedAt: new Date(),
          ipAddress: ipAddress || session.ipAddress
        }
      });

      return { success: true };

    } catch (error) {
      console.error('Error updating session activity:', error);
      return {
        success: false,
        error: 'Failed to update session activity',
        code: 'SESSION_UPDATE_ERROR'
      };
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false }
          ]
        }
      });

      console.log(`Cleaned up ${result.count} expired sessions`);

      return {
        success: true,
        deletedCount: result.count
      };

    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return {
        success: false,
        deletedCount: 0,
        error: 'Failed to cleanup expired sessions'
      };
    }
  }

  /**
   * Enforce session limits per user
   */
  static async enforceSessionLimits(userId: string): Promise<{
    success: boolean;
    removedSessions: number;
    error?: string;
  }> {
    try {
      const activeSessions = await prisma.session.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'asc' // Oldest first
        }
      });

      if (activeSessions.length <= this.MAX_SESSIONS_PER_USER) {
        return {
          success: true,
          removedSessions: 0
        };
      }

      // Remove oldest sessions to stay within limit
      const sessionsToRemove = activeSessions.slice(0, activeSessions.length - this.MAX_SESSIONS_PER_USER);
      const sessionIdsToRemove = sessionsToRemove.map(s => s.id);

      await prisma.session.updateMany({
        where: {
          id: { in: sessionIdsToRemove }
        },
        data: {
          isActive: false
        }
      });

      // Also invalidate the refresh tokens
      for (const session of sessionsToRemove) {
        await JwtService.invalidateRefreshToken(session.refreshToken);
      }

      return {
        success: true,
        removedSessions: sessionsToRemove.length
      };

    } catch (error) {
      console.error('Error enforcing session limits:', error);
      return {
        success: false,
        removedSessions: 0,
        error: 'Failed to enforce session limits'
      };
    }
  }

  /**
   * Check if device is new for user
   */
  static async isNewDevice(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    try {
      const existingSession = await prisma.session.findFirst({
        where: {
          userId,
          isActive: true,
          deviceInfo: {
            path: ['deviceId'],
            equals: deviceInfo.deviceId
          }
        }
      });

      return !existingSession;
    } catch (error) {
      console.error('Error checking if device is new:', error);
      return true; // Assume new device on error for security
    }
  }

  /**
   * Get device fingerprint information
   */
  static generateDeviceFingerprint(userAgent?: string, additionalInfo?: any): DeviceInfo {
    const deviceId = this.generateDeviceId(userAgent, additionalInfo);
    const deviceName = this.parseDeviceName(userAgent);

    return {
      deviceId,
      deviceName,
      userAgent,
      lastActivity: new Date().toISOString()
    };
  }

  /**
   * Generate a unique device ID based on available information
   */
  private static generateDeviceId(userAgent?: string, additionalInfo?: any): string {
    // In a real implementation, you'd want to create a more sophisticated
    // device fingerprint using multiple factors like:
    // - User agent
    // - Screen resolution
    // - Timezone
    // - Language
    // - Available fonts
    // - Canvas fingerprint
    // etc.
    
    // For now, we'll use a simplified approach
    const baseInfo = `${userAgent || 'unknown'}_${additionalInfo?.timezone || 'unknown'}`;
    return Buffer.from(baseInfo).toString('base64').substring(0, 16);
  }

  /**
   * Parse device name from user agent
   */
  private static parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    // Basic device detection
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Windows')) return 'Windows Device';
    if (userAgent.includes('Macintosh')) return 'Mac Device';
    if (userAgent.includes('Linux')) return 'Linux Device';
    
    // Browser detection
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    
    return 'Unknown Device';
  }

  /**
   * Get approximate location from IP address
   */
  private static getLocationFromIP(ipAddress?: string): string | undefined {
    if (!ipAddress) return undefined;
    
    // Placeholder for IP geolocation
    // In production, you'd use a service like MaxMind GeoIP or ip-api.com
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
      return 'Local Network';
    }
    
    return 'Unknown Location';
  }

  /**
   * Schedule automatic session cleanup
   */
  static scheduleSessionCleanup(): void {
    setInterval(async () => {
      await this.cleanupExpiredSessions();
    }, this.SESSION_CLEANUP_INTERVAL_MS);

    console.log('Session cleanup scheduled to run every 24 hours');
  }

  /**
   * Get session statistics for monitoring
   */
  static async getSessionStatistics(): Promise<{
    totalActiveSessions: number;
    totalExpiredSessions: number;
    averageSessionDuration: number;
    topDeviceTypes: Array<{ device: string; count: number }>;
  }> {
    try {
      const activeSessions = await prisma.session.count({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });

      const expiredSessions = await prisma.session.count({
        where: {
          OR: [
            { isActive: false },
            { expiresAt: { lte: new Date() } }
          ]
        }
      });

      // Calculate average session duration (simplified)
      const recentSessions = await prisma.session.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          createdAt: true,
          updatedAt: true,
          deviceInfo: true
        }
      });

      const totalDuration = recentSessions.reduce((sum, session) => {
        return sum + (session.updatedAt.getTime() - session.createdAt.getTime());
      }, 0);

      const averageSessionDuration = recentSessions.length > 0 ? 
        totalDuration / recentSessions.length : 0;

      // Get top device types
      const deviceCounts = new Map<string, number>();
      recentSessions.forEach(session => {
        if (session.deviceInfo) {
          try {
            const deviceInfo = JSON.parse(session.deviceInfo as string);
            const deviceType = deviceInfo.deviceName || 'Unknown';
            deviceCounts.set(deviceType, (deviceCounts.get(deviceType) || 0) + 1);
          } catch {
            deviceCounts.set('Unknown', (deviceCounts.get('Unknown') || 0) + 1);
          }
        }
      });

      const topDeviceTypes = Array.from(deviceCounts.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalActiveSessions: activeSessions,
        totalExpiredSessions: expiredSessions,
        averageSessionDuration: Math.round(averageSessionDuration / (1000 * 60)), // in minutes
        topDeviceTypes
      };

    } catch (error) {
      console.error('Error getting session statistics:', error);
      return {
        totalActiveSessions: 0,
        totalExpiredSessions: 0,
        averageSessionDuration: 0,
        topDeviceTypes: []
      };
    }
  }
}

export default SessionManagementService;