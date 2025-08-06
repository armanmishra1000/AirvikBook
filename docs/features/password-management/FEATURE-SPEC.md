# Password Management Specification

## User Stories

### Primary User Story
As a hotel guest with an AirVikBook account, I want comprehensive password management capabilities so that I can securely reset forgotten passwords, change existing passwords, and manage authentication methods for my account.

### Supporting Stories

#### For Email Account Users
- As a user who forgot my password, I want to receive a secure reset link via email so that I can regain access to my account
- As a user with an email account, I want to change my password when logged in so that I can maintain account security
- As a security-conscious user, I want my password to meet strength requirements so that my account is protected
- As a user, I want my old sessions to be invalidated when I change my password so that unauthorized access is prevented

#### For Google Account Users  
- As a Google-only user, I want clear guidance when I try to reset my password so that I understand I should use Google sign-in instead
- As a Google user, I want the option to set a password so that I can have both Google and email authentication methods
- As a mixed-auth user, I want to manage both my Google and email authentication methods so that I have flexible login options

#### For Mixed Authentication Users
- As a user with both Google and email authentication, I want to see my current authentication methods so that I can manage my account security
- As a mixed-auth user, I want to remove my password and become Google-only so that I can simplify my authentication
- As a security-conscious user, I want to see when my password was last changed so that I can track my account security

#### For Security and Privacy
- As a user, I want my password history to be tracked so that I cannot reuse recent passwords
- As a user, I want to receive email notifications about password changes so that I can detect unauthorized access
- As a user, I want reset tokens to expire quickly so that my account remains secure if someone accesses my email later

## Functional Requirements

### Core Functionality

#### 1. Forgot Password Process (Email Users)
**Acceptance Criteria:**
- User can request password reset by entering email address
- System sends reset link to email if account exists with password capability
- Reset link expires after 1 hour for security
- Reset link can only be used once
- Clear error messages for invalid or expired tokens
- Email contains user-friendly instructions and branding

#### 2. Password Reset Completion
**Acceptance Criteria:**
- User can access reset form via email link
- Form validates token before allowing password entry
- New password must meet strength requirements (8+ chars, uppercase, lowercase, number, special)
- Password confirmation must match new password
- Password cannot match last 5 used passwords
- All user sessions invalidated after successful reset
- Security email sent to notify user of password change

#### 3. Change Password (Authenticated Users)
**Acceptance Criteria:**
- User must be logged in to change password
- Current password required for verification (unless Google-only user setting first password)
- New password must meet strength requirements
- Password cannot match last 5 used passwords
- Option to invalidate other sessions after password change
- Immediate feedback on password strength while typing
- Success confirmation with updated security timestamp

#### 4. Set Password for Google Users
**Acceptance Criteria:**
- Google-only users can set a password to enable mixed authentication
- No current password required (Google authentication confirms identity)
- New password must meet strength requirements
- Account type changes from "Google-only" to "Mixed"
- User can subsequently use either Google or email authentication
- Security email sent to notify of new authentication method

#### 5. Password Status Management
**Acceptance Criteria:**
- Users can view current authentication methods (Email, Google, Both)
- Display when password was last changed
- Show security recommendations based on account type
- Mixed-auth users can remove password to become Google-only
- Account type clearly indicated throughout the interface

#### 6. Google Account Guidance
**Acceptance Criteria:**
- Google-only users redirected from password reset with clear explanation
- Forgot password form detects Google accounts and provides appropriate messaging
- Login page emphasizes Google sign-in for Google-only accounts
- Mixed-auth users offered choice between Google and email authentication

### Business Rules

#### Password Security Rules
1. **Password Strength**: Minimum 8 characters with uppercase, lowercase, number, and special character
2. **Password History**: Cannot reuse last 5 passwords (stored as hashes)
3. **Reset Token Expiry**: Password reset tokens expire after 1 hour
4. **Single Use Tokens**: Reset tokens can only be used once
5. **Session Invalidation**: Password changes invalidate all other sessions
6. **Rate Limiting**: Maximum 5 password change attempts per 15 minutes per user

#### Account Type Rules
1. **Google-Only Accounts**: Users with Google ID but no password hash
2. **Email-Only Accounts**: Users with password hash but no Google ID  
3. **Mixed Accounts**: Users with both Google ID and password hash
4. **Authentication Flexibility**: Mixed accounts can use either authentication method
5. **Account Conversion**: Google-only can become mixed, mixed can become Google-only

#### Security and Privacy Rules
1. **Email Verification**: Reset emails only sent to verified email addresses
2. **Rate Limiting**: Forgot password limited to 1 request per 5 minutes per email
3. **Security Notifications**: Email sent for all password changes and account modifications
4. **No Email Enumeration**: Forgot password always returns success response
5. **Token Security**: Reset tokens cryptographically secure with sufficient entropy

#### User Experience Rules
1. **Clear Messaging**: Different messaging for different account types
2. **Graceful Degradation**: Appropriate fallbacks for Google-only accounts
3. **Progress Indication**: Clear progress through password reset flow
4. **Error Recovery**: Helpful error messages with suggested actions
5. **Mobile Optimization**: All flows work seamlessly on mobile devices

### Validation Rules

#### Input Validation
- **Email Format**: Valid email address format required
- **Password Strength**: 8+ characters, uppercase, lowercase, number, special character
- **Password Confirmation**: Must exactly match new password
- **Token Format**: Reset tokens must be valid format and exist in database
- **Current Password**: Must match stored hash for password changes

#### Business Logic Validation
- **Account Existence**: Email must belong to existing account for reset
- **Password Capability**: Account must support password authentication
- **Authentication State**: User must be logged in for password changes
- **Account Type**: Operations must be appropriate for account type (email/Google/mixed)
- **Rate Limits**: Check attempt counts before processing sensitive operations

#### Security Validation
- **Token Verification**: Reset tokens must be valid, not expired, and not used
- **Password History**: New password must not match last 5 passwords
- **Session Validation**: Current session must be valid for authenticated operations
- **IP Tracking**: Monitor for suspicious IP address changes during password operations
- **Device Consistency**: Track device changes during sensitive operations

## Database Schema Requirements

### New PasswordResetToken Model
```javascript
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

### New PasswordHistory Model
```javascript
model PasswordHistory {
  id           String   @id @default(cuid())
  userId       String
  passwordHash String
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("password_history")
}
```

### Extended User Model Relationships
```javascript
// Add to existing User model
model User {
  // ... existing fields ...
  
  // New relationships
  passwordResetTokens PasswordResetToken[]
  passwordHistory     PasswordHistory[]
}
```

### Relationships
- User → Many PasswordResetTokens (one-to-many with cascade delete)
- User → Many PasswordHistory (one-to-many with cascade delete)
- PasswordResetToken → One User (many-to-one)
- PasswordHistory → One User (many-to-one)

## UI/UX Requirements

### Pages Required

#### 1. **Forgot Password Page** - `/auth/forgot-password`
**Purpose**: Initiate password reset process
**Elements**:
- Page title: "Reset Your Password" (text-h1)
- Email input field with validation
- Submit button "Send Reset Link" (airvik-blue)
- Back to login link
- Different messaging for Google-only accounts
- Success message after email sent
- Rate limiting notice if applicable

#### 2. **Reset Password Page** - `/auth/reset-password?token={token}`
**Purpose**: Complete password reset with new password
**Elements**:
- Page title: "Set New Password" (text-h1)
- User email display for confirmation
- New password input with strength indicator
- Confirm password input
- Password requirements checklist
- Submit button "Reset Password" (airvik-blue)
- Token expiration timer/warning
- Error handling for invalid/expired tokens

#### 3. **Account Security Page** - `/account/security`
**Purpose**: Manage password and authentication methods
**Elements**:
- Page title: "Account Security" (text-h1)
- Current authentication methods display
- Password last changed information
- Change password section (for email/mixed accounts)
- Set password section (for Google-only accounts)
- Remove password option (for mixed accounts)
- Active sessions management link
- Security recommendations

#### 4. **Change Password Section** - Part of Account Security
**Purpose**: Change current password
**Elements**:
- Section title: "Change Password" (text-h4)
- Current password input (if applicable)
- New password input with strength indicator
- Confirm password input
- "Invalidate other sessions" checkbox
- Submit button "Update Password" (airvik-blue)
- Password requirements and history notice
- Success/error feedback

#### 5. **Set Password Section** - Part of Account Security
**Purpose**: Allow Google users to set password
**Elements**:
- Section title: "Set Account Password" (text-h4)
- Explanation of mixed authentication benefits
- New password input with strength indicator
- Confirm password input
- Submit button "Set Password" (airvik-purple)
- Notice about enabling email authentication
- Security implications explanation

### Brand Compliance

#### Colors
- **Primary Actions**: `--airvik-blue` (#133EE3) for password reset and change buttons
- **Secondary Actions**: `--airvik-purple` (#4322AA) for Google-related features and set password
- **Success States**: `--success` (#4E7638) for successful password operations
- **Error States**: `--error` (#B12A2A) for validation failures and security errors
- **Warning States**: `--warning` (#CB7B2B) for expiration warnings and security notices
- **Info States**: `--airvik-blue-light` (#D1D8FA) for Google account information
- **Backgrounds**: `--airvik-white` (#F8F9FE) for forms and `--gray-100` for settings sections

#### Typography
- **Page Titles**: `.text-h1` for "Reset Your Password", "Account Security"
- **Section Headers**: `.text-h4` for "Change Password", "Authentication Methods"
- **Form Labels**: `.text-label` for all input field labels
- **Body Text**: `.text-body` for instructions, help text, and explanations
- **Success Messages**: `.text-body` with success color styling
- **Error Messages**: `.text-body-sm` with error color styling
- **Captions**: `.text-caption` for password requirements and security notes
- **Buttons**: `.text-button` for all interactive button elements

#### Spacing
- **Container Padding**: `--space-6` (24px) for main form containers
- **Element Gaps**: `--space-4` (16px) between form elements
- **Section Spacing**: `--space-8` (32px) between major sections
- **Button Padding**: `--space-3` (12px) vertical, `--space-6` (24px) horizontal
- **Card Padding**: `--space-6` (24px) for security settings cards
- **Input Spacing**: `--space-3` (12px) for internal input padding

#### Components
- **Password Strength Indicator**: Progressive color bar (red → orange → green)
- **Password Requirements Checklist**: Icon-based checklist with real-time validation
- **Security Settings Cards**: Container cards for different account types
- **Authentication Method Badges**: Visual indicators for Email/Google/Mixed status
- **Token Expiration Timer**: Countdown display for reset token expiry
- **Success Animations**: Subtle checkmark animations for successful operations

#### Interactive States
- **Hover States**: Button color darkening and card elevation
- **Focus States**: Blue outline for keyboard navigation (high contrast for security)
- **Active States**: Pressed button styling
- **Disabled States**: Grayed out buttons during form submission
- **Loading States**: Spinner overlays during password operations
- **Success States**: Green highlighting for successful validations
- **Error States**: Red highlighting with shake animation for failures

#### Dark Mode Support
- **All Components**: Full dark mode compatibility
- **High Contrast**: Enhanced contrast for password fields and security elements
- **Color Adaptation**: All brand colors have dark mode variants
- **Security Indicators**: Password strength colors remain clearly visible
- **Form Contrast**: Ensure form elements meet accessibility standards in dark mode

### Responsive Design

#### Mobile-First Approach
- **Breakpoints**: 640px (mobile), 768px (tablet), 1024px (desktop)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Form Layout**: Single column layout optimized for mobile
- **Button Sizing**: Full-width on mobile, auto-width on larger screens
- **Password Visibility**: Large, easy-to-tap show/hide toggles

#### Device-Specific Optimizations
- **Mobile**: Larger password inputs, simplified strength indicator
- **Tablet**: Balanced layout with adequate spacing for forms
- **Desktop**: Multi-column potential for security settings
- **Touch Devices**: Optimized password visibility toggles

### Accessibility Requirements

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all form elements
- **Focus Indicators**: High-contrast focus outlines for all interactive elements
- **Skip Links**: Skip to main content for screen readers
- **Enter Key**: Submit forms using Enter key in password fields

#### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all form controls
- **Error Announcements**: Screen reader announcements for validation errors
- **Success Announcements**: Confirmation announcements for successful operations
- **Progress Indication**: Clear progress announcements through multi-step flows

#### Visual Accessibility
- **Color Contrast**: WCAG AA compliance (4.5:1 ratio minimum)
- **Text Scaling**: Support for 200% text scaling without horizontal scrolling
- **Visual Indicators**: Don't rely solely on color for important information
- **Animation Control**: Respect user preferences for reduced motion

## Security Requirements

### Password Security
- **Storage**: bcrypt hashing with minimum 12 rounds
- **Transmission**: HTTPS only for all password operations
- **Token Generation**: Cryptographically secure random tokens (32+ bytes)
- **Token Storage**: Secure database storage with proper indexing

### Session Management
- **Session Invalidation**: All sessions invalidated on password change
- **Token Refresh**: Automatic token refresh during password operations
- **Device Tracking**: Monitor device changes during sensitive operations
- **IP Monitoring**: Track IP address changes for security alerts

### Rate Limiting and Abuse Prevention
- **Forgot Password**: 1 request per 5 minutes per email address
- **Password Change**: 5 attempts per 15 minutes per authenticated user
- **Token Validation**: 10 requests per minute per IP address
- **Progressive Backoff**: Increasing delays for repeated failures

### Privacy and Compliance
- **Email Enumeration**: No account existence disclosure
- **Data Retention**: Password history retention policy (90 days)
- **Audit Logging**: All password operations logged for security review
- **GDPR Compliance**: User data handling according to privacy regulations
