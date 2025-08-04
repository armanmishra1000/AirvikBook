# User Registration API Contract

## CRITICAL RULE: Frontend and Backend MUST follow this EXACTLY

### Base Configuration
- **Base URL**: http://localhost:5000
- **API Prefix**: /api/v1
- **Auth Pattern**: Bearer token in Authorization header
- **Response Format**: MUST match existing project patterns

## Endpoint Specifications

### User Registration - POST /api/v1/auth/register
**Purpose**: Create new user account with email verification

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "mobileNumber": "+1234567890",
  "acceptedTerms": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clw1x2y3z4a5b6c7d8e9f0",
      "email": "user@example.com",
      "fullName": "John Doe",
      "mobileNumber": "+1234567890",
      "role": "GUEST",
      "profilePicture": null,
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "verificationEmailSent": true
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Error Response (400/409/500):**
```json
{
  "success": false,
  "error": "Email already exists",
  "code": "EMAIL_EXISTS",
  "details": {
    "field": "email",
    "value": "user@example.com"
  }
}
```

**Business Rules:**
- Email must be unique and valid format
- Password minimum 8 characters with uppercase, lowercase, number, special character
- Mobile number must be valid international format
- Terms and conditions acceptance required
- Email verification required for activation

### Google OAuth Registration - POST /api/v1/auth/google
**Purpose**: Register/login user via Google OAuth

**Request:**
```json
{
  "googleToken": "google_oauth_token_here",
  "linkToEmail": "existing@example.com" // Optional for account linking
}
```

**Success Response (200/201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clw1x2y3z4a5b6c7d8e9f0",
      "email": "user@gmail.com",
      "fullName": "John Doe",
      "mobileNumber": null,
      "role": "GUEST",
      "profilePicture": "https://lh3.googleusercontent.com/...",
      "googleId": "google_user_id_123",
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "isNewUser": true,
    "welcomeEmailSent": true
  },
  "message": "Google registration successful. Welcome!"
}
```

**Business Rules:**
- Google token must be valid and verified
- Email from Google is automatically verified
- Profile picture from Google account is saved
- If linkToEmail provided, link Google account to existing user
- Skip email verification for Google accounts

### Email Verification - POST /api/v1/auth/verify-email
**Purpose**: Verify user email with token

**Request:**
```json
{
  "token": "email_verification_token_here",
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clw1x2y3z4a5b6c7d8e9f0",
      "email": "user@example.com",
      "isEmailVerified": true
    },
    "welcomeEmailSent": true
  },
  "message": "Email verified successfully. Welcome to AirVikBook!"
}
```

**Business Rules:**
- Token must be valid and not expired (24 hour expiry)
- Email must match token
- User account must exist
- Send welcome email after verification

### Resend Verification - POST /api/v1/auth/resend-verification
**Purpose**: Resend email verification

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
    "expiresIn": "24 hours"
  },
  "message": "Verification email sent successfully."
}
```

**Business Rules:**
- Rate limit: 1 request per 5 minutes
- User must exist and be unverified
- Generate new token, invalidate old ones

### Check Email Availability - GET /api/v1/auth/check-email/:email
**Purpose**: Check if email is available for registration

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "suggestion": null
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "Email already registered",
  "code": "EMAIL_EXISTS",
  "data": {
    "available": false,
    "suggestion": "user123@example.com"
  }
}
```

## Type Definitions Required
```typescript
// Request Types
interface UserRegistrationRequest {
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  acceptedTerms: boolean;
}

interface GoogleAuthRequest {
  googleToken: string;
  linkToEmail?: string;
}

interface EmailVerificationRequest {
  token: string;
  email: string;
}

// Response Types
interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN' | 'OWNER';
  profilePicture?: string;
  googleId?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegistrationResponse {
  user: UserResponse;
  tokens: AuthTokens;
  verificationEmailSent?: boolean;
  isNewUser?: boolean;
  welcomeEmailSent?: boolean;
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
- **EMAIL_EXISTS**: Email already registered
- **INVALID_EMAIL**: Email format invalid
- **WEAK_PASSWORD**: Password doesn't meet requirements
- **INVALID_PHONE**: Phone number format invalid
- **TERMS_NOT_ACCEPTED**: Terms and conditions not accepted
- **GOOGLE_TOKEN_INVALID**: Google OAuth token invalid
- **VERIFICATION_TOKEN_INVALID**: Email verification token invalid or expired
- **VERIFICATION_TOKEN_EXPIRED**: Email verification token expired
- **USER_NOT_FOUND**: User account not found
- **RATE_LIMIT_EXCEEDED**: Too many requests