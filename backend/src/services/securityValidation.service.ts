import DatabaseConfigService from '../config/database.config';
import AntivirusService from './antivirus.service';
import AuditService from './audit.service';
import JwtService from './jwt.service';

export interface SecurityValidationResult {
  overallStatus: 'secure' | 'warning' | 'critical';
  score: number; // 0-100
  checks: SecurityCheck[];
  recommendations: string[];
  lastChecked: string;
}

export interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  details?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityValidationService {
  /**
   * Perform comprehensive security validation
   */
  static async validateSecurity(): Promise<SecurityValidationResult> {
    const checks: SecurityCheck[] = [];
    const recommendations: string[] = [];

    // 1. Environment Configuration
    checks.push(...await this.validateEnvironmentConfig());

    // 2. Database Security
    checks.push(...await this.validateDatabaseSecurity());

    // 3. JWT Configuration
    checks.push(...this.validateJwtConfig());

    // 4. File Upload Security
    checks.push(...await this.validateFileUploadSecurity());

    // 6. Audit Logging
    checks.push(...await this.validateAuditLogging());

    // 7. Password Security
    checks.push(...this.validatePasswordSecurity());

    // 8. CORS Configuration
    checks.push(...this.validateCorsConfig());

    // 9. Security Headers
    checks.push(...this.validateSecurityHeaders());

    // 10. API Security
    checks.push(...this.validateApiSecurity());

    // Calculate overall status and score
    const { overallStatus, score } = this.calculateOverallStatus(checks);

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(checks));

    return {
      overallStatus,
      score,
      checks,
      recommendations,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Validate environment configuration
   */
  private static async validateEnvironmentConfig(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    // Check NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      checks.push({
        name: 'Environment Mode',
        status: 'pass',
        description: 'Running in production mode',
        priority: 'high',
      });
    } else {
      checks.push({
        name: 'Environment Mode',
        status: 'warning',
        description: 'Running in development mode - ensure production settings',
        priority: 'high',
      });
    }

    // Check HTTPS enforcement
    if (process.env.FORCE_HTTPS === 'true' || process.env.NODE_ENV === 'production') {
      checks.push({
        name: 'HTTPS Enforcement',
        status: 'pass',
        description: 'HTTPS enforcement is enabled',
        priority: 'critical',
      });
    } else {
      checks.push({
        name: 'HTTPS Enforcement',
        status: 'fail',
        description: 'HTTPS enforcement is not enabled',
        priority: 'critical',
      });
    }

    // Check for exposed secrets
    const exposedSecrets = this.checkForExposedSecrets();
    if (exposedSecrets.length === 0) {
      checks.push({
        name: 'Secret Exposure',
        status: 'pass',
        description: 'No exposed secrets detected',
        priority: 'critical',
      });
    } else {
      checks.push({
        name: 'Secret Exposure',
        status: 'fail',
        description: `Exposed secrets detected: ${exposedSecrets.join(', ')}`,
        priority: 'critical',
        details: exposedSecrets,
      });
    }

    return checks;
  }

  /**
   * Validate database security
   */
  private static async validateDatabaseSecurity(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    try {
      const dbConfig = DatabaseConfigService.getConfig();
      const dbValidation = DatabaseConfigService.validateSecurityConfig();

      // Check SSL configuration
      if (dbConfig.ssl && process.env.NODE_ENV === 'production') {
        checks.push({
          name: 'Database SSL',
          status: 'pass',
          description: `SSL enabled with mode: ${dbConfig.sslMode}`,
          priority: 'high',
        });
      } else if (process.env.NODE_ENV === 'production') {
        checks.push({
          name: 'Database SSL',
          status: 'fail',
          description: 'SSL not enabled in production',
          priority: 'critical',
        });
      } else {
        checks.push({
          name: 'Database SSL',
          status: 'warning',
          description: 'SSL not enabled (development mode)',
          priority: 'medium',
        });
      }

      // Check connection limits
      if (dbConfig.maxConnections <= 100) {
        checks.push({
          name: 'Database Connection Limits',
          status: 'pass',
          description: `Connection limit set to ${dbConfig.maxConnections}`,
          priority: 'medium',
        });
      } else {
        checks.push({
          name: 'Database Connection Limits',
          status: 'warning',
          description: `Connection limit too high: ${dbConfig.maxConnections}`,
          priority: 'medium',
        });
      }

      // Check for validation warnings
      if (!dbValidation.isValid) {
        checks.push({
          name: 'Database Configuration',
          status: 'warning',
          description: 'Database configuration has warnings',
          priority: 'medium',
          details: dbValidation.warnings,
        });
      }

      // Test connection
      const connectionTest = await DatabaseConfigService.testConnection();
      if (connectionTest.success) {
        checks.push({
          name: 'Database Connection',
          status: 'pass',
          description: 'Database connection successful',
          priority: 'high',
        });
      } else {
        checks.push({
          name: 'Database Connection',
          status: 'fail',
          description: 'Database connection failed',
          priority: 'critical',
          details: connectionTest.error,
        });
      }
    } catch (error) {
      checks.push({
        name: 'Database Security',
        status: 'fail',
        description: 'Database security validation failed',
        priority: 'critical',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return checks;
  }

  /**
   * Validate JWT configuration
   */
  private static validateJwtConfig(): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    const jwtValidation = JwtService.validateConfiguration();

    if (jwtValidation.isValid) {
      checks.push({
        name: 'JWT Configuration',
        status: 'pass',
        description: 'JWT configuration is valid',
        priority: 'high',
      });
    } else {
      checks.push({
        name: 'JWT Configuration',
        status: 'fail',
        description: 'JWT configuration has errors',
        priority: 'critical',
        details: jwtValidation.errors,
      });
    }

    // Check JWT expiry times
    const accessExpiry = process.env.JWT_EXPIRE || '15m';
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRE || '1d';

    if (accessExpiry === '15m') {
      checks.push({
        name: 'JWT Access Token Expiry',
        status: 'pass',
        description: 'Access token expiry set to 15 minutes',
        priority: 'high',
      });
    } else {
      checks.push({
        name: 'JWT Access Token Expiry',
        status: 'warning',
        description: `Access token expiry: ${accessExpiry}`,
        priority: 'high',
      });
    }

    if (refreshExpiry === '1d') {
      checks.push({
        name: 'JWT Refresh Token Expiry',
        status: 'pass',
        description: 'Refresh token expiry set to 1 day',
        priority: 'high',
      });
    } else {
      checks.push({
        name: 'JWT Refresh Token Expiry',
        status: 'warning',
        description: `Refresh token expiry: ${refreshExpiry}`,
        priority: 'high',
      });
    }

    return checks;
  }



  /**
   * Validate file upload security
   */
  private static async validateFileUploadSecurity(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    try {
      const antivirusStatus = await AntivirusService.getStatus();

      if (antivirusStatus.available) {
        checks.push({
          name: 'Antivirus Scanning',
          status: 'pass',
          description: 'Antivirus scanning is available',
          priority: 'high',
          details: antivirusStatus.methods,
        });
      } else {
        checks.push({
          name: 'Antivirus Scanning',
          status: 'warning',
          description: 'Antivirus scanning is not available',
          priority: 'high',
        });
      }

      // Check file size limits
      const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
      if (maxFileSize <= 5 * 1024 * 1024) { // 5MB
        checks.push({
          name: 'File Size Limits',
          status: 'pass',
          description: `Max file size: ${maxFileSize / (1024 * 1024)}MB`,
          priority: 'medium',
        });
      } else {
        checks.push({
          name: 'File Size Limits',
          status: 'warning',
          description: `Max file size too high: ${maxFileSize / (1024 * 1024)}MB`,
          priority: 'medium',
        });
      }

      // Check malware scanning
      if (process.env.SCAN_FILES_FOR_MALWARE === 'true') {
        checks.push({
          name: 'Malware Scanning',
          status: 'pass',
          description: 'Malware scanning is enabled',
          priority: 'high',
        });
      } else {
        checks.push({
          name: 'Malware Scanning',
          status: 'warning',
          description: 'Malware scanning is not enabled',
          priority: 'high',
        });
      }
    } catch (error) {
      checks.push({
        name: 'File Upload Security',
        status: 'fail',
        description: 'File upload security validation failed',
        priority: 'high',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return checks;
  }

  /**
   * Validate audit logging
   */
  private static async validateAuditLogging(): Promise<SecurityCheck[]> {
    const checks: SecurityCheck[] = [];

    try {
      if (process.env.AUDIT_LOG_ENABLED === 'true') {
        checks.push({
          name: 'Audit Logging',
          status: 'pass',
          description: 'Audit logging is enabled',
          priority: 'high',
        });
      } else {
        checks.push({
          name: 'Audit Logging',
          status: 'fail',
          description: 'Audit logging is not enabled',
          priority: 'high',
        });
      }

      if (process.env.SECURITY_ALERT_ENABLED === 'true') {
        checks.push({
          name: 'Security Alerts',
          status: 'pass',
          description: 'Security alerts are enabled',
          priority: 'high',
        });
      } else {
        checks.push({
          name: 'Security Alerts',
          status: 'warning',
          description: 'Security alerts are not enabled',
          priority: 'high',
        });
      }

      // Test audit service
      const auditStats = await AuditService.getAuditStatistics();
      checks.push({
        name: 'Audit Service',
        status: 'pass',
        description: 'Audit service is functional',
        priority: 'medium',
        details: {
          totalEvents: auditStats.totalEvents,
          successfulEvents: auditStats.successfulEvents,
          failedEvents: auditStats.failedEvents,
        },
      });
    } catch (error) {
      checks.push({
        name: 'Audit Logging',
        status: 'fail',
        description: 'Audit logging validation failed',
        priority: 'high',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return checks;
  }

  /**
   * Validate password security
   */
  private static validatePasswordSecurity(): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '12');
    const maxLength = parseInt(process.env.PASSWORD_MAX_LENGTH || '128');

    if (minLength >= 12) {
      checks.push({
        name: 'Password Minimum Length',
        status: 'pass',
        description: `Minimum password length: ${minLength} characters`,
        priority: 'high',
      });
    } else {
      checks.push({
        name: 'Password Minimum Length',
        status: 'fail',
        description: `Minimum password length too short: ${minLength} characters`,
        priority: 'critical',
      });
    }

    if (maxLength <= 128) {
      checks.push({
        name: 'Password Maximum Length',
        status: 'pass',
        description: `Maximum password length: ${maxLength} characters`,
        priority: 'medium',
      });
    } else {
      checks.push({
        name: 'Password Maximum Length',
        status: 'warning',
        description: `Maximum password length too high: ${maxLength} characters`,
        priority: 'medium',
      });
    }

    // Check password requirements
    const requirements = [
      { name: 'Uppercase', env: 'PASSWORD_REQUIRE_UPPERCASE' },
      { name: 'Lowercase', env: 'PASSWORD_REQUIRE_LOWERCASE' },
      { name: 'Numbers', env: 'PASSWORD_REQUIRE_NUMBERS' },
      { name: 'Special Characters', env: 'PASSWORD_REQUIRE_SPECIAL_CHARS' },
    ];

    requirements.forEach(req => {
      if (process.env[req.env] === 'true') {
        checks.push({
          name: `Password ${req.name}`,
          status: 'pass',
          description: `${req.name} requirement enabled`,
          priority: 'high',
        });
      } else {
        checks.push({
          name: `Password ${req.name}`,
          status: 'fail',
          description: `${req.name} requirement not enabled`,
          priority: 'high',
        });
      }
    });

    return checks;
  }

  /**
   * Validate CORS configuration
   */
  private static validateCorsConfig(): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    const frontendUrl = process.env.FRONTEND_URL;
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === 'production') {
      if (frontendUrl && frontendUrl.startsWith('https://')) {
        checks.push({
          name: 'CORS Configuration',
          status: 'pass',
          description: 'CORS configured for production with HTTPS',
          priority: 'high',
        });
      } else {
        checks.push({
          name: 'CORS Configuration',
          status: 'fail',
          description: 'CORS not properly configured for production',
          priority: 'critical',
        });
      }
    } else {
      checks.push({
        name: 'CORS Configuration',
        status: 'warning',
        description: 'CORS configured for development',
        priority: 'medium',
      });
    }

    return checks;
  }

  /**
   * Validate security headers
   */
  private static validateSecurityHeaders(): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    if (process.env.SECURITY_HEADERS_ENABLED === 'true') {
      checks.push({
        name: 'Security Headers',
        status: 'pass',
        description: 'Security headers are enabled',
        priority: 'high',
      });
    } else {
      checks.push({
        name: 'Security Headers',
        status: 'fail',
        description: 'Security headers are not enabled',
        priority: 'high',
      });
    }

    return checks;
  }

  /**
   * Validate API security
   */
  private static validateApiSecurity(): SecurityCheck[] {
    const checks: SecurityCheck[] = [];

    const apiPrefix = process.env.API_PREFIX || '/api/v1';
    if (apiPrefix.startsWith('/api/')) {
      checks.push({
        name: 'API Versioning',
        status: 'pass',
        description: `API versioning enabled: ${apiPrefix}`,
        priority: 'medium',
      });
    } else {
      checks.push({
        name: 'API Versioning',
        status: 'warning',
        description: 'API versioning not properly configured',
        priority: 'medium',
      });
    }

    return checks;
  }

  /**
   * Check for exposed secrets
   */
  private static checkForExposedSecrets(): string[] {
    const exposedSecrets: string[] = [];
    const sensitiveKeys = [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'SMTP_PASS',
      'TWILIO_AUTH_TOKEN',
      'WHATSAPP_ACCESS_TOKEN',
      'RAZORPAY_KEY_SECRET',
      'ICICI_ENCRYPTION_KEY',

      'AWS_SECRET_ACCESS_KEY',
    ];

    sensitiveKeys.forEach(key => {
      const value = process.env[key];
      if (value && (
        value.includes('your-') ||
        value.includes('example') ||
        value.includes('test') ||
        value.length < 10
      )) {
        exposedSecrets.push(key);
      }
    });

    return exposedSecrets;
  }

  /**
   * Calculate overall security status and score
   */
  private static calculateOverallStatus(checks: SecurityCheck[]): { overallStatus: 'secure' | 'warning' | 'critical'; score: number } {
    let totalScore = 0;
    let maxScore = 0;
    let criticalFails = 0;
    let highFails = 0;

    checks.forEach(check => {
      let checkScore = 0;
      let checkMaxScore = 0;

      switch (check.priority) {
        case 'critical':
          checkMaxScore = 20;
          if (check.status === 'pass') checkScore = 20;
          else if (check.status === 'warning') checkScore = 10;
          else {
            checkScore = 0;
            criticalFails++;
          }
          break;
        case 'high':
          checkMaxScore = 15;
          if (check.status === 'pass') checkScore = 15;
          else if (check.status === 'warning') checkScore = 7;
          else {
            checkScore = 0;
            highFails++;
          }
          break;
        case 'medium':
          checkMaxScore = 10;
          if (check.status === 'pass') checkScore = 10;
          else if (check.status === 'warning') checkScore = 5;
          else checkScore = 0;
          break;
        case 'low':
          checkMaxScore = 5;
          if (check.status === 'pass') checkScore = 5;
          else if (check.status === 'warning') checkScore = 2;
          else checkScore = 0;
          break;
      }

      totalScore += checkScore;
      maxScore += checkMaxScore;
    });

    const score = Math.round((totalScore / maxScore) * 100);

    let overallStatus: 'secure' | 'warning' | 'critical';
    if (criticalFails > 0) {
      overallStatus = 'critical';
    } else if (highFails > 0 || score < 80) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'secure';
    }

    return { overallStatus, score };
  }

  /**
   * Generate recommendations based on check results
   */
  private static generateRecommendations(checks: SecurityCheck[]): string[] {
    const recommendations: string[] = [];

    const failedChecks = checks.filter(check => check.status === 'fail');
    const warningChecks = checks.filter(check => check.status === 'warning');

    failedChecks.forEach(check => {
      switch (check.name) {
        case 'HTTPS Enforcement':
          recommendations.push('Enable HTTPS enforcement in production');
          break;
        case 'Secret Exposure':
          recommendations.push('Remove exposed secrets and use proper environment variables');
          break;
        case 'Database SSL':
          recommendations.push('Enable SSL for database connections in production');
          break;
        case 'JWT Configuration':
          recommendations.push('Fix JWT configuration errors');
          break;
        case 'Audit Logging':
          recommendations.push('Enable audit logging for security monitoring');
          break;
        case 'Password Minimum Length':
          recommendations.push('Increase minimum password length to at least 12 characters');
          break;
        default:
          recommendations.push(`Fix ${check.name}: ${check.description}`);
      }
    });

    warningChecks.forEach(check => {
      switch (check.name) {
        case 'Environment Mode':
          recommendations.push('Ensure all production security settings are configured');
          break;
        case 'Antivirus Scanning':
          recommendations.push('Configure antivirus scanning for file uploads');
          break;
        case 'Security Alerts':
          recommendations.push('Enable security alerts for better monitoring');
          break;
        default:
          recommendations.push(`Review ${check.name}: ${check.description}`);
      }
    });

    return recommendations;
  }
}

export default SecurityValidationService;
