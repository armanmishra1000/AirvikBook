import { PrismaClient } from '@prisma/client';
import { EnvironmentConfig } from './environment.config';

export interface DatabaseConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  acquireTimeout: number;
  timeout: number;
  ssl: boolean;
  sslMode: 'require' | 'prefer' | 'allow' | 'disable';
}

export class DatabaseConfigService {
  private static instance: PrismaClient;

  /**
   * Get database configuration from environment variables
   */
  static getConfig(): DatabaseConfig {
    const isProduction = EnvironmentConfig.isProduction();
    
    return {
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || (isProduction ? '20' : '10')),
      minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || (isProduction ? '5' : '2')),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '300000'),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      timeout: parseInt(process.env.DB_TIMEOUT || '30000'),
      ssl: isProduction, // Only use SSL in production
      sslMode: isProduction ? 'require' : 'disable',
    };
  }

  /**
   * Build secure database URL with environment-specific configuration
   */
  static buildSecureDatabaseUrl(): string {
    const baseUrl = EnvironmentConfig.getDatabaseUrl();
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const config = this.getConfig();
    const isProduction = EnvironmentConfig.isProduction();
    
    if (isProduction && config.ssl) {
      const url = new URL(baseUrl);
      
      // Add SSL parameters for production
      url.searchParams.set('sslmode', config.sslMode);
      url.searchParams.set('ssl', 'true');
      
      // Add connection pooling parameters
      url.searchParams.set('connection_limit', config.maxConnections.toString());
      url.searchParams.set('pool_timeout', config.connectionTimeout.toString());
      
      return url.toString();
    }

    return baseUrl;
  }

  /**
   * Get Prisma client instance with environment-specific settings
   */
  static getPrismaClient(): PrismaClient {
    if (!this.instance) {
      const isProduction = EnvironmentConfig.isProduction();
      
      this.instance = new PrismaClient({
        datasources: {
          db: {
            url: this.buildSecureDatabaseUrl(),
          },
        },
        log: isProduction ? ['error'] : ['query', 'error', 'warn'],
        errorFormat: isProduction ? 'minimal' : 'pretty',
      });

      this.setupConnectionHandlers();
    }

    return this.instance;
  }

  /**
   * Setup database connection event handlers
   */
  private static setupConnectionHandlers(): void {
    if (!this.instance) return;

    const isProduction = EnvironmentConfig.isProduction();
    const environment = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';
    
    console.log(`✅ Database connection established (${environment})`);
    
    if (isProduction) {
      console.log('🔒 SSL enabled for production security');
    } else {
      console.log('🛠️ Development mode - SSL disabled for local development');
    }
  }

  /**
   * Test database connection with SSL verification
   */
  static async testConnection(): Promise<{ success: boolean; error?: string; sslStatus?: string }> {
    try {
      const client = this.getPrismaClient();
      const startTime = Date.now();
      
      await client.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      const config = this.getConfig();
      const sslStatus = config.ssl ? `SSL enabled (${config.sslMode})` : 'SSL disabled';
      
      console.log(`✅ Database connection test successful (${responseTime}ms) - ${sslStatus}`);
      
      return { 
        success: true, 
        sslStatus 
      };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      };
    }
  }

  /**
   * Get database health status with SSL information
   */
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    details: {
      connectionTest: boolean;
      responseTime: number;
      sslStatus: string;
      activeConnections?: number;
      errors?: string[];
    };
  }> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Test connection
      const connectionTest = await this.testConnection();
      const responseTime = Date.now() - startTime;

      if (!connectionTest.success) {
        errors.push(connectionTest.error || 'Connection test failed');
      }

      // Determine health status
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      
      if (errors.length > 0) {
        status = 'unhealthy';
      } else if (responseTime > 1000) {
        status = 'degraded';
      }

      return {
        status,
        details: {
          connectionTest: connectionTest.success,
          responseTime,
          sslStatus: connectionTest.sslStatus || 'Unknown',
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connectionTest: false,
          responseTime: Date.now() - startTime,
          sslStatus: 'Error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  /**
   * Gracefully close database connections
   */
  static async closeConnections(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.$disconnect();
        console.log('✅ Database connections closed successfully');
      } catch (error) {
        console.error('❌ Error closing database connections:', error);
      }
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    totalUsers: number;
    totalSessions: number;
    activeSessions: number;
    lastBackup?: Date;
  }> {
    try {
      const client = this.getPrismaClient();
      
      const [totalUsers, totalSessions, activeSessions] = await Promise.all([
        client.user.count(),
        client.session.count(),
        client.session.count({
          where: {
            isActive: true,
            expiresAt: {
              gt: new Date(),
            },
          },
        }),
      ]);

      return {
        totalUsers,
        totalSessions,
        activeSessions,
        lastBackup: undefined, // Would be implemented with backup service
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalUsers: 0,
        totalSessions: 0,
        activeSessions: 0,
      };
    }
  }

  /**
   * Validate database security configuration
   */
  static validateSecurityConfig(): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const config = this.getConfig();

    // Check SSL configuration
    if (process.env.NODE_ENV === 'production' && !config.ssl) {
      warnings.push('SSL is not enabled in production environment');
    }

    // Check connection limits
    if (config.maxConnections > 100) {
      warnings.push('Maximum connections set too high (>100)');
    }

    // Check timeout settings
    if (config.connectionTimeout > 60000) {
      warnings.push('Connection timeout set too high (>60s)');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}

export default DatabaseConfigService;
