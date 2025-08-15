export class EnvironmentConfig {
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static getDatabaseUrl(): string {
    if (this.isProduction()) {
      return process.env.DATABASE_URL_PROD || process.env.DATABASE_URL || '';
    }
    return process.env.DATABASE_URL_DEV || process.env.DATABASE_URL || '';
  }

  static getDatabaseName(): string {
    if (this.isProduction()) {
      return 'airvikbook_prod';
    }
    return 'airvikbook_dev';
  }

  static getEnvironmentInfo() {
    return {
      environment: this.isProduction() ? 'PRODUCTION' : 'DEVELOPMENT',
      database: this.getDatabaseName(),
      databaseUrl: this.getDatabaseUrl().replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      allowDestructiveOps: this.isDevelopment(),
      requireConfirmation: this.isProduction()
    };
  }

  // Prevent dangerous operations in production
  static allowDestructiveOperations(): boolean {
    return this.isDevelopment();
  }

  // Require explicit confirmation for production operations
  static requireProductionConfirmation(): boolean {
    return this.isProduction();
  }

  // Get team member info (for development)
  static getTeamMemberInfo() {
    if (this.isDevelopment()) {
      return {
        teamSize: 6,
        sharedDatabase: true,
        provider: 'Supabase',
        cost: '$0/month'
      };
    }
    return {
      teamSize: 1, // Only production admin
      sharedDatabase: false,
      provider: 'AWS RDS',
      cost: '$50-100/month'
    };
  }
}
