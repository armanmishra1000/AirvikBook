# Integration Points for Password Management

## Dependencies on Existing Features
Based on project-progress.md analysis:

- [x] **Authentication System**: JWT service with token generation/verification for reset tokens
- [x] **Email System**: Brevo SMTP configuration with password reset email templates
- [x] **User Registration**: User model with password field (nullable) and Google OAuth support
- [x] **User Login**: Session management, rate limiting, and device tracking infrastructure
- [x] **Database**: Prisma schema with User, Session, and token models established
- [x] **API Structure**: Response format, error handling, and `/api/v1` prefix patterns
- [x] **Frontend Setup**: Next.js 14, TypeScript, Tailwind CSS with brand design tokens

## Shared Code to Reuse

### Backend Services (Existing Files)
- **JWT Service**: `backend/src/services/jwt.service.ts`
  - Token generation/verification methods for password reset tokens
  - Existing patterns for secure token creation with expiration
- **Email Service**: `backend/src/services/email.service.ts`
  - `sendPasswordResetEmail()` method already implemented
  - Brevo SMTP transporter with proper HTML templates
- **Auth Service**: `backend/src/services/auth/authLogin.service.ts`
  - Password verification and hashing utilities
  - User lookup and validation patterns
- **Session Management**: `backend/src/services/auth/sessionManagement.service.ts`
  - Device tracking and session invalidation methods
  - Multi-device session management utilities
- **Security Monitoring**: `backend/src/services/auth/securityMonitoring.service.ts`
  - Rate limiting patterns and security alerts

### Backend Controllers (Existing Patterns)
- **Auth Controllers**: `backend/src/controllers/auth/login.controller.ts`
  - Rate limiting middleware application
  - Request validation and error handling patterns
- **Email Controller**: `backend/src/controllers/email.controller.ts`
  - Password reset email endpoint already exists at `POST /api/v1/email/password-reset`
- **Response Utilities**: `backend/src/utils/response.utils.ts`
  - Standardized success/error response formatting
  - Validation error formatting for consistent UX

### Frontend Services (Existing Patterns)
- **User Login Service**: `frontend/src/services/userLogin.service.ts`
  - API client patterns with auto token refresh
  - Error handling and response type guards
- **Auth Context**: `frontend/src/context/AuthContext.tsx`
  - User state management and authentication flows
  - Token storage and retrieval patterns

### UI Components (Existing Components)
- **Authentication Forms**: `frontend/src/components/auth/LoginForm.tsx`
  - Input validation and brand-compliant styling
  - Loading states and error message display
- **Password Components**: `frontend/src/components/auth/PasswordStrengthIndicator.tsx`
  - Password validation and strength visualization
  - Brand-compliant color coding and animations
- **Google OAuth**: `frontend/src/components/auth/GoogleLoginButton.tsx`
  - Google sign-in integration patterns
  - Account type detection and user guidance

### Middleware (Existing Files)
- **Auth Middleware**: `backend/src/middleware/auth.middleware.ts`
  - JWT token verification for protected endpoints
  - User session validation and device tracking
- **Rate Limiting**: Built into existing auth controllers
  - 5 attempts per 15 minutes pattern for sensitive operations

## Token Storage Patterns (CRITICAL)
Based on existing implementation:

- **Access Token Location**: `sessionStorage.getItem('airvik_access_token')`
- **Refresh Token Location**: `localStorage.getItem('airvik_refresh_token')`
- **User Data Storage**: `sessionStorage.getItem('airvik_user')`
- **API Headers Format**: 
  ```javascript
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
  ```
- **Reset Token Handling**: Temporary tokens passed via URL parameters (not stored)

## Brand System Integration
Based on BRAND-GUIDELINES.md:

### Color Tokens to Use
- **Primary Actions**: `--airvik-blue` (#133EE3) for password change buttons
- **Secondary Actions**: `--airvik-purple` (#4322AA) for Google-related features
- **Success States**: `--success` (#4E7638) for password change confirmations
- **Error States**: `--error` (#B12A2A) for validation failures
- **Warning States**: `--warning` (#CB7B2B) for password strength indicators
- **Info Backgrounds**: `--airvik-blue-light` (#D1D8FA) for Google account notices
- **Card Backgrounds**: `--airvik-white` (#F8F9FE) for security settings

### Spacing Tokens
- **Container Padding**: `--space-6` (24px) for security settings cards
- **Element Gaps**: `--space-4` (16px) between form elements
- **Section Spacing**: `--space-8` (32px) between security sections
- **Button Padding**: `--space-3` (12px) vertical, `--space-6` (24px) horizontal

### Typography Classes
- **Page Titles**: `.text-h1` for "Account Security", "Reset Password"
- **Section Headers**: `.text-h4` for "Change Password", "Authentication Methods"
- **Body Content**: `.text-body` for instructions and help text
- **Form Labels**: `.text-label` for input field labels
- **Captions**: `.text-caption` for password requirements
- **Buttons**: `.text-button` for all interactive elements

### Component Patterns
- **Form Inputs**: Existing input component with focus/error/disabled states
- **Primary Buttons**: Airvik-blue background with hover/active states
- **Secondary Buttons**: Transparent background with airvik-blue border
- **Cards**: Container pattern with `--shadow-sm` and `--radius-lg`
- **Toast Notifications**: Success/error patterns for password operations

## Password Reset Token Model (New Required)
```javascript
// New model needed in Prisma schema
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  email     String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, email])
  @@map("password_reset_tokens")
}
```

## Password History Model (New Required)
```javascript
// New model needed for password history tracking
model PasswordHistory {
  id           String   @id @default(cuid())
  userId       String
  passwordHash String
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("password_history")
}
```

## Potential Conflicts

### Route Conflicts
- **Password Reset Routes**: No conflicts - using `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password`
- **Frontend Routes**: No conflicts - using `/auth/forgot-password` and `/auth/reset-password`

### Database Conflicts
- **User Model**: No changes needed - password field already exists and nullable
- **New Models**: No naming conflicts with existing schema
- **Relationships**: Clean addition to existing User relationships

### Component Naming
- **Password Components**: Extend existing `PasswordStrengthIndicator` component
- **Auth Components**: Add new components without naming conflicts
- **Form Components**: Reuse existing form input patterns

## API Integration Points

### Existing Email Endpoint
- **Endpoint**: `POST /api/v1/email/password-reset` (already exists)
- **Usage**: Reuse for sending password reset emails
- **Parameters**: `{ email, userName, resetToken }`

### Authentication Middleware
- **Protected Routes**: Apply existing auth middleware to password change endpoints
- **Rate Limiting**: Apply existing rate limiting patterns (5 attempts per 15 min)
- **Session Validation**: Use existing session management for authenticated operations

### Database Queries
- **User Lookup**: Leverage existing Prisma User model queries
- **Session Management**: Use existing session invalidation methods
- **Token Cleanup**: Implement cleanup jobs following existing token patterns

## Google OAuth Integration Points

### Account Type Detection
- **Mixed Accounts**: Users with both `password` and `googleId` fields populated
- **Google-Only**: Users with `googleId` but no `password` field
- **Email-Only**: Users with `password` but no `googleId` field

### User Experience Flows
- **Google-Only Users**: Redirect to Google sign-in, prevent password reset
- **Mixed Account Users**: Offer choice between Google sign-in or password reset
- **Account Linking**: Use existing patterns from user registration

## Frontend Integration Strategy

### State Management
- **Auth Context**: Extend existing user state to include password status
- **Form State**: Leverage existing form validation patterns
- **Loading States**: Use established loading indicator patterns

### API Service Extension
- **Password Service**: Create new service following `userLogin.service.ts` patterns
- **Error Handling**: Use existing type guards and error response handling
- **Token Management**: Follow established token refresh patterns

### Component Architecture
- **Security Dashboard**: New page component following existing auth page patterns
- **Password Forms**: Extend existing form components with validation
- **Account Status**: New components showing mixed auth status
