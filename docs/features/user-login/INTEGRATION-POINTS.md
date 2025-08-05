# Integration Points for User Login & Session Management

## Dependencies on Existing Features
Based on project-progress.md analysis:
- ✅ **Authentication**: Complete JWT service, auth middleware, and token management infrastructure from user registration
- ✅ **Database**: User and Session models exist with all required fields for login functionality
- ✅ **API Patterns**: Established `/api/v1` prefix, standardized response format, Bearer token authorization
- ✅ **UI Patterns**: Brand-compliant component patterns, form validation, error handling established

## Shared Code to Reuse
From existing codebase:

### Backend Infrastructure
- **JWT Service** (`backend/src/services/jwt.service.ts`): Complete token generation, validation, refresh, and session management
- **Auth Middleware** (`backend/src/middleware/auth.middleware.ts`): Role-based access control, token verification, rate limiting
- **Google OAuth Service** (`backend/src/services/googleOAuth.service.ts`): Google token validation and user profile extraction
- **Email Service** (`backend/src/services/email/`): Template rendering for security notifications
- **Response Utils** (`backend/src/utils/response.utils.ts`): Standardized API response formatting
- **Password Service** (from registration): bcrypt password hashing and validation

### Frontend Services
- **API Service Pattern** (`frontend/src/services/userRegistration.service.ts`): HTTP client with auto token refresh, error handling
- **Type Guards** (`frontend/src/types/userRegistration.types.ts`): `isSuccessResponse()`, `isErrorResponse()` for safe property access
- **Token Storage Logic**: Existing patterns for `sessionStorage`/`localStorage` token management
- **Validation Utils**: Email, password validation functions already implemented

### UI Components
- **Form Components**: Input components with brand compliance and error states
- **Button Components**: Primary, secondary button styles with interactive states
- **Google OAuth Button**: Existing Google "Sign in" button from registration
- **Password Strength Indicator**: Can be reused for password visibility in login
- **Toast Notifications**: Success/error notification system
- **Loading States**: Spinner and skeleton loading patterns

## Token Storage Patterns (CRITICAL)
Based on existing implementation:
- **Access token location**: `sessionStorage.getItem('airvik_access_token')` (15 minutes)
- **Refresh token location**: `localStorage.getItem('airvik_refresh_token')` (7 days)
- **User data storage**: `localStorage.getItem('airvik_user')` (user profile information)
- **API headers format**: 
  ```javascript
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
  ```

## Brand System Integration
Based on BRAND-GUIDELINES.md:
- **Color tokens to use**: 
  - `airvik-blue` for primary login button
  - `airvik-purple` for Google OAuth button  
  - `airvik-white` for input backgrounds
  - `error` color for failed authentication
  - `success` color for successful login feedback
- **Spacing tokens**: `space-6` for form container padding, `space-4` for input field gaps
- **Typography classes**: 
  - `text-h1` for "Welcome Back" page title
  - `text-h4` for section headings ("Sign In", "Or continue with")
  - `text-body` for input labels and help text
  - `text-button` for button text styling
- **Component patterns**: Follow existing card layout, input focus states, button hover effects

## Existing Database Schema Utilization
### User Model Fields (Already Available)
```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String?   // Nullable for Google-only accounts
  fullName          String
  mobileNumber      String?
  role              Role      @default(GUEST)
  profilePicture    String?
  googleId          String?   @unique
  isEmailVerified   Boolean   @default(false)
  isActive          Boolean   @default(true)
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  sessions          Session[]
}
```

### Session Model Fields (Already Available)  
```prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   // Access token placeholder
  refreshToken String   @unique
  expiresAt    DateTime
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoint Extensions
Building on existing auth routes (`/api/v1/auth/`):
- **POST** `/api/v1/auth/login` (new)
- **POST** `/api/v1/auth/google-login` (extend existing `/google`)
- **POST** `/api/v1/auth/refresh` (extend existing)
- **POST** `/api/v1/auth/logout` (new)
- **DELETE** `/api/v1/auth/logout-all` (new)
- **GET** `/api/v1/auth/sessions` (new)

## Frontend Route Integration
Extending existing auth routes:
- **Page**: `/auth/login` (new)
- **Page**: `/auth/forgot-password` (future)
- **Component**: Reuse `/auth/register` layout patterns
- **Redirect**: Use existing success page patterns

## Security Integration Points
### Extending Existing Middleware
- **Rate Limiting**: Extend existing rate limiter for login attempts
- **Auth Middleware**: Reuse existing `verifyToken`, `requireRole` middleware
- **Session Management**: Build upon existing session tracking in JWT service

### Email Security Notifications
- **New Device Login**: Email alert using existing email templates
- **Suspicious Activity**: Security notification system
- **Session Management**: Account activity summaries

## Error Handling Integration
### API Error Codes (Extending existing)
- Reuse existing error response format
- Add login-specific error codes while maintaining consistency
- Integrate with existing frontend error handling patterns

### Frontend Error States
- Reuse existing form validation error displays
- Extend toast notification system for login feedback
- Maintain existing loading state patterns during authentication

## Potential Conflicts
### Route Conflicts
- ✅ **No conflicts**: `/auth/login` doesn't conflict with existing `/auth/register`, `/auth/verify-email`
- ✅ **API endpoints**: New login endpoints don't conflict with registration endpoints

### Database Conflicts
- ✅ **No schema changes needed**: Existing User and Session models support all login functionality
- ✅ **No relationship conflicts**: Login feature uses existing User ↔ Session relationships

### Component Naming
- **Avoid conflicts**: Use `LoginForm` vs existing `RegistrationForm`
- **Reuse patterns**: Follow existing `GoogleOAuthButton` naming for consistency
- **Maintain structure**: Use existing `auth/` component directory organization

## Session Management Integration
### Multi-device Session Tracking
- Leverage existing Session model for device-specific session storage
- Build upon existing refresh token invalidation logic
- Use existing session cleanup mechanisms

### Remember Me Functionality
- Extend existing refresh token expiry logic (7 days → configurable)
- Maintain existing token storage patterns with extended duration
- Integrate with existing auto-refresh mechanisms

## Performance Considerations
### Caching and Optimization
- Reuse existing API response caching patterns
- Leverage existing token validation optimizations
- Build upon existing database connection pooling

### Bundle Size Impact
- Minimal impact: Reusing existing auth infrastructure
- No new major dependencies required
- Extend existing Google OAuth integration