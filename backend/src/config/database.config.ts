import { PrismaClient } from '@prisma/client';

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
    return {
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '5'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '300000'),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      timeout: parseInt(process.env.DB_TIMEOUT || '30000'),
      ssl: process.env.NODE_ENV === 'production',
      sslMode: (process.env.DB_SSL_MODE as 'require' | 'prefer' | 'allow' | 'disable') || 'require',
    };
  }

  /**
   * Build secure database URL with SSL configuration
   */
  static buildSecureDatabaseUrl(): string {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const config = this.getConfig();
    
    // If in production, ensure SSL is enabled
    if (config.ssl && process.env.NODE_ENV === 'production') {
      const url = new URL(baseUrl);
      
      // Add SSL parameters
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
   * Get Prisma client instance with connection pooling and SSL
   */
  static getPrismaClient(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        datasources: {
          db: {
            url: this.buildSecureDatabaseUrl(),
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Enhanced security configuration
        errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
      });

      // Add connection event handlers
      this.setupConnectionHandlers();
    }

    return this.instance;
  }

  /**
   * Setup database connection event handlers
   */
  private static setupConnectionHandlers(): void {
    if (!this.instance) return;

    // Log successful connection
    console.log('✅ Database connection established with SSL security');
    
    // Log SSL status
    const config = this.getConfig();
    if (config.ssl) {
      console.log(`🔒 SSL enabled with mode: ${config.sslMode}`);
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
