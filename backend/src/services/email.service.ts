import nodemailer from 'nodemailer';
import { ServiceResponse } from '../utils/response.utils';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplateData {
  [key: string]: any;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@airvikbook.com';
    this.transporter = null;
    
    // Check if SMTP credentials are configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (!smtpUser || !smtpPass || smtpUser === 'your-brevo-smtp-username@smtp-brevo.com' || smtpPass === 'your-brevo-smtp-password-here') {
      console.log('⚠️ SMTP credentials not configured - email service will be disabled');
      return;
    }
    
    // Create transporter with Brevo SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // false for TLS, true for SSL
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Additional options for better compatibility
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) {
      console.log('ℹ️ Email service disabled - SMTP credentials not configured');
      return;
    }
    
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully (Brevo SMTP)');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<ServiceResponse<any>> {
    if (!this.transporter) {
      console.log('⚠️ Email service disabled - cannot send email');
      return {
        success: false,
        error: 'Email service is disabled - SMTP credentials not configured',
        code: 'EMAIL_SERVICE_DISABLED',
      };
    }
    
    try {
      const mailOptions = {
        from: `"AirVikBook" <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        data: {
          messageId: result.messageId,
          response: result.response,
        },
      };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: 'Failed to send email',
        code: 'EMAIL_SEND_FAILED',
        details: error.message,
      };
    }
  }

  /**
   * Send bulk emails (with rate limiting for Brevo)
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<ServiceResponse<any>> {
    const results = [];
    const failed = [];

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        if (result.success) {
          results.push(result.data);
        } else {
          failed.push({ email: email.to, error: result.error });
        }
        
        // Rate limiting: Wait 100ms between emails to avoid hitting Brevo limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        failed.push({ email: email.to, error: error.message });
      }
    }

    return {
      success: failed.length === 0,
      data: {
        sent: results.length,
        failed: failed.length,
        results,
        failures: failed,
      },
    };
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<ServiceResponse<any>> {
    const subject = 'Welcome to AirVikBook!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to AirVikBook!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining AirVikBook. We're excited to have you on board!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and book hotels</li>
          <li>Manage your reservations</li>
          <li>Access exclusive deals</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The AirVikBook Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This email was sent from AirVikBook. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(
    to: string, 
    bookingDetails: {
      bookingId: string;
      guestName: string;
      hotelName: string;
      checkIn: string;
      checkOut: string;
      totalAmount: number;
    }
  ): Promise<ServiceResponse<any>> {
    const subject = `Booking Confirmation - ${bookingDetails.bookingId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Booking Confirmed!</h1>
        <p>Dear ${bookingDetails.guestName},</p>
        <p>Your booking has been confirmed. Here are your booking details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Hotel:</strong> ${bookingDetails.hotelName}</p>
          <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
          <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
          <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</p>
        </div>

        <p>Please save this email for your records.</p>
        <p>We look forward to hosting you!</p>
        
        <p>Best regards,<br>The AirVikBook Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<ServiceResponse<any>> {
          const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your AirVikBook Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password for your AirVikBook account.</p>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <p>Best regards,<br>The AirVikBook Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(to: string, userName: string, verificationToken: string): Promise<ServiceResponse<any>> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your AirVikBook Email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email Address</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up with AirVikBook! Please verify your email address to complete your registration.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #16a34a; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>Best regards,<br>The AirVikBook Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<ServiceResponse<any>> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service is disabled - SMTP credentials not configured',
        code: 'EMAIL_SERVICE_DISABLED',
      };
    }
    
    const testEmail = {
      to: this.fromEmail,
      subject: 'AirVikBook Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that the Brevo SMTP configuration is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Configuration:</p>
        <ul>
          <li>SMTP Host: ${process.env.SMTP_HOST}</li>
          <li>SMTP Port: ${process.env.SMTP_PORT}</li>
          <li>From Email: ${this.fromEmail}</li>
        </ul>
      `,
    };

    return this.sendEmail(testEmail);
  }

  /**
   * Send password changed notification email
   */
  async sendPasswordChangedEmail(to: string, userName: string, deviceInfo?: { deviceName?: string; location?: string }): Promise<ServiceResponse<any>> {
    const subject = 'Your AirVikBook Password Was Changed';
    const deviceName = deviceInfo?.deviceName || 'Unknown device';
    const location = deviceInfo?.location || 'Unknown location';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4E7638;">Password Changed Successfully</h1>
        <p>Hello ${userName},</p>
        <p>Your password has been successfully changed.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Change Details</h3>
          <p><strong>When:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Device:</strong> ${deviceName}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p><strong>Didn't make this change?</strong></p>
          <p>If you didn't change your password, please contact our support team immediately.</p>
        </div>
        
        <p>Best regards,<br>The AirVikBook Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send mixed authentication enabled email
   */
  async sendMixedAuthEnabledEmail(to: string, userName: string): Promise<ServiceResponse<any>> {
    const subject = 'Password Set - Mixed Authentication Enabled';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4322AA;">Password Set Successfully</h1>
        <p>Hello ${userName},</p>
        <p>You have successfully set a password for your account.</p>
        
        <div style="background: #f8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Enhanced Security Enabled</h3>
          <p>You can now sign in using either:</p>
          <ul>
            <li>Your email and password</li>
            <li>Google sign-in</li>
          </ul>
          <p>This gives you more flexibility and backup options for accessing your account.</p>
        </div>
        
        <p>You can manage your authentication methods anytime from your account security settings.</p>
        
        <p>Best regards,<br>The AirVikBook Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send Google-only account notification email
   */
  async sendGoogleOnlyAccountEmail(to: string, userName: string): Promise<ServiceResponse<any>> {
    const subject = 'Password Removed - Google Sign-in Only';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4322AA;">Password Removed</h1>
        <p>Hello ${userName},</p>
        <p>Your account password has been removed. Your account now uses Google sign-in only.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Sign-in Method</h3>
          <p>You will now use Google sign-in exclusively to access your account.</p>
          <p>For your security, you have been signed out of all devices and will need to sign in again using Google.</p>
        </div>
        
        <p>You can set a new password at any time from your account security settings to enable mixed authentication again.</p>
        
        <p>Best regards,<br>The AirVikBook Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send security alert email for suspicious password activity
   */
  async sendPasswordSecurityAlert(to: string, userName: string, alertInfo: { 
    activity: string; 
    deviceName?: string; 
    location?: string; 
    timestamp?: Date;
  }): Promise<ServiceResponse<any>> {
    const subject = '🚨 Security Alert - Unusual Password Activity';
    const { activity, deviceName = 'Unknown device', location = 'Unknown location', timestamp = new Date() } = alertInfo;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #B12A2A;">🚨 Security Alert</h1>
        <p>Hello ${userName},</p>
        <p>We detected unusual password activity on your AirVikBook account.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <h3>Activity Details</h3>
          <p><strong>Activity:</strong> ${activity}</p>
          <p><strong>When:</strong> ${timestamp.toLocaleString()}</p>
          <p><strong>Device:</strong> ${deviceName}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>If this wasn't you:</h3>
          <ol>
            <li>Change your password immediately</li>
            <li>Review your account activity</li>
            <li>Enable two-factor authentication</li>
            <li>Contact our support team at support@airvikbook.com</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/account/security" 
             style="background: #B12A2A; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Secure My Account
          </a>
        </div>
        
        <p>Stay secure,<br>The AirVikBook Security Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

// Export singleton instance
export const emailService = new EmailService();