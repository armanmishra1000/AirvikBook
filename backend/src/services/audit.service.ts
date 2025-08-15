import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

export interface SecurityAlertData {
  userId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export class AuditService {
  static async logSecurityEvent(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          details: JSON.stringify(data.details),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          success: data.success,
          errorMessage: data.errorMessage,
          timestamp: new Date(),
        },
      });

      // Also log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 SECURITY EVENT:', {
          userId: data.userId,
          action: data.action,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          success: data.success,
          errorMessage: data.errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit logging should not break main functionality
    }
  }

  static async logLogin(userId: string, req: Request, success: boolean, errorMessage?: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'LOGIN_ATTEMPT',
      details: {
        method: 'password',
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success,
      errorMessage,
    });
  }

  static async logLogout(userId: string, req: Request): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'LOGOUT',
      details: {
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: true,
    });
  }

  static async logPasswordChange(userId: string, req: Request, success: boolean): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'PASSWORD_CHANGE',
      details: {
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success,
    });
  }

  static async logAdminAction(userId: string, req: Request, action: string, details: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: `ADMIN_${action}`,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: true,
    });
  }

  static async logFileAccess(userId: string, req: Request, filename: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'FILE_ACCESS',
      details: {
        filename,
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: true,
    });
  }

  static async logSecurityAlert(data: SecurityAlertData): Promise<void> {
    try {
      await prisma.securityAlert.create({
        data: {
          userId: data.userId,
          alertType: data.alertType,
          severity: data.severity,
          details: JSON.stringify(data.details),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date(),
        },
      });

      // Also log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🚨 SECURITY ALERT:', {
          userId: data.userId,
          alertType: data.alertType,
          severity: data.severity,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Security alert logging failed:', error);
      // Don't throw - alert logging should not break main functionality
    }
  }



  static async logFailedLogin(email: string, req: Request, reason: string): Promise<void> {
    await this.logSecurityEvent({
      userId: 'anonymous',
      action: 'FAILED_LOGIN',
      details: {
        email: this.maskEmail(email),
        reason,
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success: false,
      errorMessage: reason,
    });
  }

  /**
   * Mask email for privacy in logs
   */
  private static maskEmail(email: string): string {
    if (!email) return 'no-email';
    const [local, domain] = email.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          details: true,
          ipAddress: true,
          userAgent: true,
          success: true,
          errorMessage: true,
          timestamp: true,
        },
      });

      return logs.map(log => ({
        ...log,
        details: JSON.parse(log.details),
      }));
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get security alerts
   */
  static async getSecurityAlerts(limit: number = 100, resolved: boolean = false): Promise<any[]> {
    try {
      const alerts = await prisma.securityAlert.findMany({
        where: { isResolved: resolved },
        orderBy: { timestamp: 'desc' },
        take: limit,
        select: {
          id: true,
          userId: true,
          alertType: true,
          severity: true,
          details: true,
          ipAddress: true,
          userAgent: true,
          isResolved: true,
          resolvedAt: true,
          resolvedBy: true,
          timestamp: true,
        },
      });

      return alerts.map(alert => ({
        ...alert,
        details: JSON.parse(alert.details),
      }));
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return [];
    }
  }

  /**
   * Resolve a security alert
   */
  static async resolveSecurityAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      await prisma.securityAlert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy,
        },
      });
      return true;
    } catch (error) {
      console.error('Error resolving security alert:', error);
      return false;
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStatistics(): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    recentAlerts: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    try {
      const [
        totalEvents,
        successfulEvents,
        failedEvents,
        recentAlerts,
        topActions,
      ] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({ where: { success: true } }),
        prisma.auditLog.count({ where: { success: false } }),
        prisma.securityAlert.count({ where: { isResolved: false } }),
        prisma.auditLog.groupBy({
          by: ['action'],
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 10,
        }),
      ]);

      return {
        totalEvents,
        successfulEvents,
        failedEvents,
        recentAlerts,
        topActions: topActions.map(item => ({
          action: item.action,
          count: item._count.action,
        })),
      };
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      return {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        recentAlerts: 0,
        topActions: [],
      };
    }
  }
}

export default AuditService;
