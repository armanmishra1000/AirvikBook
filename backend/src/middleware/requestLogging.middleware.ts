import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export interface RequestLogData {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId?: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  apiVersion?: string;
  userAgentInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export class RequestLoggingMiddleware {
  private static readonly SENSITIVE_PATHS = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/verify-email'
  ];

  private static readonly EXCLUDED_PATHS = [
    '/api/v1/health',
    '/favicon.ico',
    '/robots.txt'
  ];

  /**
   * Parse user agent string
   */
  private static parseUserAgent(userAgent: string): {
    browser?: string;
    os?: string;
    device?: string;
  } {
    try {
      // Simple user agent parsing
      const ua = userAgent.toLowerCase();
      
      let browser = 'Unknown';
      let os = 'Unknown';
      let device = 'Unknown';

      // Browser detection
      if (ua.includes('chrome')) browser = 'Chrome';
      else if (ua.includes('firefox')) browser = 'Firefox';
      else if (ua.includes('safari')) browser = 'Safari';
      else if (ua.includes('edge')) browser = 'Edge';
      else if (ua.includes('opera')) browser = 'Opera';

      // OS detection
      if (ua.includes('windows')) os = 'Windows';
      else if (ua.includes('mac')) os = 'macOS';
      else if (ua.includes('linux')) os = 'Linux';
      else if (ua.includes('android')) os = 'Android';
      else if (ua.includes('ios')) os = 'iOS';

      // Device detection
      if (ua.includes('mobile')) device = 'Mobile';
      else if (ua.includes('tablet')) device = 'Tablet';
      else device = 'Desktop';

      return { browser, os, device };
    } catch (error) {
      return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
    }
  }

  /**
   * Check if path contains sensitive information
   */
  private static isSensitivePath(path: string): boolean {
    return this.SENSITIVE_PATHS.some(sensitivePath => 
      path.startsWith(sensitivePath)
    );
  }

  /**
   * Check if path should be excluded from logging
   */
  private static shouldExcludePath(path: string): boolean {
    return this.EXCLUDED_PATHS.some(excludedPath => 
      path.startsWith(excludedPath)
    );
  }



  /**
   * Main request logging middleware
   */
  static logRequest(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to capture response data
    res.send = function(this: Response, data: any) {
      RequestLoggingMiddleware.logResponse(req, res, startTime, data);
      return originalSend.call(this, data);
    };

    res.json = function(this: Response, data: any) {
      RequestLoggingMiddleware.logResponse(req, res, startTime, data);
      return originalJson.call(this, data);
    };

    // Log request start
    RequestLoggingMiddleware.logRequestStart(req);

    next();
  }

  /**
   * Log request start
   */
  private static logRequestStart(req: Request): void {
    if (RequestLoggingMiddleware.shouldExcludePath(req.path)) {
      return;
    }

    const logData: Partial<RequestLogData> = {
      method: req.method,
      url: req.path,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date(),
      apiVersion: (req as any).apiVersion,
      userAgentInfo: RequestLoggingMiddleware.parseUserAgent(req.get('User-Agent') || ''),
    };

    // Log request details (excluding sensitive paths)
    if (!RequestLoggingMiddleware.isSensitivePath(req.path)) {
      console.log(`📥 ${req.method} ${req.path} - ${logData.ip} - ${logData.userAgentInfo?.browser}/${logData.userAgentInfo?.os}`);
    } else {
      console.log(`🔒 ${req.method} ${req.path} - ${logData.ip} - [SENSITIVE REQUEST]`);
    }
  }

  /**
   * Log response
   */
  private static logResponse(req: Request, res: Response, startTime: number, _responseData: any): void {
    if (RequestLoggingMiddleware.shouldExcludePath(req.path)) {
      return;
    }

    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const userId = (req as any).user?.userId || 'anonymous';

    const logData: RequestLogData = {
      method: req.method,
      url: req.path,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      userId,
      statusCode,
      responseTime,
      timestamp: new Date(),
      apiVersion: (req as any).apiVersion,
      userAgentInfo: RequestLoggingMiddleware.parseUserAgent(req.get('User-Agent') || ''),
    };

    // Log response details
    const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '🔄' : '✅';
    const logMessage = `${statusEmoji} ${req.method} ${req.path} - ${statusCode} - ${responseTime}ms - ${logData.ip}`;

    if (statusCode >= 400) {
      console.error(logMessage);
      
      // Log errors to audit service
      if (userId !== 'anonymous') {
        AuditService.logSecurityEvent({
          userId,
          action: 'API_ERROR',
          details: {
            method: req.method,
            path: req.path,
            statusCode,
            responseTime,
            timestamp: new Date().toISOString(),
          },
          ipAddress: logData.ip,
          userAgent: logData.userAgent,
          success: false,
          errorMessage: `HTTP ${statusCode}`,
        }).catch(console.error);
      }
    } else {
      console.log(logMessage);
    }

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.path} took ${responseTime}ms`);
    }

    // Log suspicious requests
    if (statusCode === 401 || statusCode === 403) {
      console.warn(`🚨 Suspicious request: ${req.method} ${req.path} - ${statusCode} - ${logData.ip}`);
    }
  }

  /**
   * Error logging middleware
   */
  static logError(error: any, req: Request, _res: Response, next: NextFunction): void {
    const userId = (req as any).user?.userId || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    console.error(`💥 Error in ${req.method} ${req.path}:`, {
      error: error.message,
      stack: error.stack,
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Log to audit service if user is authenticated
    if (userId !== 'anonymous') {
      AuditService.logSecurityEvent({
        userId,
        action: 'API_ERROR',
        details: {
          method: req.method,
          path: req.path,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: error.message,
      }).catch(console.error);
    }

    next(error);
  }

  /**
   * Get request statistics
   */
  static getRequestStats(): {
    totalRequests: number;
    errorRequests: number;
    averageResponseTime: number;
    slowRequests: number;
  } {
    // This would typically be implemented with a database or cache
    // For now, return placeholder data
    return {
      totalRequests: 0,
      errorRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
    };
  }
}

export default RequestLoggingMiddleware;
