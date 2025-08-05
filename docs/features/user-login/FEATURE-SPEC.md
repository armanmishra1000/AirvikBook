# User Login & Session Management Specification

## User Stories

### Primary User Story
As a registered hotel guest, I want to securely log into my AirVikBook account using my email/password or Google account so that I can access my booking history, manage reservations, and enjoy a personalized experience.

### Supporting Stories
- As a user, I want to log in with my Google account for quick access without remembering another password
- As a user, I want my login session to persist across browser tabs so I don't have to re-authenticate frequently
- As a user, I want to be notified when someone logs into my account from a new device for security
- As a user, I want the option to "remember me" so I stay logged in longer on my trusted devices
- As a user, I want to see and manage all my active sessions across different devices
- As a user, I want to log out from all devices if I suspect my account is compromised
- As a user, I want to seamlessly continue using the app when my session token expires without being interrupted
- As a Google user, I want to link my Google account with an existing email account I already have

## Functional Requirements

### Core Functionality

#### 1. Email/Password Authentication
**Acceptance Criteria:**
- User can log in with valid email and password combination
- Invalid credentials display clear error message
- Account lockout after 5 failed attempts within 15 minutes
- Successful login generates JWT access token (15 min) and refresh token (7 days)
- Last login timestamp updated in user profile
- Login attempt logged for security monitoring

#### 2. Google OAuth Authentication  
**Acceptance Criteria:**
- User can click "Sign in with Google" button to authenticate
- Google OAuth popup opens and handles authentication flow
- Valid Google token creates or logs into existing account
- Google profile picture and name sync to user account
- Google users bypass email verification requirement
- Existing Google account links with email account if user chooses

#### 3. Session Management
**Acceptance Criteria:**
- User session persists across browser tabs and page refreshes
- Access token automatically refreshes when expired (seamless to user)
- User can view all active sessions with device information
- User can log out from current device only or all devices
- Session invalidation works immediately across all tabs
- New device login triggers security email notification

#### 4. Remember Me Functionality
**Acceptance Criteria:**
- "Remember me" checkbox extends refresh token to 30 days
- Remember me state persists browser restarts on same device
- User can disable remember me from account settings
- Remember me works with both email and Google login

#### 5. Account Merging
**Acceptance Criteria:**
- Google login can link to existing email account
- User prompted to confirm account linking if emails match
- Merged account maintains booking history and preferences
- User can use either login method after merging
- Account merging preserves user data integrity

### Business Rules

#### Authentication Rules
1. **Email Verification Required**: Users must verify email before login (except Google users)
2. **Account Status Check**: Only active accounts can log in
3. **Rate Limiting**: Maximum 5 login attempts per IP per 15 minutes
4. **Session Limit**: Maximum 10 active sessions per user across devices
5. **Token Security**: Access tokens expire in 15 minutes, refresh tokens in 7 days (30 days with remember me)

#### Google OAuth Rules  
1. **Email Matching**: Google email must match existing account for auto-linking
2. **Profile Sync**: Google profile data overwrites existing profile picture and name
3. **Verification Bypass**: Google authenticated users skip email verification
4. **Token Validation**: Google tokens must be validated with Google before authentication

#### Session Management Rules
1. **Device Tracking**: Each session tracks device type, browser, and location
2. **Security Alerts**: Email sent for new device logins  
3. **Session Cleanup**: Expired sessions automatically cleaned up daily
4. **Concurrent Sessions**: Multiple sessions allowed but tracked separately

### Validation Rules

#### Input Validation
- **Email**: Valid email format, registered in system
- **Password**: Must meet existing password requirements (8+ chars, uppercase, lowercase, number, special)
- **Device ID**: UUID format for device tracking
- **Google Token**: Valid JWT format, verified with Google

#### Business Logic Validation
- **Account Status**: Account must be active and not suspended
- **Email Verification**: Email must be verified (except Google users)
- **Rate Limiting**: Check attempt count before processing login
- **Session Limits**: Enforce maximum session count per user

#### Security Validation
- **Password Hash**: Use bcrypt verification against stored hash
- **Token Integrity**: Validate JWT signature and expiration
- **Device Fingerprinting**: Track and compare device characteristics
- **IP Validation**: Monitor for suspicious IP address changes

## Database Schema Requirements

### Existing User Model Extensions
```javascript
// User model already supports login - no changes needed
{
  id: String, // CUID primary key
  email: String, // unique, required
  password: String, // bcrypt hash (nullable for Google-only users)
  fullName: String, // required
  mobileNumber: String, // optional
  role: Enum, // GUEST, STAFF, ADMIN, OWNER
  profilePicture: String, // optional, URL
  googleId: String, // unique, optional
  isEmailVerified: Boolean, // default false
  isActive: Boolean, // default true
  lastLoginAt: DateTime, // updated on each login
  createdAt: DateTime, // auto timestamp
  updatedAt: DateTime, // auto timestamp
  sessions: Session[] // relationship to sessions
}
```

### Existing Session Model Usage
```javascript
// Session model already supports all login functionality
{
  id: String, // CUID primary key
  userId: String, // foreign key to User
  token: String, // access token placeholder (not stored)
  refreshToken: String, // unique refresh token
  expiresAt: DateTime, // refresh token expiry
  isActive: Boolean, // default true
  createdAt: DateTime, // session start time
  deviceInfo: JSON, // device fingerprint data
  ipAddress: String, // user IP address
  userAgent: String, // browser user agent
  user: User // relationship to user
}
```

### Relationships (Already Established)
- User → Many Sessions (one-to-many)
- Session → One User (many-to-one with cascade delete)

## UI/UX Requirements

### Pages Required

#### 1. **Main Login Page** - `/auth/login`
**Purpose**: Primary authentication entry point
**Elements**:
- Page title: "Welcome Back" (text-h1)
- Email input with validation
- Password input with show/hide toggle
- "Remember me" checkbox
- Primary login button (airvik-blue)
- "Forgot password?" link
- Divider with "Or continue with"
- Google sign-in button (airvik-purple)
- "Don't have an account? Sign up" link
- Loading states during authentication
- Error message display area

#### 2. **Session Management Page** - `/account/sessions`  
**Purpose**: View and manage active sessions
**Elements**:
- Page title: "Active Sessions" (text-h1)
- Current session highlighted
- Session list with device info, last activity, location
- "Log out" button for individual sessions
- "Log out from all devices" button
- Security notice about new device alerts

#### 3. **Account Linking Page** - `/auth/link-account`
**Purpose**: Link Google account with existing email account
**Elements**:
- Explanation of account linking
- User account information display
- Google account information display  
- "Link accounts" confirmation button
- "Use separate account" option
- Privacy and security notices

#### 4. **Security Alert Page** - `/auth/security-alert`
**Purpose**: Display new device login notification
**Elements**:
- Security alert message
- Device information that logged in
- "This was me" / "This wasn't me" buttons
- Instructions for securing account
- Link to session management

### Brand Compliance

#### Colors
- **Primary Actions**: airvik-blue for main login button
- **Secondary Actions**: airvik-purple for Google OAuth button
- **Backgrounds**: airvik-white for input fields and cards
- **Success States**: success color for successful login feedback
- **Error States**: error color for failed authentication and validation errors
- **Text**: Default text colors with proper contrast ratios

#### Typography
- **Page Titles**: text-h1 for "Welcome Back", "Active Sessions"
- **Section Headers**: text-h4 for "Sign in to your account", "Or continue with"
- **Labels**: text-body for input labels and help text
- **Buttons**: text-button for all button text
- **Links**: text-body with hover states for "Forgot password?", "Sign up"

#### Spacing
- **Container Padding**: space-6 for main login card padding
- **Element Gaps**: space-4 between form elements
- **Section Spacing**: space-8 between major sections (email/password vs Google)
- **Button Spacing**: space-3 for internal button padding

#### Components
- **Form Inputs**: Reuse existing input components with focus/error/disabled states
- **Buttons**: Primary button style for login, secondary for Google OAuth
- **Cards**: Container cards with subtle shadows and rounded corners
- **Loading States**: Spinner overlays during authentication
- **Toast Notifications**: Success/error notifications for login feedback

#### Interactive States
- **Hover**: Subtle color darkening for buttons and links
- **Focus**: Blue outline for keyboard navigation on inputs and buttons
- **Active**: Pressed state styling for buttons
- **Disabled**: Grayed out state for buttons during loading
- **Loading**: Spinner replacement for button text during authentication

#### Dark Mode Support
- **All Components**: Must work in both light and dark themes
- **Color Adaptation**: All brand colors have dark mode variants
- **Contrast Ratios**: Meet WCAG guidelines in both themes
- **Asset Updates**: Icons and images adapt to theme

### Responsive Design

#### Mobile-First Approach
- **Breakpoints**: 640px (mobile), 768px (tablet), 1024px (desktop)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Form Layout**: Single column on mobile, optimized spacing
- **Button Sizing**: Full-width on mobile, auto-width on desktop

#### Device-Specific Optimizations
- **Mobile**: Larger touch targets, simplified layout, auto-zoom prevention
- **Tablet**: Balanced layout with adequate spacing
- **Desktop**: Multi-column potential, hover state enhancements

## Error Handling Requirements

### Client-Side Error Handling
- **Field Validation**: Real-time validation feedback for email and password
- **Network Errors**: Graceful handling of network failures with retry options
- **Token Expiry**: Automatic token refresh without user interruption
- **Offline Support**: Clear messaging when offline, queue requests when possible

### Server-Side Error Mapping
- **Authentication Errors**: Clear, actionable error messages
- **Rate Limiting**: User-friendly explanation with retry countdown
- **Account Issues**: Specific guidance for account-related problems
- **Security Alerts**: Appropriate messaging for suspicious activity

### Error Recovery
- **Auto-Retry**: Automatic retry for transient network failures
- **Fallback Options**: Alternative authentication methods if primary fails
- **Support Links**: Contact information for unresolvable issues
- **Error Logging**: Comprehensive error tracking for debugging

## Performance Requirements

### Response Times
- **Login Process**: Complete authentication within 2 seconds
- **Token Refresh**: Background refresh within 500ms
- **Session Loading**: Active sessions list loads within 1 second
- **Page Navigation**: Login page renders within 1 second

### Optimization Strategies  
- **Token Caching**: Efficient local storage management
- **API Efficiency**: Minimal API calls during authentication flow
- **Bundle Size**: Login feature adds minimal JavaScript bundle size
- **Memory Usage**: Efficient memory management for session data

## Security Requirements

### Authentication Security
- **Password Hashing**: bcrypt with minimum 12 rounds
- **Token Security**: JWT with strong secrets (minimum 32 characters)
- **Session Protection**: Secure refresh token storage and rotation
- **Rate Limiting**: Progressive backoff for failed attempts

### Communication Security
- **HTTPS Only**: All authentication endpoints require HTTPS
- **Token Transmission**: Tokens only sent in Authorization headers
- **Cookie Security**: HttpOnly, Secure, SameSite attributes
- **CORS Configuration**: Strict origin policies for authentication

### Data Protection
- **Token Storage**: Secure storage patterns (sessionStorage/localStorage)
- **Session Encryption**: Sensitive session data encrypted at rest
- **Audit Logging**: All authentication events logged for security monitoring
- **Privacy Compliance**: GDPR-compliant data handling and retention