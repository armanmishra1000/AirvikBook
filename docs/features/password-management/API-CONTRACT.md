# Password Management API Contract

## CRITICAL RULE: Frontend and Backend MUST follow this EXACTLY

### Base Configuration
- **Base URL**: http://localhost:5000
- **API Prefix**: /api/v1
- **Auth Pattern**: Bearer token in Authorization header (for authenticated endpoints)
- **Response Format**: MUST match existing project patterns

## Endpoint Specifications

### Forgot Password - POST /api/v1/auth/forgot-password
**Purpose**: Initiate password reset process for email accounts

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "emailSent": true,
    "message": "If an account with this email exists, you will receive password reset instructions",
    "canResetPassword": true
  }
}
```

**Google-Only Account Response (200):**
```json
{
  "success": true,
  "data": {
    "emailSent": false,
    "message": "This account uses Google sign-in. Please use 'Sign in with Google' instead",
    "canResetPassword": false,
    "accountType": "GOOGLE_ONLY",
    "alternativeAuth": {
      "method": "GOOGLE_OAUTH",
      "suggestion": "Use the 'Sign in with Google' button on the login page"
    }
  }
}
```

**Error Response (400/429/500):**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 5 minutes",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 300,
    "requestsRemaining": 0
  }
}
```

**Business Rules:**
- Always returns success for security (no email enumeration)
- Rate limiting: 1 request per 5 minutes per email address
- Reset token expires in 1 hour
- Different response for Google-only accounts
- Email sent only if account exists with password capability

### Reset Password - POST /api/v1/auth/reset-password
**Purpose**: Complete password reset using valid reset token

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "passwordReset": true,
    "message": "Password has been reset successfully",
    "user": {
      "email": "user@example.com",
      "fullName": "John Doe",
      "passwordLastChanged": "2024-01-01T12:00:00.000Z"
    },
    "sessionActions": {
      "allSessionsInvalidated": true,
      "newLoginRequired": true
    },
    "securityActions": {
      "passwordAddedToHistory": true,
      "securityEmailSent": true
    }
  }
}
```

**Error Response (400/401/422):**
```json
{
  "success": false,
  "error": "Reset token has expired",
  "code": "RESET_TOKEN_EXPIRED",
  "details": {
    "tokenExpiredAt": "2024-01-01T11:00:00.000Z",
    "requestNewReset": true
  }
}
```

**Business Rules:**
- Reset token must be valid and not expired (1 hour limit)
- Password must meet strength requirements
- Password cannot match last 5 used passwords
- All user sessions invalidated after password reset
- Security email sent to user after successful reset
- Token can only be used once

### Change Password - PUT /api/v1/auth/password
**Purpose**: Change password for authenticated user

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!",
  "invalidateOtherSessions": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "passwordChanged": true,
    "message": "Password updated successfully",
    "user": {
      "email": "user@example.com",
      "passwordLastChanged": "2024-01-01T12:00:00.000Z",
      "hasPassword": true
    },
    "sessionActions": {
      "otherSessionsInvalidated": true,
      "currentSessionMaintained": true,
      "sessionsInvalidated": 3
    },
    "securityActions": {
      "passwordAddedToHistory": true,
      "securityEmailSent": true
    }
  }
}
```

**Error Response (400/401/422):**
```json
{
  "success": false,
  "error": "Current password is incorrect",
  "code": "INVALID_CURRENT_PASSWORD",
  "details": {
    "field": "currentPassword",
    "remainingAttempts": 4
  }
}
```

**Business Rules:**
- User must be authenticated
- Current password required (unless Google-only user setting first password)
- New password must meet strength requirements
- Password cannot match last 5 used passwords
- Optional session invalidation for other devices
- Rate limiting: 5 attempts per 15 minutes per user

### Set Password for Google Users - POST /api/v1/auth/set-password
**Purpose**: Allow Google-only users to set a password for mixed authentication

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "passwordSet": true,
    "message": "Password set successfully. You can now use email or Google to sign in",
    "user": {
      "email": "user@gmail.com",
      "hasPassword": true,
      "hasGoogleAuth": true,
      "authMethods": ["EMAIL", "GOOGLE"],
      "passwordLastChanged": "2024-01-01T12:00:00.000Z"
    },
    "securityActions": {
      "mixedAuthEnabled": true,
      "securityEmailSent": true
    }
  }
}
```

**Error Response (400/403/422):**
```json
{
  "success": false,
  "error": "Account already has a password. Use change password instead",
  "code": "PASSWORD_ALREADY_EXISTS",
  "details": {
    "hasPassword": true,
    "useChangePassword": true,
    "endpoint": "/api/v1/auth/password"
  }
}
```

**Business Rules:**
- User must be authenticated with Google account
- Account must not already have a password
- Password must meet strength requirements
- Converts Google-only account to mixed authentication
- Security email sent to notify of new authentication method

### Remove Password - DELETE /api/v1/auth/password
**Purpose**: Remove password from mixed account to become Google-only

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "currentPassword": "CurrentPass123!",
  "confirmGoogleOnly": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "passwordRemoved": true,
    "message": "Password removed. Account now uses Google sign-in only",
    "user": {
      "email": "user@gmail.com",
      "hasPassword": false,
      "hasGoogleAuth": true,
      "authMethods": ["GOOGLE"],
      "accountType": "GOOGLE_ONLY"
    },
    "sessionActions": {
      "allSessionsInvalidated": true,
      "newLoginRequired": true,
      "loginMethod": "GOOGLE_OAUTH"
    }
  }
}
```

**Business Rules:**
- User must be authenticated
- Account must have both password and Google authentication
- Current password required for verification
- All sessions invalidated (must re-login with Google)
- Cannot remove password if no Google authentication exists

### Get Password Status - GET /api/v1/auth/password-status
**Purpose**: Get current password and authentication method status

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "hasPassword": true,
    "hasGoogleAuth": true,
    "authMethods": ["EMAIL", "GOOGLE"],
    "accountType": "MIXED",
    "passwordLastChanged": "2024-01-01T10:00:00.000Z",
    "securityRecommendations": [
      {
        "type": "PASSWORD_STRENGTH",
        "message": "Consider using a stronger password",
        "priority": "medium"
      }
    ],
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true,
      "historyLimit": 5
    }
  }
}
```

**Business Rules:**
- User must be authenticated
- Returns current authentication method status
- Includes security recommendations
- Shows password policy requirements

### Validate Reset Token - GET /api/v1/auth/reset-token/{token}
**Purpose**: Validate reset token before showing password reset form

**Request:**
```
GET /api/v1/auth/reset-token/reset_token_from_email
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tokenValid": true,
    "user": {
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "expiresAt": "2024-01-01T13:00:00.000Z",
    "timeRemaining": 1800
  }
}
```

**Error Response (400/404):**
```json
{
  "success": false,
  "error": "Reset token is invalid or expired",
  "code": "INVALID_RESET_TOKEN",
  "details": {
    "tokenExpired": true,
    "requestNewReset": true
  }
}
```

**Business Rules:**
- No authentication required (public endpoint)
- Token must exist and not be expired
- Token must not have been used already
- Returns user info for confirmation

## Type Definitions Required

```typescript
// Request Types
interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  invalidateOtherSessions?: boolean;
}

interface SetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

interface RemovePasswordRequest {
  currentPassword: string;
  confirmGoogleOnly: boolean;
}

// Response Types
interface ForgotPasswordResponse {
  emailSent: boolean;
  message: string;
  canResetPassword: boolean;
  accountType?: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  alternativeAuth?: {
    method: 'GOOGLE_OAUTH';
    suggestion: string;
  };
}

interface ResetPasswordResponse {
  passwordReset: boolean;
  message: string;
  user: {
    email: string;
    fullName: string;
    passwordLastChanged: string;
  };
  sessionActions: {
    allSessionsInvalidated: boolean;
    newLoginRequired: boolean;
  };
  securityActions: {
    passwordAddedToHistory: boolean;
    securityEmailSent: boolean;
  };
}

interface ChangePasswordResponse {
  passwordChanged: boolean;
  message: string;
  user: {
    email: string;
    passwordLastChanged: string;
    hasPassword: boolean;
  };
  sessionActions: {
    otherSessionsInvalidated: boolean;
    currentSessionMaintained: boolean;
    sessionsInvalidated: number;
  };
  securityActions: {
    passwordAddedToHistory: boolean;
    securityEmailSent: boolean;
  };
}

interface SetPasswordResponse {
  passwordSet: boolean;
  message: string;
  user: {
    email: string;
    hasPassword: boolean;
    hasGoogleAuth: boolean;
    authMethods: string[];
    passwordLastChanged: string;
  };
  securityActions: {
    mixedAuthEnabled: boolean;
    securityEmailSent: boolean;
  };
}

interface PasswordStatusResponse {
  hasPassword: boolean;
  hasGoogleAuth: boolean;
  authMethods: string[];
  accountType: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
  passwordLastChanged?: string;
  securityRecommendations: SecurityRecommendation[];
  passwordPolicy: PasswordPolicy;
}

interface SecurityRecommendation {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  historyLimit: number;
}

interface ResetTokenValidationResponse {
  tokenValid: boolean;
  user: {
    email: string;
    fullName: string;
  };
  expiresAt: string;
  timeRemaining: number;
}

// API Response Wrapper (LOCAL - DO NOT IMPORT)
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

// Type Guards (LOCAL - DO NOT IMPORT)
const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true;
};

const isErrorResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } => {
  return response.success === false;
};
```

## Error Codes

### Authentication Errors
- **INVALID_RESET_TOKEN**: Reset token invalid, expired, or already used
- **RESET_TOKEN_EXPIRED**: Reset token has expired (1 hour limit)
- **INVALID_CURRENT_PASSWORD**: Current password verification failed
- **PASSWORD_ALREADY_EXISTS**: Attempting to set password when one already exists
- **NO_PASSWORD_EXISTS**: Attempting to change/remove password when none exists
- **GOOGLE_ACCOUNT_REQUIRED**: Operation requires Google authentication

### Validation Errors
- **PASSWORD_TOO_WEAK**: Password doesn't meet strength requirements
- **PASSWORD_MISMATCH**: New password and confirmation don't match
- **PASSWORD_REUSED**: Password matches one of last 5 used passwords
- **INVALID_EMAIL_FORMAT**: Email address format is invalid

### Rate Limiting Errors
- **RATE_LIMIT_EXCEEDED**: Too many attempts within time window
- **PASSWORD_CHANGE_LIMIT**: Too many password change attempts (5 per 15 min)
- **FORGOT_PASSWORD_LIMIT**: Too many forgot password requests (1 per 5 min)

### Account Errors
- **ACCOUNT_NOT_FOUND**: User account does not exist
- **ACCOUNT_DISABLED**: User account has been deactivated
- **GOOGLE_ONLY_ACCOUNT**: Account uses Google authentication only
- **MIXED_AUTH_REQUIRED**: Operation requires mixed authentication setup

### Security Errors
- **SESSION_REQUIRED**: Valid session required for operation
- **UNAUTHORIZED_ACCESS**: Insufficient permissions for operation
- **SECURITY_VIOLATION**: Action violates security policy

## Security Headers
```typescript
// Required for authenticated endpoints
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-Request-ID': requestId, // Optional for request tracing
  'X-User-Agent': userAgent  // Optional for device tracking
};
```

## Rate Limiting Rules
- **Forgot Password**: 1 request per 5 minutes per email address
- **Password Change**: 5 attempts per 15 minutes per user
- **Set Password**: 3 attempts per 30 minutes per user (Google users)
- **Token Validation**: 10 requests per minute per IP (public endpoint)
