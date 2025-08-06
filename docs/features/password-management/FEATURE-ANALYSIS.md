# Password Management Analysis

## Feature Overview
Password Management provides secure password reset functionality, account security settings for mixed authentication methods (email + Google), and password change capabilities with history tracking. This feature builds upon the existing authentication system to provide comprehensive password security for users with different account types.

## Complexity Level
**Classification**: Medium
**Reasoning**: This feature involves business logic for different user types (email-only, Google-only, mixed accounts), password reset tokens with expiration, email integration, password history tracking, and security validations. It requires coordination between multiple existing services and handles sensitive security operations.

## Dependencies Analysis

### Required Features
- [x] Authentication System - JWT service, session management, and user models exist
- [x] Email System - Brevo SMTP service and password reset email templates exist
- [x] User Registration - User model with password field and Google OAuth support
- [x] User Login - Session management and token refresh patterns established

### Existing Code Integration

#### Authentication patterns
- **JWT Service**: `backend/src/services/jwt.service.ts` - Token generation for password reset tokens
- **Session Management**: `backend/src/services/auth/sessionManagement.service.ts` - Multi-device session tracking
- **Auth Middleware**: `backend/src/middleware/auth.middleware.ts` - Request authentication
- **User Model**: Prisma schema supports password field (nullable for Google-only users)

#### API patterns
- **Response Format**: Standardized `{ success: boolean, data/error }` format via `ResponseUtil`
- **Error Handling**: Consistent error codes and messages across auth endpoints
- **Rate Limiting**: Existing patterns for authentication endpoints (5 attempts per 15 min)
- **Validation**: Express-validator patterns for input validation

#### Database patterns
- **User Model**: Supports password field, Google ID, email verification status
- **Session Model**: Tracks device info, IP addresses, and active sessions
- **Token Models**: `EmailVerificationToken` pattern exists for secure token handling
- **Relationships**: User → Many Sessions with cascade delete

#### Frontend patterns
- **API Service**: Existing patterns for token-based API calls with auto-refresh
- **Auth Context**: React context for authentication state management
- **Form Components**: Brand-compliant input components with validation states
- **Toast Notifications**: Success/error feedback patterns established

## User Flows Identification

### Primary Flow: Forgot Password (Email Users)
1. User clicks "Forgot Password" on login page
2. User enters email address in forgot password form
3. System validates email and sends password reset link
4. User clicks link in email (opens reset password page)
5. User enters new password with confirmation
6. System validates password strength and updates account
7. Success message displayed with login redirection

### Alternative Flows

#### Google-Only Users (Password-Free Experience)
1. Google user visits forgot password page
2. System detects Google-only account
3. Display message: "Your account uses Google sign-in. Use 'Sign in with Google' instead"
4. Redirect to login page with Google sign-in highlighted

#### Set Password for Google Users
1. Google user accesses account security settings
2. Click "Set Password" option in mixed auth section
3. Enter new password with confirmation (no current password required)
4. System creates password hash and enables email login
5. Confirmation message: "Password set successfully. You can now use email or Google to sign in"

#### Change Password (Authenticated Users)
1. User accesses account security settings (requires current session)
2. Click "Change Password" section
3. Enter current password (if exists), new password, and confirmation
4. System validates current password and password strength
5. Update password hash, add to password history
6. Invalidate other sessions (optional user choice)
7. Success message with updated security timestamp

#### Password History Prevention
- System checks new password against last 5 passwords used
- If match found, display error: "Please choose a password you haven't used recently"
- User must select a different password

#### Account Security Settings Dashboard
1. Display current authentication methods (Email, Google)
2. Show password last changed date (if applicable)
3. Show active sessions with device info
4. Options to manage mixed auth methods
5. Security recommendations based on account type

## Brand Compliance Requirements

### Colors needed
- **Primary Actions**: `--airvik-blue` for password reset and change buttons
- **Secondary Actions**: `--airvik-purple` for Google-related options
- **Success States**: `--success` for password change confirmations
- **Error States**: `--error` for validation failures and security warnings
- **Warning States**: `--warning` for password strength indicators
- **Info States**: `--airvik-blue-light` for Google account notices
- **Backgrounds**: `--airvik-white` for forms and `--gray-100` for settings sections

### Typography
- **Page Titles**: `text-h1` for "Reset Password", "Account Security"
- **Section Headers**: `text-h4` for "Change Password", "Authentication Methods"
- **Form Labels**: `text-label` for input field labels
- **Body Text**: `text-body` for instructions and help text
- **Success Messages**: `text-body` with success color
- **Error Messages**: `text-body-sm` with error color
- **Captions**: `text-caption` for password requirements and security notes

### Components
- **Password Strength Indicator**: Progress bar with color coding (red → yellow → green)
- **Security Cards**: Information cards for different account types
- **Authentication Method Toggles**: Switch components for enabling/disabling methods
- **Session List Items**: Cards showing device info with action buttons
- **Password Requirements**: Checklist component with validation icons
- **Security Timeline**: List component showing password change history dates

### Interactions
- **Hover States**: Button darkening, card elevation on authentication method cards
- **Focus States**: Blue outline for password inputs with high contrast
- **Loading States**: Spinner overlays during password changes and email sending
- **Success Animation**: Subtle green checkmark animation for successful password changes
- **Error Animation**: Red shake animation for validation failures
- **Password Visibility Toggle**: Eye icon with smooth transition

### Dark mode considerations
- **High Contrast**: Password fields need extra contrast in dark mode for security
- **Security Indicators**: Password strength colors must remain visible in dark theme
- **Card Backgrounds**: Security setting cards use appropriate dark background variants
- **Alert Colors**: Error and warning states maintain accessibility in dark mode
