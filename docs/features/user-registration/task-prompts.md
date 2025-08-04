# Task Prompts for User Registration

## HOW TO USE
1. Copy each prompt exactly as written
2. Replace [feature-name] with "user-registration"
3. Paste to AI and let it execute
4. AI will automatically update all state files

## CRITICAL RULE REMINDERS FOR AI

### 🚨 ZERO VIOLATIONS ALLOWED
1. **NEVER import from shared/contracts/** - Create local types only
2. **ALWAYS use type guards** for union type property access
3. **NEVER use function dependencies in useEffect** - Use useRef instead
4. **ONLY use brand tokens** - No hardcoded colors, spacing, typography
5. **CREATE ALL user flow pages** - Not just main feature page
6. **FOLLOW JWT patterns EXACTLY** - sessionStorage for access, localStorage for refresh

---

## Backend Task B1: Email Verification Model & Token Service

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-registration/FEATURE-ANALYSIS.md"
  - "docs/features/user-registration/FEATURE-SPEC.md"
  - "docs/features/user-registration/API-CONTRACT.md"
  - "docs/features/user-registration/CURRENT-STATE.md"
  - "docs/features/project-progress.md"

validation_rules:
  - confirm_no_contract_imports: true
  - follow_existing_patterns: true
  - match_api_contract_exactly: true
```

### Execution Instructions
**CONTEXT**: You are implementing user registration backend - Email Verification Model & Token Service.

**MANDATORY FIRST ACTIONS**:
1. Read ALL documentation files listed above
2. Analyze existing Prisma schema in `backend/prisma/schema.prisma`
3. Confirm User model structure and add EmailVerificationToken model
4. Follow existing database patterns

**YOUR TASK**: Create Email Verification Token model and service

**FILES TO CREATE**:
1. Add EmailVerificationToken model to `backend/prisma/schema.prisma`
2. Create `backend/src/services/emailVerificationToken.service.ts`
3. Create database migration

**REQUIREMENTS**:
- EmailVerificationToken model with: id, userId, token, email, expiresAt, usedAt, createdAt
- Crypto-secure token generation (32 bytes hex)
- Token validation service with expiry checking
- User relationship in Prisma schema
- 24-hour token expiry
- One active token per user email

**VALIDATION RULES**:
- Prisma validation: `npx prisma validate`
- TypeScript compilation: `npx tsc --noEmit`
- Database push: `npx prisma db push`
- Service unit tests

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B1: Email verification model & token service created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add email verification model and token service"`

**ON ERROR**:
1. Log exact error to `PROBLEMS-LOG.md`
2. Apply known error patterns from log
3. Retry up to 3 times

---

## Backend Task B2: User Registration Service

### Pre-Execution Checklist
```yaml
dependency_check:
  - backend_b1_complete: true
  - email_verification_model_exists: true
  - prisma_schema_updated: true
```

### Execution Instructions
**CONTEXT**: You are implementing user registration service with validation and password hashing.

**MANDATORY FIRST ACTIONS**:
1. Verify B1 is complete in CURRENT-STATE.md
2. Read existing User model in Prisma schema
3. Check bcryptjs package availability

**YOUR TASK**: Create comprehensive user registration service

**FILE TO CREATE**: `backend/src/services/userRegistration.service.ts`

**REQUIREMENTS**:
- Email uniqueness validation
- Password hashing with bcryptjs (12 salt rounds)
- Input validation (email format, password strength, phone format)
- User creation with proper error handling
- Integration with email verification token service
- Return user data without password field

**BUSINESS RULES**:
- Email must be unique (case-insensitive)
- Password: 8+ chars, mixed case, number, special char
- Full name: 2-100 chars, letters/spaces/hyphens only
- Mobile: Optional, international format if provided
- Terms acceptance required

**VALIDATION RULES**:
- TypeScript compilation: `npx tsc --noEmit`
- Unit tests for all validation rules
- Password hashing test
- Duplicate email handling test

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B2: User registration service created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add user registration service with validation"`

---

## Backend Task B3: Google OAuth Service

### Pre-Execution Checklist
```yaml
dependency_check:
  - backend_b2_complete: true
  - google_oauth_env_configured: true
```

### Execution Instructions
**CONTEXT**: You are implementing Google OAuth service for social registration.

**YOUR TASK**: Create Google OAuth token validation and user creation service

**FILE TO CREATE**: `backend/src/services/googleOAuth.service.ts`

**REQUIREMENTS**:
- Google OAuth token validation using Google APIs
- Profile data extraction (email, name, picture, id)
- Social account linking to existing users
- Auto email verification for Google accounts
- Profile picture URL validation and storage
- Handle edge cases (invalid tokens, API failures)

**BUSINESS RULES**:
- Google email is automatically verified
- Profile picture from Google is saved
- If email exists, link Google ID to existing user
- If new user, create with Google profile data
- Skip password requirement for Google users

**VALIDATION RULES**:
- Google token validation test
- Profile data extraction test
- Account linking logic test
- Error handling for invalid tokens

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B3: Google OAuth service created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add Google OAuth service"`

---

## Backend Task B4: Email Service Integration

### Pre-Execution Checklist
```yaml
dependency_check:
  - email_routes_exist: true
  - brevo_smtp_configured: true
  - nodemailer_installed: true
```

### Execution Instructions
**CONTEXT**: You are creating email templates and services for user registration.

**YOUR TASK**: Create email verification and welcome email services

**FILES TO CREATE**:
1. `backend/src/services/email/emailTemplates.service.ts`
2. `backend/src/services/email/registrationEmail.service.ts`

**REQUIREMENTS**:
- Email verification template with token link
- Welcome email template with user personalization
- HTML and text versions for both templates
- Email sending methods with error handling
- Integration with existing email service
- Proper error logging and retry logic

**EMAIL TEMPLATES NEEDED**:
1. **Email Verification**: Subject, personalized content, verification link, expiry notice
2. **Welcome Email**: Subject, welcome message, getting started guide, contact info

**VALIDATION RULES**:
- Email sending test (use test email)
- Template rendering test
- Error handling test for SMTP failures
- HTML template validation

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B4: Email service integration completed"
2. Git commit: `git add . && git commit -m "feat(user-registration): add email templates and registration email service"`

---

## Backend Task B5: Authentication Controller

### Pre-Execution Checklist
```yaml
dependency_check:
  - backend_b1_b2_b3_b4_complete: true
  - all_services_created: true
```

### Execution Instructions
**CONTEXT**: You are creating authentication controller endpoints for user registration.

**YOUR TASK**: Create all authentication endpoints according to API contract

**FILE TO CREATE**: `backend/src/controllers/auth.controller.ts`

**ENDPOINTS TO IMPLEMENT**:
1. `POST /api/v1/auth/register` - Email/password registration
2. `POST /api/v1/auth/google` - Google OAuth registration
3. `POST /api/v1/auth/verify-email` - Email verification
4. `POST /api/v1/auth/resend-verification` - Resend verification
5. `GET /api/v1/auth/check-email/:email` - Email availability check

**REQUIREMENTS**:
- Use existing response utility patterns
- Implement express-validator input validation
- Proper error handling with HTTP status codes
- Rate limiting on registration endpoints
- Follow exact API contract response format
- Integration with all created services

**VALIDATION RULES**:
- All endpoints respond correctly
- Input validation works for all fields
- Error responses match API contract
- Rate limiting enforced
- Postman tests pass

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B5: Authentication controller created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add authentication controller with all endpoints"`

---

## Backend Task B6: JWT Token Service

### Pre-Execution Checklist
```yaml
dependency_check:
  - jwt_package_installed: true
  - jwt_secrets_configured: true
```

### Execution Instructions
**CONTEXT**: You are creating JWT token generation and validation services.

**YOUR TASK**: Create comprehensive JWT token management

**FILES TO CREATE**:
1. `backend/src/services/jwt.service.ts`
2. `backend/src/middleware/auth.middleware.ts`

**REQUIREMENTS**:
- Access token generation (15 minutes expiry)
- Refresh token generation (7 days expiry)
- Token validation middleware
- Token refresh endpoint logic
- Secure token signing with different secrets
- Token blacklisting capability
- User payload extraction from tokens

**TOKEN PATTERNS (CRITICAL)**:
- Access token: Short-lived, contains user ID and role
- Refresh token: Long-lived, for access token renewal
- Proper JWT claims (iss, aud, exp, iat, sub)
- Secure signing algorithms (HS256)

**VALIDATION RULES**:
- Token generation test
- Token validation test
- Middleware protection test
- Token expiry handling test
- Refresh token flow test

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B6: JWT token service created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add JWT token service and auth middleware"`

---

## Backend Task B7: API Integration & Testing

### Pre-Execution Checklist
```yaml
dependency_check:
  - all_backend_tasks_b1_b6_complete: true
  - controllers_and_services_created: true
```

### Execution Instructions
**CONTEXT**: You are completing backend integration and creating comprehensive tests.

**YOUR TASK**: Connect all services, create routes, and implement testing

**FILES TO CREATE**:
1. `backend/src/routes/auth.routes.ts`
2. `backend/tests/auth.test.ts`
3. `postman/user-registration.json`

**REQUIREMENTS**:
- Connect auth controller to Express routes
- Add auth routes to main server
- Create comprehensive API tests
- Add rate limiting middleware
- Create Postman collection for all endpoints
- End-to-end registration flow testing

**INTEGRATION TASKS**:
- All endpoints accessible via API prefix
- Middleware properly applied
- Error handling consistent
- CORS and security headers working
- Database transactions where needed

**VALIDATION RULES**:
- All API endpoints working: `newman run postman/user-registration.json`
- Backend tests passing: `npm run test`
- Integration tests passing
- Rate limiting working

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B7: API integration and testing completed"
2. Update `CURRENT-STATE.md`: Mark "✅ Backend: All tasks completed"
3. Git commit: `git add . && git commit -m "feat(user-registration): complete backend API integration and testing"`

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
**CONTEXT**: You are creating TypeScript types for user registration frontend.

**CRITICAL RULE**: NEVER import from shared/contracts/. Create LOCAL interfaces.

**MANDATORY FIRST ACTIONS**:
1. Read API-CONTRACT.md for type structure
2. Scan codebase for any existing contract imports
3. If found, STOP and fix before proceeding

**YOUR TASK**: Create local TypeScript interfaces matching API contract

**FILE TO CREATE**: `frontend/src/types/userRegistration.types.ts`

**REQUIREMENTS**:
```typescript
// ✅ CORRECT: Local interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

// ❌ FORBIDDEN: Contract imports
// import { ApiResponse } from '../../../shared/contracts/api-response.contract';
```

**TYPE GUARD PATTERNS REQUIRED**:
```typescript
// MANDATORY: Add type guards for safe property access
const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response && response.success === true;
};

const isErrorResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } => {
  return response && response.success === false;
};
```

**VALIDATION RULES**:
- Contract import scan: `grep -r 'shared/contracts' frontend/src/types/userRegistration.types.ts`
- Must return empty (no matches)
- TypeScript compilation: `npx tsc --noEmit`
- All API contract types defined locally

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F1: Local types created (no contract imports)"
2. Git commit: `git add . && git commit -m "feat(user-registration): add local TypeScript types"`

---

## Frontend Task F2: Registration API Service

### Pre-Execution Checklist
```yaml
dependency_check:
  - frontend_f1_complete: true
  - local_types_created: true
  - no_contract_imports: true
```

### Execution Instructions
**CONTEXT**: You are creating API service for user registration with proper authentication.

**YOUR TASK**: Create comprehensive API service for all registration endpoints

**FILE TO CREATE**: `frontend/src/services/userRegistration.service.ts`

**REQUIREMENTS**:
- All API endpoints from contract
- Proper error handling with type guards
- Token storage following project patterns
- Request/response transformation
- Axios interceptors for auth headers
- Retry logic for failed requests

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

const response = await fetch(`http://localhost:5000/api/v1/auth/register`, {
  method: 'POST',
  headers,
  body: JSON.stringify(data)
});

// Type-safe response handling (MANDATORY)
if (isSuccessResponse(response)) {
  console.log(response.data); // ✅ Type-safe
} else {
  console.error(response.error); // ✅ Type-safe
}
```

**VALIDATION RULES**:
- No contract imports: `grep -r 'shared/contracts' frontend/src/services/userRegistration.service.ts`
- TypeScript compilation: `npx tsc --noEmit`
- API service tests passing
- Type guards used for all API responses

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F2: Registration API service created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add registration API service"`

---

## Frontend Task F3: Registration Form Components

### Pre-Execution Checklist
```yaml
dependency_check:
  - frontend_f1_f2_complete: true
  - api_service_created: true
  - brand_guidelines_read: true
```

### Execution Instructions
**CONTEXT**: You are creating brand-compliant registration form components.

**YOUR TASK**: Create main registration form with all required components

**FILES TO CREATE**:
1. `frontend/src/components/auth/RegistrationForm.tsx`
2. `frontend/src/components/auth/GoogleOAuthButton.tsx`
3. `frontend/src/components/auth/PasswordStrengthIndicator.tsx`

**BRAND COMPLIANCE REQUIREMENTS**:
```typescript
// ✅ CORRECT: Brand tokens
className="bg-airvik-blue hover:bg-airvik-purple text-white"
className="space-y-space-4 p-space-6"
className="text-h4 text-airvik-black"

// ❌ FORBIDDEN: Hardcoded values
className="bg-blue-600 hover:bg-purple-600 text-white"
className="space-y-4 p-6"
className="text-2xl text-black"
```

**REQUIREMENTS**:
- React Hook Form with Zod validation
- Real-time validation feedback
- Password strength indicator
- Google OAuth integration
- Terms and conditions checkbox
- Loading states and disabled logic
- Error display with toast notifications
- Brand-compliant styling with design tokens

**VALIDATION RULES**:
- Brand compliance check: No hardcoded colors/spacing
- Component rendering tests
- Form validation tests
- TypeScript compilation: `npx tsc --noEmit`
- Accessibility validation

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F3: Registration form components created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add registration form components"`

---

## Frontend Task F4: Verification & Success Pages

### Pre-Execution Checklist
```yaml
dependency_check:
  - frontend_f3_complete: true
  - form_components_created: true
```

### Execution Instructions
**CONTEXT**: You are creating verification and success pages for complete user flows.

**YOUR TASK**: Create ALL user flow pages according to specification

**FILES TO CREATE**:
1. `frontend/src/app/auth/register/page.tsx` - Main registration page
2. `frontend/src/app/auth/verify-email/page.tsx` - Email verification pending
3. `frontend/src/app/auth/verify-email/success/page.tsx` - Verification success
4. `frontend/src/components/auth/AccountLinkingDialog.tsx` - Account linking

**REQUIREMENTS**:
- Complete user flow coverage (not just main page)
- Email verification pending with resend functionality
- Success page with auto-redirect
- Account linking confirmation dialog
- Brand-compliant design with proper spacing
- Mobile-responsive layouts
- Loading states and error handling

**PAGE SPECIFICATIONS**:
1. **Registration Page**: Form + benefits sidebar layout
2. **Verification Pending**: Email confirmation message + resend button
3. **Verification Success**: Success message + continue button + auto-redirect
4. **Account Linking**: Modal dialog with confirmation options

**VALIDATION RULES**:
- All pages accessible and rendering
- Navigation flows working
- Brand compliance verified
- Mobile responsive design
- TypeScript compilation passing

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F4: All user flow pages created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add all verification and success pages"`

---

## Frontend Task F5: Authentication Context & State

### Pre-Execution Checklist
```yaml
dependency_check:
  - frontend_f4_complete: true
  - all_pages_created: true
```

### Execution Instructions
**CONTEXT**: You are creating authentication context and state management.

**YOUR TASK**: Create comprehensive authentication state management

**FILES TO CREATE**:
1. `frontend/src/contexts/AuthContext.tsx`
2. `frontend/src/hooks/useAuth.tsx`
3. `frontend/src/utils/tokenStorage.ts`

**REQUIREMENTS**:
- React Context for authentication state
- User state management (logged in, user data, loading)
- Token storage utilities (sessionStorage/localStorage)
- Login/logout state handlers
- Authentication status checking
- Token refresh handling
- Automatic token cleanup on logout

**CRITICAL TOKEN PATTERNS**:
```typescript
// ✅ CORRECT: Token storage patterns
const storeTokens = (accessToken: string, refreshToken: string) => {
  sessionStorage.setItem('airvik_access_token', accessToken);
  localStorage.setItem('airvik_refresh_token', refreshToken);
};

const clearTokens = () => {
  sessionStorage.removeItem('airvik_access_token');
  localStorage.removeItem('airvik_refresh_token');
  localStorage.removeItem('airvik_user');
};
```

**VALIDATION RULES**:
- Context provider working
- State updates correctly
- Token storage patterns followed exactly
- Authentication persistence across page reloads
- Logout clears all authentication data

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F5: Authentication context and state created"
2. Git commit: `git add . && git commit -m "feat(user-registration): add authentication context and state management"`

---

## Frontend Task F6: Form Validation & UX

### Pre-Execution Checklist
```yaml
dependency_check:
  - frontend_f5_complete: true
  - auth_context_created: true
```

### Execution Instructions
**CONTEXT**: You are implementing comprehensive form validation and UX improvements.

**YOUR TASK**: Create robust validation and user experience features

**FILES TO CREATE**:
1. `frontend/src/schemas/userRegistration.schema.ts` - Zod validation schemas
2. `frontend/src/components/ui/Toast.tsx` - Notification component
3. `frontend/src/hooks/useFormValidation.ts` - Custom validation hook

**REQUIREMENTS**:
- Zod schemas for all form validation
- Real-time validation feedback
- Success/error toast notifications
- Loading states and button disable logic
- Form field error displays
- Password strength real-time feedback
- Email availability checking

**VALIDATION SCHEMAS NEEDED**:
```typescript
// Registration form validation
const registrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z.string().optional(),
  acceptedTerms: z.boolean().refine(val => val === true, "Terms must be accepted")
});
```

**VALIDATION RULES**:
- All form validation working
- Real-time feedback responsive
- Toast notifications displaying
- Loading states working correctly
- Error handling comprehensive

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F6: Form validation and UX completed"
2. Git commit: `git add . && git commit -m "feat(user-registration): add comprehensive form validation and UX"`

---

## Frontend Task F7: Google OAuth Integration

### Pre-Execution Checklist
```yaml
dependency_check:
  - frontend_f6_complete: true
  - nextauth_configured: true
  - google_client_id_set: true
```

### Execution Instructions
**CONTEXT**: You are integrating Google OAuth using NextAuth.js.

**YOUR TASK**: Complete Google OAuth authentication flow

**FILES TO CREATE**:
1. `frontend/src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
2. `frontend/src/components/auth/GoogleOAuthHandler.tsx` - OAuth flow handler
3. `frontend/src/hooks/useGoogleAuth.ts` - Google auth hook

**REQUIREMENTS**:
- NextAuth.js Google provider configuration
- OAuth callback handling
- Account linking flow implementation
- OAuth error handling and retry logic
- Integration with existing auth context
- Proper redirect handling after OAuth

**GOOGLE OAUTH CONFIGURATION**:
```typescript
// NextAuth Google provider setup
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'openid email profile'
    }
  }
})
```

**VALIDATION RULES**:
- Google OAuth flow working end-to-end
- Account linking working correctly
- Error handling for OAuth failures
- Proper integration with auth context
- No security vulnerabilities

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F7: Google OAuth integration completed"
2. Git commit: `git add . && git commit -m "feat(user-registration): add Google OAuth integration"`

---

## Frontend Task F8: Integration & Error Handling

### Pre-Execution Checklist
```yaml
dependency_check:
  - all_frontend_tasks_f1_f7_complete: true
  - backend_integration_ready: true
```

### Execution Instructions
**CONTEXT**: Final integration of user registration frontend with backend and comprehensive error handling.

**YOUR TASK**: Complete frontend-backend integration and error handling

**FILES TO CREATE**:
1. `frontend/src/components/ErrorBoundary.tsx` - Error boundary component
2. `frontend/src/utils/errorHandling.ts` - Error handling utilities
3. `frontend/tests/userRegistration.test.ts` - Component tests

**REQUIREMENTS**:
- Connect all frontend components to backend APIs
- Implement comprehensive error boundaries
- Add retry mechanisms for failed requests
- Create user feedback systems for all error scenarios
- Handle network failures gracefully
- Implement proper loading states throughout

**ERROR HANDLING PATTERNS**:
```typescript
// ✅ CORRECT: Comprehensive error handling
try {
  const response = await registrationService.register(userData);
  if (isSuccessResponse(response)) {
    // Handle success
    setUser(response.data.user);
    showToast('Registration successful!', 'success');
  } else {
    // Handle API error
    showToast(response.error, 'error');
  }
} catch (error) {
  // Handle network error
  showToast('Network error. Please try again.', 'error');
}
```

**FINAL VALIDATION**:
- End-to-end user registration flow working
- Google OAuth registration working
- Email verification flow working
- All error scenarios handled gracefully
- All loading states implemented
- Brand compliance verified
- Dark mode working
- Mobile responsive
- Accessibility standards met

**ON COMPLETION**:
1. Update `CURRENT-STATE.md`: Mark feature as "✅ COMPLETE"
2. Update `docs/features/project-progress.md`: Add completed feature
3. Final commit: `git commit -m "feat(user-registration): complete frontend integration and error handling"`
4. Push to branch: `git push origin feature/user-registration`
5. Feature ready for testing and use!

---

## 🎯 IMPLEMENTATION SEQUENCE

To implement this feature, copy and paste these prompts in order:

1. **Backend Tasks**: B1 → B2 → B3 → B4 → B5 → B6 → B7
2. **Frontend Tasks**: F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8

Each task will automatically update the CURRENT-STATE.md file and commit progress to Git.

**Final Result**: Complete user registration system with email/password and Google OAuth, email verification, account linking, and comprehensive error handling - all following established patterns and brand guidelines.