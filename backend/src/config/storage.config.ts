export type StorageType = 'local' | 's3';

export class StorageConfig {
  /**
   * Get the current storage type from environment variables
   */
  static getStorageType(): StorageType {
    return (process.env.STORAGE_TYPE as StorageType) || 'local';
  }

  /**
   * Check if local storage is being used
   */
  static isLocalStorage(): boolean {
    return this.getStorageType() === 'local';
  }

  /**
   * Check if S3 storage is being used
   */
  static isS3Storage(): boolean {
    return this.getStorageType() === 's3';
  }

  /**
   * Get comprehensive storage information
   */
  static getStorageInfo() {
    const storageType = this.getStorageType();
    
    return {
      type: storageType,
      isLocal: this.isLocalStorage(),
      isS3: this.isS3Storage(),
      environment: process.env.NODE_ENV || 'development',
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
      isConfigured: this.isStorageConfigured()
    };
  }

  /**
   * Check if storage is properly configured for the current type
   */
  static isStorageConfigured(): boolean {
    const storageType = this.getStorageType();
    
    if (storageType === 'local') {
      // Local storage is always available
      return true;
    }
    
    if (storageType === 's3') {
      // Check if S3 credentials are configured
      return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET_NAME &&
        process.env.AWS_REGION
      );
    }
    
    return false;
  }

  /**
   * Get storage configuration status for debugging
   */
  static getConfigurationStatus() {
    const storageType = this.getStorageType();
    const isConfigured = this.isStorageConfigured();
    
    return {
      storageType,
      isConfigured,
      environment: process.env.NODE_ENV || 'development',
      missingConfig: this.getMissingConfiguration(),
      recommendations: this.getConfigurationRecommendations()
    };
  }

  /**
   * Get missing configuration for current storage type
   */
  private static getMissingConfiguration(): string[] {
    const storageType = this.getStorageType();
    const missing: string[] = [];
    
    if (storageType === 's3') {
      if (!process.env.AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID');
      if (!process.env.AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY');
      if (!process.env.AWS_S3_BUCKET_NAME) missing.push('AWS_S3_BUCKET_NAME');
      if (!process.env.AWS_REGION) missing.push('AWS_REGION');
    }
    
    return missing;
  }

  /**
   * Get configuration recommendations
   */
  private static getConfigurationRecommendations(): string[] {
    const storageType = this.getStorageType();
    const recommendations: string[] = [];
    
    if (storageType === 's3' && !this.isStorageConfigured()) {
      recommendations.push('Set up AWS credentials in environment variables');
      recommendations.push('Create an S3 bucket for file uploads');
      recommendations.push('Configure proper IAM permissions for S3 access');
    }
    
    if (storageType === 'local') {
      recommendations.push('Ensure upload directory has proper write permissions');
      recommendations.push('Consider setting up backup for local files');
    }
    
    return recommendations;
  }
}
