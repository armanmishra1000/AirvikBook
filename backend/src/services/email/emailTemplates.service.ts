export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailVerificationTemplateData {
  fullName: string;
  verificationLink: string;
  expiryHours: number;
}

export interface WelcomeEmailTemplateData {
  fullName: string;
  email: string;
  loginLink: string;
}

export class EmailTemplatesService {
  /**
   * Generate email verification template
   */
  static generateEmailVerificationTemplate(data: EmailVerificationTemplateData): EmailTemplate {
    const { fullName, verificationLink, expiryHours } = data;

    const subject = 'Verify your AirVikBook account';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - AirVikBook</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1890ce 0%, #6366f1 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #4b5563;
            line-height: 1.7;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #1890ce 0%, #6366f1 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .expiry-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #1890ce;
            text-decoration: none;
        }
        .security-notice {
            margin-top: 30px;
            padding: 16px;
            background-color: #f3f4f6;
            border-radius: 6px;
            font-size: 14px;
            color: #4b5563;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏨 AirVikBook</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Hotel Booking Made Simple</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${fullName},
            </div>
            
            <div class="message">
                Welcome to AirVikBook! To complete your registration and start booking amazing hotels, 
                we need to verify your email address.
            </div>
            
            <div class="button-container">
                <a href="${verificationLink}" class="verify-button">
                    Verify My Email Address
                </a>
            </div>
            
            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This verification link will expire in ${expiryHours} hours. 
                Please verify your email soon to activate your account.
            </div>
            
            <div class="message">
                If you didn't create an account with AirVikBook, you can safely ignore this email.
            </div>
            
            <div class="security-notice">
                <strong>🔒 Security Tip:</strong> Never share this email or click on suspicious links. 
                AirVikBook will never ask for your password via email.
            </div>
        </div>
        
        <div class="footer">
            <p>
                This email was sent by AirVikBook<br>
                Need help? <a href="mailto:support@airvikbook.com">Contact our support team</a>
            </p>
            <p style="margin-top: 15px;">
                <a href="https://airvikbook.com">Visit Website</a> | 
                <a href="https://airvikbook.com/privacy">Privacy Policy</a> | 
                <a href="https://airvikbook.com/terms">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
AirVikBook - Email Verification

Hello ${fullName},

Welcome to AirVikBook! To complete your registration and start booking amazing hotels, we need to verify your email address.

Please click the following link to verify your email:
${verificationLink}

⏰ IMPORTANT: This verification link will expire in ${expiryHours} hours. Please verify your email soon to activate your account.

If you didn't create an account with AirVikBook, you can safely ignore this email.

🔒 Security Tip: Never share this email or click on suspicious links. AirVikBook will never ask for your password via email.

Need help? Contact our support team: support@airvikbook.com
Visit our website: https://airvikbook.com

This email was sent by AirVikBook
`;

    return {
      subject,
      htmlContent,
      textContent
    };
  }

  /**
   * Generate welcome email template
   */
  static generateWelcomeEmailTemplate(data: WelcomeEmailTemplateData): EmailTemplate {
    const { fullName, email, loginLink } = data;

    const subject = 'Welcome to AirVikBook! Your account is ready 🎉';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AirVikBook</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1890ce 0%, #6366f1 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
        }
        .welcome-emoji {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #1f2937;
            font-weight: 600;
        }
        .message {
            font-size: 16px;
            margin-bottom: 25px;
            color: #4b5563;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1890ce 0%, #6366f1 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .features {
            background-color: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .features h3 {
            margin: 0 0 20px 0;
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
        }
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .feature-list li {
            padding: 8px 0;
            color: #4b5563;
            font-size: 15px;
        }
        .feature-list li:before {
            content: "✅ ";
            margin-right: 8px;
        }
        .account-info {
            background-color: #f0f9ff;
            border-left: 4px solid #1890ce;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 25px 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #1890ce;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="welcome-emoji">🎉</div>
            <h1>Welcome to AirVikBook!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to amazing hotels starts here</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${fullName}! 👋
            </div>
            
            <div class="message">
                Congratulations! Your AirVikBook account has been successfully created and verified. 
                You're now part of our community of smart travelers who choose quality and convenience.
            </div>
            
            <div class="account-info">
                <strong>📧 Your Account Details:</strong><br>
                Email: ${email}<br>
                Status: ✅ Verified and Active
            </div>
            
            <div class="button-container">
                <a href="${loginLink}" class="cta-button">
                    Start Booking Hotels 🏨
                </a>
            </div>
            
            <div class="features">
                <h3>What you can do with your AirVikBook account:</h3>
                <ul class="feature-list">
                    <li>Search and book from thousands of verified hotels</li>
                    <li>Manage your bookings and view booking history</li>
                    <li>Save your favorite hotels for quick booking</li>
                    <li>Access exclusive member-only deals and discounts</li>
                    <li>Receive personalized hotel recommendations</li>
                    <li>24/7 customer support for all your bookings</li>
                </ul>
            </div>
            
            <div class="message">
                Our team is here to help if you have any questions. Don't hesitate to reach out to our 
                support team anytime.
            </div>
            
            <div class="message">
                <strong>Happy travels!</strong><br>
                The AirVikBook Team
            </div>
        </div>
        
        <div class="footer">
            <p>
                <strong>AirVikBook</strong> - Hotel Booking Made Simple<br>
                Questions? <a href="mailto:support@airvikbook.com">Contact Support</a> | 
                <a href="tel:+1-800-AIRVIK">Call +1-800-AIRVIK</a>
            </p>
            <p style="margin-top: 15px;">
                <a href="https://airvikbook.com">Website</a> | 
                <a href="https://airvikbook.com/help">Help Center</a> | 
                <a href="https://airvikbook.com/mobile">Mobile App</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
                <a href="https://airvikbook.com/unsubscribe">Unsubscribe</a> | 
                <a href="https://airvikbook.com/privacy">Privacy</a> | 
                <a href="https://airvikbook.com/terms">Terms</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
🎉 Welcome to AirVikBook!

Hello ${fullName}!

Congratulations! Your AirVikBook account has been successfully created and verified. You're now part of our community of smart travelers who choose quality and convenience.

📧 Your Account Details:
Email: ${email}
Status: ✅ Verified and Active

Start booking hotels: ${loginLink}

What you can do with your AirVikBook account:
✅ Search and book from thousands of verified hotels
✅ Manage your bookings and view booking history
✅ Save your favorite hotels for quick booking
✅ Access exclusive member-only deals and discounts
✅ Receive personalized hotel recommendations
✅ 24/7 customer support for all your bookings

Our team is here to help if you have any questions. Don't hesitate to reach out to our support team anytime.

Happy travels!
The AirVikBook Team

---
AirVikBook - Hotel Booking Made Simple
Questions? Email: support@airvikbook.com | Call: +1-800-AIRVIK
Website: https://airvikbook.com
Help Center: https://airvikbook.com/help
Mobile App: https://airvikbook.com/mobile
`;

    return {
      subject,
      htmlContent,
      textContent
    };
  }

  /**
   * Generate password reset email template (for future use)
   */
  static generatePasswordResetTemplate(data: {
    fullName: string;
    resetLink: string;
    expiryHours: number;
  }): EmailTemplate {
    const { fullName, resetLink, expiryHours } = data;

    const subject = 'Reset your AirVikBook password';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - AirVikBook</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .security-notice {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
        </div>
        
        <div class="content">
            <p>Hello ${fullName},</p>
            
            <p>We received a request to reset your AirVikBook account password. Click the button below to create a new password:</p>
            
            <div class="button-container">
                <a href="${resetLink}" class="reset-button">
                    Reset My Password
                </a>
            </div>
            
            <div class="security-notice">
                <strong>⏰ Important:</strong> This link will expire in ${expiryHours} hours for security reasons.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
AirVikBook - Password Reset

Hello ${fullName},

We received a request to reset your AirVikBook account password. Click the following link to create a new password:

${resetLink}

⏰ IMPORTANT: This link will expire in ${expiryHours} hours for security reasons.

If you didn't request this password reset, please ignore this email. Your account remains secure.

AirVikBook Support Team
`;

    return {
      subject,
      htmlContent,
      textContent
    };
  }
}

export default EmailTemplatesService;