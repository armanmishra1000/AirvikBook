import { Request, Response, NextFunction } from 'express';

export class HttpsMiddleware {
  /**
   * Enforce HTTPS in production
   */
  static enforceHttps(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production') {
      // Check if request is coming through a proxy (common in production)
      const isSecure = req.secure || 
                      req.header('x-forwarded-proto') === 'https' ||
                      req.header('x-forwarded-ssl') === 'on';

      if (!isSecure) {
        const host = req.header('host') || req.hostname;
        const redirectUrl = `https://${host}${req.url}`;
        
        return res.redirect(301, redirectUrl);
      }
    }
    next();
  }

  /**
   * Add security headers for HTTPS
   */
  static addSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production') {
      // Strict Transport Security (HSTS)
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // XSS Protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions Policy
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }
    next();
  }

  /**
   * Check if HTTPS is properly configured
   */
  static isHttpsConfigured(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.FORCE_HTTPS === 'true' || process.env.NODE_ENV === 'production');
  }
}

export default HttpsMiddleware;
