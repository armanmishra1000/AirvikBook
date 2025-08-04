/**
 * Email Configuration
 * Centralized email configuration for the AirVikBook application
 */

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    email: string;
    name: string;
  };
  templates: {
    welcome: string;
    booking: string;
    passwordReset: string;
    emailVerification: string;
  };
  limits: {
    dailyLimit: number;
    hourlyLimit: number;
    rateLimitDelay: number; // milliseconds between emails
  };
}

export const emailConfig: EmailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  from: {
    email: process.env.FROM_EMAIL || 'noreply@airvikbook.com',
    name: 'AirVikBook',
  },
  templates: {
    welcome: 'welcome',
    booking: 'booking-confirmation',
    passwordReset: 'password-reset',
    emailVerification: 'email-verification',
  },
  limits: {
    dailyLimit: 300, // Brevo free plan limit
    hourlyLimit: 50,
    rateLimitDelay: 100, // 100ms between emails
  },
};

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!emailConfig.smtp.host) {
    errors.push('SMTP_HOST is required');
  }

  if (!emailConfig.smtp.auth.user) {
    errors.push('SMTP_USER is required');
  }

  if (!emailConfig.smtp.auth.pass) {
    errors.push('SMTP_PASS is required');
  }

  if (!emailConfig.from.email) {
    errors.push('FROM_EMAIL is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailConfig.from.email && !emailRegex.test(emailConfig.from.email)) {
    errors.push('FROM_EMAIL must be a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get email configuration summary for logging
 */
export function getEmailConfigSummary() {
  return {
    provider: 'Brevo SMTP',
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    fromEmail: emailConfig.from.email,
    fromName: emailConfig.from.name,
    hasAuth: !!(emailConfig.smtp.auth.user && emailConfig.smtp.auth.pass),
  };
}