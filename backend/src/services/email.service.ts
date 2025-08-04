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
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@airvikbook.com';
    
    // Create transporter with Brevo SMTP configuration
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // false for TLS, true for SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
}

// Export singleton instance
export const emailService = new EmailService();