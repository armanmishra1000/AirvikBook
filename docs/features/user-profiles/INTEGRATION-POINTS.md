# Integration Points for User Profiles

## Dependencies on Existing Features
Based on project-progress.md analysis:
- [x] **Authentication**: Uses existing JWT service, auth middleware, and Google OAuth service for profile data extraction
- [x] **Database**: Extends existing User model with additional profile fields (preferences, privacy settings)
- [x] **API Patterns**: Follows existing ResponseUtil.success/error structure and /api/v1/auth endpoint patterns
- [x] **UI Patterns**: Uses existing card, button, input components with brand design tokens

## Shared Code to Reuse
From existing codebase:
- **Backend utilities**: 
  - `src/services/jwt.service.ts` - Token generation and verification
  - `src/services/googleOAuth.service.ts` - Google profile data extraction
  - `src/middleware/auth.middleware.ts` - Route authentication
  - `src/utils/response.utils.ts` - Standard API response formatting
  - `src/services/email.service.ts` - Profile change notifications

- **Frontend services**: 
  - `src/services/userLogin.service.ts` - ApiClient pattern with auto token refresh
  - `src/types/userLogin.types.ts` - User interface and auth patterns
  - Token storage patterns: sessionStorage for access, localStorage for refresh tokens

- **UI components**: 
  - `src/components/auth/PasswordInput.tsx` - Input component with validation
  - `src/components/auth/GoogleOAuthButton.tsx` - Google account connection patterns
  - Card layout patterns from auth pages for profile sections
  - Form validation and error display components

- **Middleware**: 
  - Rate limiting middleware for profile update endpoints
  - File upload middleware for profile picture handling
  - Validation middleware for profile data sanitization

## Token Storage Patterns (CRITICAL)
Based on existing implementation:
- **Access token location**: `sessionStorage.getItem('airvik_access_token')`
- **Refresh token location**: `localStorage.getItem('airvik_refresh_token')`
- **User data storage**: `localStorage.getItem('airvik_user')` - will need updates for profile changes
- **API headers format**: `Authorization: Bearer ${accessToken}`, `Content-Type: application/json`

## Brand System Integration
Based on BRAND-GUIDELINES.md:
- **Color tokens to use**: 
  - `var(--airvik-blue)` for primary save/update actions
  - `var(--airvik-purple)` for secondary edit actions  
  - `var(--airvik-cyan)` for connected account highlights
  - `var(--success)` for save confirmations
  - `var(--warning)` for validation warnings
  - `var(--error)` for error states

- **Spacing tokens**: 
  - `var(--space-6)` for card padding and section spacing
  - `var(--space-4)` for form element gaps
  - `var(--space-3)` for input padding
  - `var(--space-2)` for small element spacing

- **Typography classes**: 
  - `.text-h3` for main page title "Profile Settings"
  - `.text-h5` for section headers ("Personal Information", "Connected Accounts")
  - `.text-body` for form content and descriptions
  - `.text-label` for input field labels
  - `.text-caption` for help text and status messages

- **Component patterns**: 
  - `.btn-primary` for save/update actions
  - `.btn-secondary` for cancel/edit toggles
  - `.card` for profile sections with hover effects
  - `.input` with focus states for form fields
  - Interactive states (hover, focus, active, disabled) for all elements

## Database Integration
### Existing User Model Extension
```prisma
model User {
  // Existing fields (no changes needed)
  id                String    @id @default(cuid())
  email             String    @unique
  password          String?   // Already nullable for Google users
  fullName          String    // Will be editable in profiles
  mobileNumber      String?   // Will be editable in profiles
  role              UserRole  @default(GUEST)
  profilePicture    String?   // Will be manageable (upload/sync)
  googleId          String?   @unique
  isEmailVerified   Boolean   @default(false)
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  isActive          Boolean   @default(true)

  // Additional fields needed for User Profiles
  bio               String?   // Personal bio/description
  dateOfBirth       DateTime? // Optional birth date
  gender            String?   // Optional gender
  nationality       String?   // Optional nationality
  occupation        String?   // Optional occupation
  website           String?   // Personal website URL
  location          String?   // Current location/city
  
  // Privacy settings
  profileVisibility String    @default("PUBLIC") // PUBLIC, PRIVATE, FRIENDS
  showEmail         Boolean   @default(false)
  showPhone         Boolean   @default(false)
  allowGoogleSync   Boolean   @default(true)
  
  // Profile picture settings
  profilePictureSource String? // "UPLOAD", "GOOGLE", "DEFAULT"
  
  // Existing relations (maintain)
  emailVerificationTokens EmailVerificationToken[]
  sessions                Session[]
  passwordResetTokens     PasswordResetToken[]
  passwordHistory         PasswordHistory[]
}
```

### Google OAuth Data Mapping
From existing `GoogleOAuthService.verifyGoogleToken()`:
- `payload.name` → `User.fullName`
- `payload.email` → `User.email` 
- `payload.picture` → `User.profilePicture` (if sync enabled)
- `payload.sub` → `User.googleId`

## Potential Conflicts
- **Route conflicts**: Ensure `/profile` doesn't conflict with existing auth routes
- **Database conflicts**: New User model fields must be nullable to avoid breaking existing users
- **Component naming**: Use `ProfileForm`, `ProfilePicture`, `SocialConnections` to avoid conflicts with auth components
- **API endpoint conflicts**: Use `/api/v1/user/profile` to distinguish from `/api/v1/auth` endpoints
- **File storage conflicts**: Implement proper file naming and cleanup for profile pictures

## API Integration Patterns
### Authentication Requirements
All profile endpoints require:
```typescript
// Headers
Authorization: Bearer ${accessToken}
Content-Type: application/json

// Middleware chain
[
  authMiddleware.verifyToken,
  validationMiddleware.validateProfile,
  profileController.method
]
```

### File Upload Integration
For profile picture uploads:
```typescript
// Headers for file upload
Content-Type: multipart/form-data
Authorization: Bearer ${accessToken}

// File validation
- Max size: 5MB
- Formats: jpg, jpeg, png, webp
- Dimensions: 100x100 to 2000x2000 pixels
```

## Frontend State Management
### AuthContext Extension
```typescript
// Extend existing AuthContext with profile methods
interface AuthContextValue {
  // Existing methods...
  user: User | null;
  
  // New profile methods
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  syncGoogleProfilePicture: () => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
  refreshUserData: () => Promise<void>;
}
```

## Error Handling Integration
Following existing patterns:
- Validation errors: Return 400 with field-specific error details
- Auth errors: Return 401 with clear auth failure messages
- File upload errors: Return 413 for size, 415 for format
- Server errors: Return 500 with generic message, log detailed errors
