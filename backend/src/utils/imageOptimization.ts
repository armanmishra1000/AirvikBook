import sharp from 'sharp';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizationResult {
  buffer: Buffer;
  dimensions: ImageDimensions;
  format: string;
  size: number;
}

export class ImageOptimization {
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly DEFAULT_MAX_WIDTH = 800;
  private static readonly DEFAULT_MAX_HEIGHT = 800;
  private static readonly DEFAULT_FORMAT = 'jpeg';

  /**
   * Get image dimensions from buffer
   */
  static async getImageDimensions(buffer: Buffer): Promise<ImageDimensions> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0
      };
    } catch (error) {
      throw new Error('Unable to read image dimensions');
    }
  }

  /**
   * Validate image dimensions
   */
  static validateDimensions(dimensions: ImageDimensions, minWidth = 100, minHeight = 100, maxWidth = 2000, maxHeight = 2000): boolean {
    return (
      dimensions.width >= minWidth &&
      dimensions.height >= minHeight &&
      dimensions.width <= maxWidth &&
      dimensions.height <= maxHeight
    );
  }

  /**
   * Optimize image for profile picture
   */
  static async optimizeProfilePicture(
    buffer: Buffer,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    try {
      const {
        maxWidth = this.DEFAULT_MAX_WIDTH,
        maxHeight = this.DEFAULT_MAX_HEIGHT,
        quality = this.DEFAULT_QUALITY,
        format = this.DEFAULT_FORMAT
      } = options;

      // Get original dimensions
      const originalDimensions = await this.getImageDimensions(buffer);

      // Calculate new dimensions while maintaining aspect ratio
      const { width, height } = this.calculateResizeDimensions(
        originalDimensions.width,
        originalDimensions.height,
        maxWidth,
        maxHeight
      );

      // Process image with Sharp
      let processedImage = sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Apply format-specific processing
      switch (format) {
        case 'jpeg':
          processedImage = processedImage.jpeg({ quality });
          break;
        case 'png':
          processedImage = processedImage.png({ quality });
          break;
        case 'webp':
          processedImage = processedImage.webp({ quality });
          break;
        default:
          processedImage = processedImage.jpeg({ quality });
      }

      // Get optimized buffer
      const optimizedBuffer = await processedImage.toBuffer();

      // Get final dimensions
      const finalDimensions = await this.getImageDimensions(optimizedBuffer);

      return {
        buffer: optimizedBuffer,
        dimensions: finalDimensions,
        format,
        size: optimizedBuffer.length
      };
    } catch (error) {
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate resize dimensions while maintaining aspect ratio
   */
  private static calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // If image is larger than max dimensions, resize it
    if (width > maxWidth || height > maxHeight) {
      if (width / maxWidth > height / maxHeight) {
        width = maxWidth;
        height = Math.round(width / aspectRatio);
      } else {
        height = maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }

    return { width, height };
  }

  /**
   * Convert image to specific format
   */
  static async convertFormat(
    buffer: Buffer,
    format: 'jpeg' | 'png' | 'webp',
    quality = 85
  ): Promise<Buffer> {
    try {
      let processedImage = sharp(buffer);

      switch (format) {
        case 'jpeg':
          processedImage = processedImage.jpeg({ quality });
          break;
        case 'png':
          processedImage = processedImage.png({ quality });
          break;
        case 'webp':
          processedImage = processedImage.webp({ quality });
          break;
      }

      return await processedImage.toBuffer();
    } catch (error) {
      throw new Error(`Format conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create thumbnail from image
   */
  static async createThumbnail(
    buffer: Buffer,
    size: number = 150,
    quality = 80
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      throw new Error(`Thumbnail creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image format
   */
  static async validateImageFormat(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      const format = metadata.format?.toLowerCase();
      
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      return allowedFormats.includes(format || '');
    } catch {
      return false;
    }
  }

  /**
   * Get image metadata
   */
  static async getImageMetadata(buffer: Buffer): Promise<{
    format: string;
    width: number;
    height: number;
    size: number;
    hasAlpha: boolean;
  }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: buffer.length,
        hasAlpha: metadata.hasAlpha || false
      };
    } catch (error) {
      throw new Error('Unable to read image metadata');
    }
  }
}

export default ImageOptimization;
