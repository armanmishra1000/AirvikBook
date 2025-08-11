import { Request, Response, NextFunction } from 'express';

export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  sunset?: string; // ISO date string
  supported: boolean;
}

export class ApiVersioningMiddleware {
  private static readonly SUPPORTED_VERSIONS: Record<string, ApiVersion> = {
    'v1': {
      version: 'v1',
      supported: true,
      deprecated: false,
    },
    'v2': {
      version: 'v2',
      supported: false, // Not yet implemented
      deprecated: false,
    }
  };

  private static readonly DEFAULT_VERSION = 'v1';
  private static readonly LATEST_VERSION = 'v1';

  /**
   * Extract API version from request
   */
  static extractVersion(req: Request): string {
    // Check URL path for version
    const pathVersion = req.path.match(/\/api\/v(\d+)/);
    if (pathVersion) {
      return `v${pathVersion[1]}`;
    }

    // Check Accept header for version
    const acceptHeader = req.get('Accept');
    if (acceptHeader && acceptHeader.includes('version=')) {
      const versionMatch = acceptHeader.match(/version=(\d+)/);
      if (versionMatch) {
        return `v${versionMatch[1]}`;
      }
    }

    // Check custom header
    const customVersion = req.get('X-API-Version');
    if (customVersion) {
      return customVersion.startsWith('v') ? customVersion : `v${customVersion}`;
    }

    return ApiVersioningMiddleware.DEFAULT_VERSION;
  }

  /**
   * Validate API version
   */
  static validateVersion(version: string): { isValid: boolean; error?: string } {
    const versionInfo = ApiVersioningMiddleware.SUPPORTED_VERSIONS[version];
    
    if (!versionInfo) {
      return {
        isValid: false,
        error: `API version '${version}' is not supported. Supported versions: ${Object.keys(ApiVersioningMiddleware.SUPPORTED_VERSIONS).join(', ')}`
      };
    }

    if (!versionInfo.supported) {
      return {
        isValid: false,
        error: `API version '${version}' is not yet implemented`
      };
    }

    return { isValid: true };
  }

  /**
   * Add version headers to response
   */
  static addVersionHeaders(_req: Request, res: Response, version: string): void {
    const versionInfo = ApiVersioningMiddleware.SUPPORTED_VERSIONS[version];
    
    if (versionInfo) {
      res.setHeader('X-API-Version', version);
      res.setHeader('X-API-Latest-Version', ApiVersioningMiddleware.LATEST_VERSION);
      
      if (versionInfo.deprecated) {
        res.setHeader('X-API-Deprecated', 'true');
        if (versionInfo.sunset) {
          res.setHeader('X-API-Sunset', versionInfo.sunset);
        }
      }
    }
  }

  /**
   * Main versioning middleware
   */
  static handleVersioning(req: Request, res: Response, next: NextFunction): void {
    const version = ApiVersioningMiddleware.extractVersion(req);
    const validation = ApiVersioningMiddleware.validateVersion(version);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error,
        code: 'INVALID_API_VERSION',
        supportedVersions: Object.keys(ApiVersioningMiddleware.SUPPORTED_VERSIONS).filter(v => ApiVersioningMiddleware.SUPPORTED_VERSIONS[v].supported),
        latestVersion: ApiVersioningMiddleware.LATEST_VERSION
      });
      return;
    }

    // Add version info to request
    (req as any).apiVersion = version;
    (req as any).apiVersionInfo = ApiVersioningMiddleware.SUPPORTED_VERSIONS[version];

    // Add version headers to response
    ApiVersioningMiddleware.addVersionHeaders(req, res, version);

    next();
  }

  /**
   * Deprecation warning middleware
   */
  static addDeprecationWarning(req: Request, res: Response, next: NextFunction): void {
    const version = (req as any).apiVersion;
    const versionInfo = (req as any).apiVersionInfo;

    if (versionInfo && versionInfo.deprecated) {
      console.warn(`Deprecated API version ${version} used by ${req.ip} for ${req.path}`);
      
      // Add deprecation warning to response
      const originalJson = res.json;
      const latestVersion = ApiVersioningMiddleware.LATEST_VERSION;
      res.json = function(this: Response, data: any) {
        if (data && typeof data === 'object') {
          data.deprecationWarning = {
            message: `API version ${version} is deprecated`,
            sunset: versionInfo.sunset,
            latestVersion: latestVersion
          };
        }
        return originalJson.call(this, data);
      };
    }

    next();
  }

  /**
   * Get supported versions
   */
  static getSupportedVersions(): Record<string, ApiVersion> {
    return this.SUPPORTED_VERSIONS;
  }

  /**
   * Check if version is deprecated
   */
  static isVersionDeprecated(version: string): boolean {
    const versionInfo = this.SUPPORTED_VERSIONS[version];
    return versionInfo ? versionInfo.deprecated || false : false;
  }
}

export default ApiVersioningMiddleware;
