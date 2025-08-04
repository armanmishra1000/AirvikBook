import { RegistrationEmailService } from '../services/email/registrationEmail.service';
import { EmailTemplatesService } from '../services/email/emailTemplates.service';

// Mock the EmailService
jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn(),
    testConnection: jest.fn()
  }))
}));

describe('RegistrationEmailService', () => {
  const mockEmailData = {
    email: 'test@example.com',
    fullName: 'John Doe',
    verificationToken: 'test_verification_token_123'
  };

  const mockWelcomeData = {
    email: 'test@example.com',
    fullName: 'John Doe'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set required environment variables
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FRONTEND_URL;
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      // Mock successful email send
      const mockSendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'mock_message_id_123'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      const result = await RegistrationEmailService.sendVerificationEmail(mockEmailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock_message_id_123');
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: mockEmailData.email,
        subject: expect.stringContaining('Verify your AirVikBook account'),
        htmlContent: expect.stringContaining(mockEmailData.fullName),
        textContent: expect.stringContaining(mockEmailData.fullName)
      });
    });

    it('should handle email send failure', async () => {
      // Mock failed email send
      const mockSendEmail = jest.fn().mockResolvedValue({
        success: false,
        error: 'SMTP connection failed'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      const result = await RegistrationEmailService.sendVerificationEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP connection failed');
    });

    it('should handle unexpected errors', async () => {
      // Mock email service throwing an error
      const mockSendEmail = jest.fn().mockRejectedValue(new Error('Network error'));

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      const result = await RegistrationEmailService.sendVerificationEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      // Mock successful email send
      const mockSendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'welcome_message_id_123'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      const result = await RegistrationEmailService.sendWelcomeEmail(mockWelcomeData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('welcome_message_id_123');
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: mockWelcomeData.email,
        subject: expect.stringContaining('Welcome to AirVikBook'),
        htmlContent: expect.stringContaining(mockWelcomeData.fullName),
        textContent: expect.stringContaining(mockWelcomeData.fullName)
      });
    });

    it('should handle welcome email send failure', async () => {
      // Mock failed email send
      const mockSendEmail = jest.fn().mockResolvedValue({
        success: false,
        error: 'Email template error'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      const result = await RegistrationEmailService.sendWelcomeEmail(mockWelcomeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email template error');
    });
  });

  describe('sendVerificationEmailWithRetry', () => {
    it('should succeed on first attempt', async () => {
      // Mock successful email send on first attempt
      const mockSendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'retry_message_id_123'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      const result = await RegistrationEmailService.sendVerificationEmailWithRetry(mockEmailData, 3);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('retry_message_id_123');
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      // Mock failure on first attempt, success on second
      const mockSendEmail = jest.fn()
        .mockResolvedValueOnce({
          success: false,
          error: 'Temporary failure'
        })
        .mockResolvedValueOnce({
          success: true,
          messageId: 'retry_success_id'
        });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      // Mock setTimeout to avoid actual delays in tests
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      const result = await RegistrationEmailService.sendVerificationEmailWithRetry(mockEmailData, 3);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('retry_success_id');
      expect(mockSendEmail).toHaveBeenCalledTimes(2);

      // Restore setTimeout
      jest.restoreAllMocks();
    });

    it('should fail after all retries exhausted', async () => {
      // Mock failure on all attempts
      const mockSendEmail = jest.fn().mockResolvedValue({
        success: false,
        error: 'Persistent failure'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: mockSendEmail,
        testConnection: jest.fn()
      }));

      // Mock setTimeout to avoid actual delays in tests
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      const result = await RegistrationEmailService.sendVerificationEmailWithRetry(mockEmailData, 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send email after 2 attempts');
      expect(mockSendEmail).toHaveBeenCalledTimes(2);

      // Restore setTimeout
      jest.restoreAllMocks();
    });
  });

  describe('validateEmailConfiguration', () => {
    it('should validate configuration successfully', async () => {
      // Mock successful test connection
      const mockTestConnection = jest.fn().mockResolvedValue({
        success: true
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: jest.fn(),
        testConnection: mockTestConnection
      }));

      const result = await RegistrationEmailService.validateEmailConfiguration();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing environment variables', async () => {
      // Remove required env var
      delete process.env.FRONTEND_URL;

      // Mock successful test connection
      const mockTestConnection = jest.fn().mockResolvedValue({
        success: true
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: jest.fn(),
        testConnection: mockTestConnection
      }));

      const result = await RegistrationEmailService.validateEmailConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('FRONTEND_URL environment variable is missing');
    });

    it('should detect email service configuration errors', async () => {
      // Mock failed test connection
      const mockTestConnection = jest.fn().mockResolvedValue({
        success: false,
        error: 'SMTP authentication failed'
      });

      const { EmailService } = require('../services/email.service');
      EmailService.mockImplementation(() => ({
        sendEmail: jest.fn(),
        testConnection: mockTestConnection
      }));

      const result = await RegistrationEmailService.validateEmailConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email service configuration error: SMTP authentication failed');
    });
  });

  describe('getEmailStats', () => {
    it('should return email service statistics', () => {
      const stats = RegistrationEmailService.getEmailStats();

      expect(stats).toEqual({
        verificationEmailsEnabled: true,
        welcomeEmailsEnabled: true,
        retryEnabled: true,
        maxRetries: 3
      });
    });
  });
});

describe('EmailTemplatesService', () => {
  describe('generateEmailVerificationTemplate', () => {
    it('should generate email verification template', () => {
      const data = {
        fullName: 'John Doe',
        verificationLink: 'https://example.com/verify?token=abc123',
        expiryHours: 24
      };

      const template = EmailTemplatesService.generateEmailVerificationTemplate(data);

      expect(template.subject).toContain('Verify your AirVikBook account');
      expect(template.htmlContent).toContain(data.fullName);
      expect(template.htmlContent).toContain(data.verificationLink);
      expect(template.htmlContent).toContain('24 hours');
      expect(template.textContent).toContain(data.fullName);
      expect(template.textContent).toContain(data.verificationLink);
    });
  });

  describe('generateWelcomeEmailTemplate', () => {
    it('should generate welcome email template', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        loginLink: 'https://example.com/login'
      };

      const template = EmailTemplatesService.generateWelcomeEmailTemplate(data);

      expect(template.subject).toContain('Welcome to AirVikBook');
      expect(template.htmlContent).toContain(data.fullName);
      expect(template.htmlContent).toContain(data.email);
      expect(template.htmlContent).toContain(data.loginLink);
      expect(template.textContent).toContain(data.fullName);
      expect(template.textContent).toContain(data.email);
    });
  });

  describe('generatePasswordResetTemplate', () => {
    it('should generate password reset template', () => {
      const data = {
        fullName: 'John Doe',
        resetLink: 'https://example.com/reset?token=xyz789',
        expiryHours: 2
      };

      const template = EmailTemplatesService.generatePasswordResetTemplate(data);

      expect(template.subject).toContain('Reset your AirVikBook password');
      expect(template.htmlContent).toContain(data.fullName);
      expect(template.htmlContent).toContain(data.resetLink);
      expect(template.htmlContent).toContain('2 hours');
      expect(template.textContent).toContain(data.fullName);
      expect(template.textContent).toContain(data.resetLink);
    });
  });
});