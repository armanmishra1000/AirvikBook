import { EmailService } from '../email.service';
import { EmailTemplatesService } from './emailTemplates.service';

// Helper function to mask email addresses for security
const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

export interface SendVerificationEmailData {
  email: string;
  fullName: string;
  verificationToken: string;
}

export interface SendWelcomeEmailData {
  email: string;
  fullName: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class RegistrationEmailService {
  private static emailService = new EmailService();
  private static readonly VERIFICATION_EXPIRY_HOURS = 24;

  /**
   * Generate email verification URL
   */
  private static generateVerificationUrl(token: string, email: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const encodedEmail = encodeURIComponent(email);
    return `${baseUrl}/verify-email?token=${token}&email=${encodedEmail}`;
  }

  /**
   * Generate login/dashboard URL
   */
  private static generateLoginUrl(): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/login`;
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(data: SendVerificationEmailData): Promise<EmailSendResult> {
    try {
      const { email, fullName, verificationToken } = data;

      // Generate verification link
      const verificationLink = this.generateVerificationUrl(verificationToken, email);

      // Generate email template
      const template = EmailTemplatesService.generateEmailVerificationTemplate({
        fullName,
        verificationLink,
        expiryHours: this.VERIFICATION_EXPIRY_HOURS
      });

      // Send email
      const result = await this.emailService.sendEmail({
        to: email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });

      if (result.success) {
        console.log(`✅ Verification email sent to ${maskEmail(email)}`);
        return {
          success: true,
          messageId: result.data?.messageId || 'sent'
        };
      } else {
        console.error(`❌ Failed to send verification email to ${maskEmail(email)}:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        error: 'Failed to send verification email'
      };
    }
  }

  /**
   * Send welcome email after successful verification
   */
  static async sendWelcomeEmail(data: SendWelcomeEmailData): Promise<EmailSendResult> {
    try {
      const { email, fullName } = data;

      // Generate login link
      const loginLink = this.generateLoginUrl();

      // Generate email template
      const template = EmailTemplatesService.generateWelcomeEmailTemplate({
        fullName,
        email,
        loginLink
      });

      // Send email
      const result = await this.emailService.sendEmail({
        to: email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });

      if (result.success) {
        console.log(`✅ Welcome email sent to ${maskEmail(email)}`);
        return {
          success: true,
          messageId: result.data?.messageId || 'sent'
        };
      } else {
        console.error(`❌ Failed to send welcome email to ${maskEmail(email)}:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error sending welcome email:', error);
      return {
        success: false,
        error: 'Failed to send welcome email'
      };
    }
  }

  /**
   * Send password reset email (for future use)
   */
  static async sendPasswordResetEmail(data: {
    email: string;
    fullName: string;
    resetToken: string;
  }): Promise<EmailSendResult> {
    try {
      const { email, fullName, resetToken } = data;

      // Generate reset link (will be implemented in password reset feature)
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Generate email template
      const template = EmailTemplatesService.generatePasswordResetTemplate({
        fullName,
        resetLink,
        expiryHours: 2 // Password reset tokens expire faster
      });

      // Send email
      const result = await this.emailService.sendEmail({
        to: email,
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent
      });

      if (result.success) {
        console.log(`✅ Password reset email sent to ${maskEmail(email)}`);
        return {
          success: true,
          messageId: result.data?.messageId || 'sent'
        };
      } else {
        console.error(`❌ Failed to send password reset email to ${maskEmail(email)}:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: 'Failed to send password reset email'
      };
    }
  }

  /**
   * Send verification email with retry logic
   */
  static async sendVerificationEmailWithRetry(
    data: SendVerificationEmailData,
    maxRetries: number = 3
  ): Promise<EmailSendResult> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 Attempting to send verification email (attempt ${attempt}/${maxRetries})`);
        
        const result = await this.sendVerificationEmail(data);
        
        if (result.success) {
          if (attempt > 1) {
            console.log(`✅ Verification email sent successfully on attempt ${attempt}`);
          }
          return result;
        }
        
        lastError = result.error || 'Unknown error';
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Attempt ${attempt} failed:`, lastError);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`❌ All ${maxRetries} attempts failed. Last error: ${lastError}`);
    return {
      success: false,
      error: `Failed to send email after ${maxRetries} attempts: ${lastError}`
    };
  }

  /**
   * Validate email configuration before sending
   */
  static async validateEmailConfiguration(): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check required environment variables
    if (!process.env.FRONTEND_URL) {
      errors.push('FRONTEND_URL environment variable is missing');
    }

    // Test email service configuration by sending a test email to verify
    try {
      // Since no testConnection method exists, we'll assume SMTP config is valid if env vars are set
      const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        errors.push(`Missing email configuration: ${missingVars.join(', ')}`);
      }
    } catch (error) {
      errors.push(`Email service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get email service statistics (for monitoring)
   */
  static getEmailStats(): {
    verificationEmailsEnabled: boolean;
    welcomeEmailsEnabled: boolean;
    retryEnabled: boolean;
    maxRetries: number;
  } {
    return {
      verificationEmailsEnabled: true,
      welcomeEmailsEnabled: true,
      retryEnabled: true,
      maxRetries: 3
    };
  }
}

export default RegistrationEmailService;