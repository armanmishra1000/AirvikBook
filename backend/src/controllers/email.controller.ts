import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { ResponseUtil } from '../utils/response.utils';
import { validateEmailConfig, getEmailConfigSummary } from '../config/email.config';

export class EmailController {
  /**
   * Test email configuration
   * POST /api/v1/email/test
   */
  static async testEmailConfig(req: Request, res: Response) {
    try {
      // Validate configuration first
      const configValidation = validateEmailConfig();
      if (!configValidation.isValid) {
        return ResponseUtil.error(
          res,
          'Email configuration is invalid',
          'EMAIL_CONFIG_INVALID',
          400,
          { errors: configValidation.errors }
        );
      }

      // Test sending email
      const result = await emailService.testEmailConfiguration();
      
      if (result.success) {
        return ResponseUtil.success(res, {
          message: 'Email configuration test successful',
          config: getEmailConfigSummary(),
          result: result.data,
        });
      } else {
        return ResponseUtil.error(
          res,
          'Email configuration test failed',
          'EMAIL_TEST_FAILED',
          500,
          result
        );
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Send welcome email
   * POST /api/v1/email/welcome
   * Body: { email: string, userName: string }
   */
  static async sendWelcomeEmail(req: Request, res: Response) {
    try {
      const { email, userName } = req.body;

      if (!email || !userName) {
        return ResponseUtil.validationError(res, {
          email: email ? null : 'Email is required',
          userName: userName ? null : 'User name is required',
        });
      }

      const result = await emailService.sendWelcomeEmail(email, userName);

      if (result.success) {
        return ResponseUtil.success(res, {
          message: 'Welcome email sent successfully',
          result: result.data,
        });
      } else {
        return ResponseUtil.error(
          res,
          'Failed to send welcome email',
          'EMAIL_SEND_FAILED',
          500,
          result
        );
      }
    } catch (error: any) {
      console.error('Welcome email error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Send booking confirmation email
   * POST /api/v1/email/booking-confirmation
   */
  static async sendBookingConfirmation(req: Request, res: Response) {
    try {
      const { email, bookingDetails } = req.body;

      if (!email || !bookingDetails) {
        return ResponseUtil.validationError(res, {
          email: email ? null : 'Email is required',
          bookingDetails: bookingDetails ? null : 'Booking details are required',
        });
      }

      // Validate required booking details
      const requiredFields = ['bookingId', 'guestName', 'hotelName', 'checkIn', 'checkOut', 'totalAmount'];
      const missingFields = requiredFields.filter(field => !bookingDetails[field]);
      
      if (missingFields.length > 0) {
        return ResponseUtil.validationError(res, {
          bookingDetails: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const result = await emailService.sendBookingConfirmation(email, bookingDetails);

      if (result.success) {
        return ResponseUtil.success(res, {
          message: 'Booking confirmation email sent successfully',
          result: result.data,
        });
      } else {
        return ResponseUtil.error(
          res,
          'Failed to send booking confirmation email',
          'EMAIL_SEND_FAILED',
          500,
          result
        );
      }
    } catch (error: any) {
      console.error('Booking confirmation email error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Send password reset email
   * POST /api/v1/email/password-reset
   */
  static async sendPasswordResetEmail(req: Request, res: Response) {
    try {
      const { email, userName, resetToken } = req.body;

      if (!email || !userName || !resetToken) {
        return ResponseUtil.validationError(res, {
          email: email ? null : 'Email is required',
          userName: userName ? null : 'User name is required',
          resetToken: resetToken ? null : 'Reset token is required',
        });
      }

      const result = await emailService.sendPasswordResetEmail(email, userName, resetToken);

      if (result.success) {
        return ResponseUtil.success(res, {
          message: 'Password reset email sent successfully',
          result: result.data,
        });
      } else {
        return ResponseUtil.error(
          res,
          'Failed to send password reset email',
          'EMAIL_SEND_FAILED',
          500,
          result
        );
      }
    } catch (error: any) {
      console.error('Password reset email error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Send email verification
   * POST /api/v1/email/verify-email
   */
  static async sendEmailVerification(req: Request, res: Response) {
    try {
      const { email, userName, verificationToken } = req.body;

      if (!email || !userName || !verificationToken) {
        return ResponseUtil.validationError(res, {
          email: email ? null : 'Email is required',
          userName: userName ? null : 'User name is required',
          verificationToken: verificationToken ? null : 'Verification token is required',
        });
      }

      const result = await emailService.sendEmailVerification(email, userName, verificationToken);

      if (result.success) {
        return ResponseUtil.success(res, {
          message: 'Email verification sent successfully',
          result: result.data,
        });
      } else {
        return ResponseUtil.error(
          res,
          'Failed to send email verification',
          'EMAIL_SEND_FAILED',
          500,
          result
        );
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Send custom email
   * POST /api/v1/email/send
   */
  static async sendCustomEmail(req: Request, res: Response) {
    try {
      const { to, subject, text, html, attachments } = req.body;

      if (!to || !subject || (!text && !html)) {
        return ResponseUtil.validationError(res, {
          to: to ? null : 'Recipient email is required',
          subject: subject ? null : 'Subject is required',
          content: (!text && !html) ? 'Either text or html content is required' : null,
        });
      }

      const result = await emailService.sendEmail({
        to,
        subject,
        text,
        html,
        attachments,
      });

      if (result.success) {
        return ResponseUtil.success(res, {
          message: 'Email sent successfully',
          result: result.data,
        });
      } else {
        return ResponseUtil.error(
          res,
          'Failed to send email',
          'EMAIL_SEND_FAILED',
          500,
          result
        );
      }
    } catch (error: any) {
      console.error('Custom email error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  /**
   * Get email configuration status
   * GET /api/v1/email/config
   */
  static async getEmailConfig(req: Request, res: Response) {
    try {
      const configValidation = validateEmailConfig();
      const configSummary = getEmailConfigSummary();

      return ResponseUtil.success(res, {
        isValid: configValidation.isValid,
        errors: configValidation.errors,
        config: configSummary,
      });
    } catch (error: any) {
      console.error('Email config error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}