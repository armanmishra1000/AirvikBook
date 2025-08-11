import { Request, Response, NextFunction } from 'express';

export class SanitizationMiddleware {
  /**
   * Sanitize request body
   */
  static sanitizeBody(req: Request, _res: Response, next: NextFunction) {
    if (req.body) {
      req.body = SanitizationMiddleware.sanitizeObject(req.body);
    }
    next();
  }

  /**
   * Sanitize query parameters
   */
  static sanitizeQuery(req: Request, _res: Response, next: NextFunction) {
    // Do NOT sanitize Google OAuth query params. Google's OAuth flow relies on
    // an exact `state` value round-trip. Encoding characters (e.g. quotes or slashes)
    // breaks the JSON state payload and causes "Invalid OAuth state".
    const path = req.path || '';
    if (path.includes('/auth/google')) {
      return next();
    }

    if (req.query) {
      // Preserve `state` param verbatim even outside Google endpoints, just in case
      // future identity providers/flows rely on the same pattern.
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(req.query)) {
        if (key === 'state') {
          sanitized[key] = value;
        } else {
          sanitized[key] = SanitizationMiddleware.sanitizeObject(value);
        }
      }
      req.query = sanitized as any;
    }
    next();
  }

  /**
   * Sanitize URL parameters
   */
  static sanitizeParams(req: Request, _res: Response, next: NextFunction) {
    if (req.params) {
      req.params = SanitizationMiddleware.sanitizeObject(req.params);
    }
    next();
  }

  /**
   * Recursively sanitize object properties
   */
  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return SanitizationMiddleware.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SanitizationMiddleware.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = SanitizationMiddleware.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Sanitize a string to prevent XSS
   */
  private static sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') {
      return str;
    }

    // Check if this looks like a URL (starts with http:// or https://)
    const isUrl = /^https?:\/\//.test(str);
    
    // Remove HTML tags and encode special characters
    let sanitized = str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    // Only encode forward slashes if it's NOT a URL
    if (!isUrl) {
      sanitized = sanitized.replace(/\//g, '&#x2F;');
    }
    
    return sanitized;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate and sanitize file path to prevent path traversal
   */
  static validateFilePath(filePath: string): boolean {
    if (!filePath) return false;
    
    // Check for path traversal attempts
    const normalizedPath = filePath.replace(/\\/g, '/');
    return !normalizedPath.includes('..') && 
           !normalizedPath.includes('~') && 
           !normalizedPath.startsWith('/') &&
           !normalizedPath.includes('//');
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) return '';
    
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}

export default SanitizationMiddleware;
