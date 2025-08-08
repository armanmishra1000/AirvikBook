import { RegistrationEmailService } from '../services/email/registrationEmail.service';
import { EmailTemplatesService } from '../services/email/emailTemplates.service';

// Mock the entire RegistrationEmailService
jest.mock('../services/email/registrationEmail.service', () => {
  const originalModule = jest.requireActual('../services/email/registrationEmail.service');
  return {
    ...originalModule,
    RegistrationEmailService: {
      ...originalModule.RegistrationEmailService,
      sendVerificationEmail: jest.fn(),
      sendWelcomeEmail: jest.fn(),
      sendVerificationEmailWithRetry: jest.fn(),
      validateEmailConfiguration: jest.fn(),
      getEmailStats: jest.fn()
    }
  };
});

// Mock EmailTemplatesService
jest.mock('../services/email/emailTemplates.service', () => ({
  EmailTemplatesService: {
    generateEmailVerificationTemplate: jest.fn(),
    generateWelcomeEmailTemplate: jest.fn(),
    generatePasswordResetTemplate: jest.fn()
  }
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

  let mockRegistrationEmailService: any;
  let mockEmailTemplatesService: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set required environment variables
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'password';

    // Setup RegistrationEmailService mock
    mockRegistrationEmailService = require('../services/email/registrationEmail.service').RegistrationEmailService;

    // Setup EmailTemplatesService mock
    mockEmailTemplatesService = require('../services/email/emailTemplates.service').EmailTemplatesService;
    mockEmailTemplatesService.generateEmailVerificationTemplate.mockReturnValue({
      subject: 'Verify your AirVikBook account',
      htmlContent: '<html>Verification email for John Doe</html>',
      textContent: 'Verification email for John Doe'
    });
    mockEmailTemplatesService.generateWelcomeEmailTemplate.mockReturnValue({
      subject: 'Welcome to AirVikBook',
      htmlContent: '<html>Welcome email for John Doe</html>',
      textContent: 'Welcome email for John Doe'
    });
    mockEmailTemplatesService.generatePasswordResetTemplate.mockReturnValue({
      subject: 'Reset your AirVikBook password',
      htmlContent: '<html>Password reset for John Doe</html>',
      textContent: 'Password reset for John Doe'
    });
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FRONTEND_URL;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      // Mock successful email send
      mockRegistrationEmailService.sendVerificationEmail.mockResolvedValue({
        success: true,
        messageId: 'mock_message_id_123'
      });

      const result = await RegistrationEmailService.sendVerificationEmail(mockEmailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock_message_id_123');
      expect(mockRegistrationEmailService.sendVerificationEmail).toHaveBeenCalledWith(mockEmailData);
    });

    it('should handle email send failure', async () => {
      // Mock failed email send
      mockRegistrationEmailService.sendVerificationEmail.mockResolvedValue({
        success: false,
        error: 'SMTP connection failed'
      });

      const result = await RegistrationEmailService.sendVerificationEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP connection failed');
    });

    it('should handle unexpected errors', async () => {
      // Mock email service throwing an error
      mockRegistrationEmailService.sendVerificationEmail.mockResolvedValue({
        success: false,
        error: 'Failed to send verification email'
      });

      const result = await RegistrationEmailService.sendVerificationEmail(mockEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      // Mock successful email send
      mockRegistrationEmailService.sendWelcomeEmail.mockResolvedValue({
        success: true,
        messageId: 'welcome_message_id_123'
      });

      const result = await RegistrationEmailService.sendWelcomeEmail(mockWelcomeData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('welcome_message_id_123');
      expect(mockRegistrationEmailService.sendWelcomeEmail).toHaveBeenCalledWith(mockWelcomeData);
    });

    it('should handle welcome email send failure', async () => {
      // Mock failed email send
      mockRegistrationEmailService.sendWelcomeEmail.mockResolvedValue({
        success: false,
        error: 'Email template error'
      });

      const result = await RegistrationEmailService.sendWelcomeEmail(mockWelcomeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email template error');
    });
  });

  describe('sendVerificationEmailWithRetry', () => {
    it('should succeed on first attempt', async () => {
      // Mock successful email send on first attempt
      mockRegistrationEmailService.sendVerificationEmailWithRetry.mockResolvedValue({
        success: true,
        messageId: 'retry_message_id_123'
      });

      const result = await RegistrationEmailService.sendVerificationEmailWithRetry(mockEmailData, 3);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('retry_message_id_123');
      expect(mockRegistrationEmailService.sendVerificationEmailWithRetry).toHaveBeenCalledWith(mockEmailData, 3);
    });

    it('should retry on failure and eventually succeed', async () => {
      // Mock retry success
      mockRegistrationEmailService.sendVerificationEmailWithRetry.mockResolvedValue({
        success: true,
        messageId: 'retry_success_id'
      });

      const result = await RegistrationEmailService.sendVerificationEmailWithRetry(mockEmailData, 3);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('retry_success_id');
      expect(mockRegistrationEmailService.sendVerificationEmailWithRetry).toHaveBeenCalledWith(mockEmailData, 3);
    });

    it('should fail after all retries exhausted', async () => {
      // Mock failure after all retries
      mockRegistrationEmailService.sendVerificationEmailWithRetry.mockResolvedValue({
        success: false,
        error: 'Failed to send email after 2 attempts: Persistent failure'
      });

      const result = await RegistrationEmailService.sendVerificationEmailWithRetry(mockEmailData, 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send email after 2 attempts');
      expect(mockRegistrationEmailService.sendVerificationEmailWithRetry).toHaveBeenCalledWith(mockEmailData, 2);
    });
  });

  describe('validateEmailConfiguration', () => {
    it('should validate configuration successfully', async () => {
      mockRegistrationEmailService.validateEmailConfiguration.mockResolvedValue({
        isValid: true,
        errors: []
      });

      const result = await RegistrationEmailService.validateEmailConfiguration();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing environment variables', async () => {
      mockRegistrationEmailService.validateEmailConfiguration.mockResolvedValue({
        isValid: false,
        errors: ['FRONTEND_URL environment variable is missing']
      });

      const result = await RegistrationEmailService.validateEmailConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('FRONTEND_URL environment variable is missing');
    });

    it('should detect email service configuration errors', async () => {
      mockRegistrationEmailService.validateEmailConfiguration.mockResolvedValue({
        isValid: false,
        errors: ['Missing email configuration: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS']
      });

      const result = await RegistrationEmailService.validateEmailConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing email configuration: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    });
  });

  describe('getEmailStats', () => {
    it('should return email service statistics', () => {
      mockRegistrationEmailService.getEmailStats.mockReturnValue({
        verificationEmailsEnabled: true,
        welcomeEmailsEnabled: true,
        retryEnabled: true,
        maxRetries: 3
      });

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
      const template = EmailTemplatesService.generateEmailVerificationTemplate({
        fullName: 'John Doe',
        verificationLink: 'http://localhost:3000/verify?token=123',
        expiryHours: 24
      });

      expect(template).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.htmlContent).toBeDefined();
      expect(template.textContent).toBeDefined();
    });
  });

  describe('generateWelcomeEmailTemplate', () => {
    it('should generate welcome email template', () => {
      const template = EmailTemplatesService.generateWelcomeEmailTemplate({
        fullName: 'John Doe',
        email: 'john@example.com',
        loginLink: 'http://localhost:3000/login'
      });

      expect(template).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.htmlContent).toBeDefined();
      expect(template.textContent).toBeDefined();
    });
  });

  describe('generatePasswordResetTemplate', () => {
    it('should generate password reset template', () => {
      const template = EmailTemplatesService.generatePasswordResetTemplate({
        fullName: 'John Doe',
        resetLink: 'http://localhost:3000/reset?token=123',
        expiryHours: 2
      });

      expect(template).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.htmlContent).toBeDefined();
      expect(template.textContent).toBeDefined();
    });
  });
});