# User Login & Session Management API Contract

## CRITICAL RULE: Frontend and Backend MUST follow this EXACTLY

### Base Configuration
- **Base URL**: http://localhost:5000
- **API Prefix**: /api/v1
- **Auth Pattern**: Bearer token in Authorization header
- **Response Format**: MUST match existing project patterns

## Endpoint Specifications

### User Login - POST /api/v1/auth/login
**Purpose**: Authenticate user with email/password and generate session tokens

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false,
  "deviceInfo": {
    "deviceId": "uuid-device-identifier",
    "deviceName": "Chrome on MacOS",
    "userAgent": "Mozilla/5.0..."
  }
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
      "fullName": "John Doe",
      "mobileNumber": "+1234567890",
      "role": "GUEST",
      "profilePicture": "https://example.com/profile.jpg",
      "googleId": null,
      "isEmailVerified": true,
      "lastLoginAt": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "refreshExpiresIn": 604800
    },
    "session": {
      "id": "session_id_123",
      "deviceInfo": {
        "deviceId": "uuid-device-identifier",
        "deviceName": "Chrome on MacOS",
        "lastActivity": "2024-01-01T12:00:00.000Z"
      },
      "isNewDevice": true
    },
    "securityAlert": {
      "newDeviceEmailSent": true,
      "requiresAdditionalVerification": false
    }
  },
  "message": "Login successful. Welcome back!"
}
```

**Error Response (400/401/403/500):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS",
  "details": {
    "attempts": 2,
    "maxAttempts": 5,
    "lockoutTime": null
  }
}
```

**Business Rules:**
- Email must be registered and verified
- Password must match stored hash
- Account must be active (not disabled)
- Rate limiting: 5 attempts per 15 minutes per IP
- Remember me extends refresh token to 30 days
- New device detection triggers security email

### Google OAuth Login - POST /api/v1/auth/google-login  
**Purpose**: Authenticate user with Google OAuth token

**Request:**
```json
{
  "googleToken": "google_oauth_token_here",
  "rememberMe": false,
  "deviceInfo": {
    "deviceId": "uuid-device-identifier",
    "deviceName": "Chrome on MacOS",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Success Response (200):**
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
      "lastLoginAt": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "refreshExpiresIn": 604800
    },
    "session": {
      "id": "session_id_123",
      "deviceInfo": {
        "deviceId": "uuid-device-identifier",
        "deviceName": "Chrome on MacOS",
        "lastActivity": "2024-01-01T12:00:00.000Z"
      },
      "isNewDevice": false
    },
    "accountStatus": {
      "isExistingUser": true,
      "hasEmailAccount": false,
      "accountLinked": false
    }
  },
  "message": "Google login successful. Welcome back!"
}
```

**Business Rules:**
- Google token must be valid and not expired
- Email from Google token must match existing user OR create new user
- Google accounts are automatically email verified
- Profile picture updated from Google account if available
- Device tracking same as email/password login

### Token Refresh - POST /api/v1/auth/refresh
**Purpose**: Generate new access token using refresh token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "clw1x2y3z4a5b6c7d8e9f0",
      "email": "user@example.com",
      "role": "GUEST",
      "lastLoginAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Business Rules:**
- Refresh token must be valid and not expired
- Refresh token must exist in active sessions
- User account must still be active
- Updates last activity timestamp

### Logout - POST /api/v1/auth/logout
**Purpose**: Invalidate current session and tokens

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "logoutFromAllDevices": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "loggedOut": true,
    "sessionsInvalidated": 1,
    "message": "Successfully logged out"
  }
}
```

**Business Rules:**
- Invalidates refresh token in database
- Marks session as inactive
- If logoutFromAllDevices=true, invalidates all user sessions
- Always returns success even if token already invalid

### Logout from All Devices - DELETE /api/v1/auth/sessions
**Purpose**: Invalidate all user sessions across devices

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionsInvalidated": 3,
    "message": "Logged out from all devices"
  }
}
```

### Get Active Sessions - GET /api/v1/auth/sessions
**Purpose**: List all active sessions for current user

**Headers Required:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_id_123",
        "deviceInfo": {
          "deviceId": "uuid-device-identifier",
          "deviceName": "Chrome on MacOS",
          "userAgent": "Mozilla/5.0..."
        },
        "createdAt": "2024-01-01T10:00:00.000Z",
        "lastActivity": "2024-01-01T12:00:00.000Z",
        "isCurrent": true,
        "ipAddress": "192.168.1.100",
        "location": "San Francisco, CA"
      }
    ],
    "totalSessions": 1
  }
}
```

### Forgot Password - POST /api/v1/auth/forgot-password
**Purpose**: Initiate password reset process

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
    "message": "Password reset instructions sent to your email"
  }
}
```

**Business Rules:**
- Always returns success (security measure)
- Rate limit: 1 request per 5 minutes per email
- Token expires in 1 hour
- Email sent only if account exists

## Type Definitions Required

```typescript
// Request Types
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

interface GoogleLoginRequest {
  googleToken: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface LogoutRequest {
  refreshToken: string;
  logoutFromAllDevices?: boolean;
}

interface ForgotPasswordRequest {
  email: string;
}

// Response Types
interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  session: SessionInfo;
  securityAlert?: SecurityAlert;
  accountStatus?: AccountStatus;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: 'GUEST' | 'STAFF' | 'ADMIN' | 'OWNER';
  profilePicture?: string;
  googleId?: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface SessionInfo {
  id: string;
  deviceInfo: DeviceInfo;
  isNewDevice: boolean;
}

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent?: string;
  lastActivity?: string;
}

interface SecurityAlert {
  newDeviceEmailSent: boolean;
  requiresAdditionalVerification: boolean;
}

interface AccountStatus {
  isExistingUser: boolean;
  hasEmailAccount: boolean;
  accountLinked: boolean;
}

interface ActiveSession {
  id: string;
  deviceInfo: DeviceInfo;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
  ipAddress?: string;
  location?: string;
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
- **INVALID_CREDENTIALS**: Email/password combination invalid
- **ACCOUNT_LOCKED**: Too many failed login attempts
- **ACCOUNT_DISABLED**: User account has been deactivated
- **EMAIL_NOT_VERIFIED**: Account exists but email not verified
- **GOOGLE_TOKEN_INVALID**: Google OAuth token invalid or expired
- **REFRESH_TOKEN_INVALID**: Refresh token invalid or expired
- **REFRESH_TOKEN_EXPIRED**: Refresh token has expired
- **SESSION_NOT_FOUND**: Session does not exist
- **RATE_LIMIT_EXCEEDED**: Too many requests from IP/user
- **DEVICE_NOT_RECOGNIZED**: New device requires verification
- **PASSWORD_RESET_REQUIRED**: Account requires password reset

## Security Headers
```typescript
// Required for all authenticated endpoints
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-Device-ID': deviceId, // Optional for device tracking
  'X-Request-ID': requestId // Optional for request tracing
};
```

## Rate Limiting Rules
- **Login attempts**: 5 per 15 minutes per IP address
- **Password reset**: 1 per 5 minutes per email
- **Token refresh**: 10 per minute per user
- **Session queries**: 20 per minute per user