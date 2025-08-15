import { Router, Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.utils';
import AntivirusService from '../services/antivirus.service';
import AuditService from '../services/audit.service';
import PasswordValidationService from '../services/passwordValidation.service';
import SecurityValidationService from '../services/securityValidation.service';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/security/validate
 * Perform comprehensive security validation (admin only)
 */
router.get('/validate', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admins to perform security validation
    if (user.role !== 'admin') {
      return ResponseUtil.error(res, 'Access denied', 'ACCESS_DENIED', 403);
    }

    const validationResult = await SecurityValidationService.validateSecurity();
    
    return ResponseUtil.success(res, validationResult);
  } catch (error) {
    console.error('Error performing security validation:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * GET /api/v1/security/status
 * Get overall security status of the system
 */
router.get('/status', AuthMiddleware.verifyToken, async (_req: Request, res: Response) => {
  try {
    const [antivirusStatus, auditStats, passwordRequirements] = await Promise.all([
      AntivirusService.getStatus(),
      AuditService.getAuditStatistics(),
      PasswordValidationService.getRequirements(),
    ]);

    const securityStatus = {
      system: {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
      },
      antivirus: {
        available: antivirusStatus.available,
        methods: antivirusStatus.methods,
        lastScan: antivirusStatus.lastScan,
      },
      audit: {
        totalEvents: auditStats.totalEvents,
        successfulEvents: auditStats.successfulEvents,
        failedEvents: auditStats.failedEvents,
        recentAlerts: auditStats.recentAlerts,
        topActions: auditStats.topActions,
      },
      password: {
        requirements: passwordRequirements,
        strengthTips: PasswordValidationService.getStrengthTips(),
      },
      security: {
        corsEnabled: true,
        cspEnabled: true,
        httpsEnforced: process.env.NODE_ENV === 'production',
        jwtRotation: true,
        tokenBlacklisting: true,
        inputSanitization: true,
        fileUploadScanning: true,
      },
    };

    return ResponseUtil.success(res, securityStatus);
  } catch (error) {
    console.error('Error getting security status:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * GET /api/v1/security/audit-logs
 * Get audit logs for the authenticated user
 */
router.get('/audit-logs', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const logs = await AuditService.getUserAuditLogs(userId, limit);
    
    return ResponseUtil.success(res, {
      logs,
      total: logs.length,
      limit,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * GET /api/v1/security/alerts
 * Get security alerts (admin only)
 */
router.get('/alerts', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admins to view security alerts
    if (user.role !== 'admin') {
      return ResponseUtil.error(res, 'Access denied', 'ACCESS_DENIED', 403);
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const resolved = req.query.resolved === 'true';
    
    const alerts = await AuditService.getSecurityAlerts(limit, resolved);
    
    return ResponseUtil.success(res, {
      alerts,
      total: alerts.length,
      limit,
      resolved,
    });
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * POST /api/v1/security/alerts/:alertId/resolve
 * Resolve a security alert (admin only)
 */
router.post('/alerts/:alertId/resolve', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admins to resolve security alerts
    if (user.role !== 'admin') {
      return ResponseUtil.error(res, 'Access denied', 'ACCESS_DENIED', 403);
    }

    const { alertId } = req.params;
    const { resolvedBy } = req.body;

    if (!resolvedBy) {
      return ResponseUtil.error(res, 'Resolved by field is required', 'MISSING_FIELD', 400);
    }

    const success = await AuditService.resolveSecurityAlert(alertId, resolvedBy);
    
    if (success) {
      return ResponseUtil.success(res, { message: 'Alert resolved successfully' });
    } else {
      return ResponseUtil.error(res, 'Failed to resolve alert', 'RESOLVE_FAILED', 500);
    }
  } catch (error) {
    console.error('Error resolving security alert:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * POST /api/v1/security/validate-password
 * Validate password strength
 */
router.post('/validate-password', async (req: Request, res: Response) => {
  try {
    const { password, userId, userInfo } = req.body;

    if (!password) {
      return ResponseUtil.error(res, 'Password is required', 'MISSING_PASSWORD', 400);
    }

    const validation = await PasswordValidationService.validatePassword(password, userId, userInfo);
    
    return ResponseUtil.success(res, {
      isValid: validation.isValid,
      strength: validation.strength,
      score: validation.score,
      errors: validation.errors,
      requirements: PasswordValidationService.getRequirements(),
      tips: PasswordValidationService.getStrengthTips(),
    });
  } catch (error) {
    console.error('Error validating password:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * POST /api/v1/security/generate-password
 * Generate a secure password
 */
router.post('/generate-password', async (req: Request, res: Response) => {
  try {
    const { length = 16 } = req.body;
    
    if (length < 12 || length > 128) {
      return ResponseUtil.error(res, 'Password length must be between 12 and 128 characters', 'INVALID_LENGTH', 400);
    }

    const password = PasswordValidationService.generateSecurePassword(length);
    
    return ResponseUtil.success(res, {
      password,
      length,
      requirements: PasswordValidationService.getRequirements(),
    });
  } catch (error) {
    console.error('Error generating password:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * GET /api/v1/security/antivirus-status
 * Get antivirus service status
 */
router.get('/antivirus-status', AuthMiddleware.verifyToken, async (_req: Request, res: Response) => {
  try {
    const status = await AntivirusService.getStatus();
    
    return ResponseUtil.success(res, status);
  } catch (error) {
    console.error('Error getting antivirus status:', error);
    return ResponseUtil.serverError(res, error);
  }
});

/**
 * POST /api/v1/security/test-scan
 * Test file scanning (admin only)
 */
router.post('/test-scan', AuthMiddleware.verifyToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Only allow admins to test scanning
    if (user.role !== 'admin') {
      return ResponseUtil.error(res, 'Access denied', 'ACCESS_DENIED', 403);
    }

    const { fileContent, filename } = req.body;

    if (!fileContent || !filename) {
      return ResponseUtil.error(res, 'File content and filename are required', 'MISSING_FIELDS', 400);
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileContent, 'base64');
    
    const scanResult = await AntivirusService.scanFile(buffer, filename);
    
    return ResponseUtil.success(res, {
      scanResult,
      fileSize: buffer.length,
      filename,
    });
  } catch (error) {
    console.error('Error testing file scan:', error);
    return ResponseUtil.serverError(res, error);
  }
});

export default router;
