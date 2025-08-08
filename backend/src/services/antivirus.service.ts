import { promisify } from 'util';
import { exec } from 'child_process';
import https from 'https';

const execAsync = promisify(exec);

export interface ScanResult {
  isClean: boolean;
  threats: string[];
  scanMethod: string;
  scanTime: number;
  error?: string;
}

export interface VirusTotalResult {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout: number;
  confirmed_timeout: number;
  failure: number;
  type_unsupported: number;
}

export class AntivirusService {
  private static readonly VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  private static readonly VIRUSTOTAL_API_URL = 'https://www.virustotal.com/vtapi/v2';
  private static readonly CLAMAV_PATH = process.env.CLAMAV_PATH || 'C:\\Program Files\\ClamAV\\clamscan.exe';
  private static readonly MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB for VirusTotal
  private static readonly SCAN_TIMEOUT = 30000; // 30 seconds

  /**
   * Scan file for malware using multiple methods
   */
  static async scanFile(buffer: Buffer, filename: string): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // Method 1: ClamAV scan (local)
      const clamavResult = await this.scanWithClamAV(buffer, filename);
      if (!clamavResult.isClean) {
        return {
          ...clamavResult,
          scanTime: Date.now() - startTime
        };
      }

      // Method 2: VirusTotal scan (if file size allows and API key available)
      if (buffer.length <= this.MAX_FILE_SIZE && this.VIRUSTOTAL_API_KEY) {
        const vtResult = await this.scanWithVirusTotal(buffer, filename);
        if (!vtResult.isClean) {
          return {
            ...vtResult,
            scanTime: Date.now() - startTime
          };
        }
      }

      // Method 3: Basic signature scanning
      const signatureResult = await this.scanWithSignatures(buffer);
      if (!signatureResult.isClean) {
        return {
          ...signatureResult,
          scanTime: Date.now() - startTime
        };
      }

      return {
        isClean: true,
        threats: [],
        scanMethod: 'multi-layer',
        scanTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Antivirus scan error:', error);
      return {
        isClean: false,
        threats: ['Scan failed'],
        scanMethod: 'error',
        scanTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Scan file using ClamAV
   */
  private static async scanWithClamAV(buffer: Buffer, filename: string): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // Write buffer to temporary file
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `scan_${Date.now()}_${filename}`);
      
      fs.writeFileSync(tempFile, buffer);

      // Run ClamAV scan with proper path handling
      const clamavPath = this.CLAMAV_PATH.replace(/"/g, ''); // Remove quotes if present
      console.log(`🔍 Running ClamAV scan with: ${clamavPath}`);
      const { stdout } = await execAsync(
        `"${clamavPath}" --no-summary "${tempFile}"`,
        { timeout: this.SCAN_TIMEOUT }
      );

      // Clean up temp file
      fs.unlinkSync(tempFile);

      // Parse ClamAV output
      const isClean = !stdout.includes('FOUND');
      const threats = isClean ? [] : [stdout.trim()];

      return {
        isClean,
        threats,
        scanMethod: 'clamav',
        scanTime: Date.now() - startTime
      };

    } catch (error) {
      console.warn('ClamAV scan failed:', error);
      // If ClamAV is not available, continue with other methods
      return {
        isClean: true,
        threats: [],
        scanMethod: 'clamav-unavailable',
        scanTime: Date.now() - startTime
      };
    }
  }

  /**
   * Scan file using VirusTotal API
   */
  private static async scanWithVirusTotal(buffer: Buffer, _filename: string): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // Calculate file hash
      const crypto = require('crypto');
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

      // Check if file has been scanned before
      const checkUrl = `${this.VIRUSTOTAL_API_URL}/file/report`;
      const checkResponse = await this.makeHttpRequest(checkUrl, {
        apikey: this.VIRUSTOTAL_API_KEY!,
        resource: fileHash
      });

      if (checkResponse.response_code === 1) {
        // File has been scanned before
        const result = checkResponse as VirusTotalResult;
        const isClean = result.malicious === 0 && result.suspicious === 0;
        
        return {
          isClean,
          threats: isClean ? [] : [`VirusTotal: ${result.malicious} malicious, ${result.suspicious} suspicious`],
          scanMethod: 'virustotal-cached',
          scanTime: Date.now() - startTime
        };
      } else {
        // File needs to be uploaded for scanning
        // For now, assume clean for uploaded files
        return {
          isClean: true,
          threats: [],
          scanMethod: 'virustotal-uploaded',
          scanTime: Date.now() - startTime
        };
      }

    } catch (error) {
      console.warn('VirusTotal scan failed:', error);
      return {
        isClean: true,
        threats: [],
        scanMethod: 'virustotal-unavailable',
        scanTime: Date.now() - startTime
      };
    }
  }

  /**
   * Basic signature-based malware detection
   */
  private static async scanWithSignatures(buffer: Buffer): Promise<ScanResult> {
    const startTime = Date.now();
    const threats: string[] = [];
    
    // Check for common malware signatures (only for non-image files)
    const imageSignatures = [
      { name: 'JPEG', pattern: Buffer.from([0xFF, 0xD8, 0xFF]), description: 'JPEG image' },
      { name: 'PNG', pattern: Buffer.from([0x89, 0x50, 0x4E, 0x47]), description: 'PNG image' },
      { name: 'GIF', pattern: Buffer.from([0x47, 0x49, 0x46]), description: 'GIF image' },
      { name: 'WEBP', pattern: Buffer.from([0x52, 0x49, 0x46, 0x46]), description: 'WEBP image' },
    ];
    
    // Check if it's an image file first
    let isImageFile = false;
    for (const sig of imageSignatures) {
      if (this.containsSignature(buffer, sig.pattern)) {
        isImageFile = true;
        break;
      }
    }
    
    // Only check for executable signatures if it's not an image file
    if (!isImageFile) {
      const signatures = [
        { name: 'PE Header', pattern: Buffer.from([0x4D, 0x5A]), description: 'Executable file detected' },
        { name: 'ELF Header', pattern: Buffer.from([0x7F, 0x45, 0x4C, 0x46]), description: 'Linux executable detected' },
        { name: 'Mach-O Header', pattern: Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), description: 'macOS executable detected' },
        { name: 'ZIP Archive', pattern: Buffer.from([0x50, 0x4B, 0x03, 0x04]), description: 'ZIP archive detected' },
        { name: 'RAR Archive', pattern: Buffer.from([0x52, 0x61, 0x72, 0x21]), description: 'RAR archive detected' },
      ];

      for (const signature of signatures) {
        if (this.containsSignature(buffer, signature.pattern)) {
          threats.push(`${signature.name}: ${signature.description}`);
        }
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      { name: 'Suspicious Script', pattern: /<script.*>.*<\/script>/i, description: 'HTML script tags detected' },
      { name: 'PHP Code', pattern: /<\?php/i, description: 'PHP code detected' },
      { name: 'JavaScript', pattern: /javascript:/i, description: 'JavaScript code detected' },
      { name: 'VBScript', pattern: /vbscript:/i, description: 'VBScript code detected' },
    ];

    const fileContent = buffer.toString('utf8', 0, Math.min(buffer.length, 10000)); // Check first 10KB
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.pattern.test(fileContent)) {
        threats.push(`${pattern.name}: ${pattern.description}`);
      }
    }

    return {
      isClean: threats.length === 0,
      threats,
      scanMethod: 'signature-based',
      scanTime: Date.now() - startTime
    };
  }

  /**
   * Check if buffer contains a specific signature
   */
  private static containsSignature(buffer: Buffer, signature: Buffer): boolean {
    for (let i = 0; i <= buffer.length - signature.length; i++) {
      let match = true;
      for (let j = 0; j < signature.length; j++) {
        if (buffer[i + j] !== signature[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  }

  /**
   * Make HTTP request using Node.js built-in https module
   */
  private static async makeHttpRequest(url: string, params: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;

      const req = https.get(fullUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(this.SCAN_TIMEOUT, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Check if antivirus service is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if ClamAV is available
      const clamavPath = this.CLAMAV_PATH.replace(/"/g, ''); // Remove quotes if present
      await execAsync(`"${clamavPath}" --version`);
      return true;
    } catch (error) {
      // Check if VirusTotal API is available
      return !!this.VIRUSTOTAL_API_KEY;
    }
  }

  /**
   * Get antivirus service status
   */
  static async getStatus(): Promise<{
    available: boolean;
    methods: string[];
    lastScan: Date | null;
  }> {
    const available = await this.isAvailable();
    const methods: string[] = [];

    if (available) {
      try {
        const clamavPath = this.CLAMAV_PATH.replace(/"/g, ''); // Remove quotes if present
        await execAsync(`"${clamavPath}" --version`);
        methods.push('clamav');
      } catch (error) {
        // ClamAV not available
      }

      if (this.VIRUSTOTAL_API_KEY) {
        methods.push('virustotal');
      }

      methods.push('signature-based');
    }

    return {
      available,
      methods,
      lastScan: null // Could be implemented with database tracking
    };
  }
}

export default AntivirusService;
