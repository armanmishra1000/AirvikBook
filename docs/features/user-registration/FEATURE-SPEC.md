# User Registration Specification

## User Stories
### Primary User Story
As a hotel guest, I want to create an account so that I can make bookings, save my preferences, and manage my reservations.

### Supporting Stories
- As a guest, I want to register with my email and password so that I can access my account securely
- As a guest, I want to register with my Google account so that I can quickly sign up without creating a new password
- As a guest, I want to verify my email address so that the hotel can send me booking confirmations
- As a guest, I want to link my Google account to my existing email account so that I can use both login methods
- As a guest, I want to skip email verification when using Google so that I can start booking immediately
- As a guest, I want to receive a welcome email so that I know my registration was successful

## Functional Requirements
### Core Functionality
1. **Email/Password Registration**
   - User enters email, password, full name, and mobile number
   - System validates all inputs according to business rules
   - Account created with email verification required
   - Verification email sent automatically
   - User redirected to verification pending page

2. **Google OAuth Registration**
   - User clicks "Sign up with Google" button
   - Google OAuth popup opens for authentication
   - Account created with Google profile information
   - Email automatically verified for Google accounts
   - Profile picture imported from Google account
   - User redirected to dashboard/profile

3. **Email Verification Process**
   - User receives email with verification link
   - Clicking link verifies email and activates account
   - Welcome email sent after successful verification
   - User can resend verification email if needed

4. **Social Account Linking**
   - Existing users can link Google account to their email account
   - Prevents duplicate accounts for same email address
   - Allows login via either email/password or Google

### Business Rules
1. **Email Validation**
   - Must be valid email format (RFC 5322 compliant)
   - Must be unique across all users
   - Case-insensitive comparison
   - Domain validation (no disposable email services)

2. **Password Requirements**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character (!@#$%^&*)
   - No common passwords (dictionary check)

3. **Account Activation**
   - Email verification required for email/password registration
   - Google accounts are auto-verified
   - Unverified accounts cannot make bookings
   - Verification tokens expire after 24 hours

4. **Terms and Conditions**
   - User must explicitly accept terms and conditions
   - Checkbox required, not pre-checked
   - Link to terms page opens in new tab

### Validation Rules
- **Email**: RFC 5322 format, unique, no disposable domains
- **Password**: 8+ chars, mixed case, number, special char
- **Full Name**: 2-100 characters, letters, spaces, hyphens, apostrophes only
- **Mobile Number**: International format validation, optional field
- **Terms Acceptance**: Required boolean field

## Database Schema Requirements
### Existing User Entity (Reuse)
```javascript
// User Schema (already exists in Prisma)
{
  id: { type: String, required: true, unique: true }, // CUID
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for social login
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: false },
  role: { type: Enum, default: 'GUEST' }, // GUEST, STAFF, ADMIN, OWNER
  profilePicture: { type: String, required: false },
  googleId: { type: String, required: false, unique: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}
```

### New Entity Required
```javascript
// EmailVerificationToken Schema
{
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User' },
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now }
}
```

### Relationships
- User has many EmailVerificationTokens
- EmailVerificationToken belongs to User
- Only one active token per user email at a time

## UI/UX Requirements
### Pages Required
1. **Registration Page** - `/auth/register`
   - Split layout: form on left, benefits/features on right
   - Email/password form with Google OAuth option
   - Real-time validation feedback
   - Terms and conditions checkbox with link

2. **Email Verification Pending** - `/auth/verify-email`
   - Confirmation message with email address
   - Resend verification email button
   - Check inbox instructions
   - Link to login page

3. **Email Verification Success** - `/auth/verify-email/success`
   - Success confirmation
   - Welcome message
   - Continue to dashboard button
   - Auto-redirect after 3 seconds

4. **Account Linking Confirmation** - `/auth/link-account`
   - Confirmation dialog for linking Google to existing account
   - Show both account details
   - Confirm or cancel options

### Brand Compliance
- **Colors**: 
  - Primary buttons: `airvik-blue` with `airvik-purple` hover
  - Form backgrounds: `airvik-white` with `gray-50` borders
  - Error states: `error` color for validation messages
  - Success states: `success` color for confirmations
- **Typography**: 
  - Page title: `text-h1` for "Create Account"
  - Section headings: `text-h4` for form sections
  - Body text: `text-body` for labels and descriptions
  - Button text: `text-button` with proper letter spacing
- **Spacing**: 
  - Form container: `space-6` padding
  - Form fields: `space-4` vertical spacing
  - Button groups: `space-3` gap
- **Components**: 
  - Use brand-compliant `.btn-primary` and `.btn-secondary`
  - Form inputs with `.input` class and focus states
  - `.card` for form containers
  - `.toast` notifications for success/error messages
- **Dark Mode**: All forms and components must support dark theme variants
- **Interactive States**: Complete hover, focus, active, disabled states for all interactive elements

### Responsive Design
- **Mobile-first approach**: Design for 320px+ screens
- **Breakpoints**: 640px (tablet), 1024px (desktop)
- **Touch-friendly**: Minimum 44px touch targets
- **Form layout**: Single column on mobile, two-column on desktop
- **Google OAuth button**: Full width on mobile, inline on desktop

### Accessibility Requirements
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Screen reader support**: Proper ARIA labels and descriptions
- **Error announcements**: Form validation errors announced to screen readers
- **Focus management**: Logical tab order and visible focus indicators
- **Color contrast**: Minimum 4.5:1 contrast ratio for all text
- **Form labels**: Explicit labels for all form inputs