# Task Prompts for User Profiles

## HOW TO USE
1. Copy each prompt exactly as written
2. Replace [feature-name] with "user-profiles"
3. Paste to AI and let it execute
4. AI will automatically update all state files

## CRITICAL RULE REMINDERS FOR AI

### 🚨 ZERO VIOLATIONS ALLOWED
1. **NEVER import from shared/contracts/** - Create local types only
2. **ALWAYS use type guards** for union type property access
3. **NEVER use function dependencies in useEffect** - Use useRef instead
4. **ONLY use brand tokens** - No hardcoded colors, spacing, typography
5. **CREATE ALL user flow pages** - Not just main feature page
6. **VALIDATE ALL file uploads** - Size, format, dimensions, security
7. **PROTECT ALL routes** with authentication middleware

---

## Backend Task B1: Data Model Extension

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-profiles/FEATURE-ANALYSIS.md"
  - "docs/features/user-profiles/FEATURE-SPEC.md"
  - "docs/features/user-profiles/API-CONTRACT.md"
  - "docs/features/user-profiles/CURRENT-STATE.md"
  - "docs/features/project-progress.md"
  - "backend/prisma/schema.prisma"

validation_rules:
  - confirm_existing_user_model: true
  - ensure_nullable_new_fields: true
  - follow_existing_patterns: true
```

### Execution Instructions
**CONTEXT**: You are extending the existing User model for user-profiles feature.

**MANDATORY FIRST ACTIONS**:
1. Read ALL documentation files listed above
2. Analyze existing User model structure in schema.prisma
3. Confirm all new fields are nullable/optional for existing users
4. Verify integration requirements with existing authentication features

**YOUR TASK**: Extend User model with profile fields and privacy settings

**FILE TO MODIFY**: `backend/prisma/schema.prisma`

**REQUIREMENTS**:
- Add profile fields: bio (String?), dateOfBirth (DateTime?), gender (String?), nationality (String?), occupation (String?), website (String?), location (String?)
- Add privacy fields: profileVisibility (String @default("PUBLIC")), showEmail (Boolean @default(false)), showPhone (Boolean @default(false)), allowGoogleSync (Boolean @default(true))
- Add profilePictureSource (String? @default("DEFAULT")) for tracking picture source
- ALL new fields MUST be nullable or have defaults to avoid breaking existing users
- Maintain all existing fields and relationships
- Create migration with proper field defaults

**VALIDATION RULES**:
- TypeScript compilation: `cd backend && npx tsc --noEmit`
- Prisma validation: `cd backend && npx prisma validate`
- Generate migration: `cd backend && npx prisma migrate dev --name add_user_profile_fields`
- Apply migration: Migration should succeed without errors

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B1: User model extended with profile fields"
2. Verify migration created and applied successfully
3. Git commit: `git add . && git commit -m "feat(user-profiles): extend User model with profile fields (B1)"`

**ON ERROR**:
1. Log exact error to `PROBLEMS-LOG.md` with timestamp and task B1
2. Apply known error patterns from log
3. Retry up to 3 times with different approach
4. If still failing, request manual assistance

---

## Backend Task B2: Profile Service Layer Creation

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-profiles/API-CONTRACT.md"
  - "docs/features/user-profiles/INTEGRATION-POINTS.md"
  - "backend/src/services/googleOAuth.service.ts"
  - "backend/src/utils/response.utils.ts"

validation_rules:
  - confirm_b1_completed: "User model extended successfully"
  - follow_existing_service_patterns: true
  - implement_all_contract_methods: true
```

### Execution Instructions
**CONTEXT**: You are creating profile service layer for user-profiles feature.

**MANDATORY FIRST ACTIONS**:
1. Read API-CONTRACT.md for exact method signatures
2. Study existing service patterns from googleOAuth.service.ts
3. Confirm B1 completion in CURRENT-STATE.md
4. Verify Google OAuth integration patterns

**YOUR TASK**: Create comprehensive profile management service

**FILES TO CREATE**: 
- `backend/src/services/user/profile.service.ts` - Main profile service
- `backend/src/services/user/profilePicture.service.ts` - Image management service

**REQUIREMENTS**:
- ProfileService class with methods: getProfile, updateProfile, updatePrivacySettings, connectGoogle, disconnectGoogle
- ProfilePictureService class with methods: uploadPicture, syncFromGoogle, deletePicture, validateImage
- Use Prisma for database operations
- Integrate with existing GoogleOAuthService for data sync
- Implement proper error handling and validation
- Follow exact response format from API-CONTRACT.md
- Add proper TypeScript interfaces for all methods

**VALIDATION RULES**:
- TypeScript compilation: `cd backend && npx tsc --noEmit`
- Service method tests: Create basic test for each method
- Integration with existing patterns: Must use Prisma and ResponseUtil patterns

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B2: Profile service layer created"
2. Create basic test file: `backend/src/tests/profileService.test.ts`
3. Git commit: `git add . && git commit -m "feat(user-profiles): add profile service layer (B2)"`

---

## Backend Task B3: File Storage Integration

### Pre-Execution Checklist
```yaml
critical_validations:
  - security_validation: "File upload security patterns understood"
  - storage_strategy: "Local/cloud storage approach defined"
  - image_optimization: "Image processing requirements clear"
```

### Execution Instructions
**CONTEXT**: You are implementing secure file storage for profile pictures.

**CRITICAL SECURITY RULES**: 
- Validate file size (5MB max)
- Validate file type (jpg, jpeg, png, webp only)
- Validate image dimensions (100x100 to 2000x2000)
- Sanitize filenames to prevent attacks
- Optimize images before storage

**YOUR TASK**: Create secure file storage with image optimization

**FILES TO CREATE**:
- `backend/src/services/storage/fileStorage.service.ts` - File management
- `backend/src/middleware/fileUpload.middleware.ts` - Multer configuration
- `backend/src/utils/imageOptimization.ts` - Image processing

**REQUIREMENTS**:
```typescript
// FileStorageService must include:
class FileStorageService {
  static async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<UploadResult>
  static async deleteFile(filePath: string): Promise<void>
  static async validateImageFile(file: Express.Multer.File): Promise<ValidationResult>
  static async optimizeImage(buffer: Buffer): Promise<Buffer>
}

// Multer configuration for profile pictures
const profilePictureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => { /* validation */ }
});
```

**VALIDATION RULES**:
- File upload test: Upload valid image, verify optimization
- Security test: Attempt upload of invalid files, verify rejection
- Storage test: Verify file cleanup when replacing images

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B3: File storage with security implemented"
2. Create file upload tests
3. Git commit: `git add . && git commit -m "feat(user-profiles): add secure file storage (B3)"`

---

## Backend Task B4: Profile Controllers

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-profiles/API-CONTRACT.md"
  - "backend/src/controllers/auth.controller.ts"

validation_rules:
  - confirm_b2_b3_completed: true
  - follow_existing_controller_patterns: true
  - implement_exact_api_contract: true
```

### Execution Instructions
**CONTEXT**: You are creating HTTP controllers for all profile endpoints.

**MANDATORY PATTERN FOLLOWING**: Use exact patterns from auth.controller.ts

**YOUR TASK**: Create controllers implementing exact API contract

**FILES TO CREATE**:
- `backend/src/controllers/user/profile.controller.ts` - Profile CRUD endpoints
- `backend/src/controllers/user/profilePicture.controller.ts` - Picture upload endpoints

**ENDPOINTS TO IMPLEMENT**:
- GET /user/profile - Retrieve user profile
- PUT /user/profile - Update profile information  
- POST /user/profile/picture - Upload profile picture
- POST /user/profile/picture/sync-google - Sync from Google
- PUT /user/profile/privacy - Update privacy settings
- POST /user/profile/connect-google - Connect Google account
- DELETE /user/profile/disconnect-google - Disconnect Google account

**REQUIREMENTS**:
- Use ResponseUtil.success/error for all responses
- Apply proper validation middleware
- Handle all error cases from API-CONTRACT.md
- Follow exact response format specifications
- Implement proper request validation

**VALIDATION RULES**:
- API contract compliance: Every endpoint must match API-CONTRACT.md exactly
- Error handling: Test all error scenarios
- Request validation: Verify all input validation works

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B4: Profile controllers implemented"
2. Create Postman collection for testing
3. Git commit: `git add . && git commit -m "feat(user-profiles): add profile controllers (B4)"`

---

## Backend Task B5: Route Configuration

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "backend/src/routes/auth.routes.ts"
  - "backend/src/middleware/auth.middleware.ts"

validation_rules:
  - confirm_b4_completed: true
  - apply_auth_middleware_all_routes: true
  - implement_rate_limiting: true
```

### Execution Instructions
**CONTEXT**: You are configuring API routes with proper middleware chains.

**CRITICAL SECURITY REQUIREMENT**: ALL profile routes MUST be protected with authentication

**YOUR TASK**: Configure routes with complete middleware chains

**FILE TO CREATE**: `backend/src/routes/user/profile.routes.ts`

**REQUIREMENTS**:
```typescript
// ALL routes MUST include authentication
router.get('/profile', 
  authMiddleware.verifyToken,  // REQUIRED
  profileController.getProfile
);

router.put('/profile',
  rateLimit({ max: 10, windowMs: 15 * 60 * 1000 }), // REQUIRED
  authMiddleware.verifyToken,  // REQUIRED
  validationMiddleware.validateProfile, // REQUIRED
  profileController.updateProfile
);

// File upload routes need special middleware
router.post('/profile/picture',
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // REQUIRED
  authMiddleware.verifyToken,  // REQUIRED
  fileUploadMiddleware.single('picture'), // REQUIRED
  profileController.uploadPicture
);
```

**VALIDATION RULES**:
- Route protection test: Verify unauthenticated requests fail
- Rate limiting test: Verify limits are enforced
- Middleware chain test: Verify all middleware executes correctly

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B5: Route configuration with security"
2. Test all routes with authentication
3. Git commit: `git add . && git commit -m "feat(user-profiles): configure routes with security (B5)"`

---

## Backend Task B6: Business Logic & Validation

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-profiles/FEATURE-SPEC.md"
  - "docs/features/user-profiles/PROBLEMS-LOG.md"

validation_rules:
  - implement_all_business_rules: true
  - comprehensive_validation: true
  - security_validation: true
```

### Execution Instructions
**CONTEXT**: You are implementing comprehensive validation and business rules.

**YOUR TASK**: Create robust validation for all profile operations

**FILES TO CREATE**:
- `backend/src/validators/profile.validator.ts` - Profile data validation
- `backend/src/middleware/profileValidation.middleware.ts` - Request validation

**BUSINESS RULES TO IMPLEMENT**:
```typescript
// Profile validation rules
const profileValidation = {
  fullName: { required: true, minLength: 2, maxLength: 100, pattern: /^[a-zA-Z\s]+$/ },
  mobileNumber: { optional: true, pattern: /^\+[1-9]\d{1,14}$/ },
  bio: { optional: true, maxLength: 500 },
  website: { optional: true, pattern: /^https?:\/\/.+/ },
  dateOfBirth: { optional: true, mustBePast: true },
  // ... additional validation rules
};

// Google disconnection safety check
const canDisconnectGoogle = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true }
  });
  return !!user?.password; // Must have password to disconnect Google
};
```

**VALIDATION RULES**:
- Field validation test: Test all validation rules
- Business logic test: Test Google disconnection safety
- Error message test: Verify clear, actionable error messages

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B6: Business logic and validation implemented"
2. Create comprehensive validation tests
3. Git commit: `git add . && git commit -m "feat(user-profiles): add business logic and validation (B6)"`

---

## Backend Task B7: Google Integration Enhancement

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "backend/src/services/googleOAuth.service.ts"
  - "docs/features/user-profiles/INTEGRATION-POINTS.md"

validation_rules:
  - understand_existing_google_integration: true
  - extend_not_replace: true
  - maintain_backward_compatibility: true
```

### Execution Instructions
**CONTEXT**: You are enhancing existing Google OAuth service for profile management.

**CRITICAL RULE**: EXTEND existing service, do NOT replace or break existing functionality

**YOUR TASK**: Add profile-specific Google integration methods

**FILE TO MODIFY**: `backend/src/services/googleOAuth.service.ts`

**METHODS TO ADD**:
```typescript
// Add these methods to existing GoogleOAuthService class
class GoogleOAuthService {
  // Existing methods remain unchanged...

  // NEW: Connect Google account to existing user
  static async connectGoogleToUser(userId: string, googleToken: string): Promise<ConnectionResult>
  
  // NEW: Sync profile data from Google
  static async syncProfileFromGoogle(userId: string): Promise<SyncResult>
  
  // NEW: Disconnect Google account safely
  static async disconnectGoogle(userId: string): Promise<DisconnectionResult>
  
  // NEW: Validate Google profile picture URL
  static async validateGooglePictureUrl(pictureUrl: string): Promise<boolean>
}
```

**REQUIREMENTS**:
- Maintain all existing Google OAuth functionality
- Add new methods without breaking existing code
- Handle all Google API edge cases
- Implement proper error handling for Google API failures
- Add rate limiting for Google API calls

**VALIDATION RULES**:
- Backward compatibility: Existing Google auth must still work
- New functionality test: Test all new profile-related methods
- Error handling test: Test Google API failure scenarios

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B7: Google integration enhanced for profiles"
2. Test both existing and new Google functionality
3. Git commit: `git add . && git commit -m "feat(user-profiles): enhance Google integration for profiles (B7)"`

---

## Frontend Task F1: TypeScript Types (CRITICAL CONTRACT RULE)

### Pre-Execution Checklist
```yaml
critical_validations:
  - scan_for_contract_imports: "grep -r 'shared/contracts' frontend/src/"
  - must_be_empty: true
  - block_execution_if_found: true
```

### Execution Instructions
**CONTEXT**: You are creating TypeScript types for user-profiles frontend.

**CRITICAL RULE**: NEVER import from shared/contracts/. Create LOCAL interfaces.

**MANDATORY FIRST ACTIONS**:
1. Read API-CONTRACT.md for type structure
2. Scan codebase for any existing contract imports: `grep -r 'shared/contracts' frontend/src/`
3. If found, STOP and fix before proceeding

**YOUR TASK**: Create local TypeScript interfaces matching API contract

**FILE TO CREATE**: `frontend/src/types/userProfile.types.ts`

**REQUIREMENTS**:
```typescript
// ✅ CORRECT: Local interfaces (copy structure from API-CONTRACT.md)
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
  privacy: PrivacySettings;
  connectedAccounts: ConnectedAccounts;
  lastUpdated: string;
}

// ❌ FORBIDDEN: Contract imports
// import { ApiResponse } from '../../../shared/contracts/api-response.contract';
```

**TYPE GUARD PATTERNS REQUIRED**:
```typescript
// MANDATORY: Add type guards for safe property access
const isSuccessResponse = (response: any): response is { success: true; data: any } => {
  return response && response.success === true;
};

const isErrorResponse = (response: any): response is { success: false; error: string } => {
  return response && response.success === false;
};
```

**VALIDATION RULES**:
- Contract import scan: `grep -r 'shared/contracts' frontend/src/types/userProfile.types.ts`
- Must return empty (no matches)
- TypeScript compilation: `cd frontend && npx tsc --noEmit`

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F1: Local types created (no contract imports)"
2. Verify TypeScript compilation success
3. Git commit: `git add . && git commit -m "feat(user-profiles): add local TypeScript types (F1)"`

---

## Frontend Task F2: API Service Layer

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "frontend/src/services/userLogin.service.ts"
  - "frontend/src/types/userProfile.types.ts"

validation_rules:
  - follow_existing_api_patterns: true
  - implement_auto_token_refresh: true
  - use_type_guards_always: true
```

### Execution Instructions
**CONTEXT**: You are creating frontend API service for profile management.

**MANDATORY PATTERN FOLLOWING**: Copy exact patterns from userLogin.service.ts

**YOUR TASK**: Create profile API service with auto token refresh

**FILE TO CREATE**: `frontend/src/services/userProfile.service.ts`

**REQUIREMENTS**:
```typescript
// Follow exact ApiClient pattern from userLogin.service.ts
export class UserProfileService {
  // Get user profile
  static async getProfile(): Promise<ProfileApiResponse> {
    const response = await ApiClient.request<UserProfile>(
      'GET',
      '/user/profile',
      undefined,
      { requiresAuth: true }
    );
    
    // MANDATORY: Use type guards
    if (isSuccessResponse(response)) {
      return response as ProfileApiResponse;
    }
    return response as ProfileApiResponse;
  }

  // Update profile
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<ProfileUpdateApiResponse> {
    // Implementation following exact patterns...
  }

  // Upload profile picture with file support
  static async uploadProfilePicture(file: File): Promise<ProfilePictureApiResponse> {
    // Special handling for file uploads...
  }
}
```

**VALIDATION RULES**:
- Type safety: All responses must use type guards
- Token refresh: Verify automatic token refresh works
- Error handling: Test all error scenarios
- File upload: Test profile picture upload functionality

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F2: API service with auto token refresh"
2. Test API service methods
3. Git commit: `git add . && git commit -m "feat(user-profiles): add API service layer (F2)"`

---

## Frontend Task F3: Profile UI Components

### Pre-Execution Checklist
```yaml
critical_validations:
  - brand_tokens_only: "No hardcoded colors, spacing, typography"
  - interactive_states_required: "hover, focus, active, disabled"
  - dark_mode_support: "data-theme='dark' compatibility"
```

### Execution Instructions
**CONTEXT**: You are creating brand-compliant profile UI components.

**CRITICAL RULE**: Use ONLY brand tokens - No hardcoded values

**YOUR TASK**: Create reusable profile components with full brand compliance

**FILES TO CREATE**:
- `frontend/src/components/profile/ProfileForm.tsx` - Profile editing form
- `frontend/src/components/profile/ProfilePictureUpload.tsx` - Picture upload
- `frontend/src/components/profile/PrivacySettings.tsx` - Privacy controls
- `frontend/src/components/profile/ConnectedAccounts.tsx` - Account management
- `frontend/src/components/profile/ProfileCard.tsx` - Profile display

**BRAND COMPLIANCE REQUIREMENTS**:
```typescript
// ✅ CORRECT: Brand tokens only
const ProfileForm = () => {
  return (
    <div className="bg-airvik-white p-space-6 rounded-radius-lg shadow-shadow-sm">
      <h3 className="text-h3 text-airvik-black mb-space-4">
        Profile Settings
      </h3>
      <button className="btn-primary bg-airvik-blue hover:bg-airvik-purple">
        Save Changes
      </button>
    </div>
  );
};

// ❌ FORBIDDEN: Hardcoded values
// <div style={{ backgroundColor: '#F8F9FE', padding: '24px' }}>
// <button className="bg-blue-500 px-6 py-3">
```

**INTERACTIVE STATES REQUIRED**:
- Hover: All clickable elements must have hover effects
- Focus: Keyboard navigation and focus indicators
- Active: Button press and active states
- Disabled: Disabled states for unavailable actions
- Loading: Loading states for async operations

**VALIDATION RULES**:
- Brand token scan: `grep -r 'bg-blue-\|text-lg\|p-6\|#[0-9A-F]' frontend/src/components/profile/`
- Must return empty (no hardcoded values)
- Dark mode test: All components work with data-theme="dark"
- Accessibility test: All interactive elements are keyboard accessible

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F3: Brand-compliant components with interactive states"
2. Test all components in light and dark mode
3. Git commit: `git add . && git commit -m "feat(user-profiles): add brand-compliant UI components (F3)"`

---

## Frontend Task F4: Profile Pages Implementation

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-profiles/FEATURE-SPEC.md"
  - "frontend/src/app/auth/login/page.tsx"

validation_rules:
  - implement_all_user_flows: true
  - mobile_responsive_design: true
  - error_boundaries_included: true
```

### Execution Instructions
**CONTEXT**: You are implementing all user-facing profile pages.

**MANDATORY REQUIREMENT**: Create ALL pages listed in FEATURE-SPEC.md, not just main page

**YOUR TASK**: Implement complete profile page flows

**PAGES TO CREATE**:
- `frontend/src/app/profile/page.tsx` - Main profile overview
- `frontend/src/app/profile/edit/page.tsx` - Profile editing
- `frontend/src/app/profile/picture/page.tsx` - Picture management
- `frontend/src/app/profile/privacy/page.tsx` - Privacy settings
- `frontend/src/app/profile/connections/page.tsx` - Connected accounts

**REQUIREMENTS**:
```typescript
// Each page must include:
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
      <ProfileErrorBoundary>
        <div className="container mx-auto px-space-4 py-space-8">
          {/* Page content with proper spacing and typography */}
        </div>
      </ProfileErrorBoundary>
    </div>
  );
}

// Metadata for each page
export const metadata = {
  title: 'Profile Settings | AirVikBook',
  description: 'Manage your profile information and privacy settings'
};
```

**VALIDATION RULES**:
- Mobile responsive: Test all pages on mobile viewport
- Navigation: Verify proper breadcrumbs and back buttons
- Error boundaries: All pages handle errors gracefully
- Loading states: All async operations show loading indicators

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F4: All profile pages implemented"
2. Test complete user flows on desktop and mobile
3. Git commit: `git add . && git commit -m "feat(user-profiles): implement all profile pages (F4)"`

---

## Frontend Task F5: Authentication Context Integration

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "frontend/src/context/AuthContext.tsx"
  - "frontend/src/types/userLogin.types.ts"

validation_rules:
  - extend_existing_context: true
  - maintain_backward_compatibility: true
  - update_user_data_realtime: true
```

### Execution Instructions
**CONTEXT**: You are extending existing AuthContext with profile management.

**CRITICAL RULE**: EXTEND existing context, do NOT break existing functionality

**YOUR TASK**: Add profile methods to AuthContext

**FILES TO MODIFY**:
- `frontend/src/context/AuthContext.tsx` - Add profile methods
- `frontend/src/types/userLogin.types.ts` - Extend AuthContextValue

**METHODS TO ADD**:
```typescript
// Add to existing AuthContextValue interface
interface AuthContextValue {
  // Existing methods remain unchanged...
  
  // NEW: Profile management methods
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  syncGoogleProfilePicture: () => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
  connectGoogleAccount: (token: string) => Promise<void>;
  disconnectGoogleAccount: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}
```

**REQUIREMENTS**:
- Maintain all existing authentication functionality
- Add profile methods with proper error handling
- Update user data in real-time after profile changes
- Sync profile picture updates across all components
- Handle profile-related errors gracefully

**VALIDATION RULES**:
- Backward compatibility: Existing auth functionality must work unchanged
- Real-time updates: Profile changes immediately update user state
- Error handling: All profile operations handle errors properly

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F5: AuthContext extended with profile methods"
2. Test existing auth functionality still works
3. Git commit: `git add . && git commit -m "feat(user-profiles): extend AuthContext with profile methods (F5)"`

---

## Frontend Task F6: File Upload & Image Handling

### Pre-Execution Checklist
```yaml
critical_validations:
  - image_security_validation: "Client-side file validation patterns"
  - performance_optimization: "Image processing and optimization"
  - mobile_upload_support: "Touch-friendly upload interface"
```

### Execution Instructions
**CONTEXT**: You are implementing secure file upload with image optimization.

**YOUR TASK**: Create comprehensive image upload functionality

**FILES TO CREATE**:
- `frontend/src/components/profile/ImageUploader.tsx` - Drag-and-drop upload
- `frontend/src/components/profile/ImageCropper.tsx` - Image cropping
- `frontend/src/utils/imageOptimization.ts` - Client-side processing
- `frontend/src/hooks/useImageUpload.ts` - Upload state management

**REQUIREMENTS**:
```typescript
// Image validation (client-side)
const validateImage = (file: File): ValidationResult => {
  // Size check (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File too large (max 5MB)' };
  }
  
  // Type check
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file format' };
  }
  
  return { valid: true };
};

// Drag and drop interface
const ImageUploader = () => {
  return (
    <div 
      className="border-2 border-dashed border-airvik-blue rounded-radius-lg p-space-8 text-center
                 hover:border-airvik-purple hover:bg-airvik-blue-light/10
                 dark:border-airvik-cyan dark:hover:bg-airvik-cyan/10"
    >
      {/* Upload interface */}
    </div>
  );
};
```

**VALIDATION RULES**:
- File validation: Client-side validation before upload
- Image optimization: Reduce file size while maintaining quality
- Upload progress: Show progress indicators during upload
- Error handling: Handle upload failures gracefully
- Mobile support: Touch-friendly upload on mobile devices

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F6: Image upload with optimization"
2. Test file upload on desktop and mobile
3. Git commit: `git add . && git commit -m "feat(user-profiles): add image upload and optimization (F6)"`

---

## Frontend Task F7: Google Account Integration

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "frontend/src/components/auth/GoogleOAuthButton.tsx"
  - "frontend/src/services/userLogin.service.ts"

validation_rules:
  - reuse_existing_google_patterns: true
  - handle_connection_edge_cases: true
  - provide_clear_user_feedback: true
```

### Execution Instructions
**CONTEXT**: You are implementing Google account integration for profiles.

**MANDATORY PATTERN REUSE**: Copy patterns from existing Google OAuth components

**YOUR TASK**: Create Google account connection and management components

**FILES TO CREATE**:
- `frontend/src/components/profile/GoogleConnect.tsx` - Account connection
- `frontend/src/components/profile/GoogleSync.tsx` - Data sync controls
- `frontend/src/components/profile/AccountStatus.tsx` - Connection status

**REQUIREMENTS**:
```typescript
// Reuse existing Google OAuth patterns
import { GoogleOAuthButton } from '../auth/GoogleOAuthButton';

const GoogleConnect = () => {
  const handleGoogleConnect = async (token: string) => {
    try {
      await UserProfileService.connectGoogleAccount(token);
      // Update UI and show success
    } catch (error) {
      // Handle connection errors
    }
  };

  return (
    <div className="card p-space-6">
      <h5 className="text-h5 mb-space-4">Connect Google Account</h5>
      <GoogleOAuthButton
        onSuccess={handleGoogleConnect}
        onError={handleConnectionError}
        className="btn-secondary"
      />
    </div>
  );
};
```

**VALIDATION RULES**:
- Google OAuth flow: Test account connection process
- Data sync: Verify Google profile data syncs correctly
- Error handling: Test connection failures and edge cases
- Disconnection safety: Warn users about losing access

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F7: Google account integration"
2. Test Google connection and disconnection flows
3. Git commit: `git add . && git commit -m "feat(user-profiles): add Google account integration (F7)"`

---

## Frontend Task F8: Error Handling & Validation

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-profiles/PROBLEMS-LOG.md"
  - "frontend/src/components/auth/RegistrationForm.tsx"

validation_rules:
  - comprehensive_error_boundaries: true
  - real_time_validation: true
  - accessibility_compliance: true
```

### Execution Instructions
**CONTEXT**: You are implementing comprehensive error handling and validation.

**YOUR TASK**: Create robust error boundaries and validation system

**FILES TO CREATE**:
- `frontend/src/components/profile/ProfileErrorBoundary.tsx` - Error boundary
- `frontend/src/hooks/useProfileValidation.ts` - Real-time validation
- `frontend/src/utils/profileValidation.ts` - Validation utilities
- `frontend/src/components/profile/ValidationMessage.tsx` - Error display

**REQUIREMENTS**:
```typescript
// Error boundary for profile pages
class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Profile Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-airvik-white">
          <div className="card p-space-8 text-center">
            <h3 className="text-h3 text-error mb-space-4">Something went wrong</h3>
            <p className="text-body mb-space-6">We're sorry, there was an error loading your profile.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Real-time validation hook
const useProfileValidation = (profileData) => {
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const validationErrors = validateProfileData(profileData);
    setErrors(validationErrors);
  }, [profileData]);
  
  return { errors, isValid: Object.keys(errors).length === 0 };
};
```

**VALIDATION RULES**:
- Error boundary test: Trigger errors and verify graceful handling
- Real-time validation: Verify immediate feedback on form changes
- Network error recovery: Test retry mechanisms for network failures
- Accessibility: Error messages are announced by screen readers

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F8: Comprehensive error handling and validation"
2. Test all error scenarios and recovery mechanisms
3. Git commit: `git add . && git commit -m "feat(user-profiles): add error handling and validation (F8)"`

---

## Integration Task: Frontend-Backend Connection

### Pre-Execution Checklist
```yaml
integration_validation:
  - backend_complete: "All B1-B7 tasks marked complete in CURRENT-STATE.md"
  - frontend_components_ready: "F1-F8 tasks completed"
  - auth_patterns_extracted: "Token storage patterns documented"
  - api_endpoints_tested: "Backend endpoints responding correctly"
```

### Execution Instructions
**CONTEXT**: Final integration of user-profiles frontend with backend.

**CRITICAL PATTERNS TO FOLLOW**:
```typescript
// Token retrieval (EXACT pattern)
const accessToken = sessionStorage.getItem('airvik_access_token');
const refreshToken = localStorage.getItem('airvik_refresh_token');

// API calls (EXACT pattern)
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

const response = await fetch(`http://localhost:5000/api/v1/user/profile`, {
  method: 'PUT',
  headers,
  body: JSON.stringify(profileData)
});

// Type-safe response handling (MANDATORY)
if (isSuccessResponse(response)) {
  console.log(response.data); // ✅ Type-safe
} else {
  console.error(response.error); // ✅ Type-safe
}
```

**FINAL VALIDATION**:
- **End-to-end user flow testing**: Complete profile management flow
- **All error scenarios handled**: Network failures, validation errors, file upload errors
- **All loading states implemented**: Profile loading, image upload progress, save operations
- **Brand compliance verified**: All components use design tokens correctly
- **Dark mode working**: All profile components support dark theme
- **Mobile responsive**: All profile pages work on mobile devices
- **File upload tested**: Profile picture upload, validation, and optimization
- **Google integration tested**: Account connection, data sync, disconnection
- **Privacy settings tested**: All privacy controls work correctly

**ON COMPLETION**:
1. Update `CURRENT-STATE.md`: Mark feature as "✅ COMPLETE - All tasks (B1-B7, F1-F8) finished"
2. Update `docs/features/project-progress.md`: Add User Profiles as completed feature
3. Final commit: `git commit -m "feat(user-profiles): complete implementation - all backend and frontend tasks"`
4. Push feature branch: `git push origin feature/user-profiles`
5. Feature ready for use!

**POST-COMPLETION VERIFICATION**:
- [ ] All profile CRUD operations work correctly
- [ ] Profile picture upload and Google sync functional
- [ ] Privacy settings control data visibility
- [ ] Google account connection/disconnection works safely
- [ ] All error cases handled gracefully
- [ ] Mobile interface is touch-friendly
- [ ] Dark mode support is complete
- [ ] Performance is acceptable (< 2 second response times)
- [ ] Security measures in place (file validation, rate limiting)
- [ ] Accessibility standards met (keyboard navigation, screen reader support)
