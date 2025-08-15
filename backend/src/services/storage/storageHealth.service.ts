import { StorageConfig } from '../../config/storage.config';
import FileStorageService from './fileStorage.service';
import S3StorageService from './s3Storage.service';

export interface StorageHealthStatus {
  storageType: 'local' | 's3';
  isHealthy: boolean;
  isConfigured: boolean;
  environment: string;
  stats: any;
  errors: string[];
  recommendations: string[];
  lastChecked: Date;
}

export class StorageHealthService {
  /**
   * Check overall storage health
   */
  static async checkStorageHealth(): Promise<StorageHealthStatus> {
    const storageType = StorageConfig.getStorageType();
    const isConfigured = StorageConfig.isStorageConfigured();
    const environment = process.env.NODE_ENV || 'development';
    const errors: string[] = [];
    const recommendations: string[] = [];
    
    console.log(`🔍 Checking storage health for ${storageType} storage in ${environment} environment`);
    
    try {
      let stats: any = {};
      let isHealthy = false;
      
      if (storageType === 'local') {
        try {
          stats = await FileStorageService.getStorageStats();
          isHealthy = true;
        } catch (error) {
          errors.push(`Local storage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          isHealthy = false;
        }
      } else if (storageType === 's3') {
        if (!isConfigured) {
          errors.push('S3 storage is not properly configured');
          recommendations.push('Set up AWS credentials in environment variables');
          recommendations.push('Create an S3 bucket for file uploads');
          isHealthy = false;
        } else {
          try {
            stats = await S3StorageService.getStorageStats();
            isHealthy = true;
          } catch (error) {
            errors.push(`S3 storage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            isHealthy = false;
          }
        }
      } else {
        errors.push(`Unsupported storage type: ${storageType}`);
        isHealthy = false;
      }
      
      // Add general recommendations
      if (storageType === 'local' && environment === 'production') {
        recommendations.push('Consider using S3 storage for production environments');
        recommendations.push('Set up backup for local files');
      }
      
      if (storageType === 's3' && environment === 'development') {
        recommendations.push('Consider using local storage for development to reduce costs');
      }
      
      return {
        storageType,
        isHealthy,
        isConfigured,
        environment,
        stats,
        errors,
        recommendations,
        lastChecked: new Date()
      };
      
    } catch (error) {
      return {
        storageType,
        isHealthy: false,
        isConfigured,
        environment,
        stats: {},
        errors: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check storage configuration and permissions'],
        lastChecked: new Date()
      };
    }
  }

  /**
   * Get storage configuration status
   */
  static getConfigurationStatus() {
    return StorageConfig.getConfigurationStatus();
  }

  /**
   * Test file upload capability
   */
  static async testUploadCapability(): Promise<{
    canUpload: boolean;
    error?: string;
    storageType: string;
  }> {
    const storageType = StorageConfig.getStorageType();
    
    try {
      if (storageType === 'local') {
        // Test local directory access
        await FileStorageService.getStorageStats();
        return {
          canUpload: true,
          storageType: 'local',
          error: undefined
        };
      } else if (storageType === 's3') {
        if (!StorageConfig.isStorageConfigured()) {
          return {
            canUpload: false,
            storageType: 's3',
            error: 'S3 is not properly configured'
          };
        }
        
        // Test S3 connectivity
        await S3StorageService.getStorageStats();
        return {
          canUpload: true,
          storageType: 's3',
          error: undefined
        };
      }
      
      return {
        canUpload: false,
        storageType,
        error: 'Unsupported storage type'
      };
    } catch (error) {
      return {
        canUpload: false,
        storageType,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get storage information summary
   */
  static getStorageInfo() {
    return StorageConfig.getStorageInfo();
  }

  /**
   * Validate storage configuration
   */
  static validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const storageType = StorageConfig.getStorageType();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (storageType === 's3') {
      if (!process.env.AWS_ACCESS_KEY_ID) {
        errors.push('AWS_ACCESS_KEY_ID is not set');
      }
      if (!process.env.AWS_SECRET_ACCESS_KEY) {
        errors.push('AWS_SECRET_ACCESS_KEY is not set');
      }
      if (!process.env.AWS_S3_BUCKET_NAME) {
        errors.push('AWS_S3_BUCKET_NAME is not set');
      }
      if (!process.env.AWS_REGION) {
        errors.push('AWS_REGION is not set');
      }
    }
    
    if (storageType === 'local') {
      if (process.env.NODE_ENV === 'production') {
        warnings.push('Using local storage in production environment');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
