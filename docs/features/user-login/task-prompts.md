# Task Prompts for User Login & Session Management

## HOW TO USE
1. Copy each prompt exactly as written
2. Replace [feature-name] with "user-login"
3. Paste to AI and let it execute
4. AI will automatically update all state files

## CRITICAL RULE REMINDERS FOR AI

### 🚨 ZERO VIOLATIONS ALLOWED
1. **NEVER import from shared/contracts/** - Create local types only
2. **ALWAYS use type guards** for union type property access
3. **NEVER use function dependencies in useEffect** - Use useRef instead
4. **ONLY use brand tokens** - No hardcoded colors, spacing, typography
5. **CREATE ALL user flow pages** - Not just main feature page
6. **FOLLOW token storage patterns** - sessionStorage for access, localStorage for refresh
7. **VALIDATE Google tokens server-side** - Never trust client-side token validation
8. **IMPLEMENT proper rate limiting** - Both IP and user-based limiting

---

## Backend Task B1: Authentication Service Layer

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/user-login/FEATURE-ANALYSIS.md"
  - "docs/features/user-login/FEATURE-SPEC.md"
  - "docs/features/user-login/API-CONTRACT.md"
  - "docs/features/user-login/CURRENT-STATE.md"
  - "docs/features/project-progress.md"
  - "backend/src/services/jwt.service.ts"
  - "backend/src/services/googleOAuth.service.ts"

validation_rules:
  - confirm_no_contract_imports: true
  - follow_existing_jwt_patterns: true
  - match_api_contract_exactly: true
  - integrate_with_existing_services: true
```

### Execution Instructions
**CONTEXT**: You are implementing user-login backend authentication service layer.

**MANDATORY FIRST ACTIONS**:
1. Read ALL documentation files listed above
2. Analyze existing JWT and Google OAuth services from user registration
3. Confirm feature complexity level (Medium) and adapt approach
4. Verify integration requirements with existing auth infrastructure

**YOUR TASK**: Create authentication service for email/password and Google OAuth login

**FILE TO CREATE**: `backend/src/services/auth/authLogin.service.ts`

**REQUIREMENTS**:
- Extend existing JWT service patterns for login authentication
- Integrate with existing Google OAuth service for login flow
- Implement email/password authentication with bcrypt validation
- Add account merging logic for Google + email accounts
- Include login attempt tracking and rate limiting
- Update lastLoginAt timestamp on successful login
- Support device fingerprinting and session creation
- Handle remember me functionality with extended token expiry

**INTEGRATION RULES**:
- Use existing `JwtService.generateTokenPair()` for token creation
- Use existing `GoogleOAuthService.verifyGoogleToken()` for OAuth validation
- Use existing `UserRegistrationService` patterns for user lookup
- Use existing bcrypt patterns for password validation
- Use existing Prisma client patterns for database operations

**VALIDATION RULES**:
- TypeScript compilation: `npx tsc --noEmit`
- ESLint check: `npm run lint`
- Service unit tests: Create comprehensive test coverage
- Integration test: Email/password login flow
- Integration test: Google OAuth login flow

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B1: Authentication service layer created"
2. Update `progress.md`: Mark B1 as completed
3. Git commit: `git add . && git commit -m "feat(user-login): add authentication service layer"`
4. Git push: `git push origin feature/user-login`

**ON ERROR**:
1. Log exact error to `PROBLEMS-LOG.md`
2. Apply known error patterns from log
3. Retry up to 3 times
4. If still failing, request manual assistance

---

## Backend Task B2: Session Management Service

### Pre-Execution Checklist
```yaml
prerequisites:
  - backend_b1_completed: true
  - jwt_service_available: true
  - session_model_ready: true

validation_rules:
  - multi_device_support: true
  - session_cleanup_logic: true
  - device_fingerprinting: true
```

### Execution Instructions
**CONTEXT**: You are implementing session management service for multi-device support.

**MANDATORY FIRST ACTIONS**:
1. Verify Backend B1 is completed successfully
2. Review existing Session model from user registration
3. Analyze existing JWT service session methods
4. Confirm device fingerprinting requirements

**YOUR TASK**: Create comprehensive session management service

**FILE TO CREATE**: `backend/src/services/auth/sessionManagement.service.ts`

**REQUIREMENTS**:
- Active session tracking per user across devices
- Device information storage and fingerprinting
- Session invalidation (single device and all devices)
- Session cleanup and maintenance (expired sessions)
- New device detection and security alerts
- Remember me functionality with extended refresh token expiry
- Session limits enforcement (max 10 per user)

**INTEGRATION RULES**:
- Extend existing `JwtService` session methods
- Use existing Session Prisma model
- Integrate with existing email service for security alerts
- Follow existing database operation patterns

**VALIDATION RULES**:
- Session creation and tracking works correctly
- Multi-device session management functional
- Session cleanup removes expired sessions
- Device fingerprinting accurately detects new devices
- Security alerts sent for new device logins

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B2: Session management service created"
2. Update task progress
3. Git commit and push changes

---

## Backend Task B3: Login Controller

### Pre-Execution Checklist
```yaml
prerequisites:
  - backend_b1_completed: true
  - backend_b2_completed: true
  - auth_middleware_available: true

api_contract_compliance:
  - exact_endpoint_matching: true
  - response_format_compliance: true
  - error_code_consistency: true
```

### Execution Instructions
**CONTEXT**: You are implementing login controller for HTTP request handling.

**YOUR TASK**: Create login controller with all required endpoints

**FILE TO CREATE**: `backend/src/controllers/auth/login.controller.ts`

**ENDPOINTS TO IMPLEMENT**:
- POST `/api/v1/auth/login` - email/password authentication
- POST `/api/v1/auth/google-login` - Google OAuth authentication
- POST `/api/v1/auth/refresh` - token refresh (extend existing)
- POST `/api/v1/auth/logout` - single device logout
- DELETE `/api/v1/auth/sessions` - logout from all devices
- GET `/api/v1/auth/sessions` - list active sessions

**REQUIREMENTS**:
- Use existing `ResponseUtil` for standardized responses
- Implement comprehensive input validation
- Follow exact API contract specifications
- Include rate limiting integration points
- Handle all error scenarios with proper error codes
- Add request logging and security monitoring hooks

**VALIDATION RULES**:
- All endpoints return correct response format
- Error codes match API contract exactly
- Rate limiting integration points configured
- Input validation prevents security vulnerabilities
- Comprehensive error handling for all scenarios

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B3: Login controller created"
2. Update task progress
3. Git commit and push changes

---

## Backend Task B4: Security Enhancement Services

### Pre-Execution Checklist
```yaml
security_requirements:
  - rate_limiting_strategy: "5 attempts per 15 minutes per IP"
  - account_lockout_logic: true
  - security_monitoring: true
  - new_device_alerts: true
```

### Execution Instructions
**CONTEXT**: You are implementing security enhancements for login protection.

**YOUR TASK**: Create security monitoring and protection services

**FILE TO CREATE**: `backend/src/services/auth/securityMonitoring.service.ts`

**REQUIREMENTS**:
- Rate limiting for login attempts (5 per 15 min per IP)
- Failed login attempt tracking and account lockout
- New device detection and email notifications
- Suspicious activity monitoring and logging
- Security event auditing
- Device fingerprinting algorithms

**VALIDATION RULES**:
- Rate limiting blocks excessive login attempts
- Account lockout activates after failed attempts
- New device detection triggers email alerts
- Security events logged properly
- Suspicious activity monitoring functional

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B4: Security enhancement services created"
2. Update task progress
3. Git commit and push changes

---

## Backend Task B5: Route Configuration

### Execution Instructions
**CONTEXT**: You are configuring API routes for login functionality.

**YOUR TASK**: Configure login routes in existing auth router

**FILE TO UPDATE**: `backend/src/routes/auth.routes.ts`

**REQUIREMENTS**:
- Add all login routes to existing auth router
- Apply rate limiting middleware to login endpoints
- Configure authentication middleware for protected routes
- Set up device tracking middleware
- Configure security monitoring middleware

**VALIDATION RULES**:
- All login endpoints accessible at correct URLs
- Rate limiting applied to appropriate endpoints
- Auth middleware protects session management endpoints
- Route configuration matches API contract

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B5: Route configuration complete"
2. Update task progress
3. Git commit and push changes

---

## Backend Task B6: Password Reset Integration

### Execution Instructions
**CONTEXT**: You are implementing forgot password functionality.

**YOUR TASK**: Create password reset service and endpoints

**FILE TO CREATE**: `backend/src/services/auth/passwordReset.service.ts`

**REQUIREMENTS**:
- POST `/api/v1/auth/forgot-password` endpoint
- Secure password reset token generation
- Password reset email templates
- Token validation and expiry handling
- Rate limiting for password reset requests

**VALIDATION RULES**:
- Password reset emails sent correctly
- Reset tokens secure and expire properly
- Rate limiting prevents abuse
- Integration with existing email service works

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B6: Password reset integration complete"
2. Update task progress
3. Git commit and push changes

---

## Backend Task B7: Backend Integration & Testing

### Pre-Execution Checklist
```yaml
backend_completion:
  - all_b1_b6_completed: true
  - integration_ready: true
  - testing_framework_ready: true
```

### Execution Instructions
**CONTEXT**: You are completing backend integration with comprehensive testing.

**YOUR TASK**: Complete backend integration and create test suites

**FILES TO CREATE**:
- Test suites for all login services (Jest)
- Integration tests for login endpoints
- Postman collection for login API testing

**REQUIREMENTS**:
- Unit tests for all login services
- Integration tests for complete login flows
- Postman collection with all login endpoints
- Performance testing for authentication flows
- Security testing for rate limiting and token handling
- Error scenario testing

**VALIDATION RULES**:
- All tests pass with 90%+ coverage
- Postman collection tests all endpoints successfully
- Performance targets met (< 2 second login)
- Security vulnerabilities identified and fixed

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Backend B7: Backend integration & testing complete"
2. Update task progress
3. Git commit and push changes

---

## Frontend Task F1: Login Types & Interfaces (CRITICAL CONTRACT RULE)

### Pre-Execution Checklist
```yaml
critical_validations:
  - scan_for_contract_imports: "grep -r 'shared/contracts' frontend/src/"
  - must_be_empty: true
  - block_execution_if_found: true
```

### Execution Instructions
**CONTEXT**: You are creating TypeScript types for user-login frontend.

**CRITICAL RULE**: NEVER import from shared/contracts/. Create LOCAL interfaces.

**MANDATORY FIRST ACTIONS**:
1. Read API-CONTRACT.md for type structure
2. Scan codebase for any existing contract imports
3. If found, STOP and fix before proceeding

**YOUR TASK**: Create local TypeScript interfaces matching API contract

**FILE TO CREATE**: `frontend/src/types/userLogin.types.ts`

**REQUIREMENTS**:
```typescript
// ✅ CORRECT: Local interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
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
- Contract import scan: `grep -r 'shared/contracts' frontend/src/types/userLogin.types.ts`
- Must return empty (no matches)
- TypeScript compilation: `npx tsc --noEmit`

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F1: Local login types created (no contract imports)"
2. Mark progress
3. Git commit and push

---

## Frontend Task F2: Login API Service

### Pre-Execution Checklist
```yaml
token_storage_validation:
  - access_token_location: "sessionStorage"
  - refresh_token_location: "localStorage"
  - user_data_location: "localStorage"
```

### Execution Instructions
**CONTEXT**: You are creating login API service for frontend.

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

// Type-safe response handling (MANDATORY)
if (isSuccessResponse(response)) {
  console.log(response.data); // ✅ Type-safe
} else {
  console.error(response.error); // ✅ Type-safe
}
```

**YOUR TASK**: Create login API service extending existing patterns

**FILE TO CREATE**: `frontend/src/services/userLogin.service.ts`

**REQUIREMENTS**:
- Email/password login API calls
- Google OAuth login integration
- Token refresh with automatic retry
- Session management API calls
- Logout functionality (single and all devices)
- Device fingerprinting
- Auto token refresh on API failures

**VALIDATION RULES**:
- Token storage patterns correct
- Type guards used for all API responses
- Auto token refresh works seamlessly
- Error handling comprehensive

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F2: Login API service created"
2. Mark progress
3. Git commit and push

---

## Frontend Task F3: Authentication Context & State

### Execution Instructions
**CONTEXT**: You are creating authentication context and state management.

**YOUR TASK**: Create React context and Redux integration for login state

**FILES TO CREATE**:
- `frontend/src/context/AuthContext.tsx`
- Update existing auth slice if present

**REQUIREMENTS**:
- Authentication context provider
- Login state management (loading, error, user data)
- Session state management
- Auto token refresh integration
- Login/logout action dispatchers
- Authentication persistence across page reloads

**VALIDATION RULES**:
- Context provides all auth state correctly
- State updates work seamlessly
- Auto token refresh integrated
- Persistence works across page reloads

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F3: Authentication context & state created"
2. Mark progress
3. Git commit and push

---

## Frontend Task F4: Login Form Components

### Pre-Execution Checklist
```yaml
brand_compliance:
  - use_only_brand_tokens: true
  - no_hardcoded_colors: true
  - no_hardcoded_spacing: true
  - interactive_states_required: true
```

### Execution Instructions
**CONTEXT**: You are creating brand-compliant login form components.

**CRITICAL BRAND RULES**:
```typescript
// ✅ CORRECT: Brand tokens only
<button className="bg-airvik-blue text-airvik-white px-space-4 py-space-2 text-button hover:bg-airvik-blue-dark">
  Login
</button>

// ❌ FORBIDDEN: Hardcoded styles
<button className="bg-blue-600 text-white px-4 py-2 text-lg">
  Login
</button>
```

**YOUR TASK**: Create login form with complete brand compliance

**FILE TO CREATE**: `frontend/src/components/auth/LoginForm.tsx`

**REQUIREMENTS**:
- Email and password input fields with validation
- Remember me checkbox functionality
- Real-time form validation and error display
- Loading states during authentication
- Error handling and user feedback
- Responsive design for all breakpoints
- Dark mode support

**VALIDATION RULES**:
- Brand token scan: No hardcoded colors/spacing found
- Interactive states work (hover, focus, active, disabled)
- Dark mode support functional
- Responsive design works on all breakpoints

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F4: Login form components created"
2. Mark progress
3. Git commit and push

---

## Frontend Task F5: Google OAuth Integration

### Execution Instructions
**CONTEXT**: You are extending Google OAuth for login flow.

**YOUR TASK**: Extend existing Google OAuth component for login

**FILE TO UPDATE**: `frontend/src/components/auth/GoogleOAuthButton.tsx`

**REQUIREMENTS**:
- Extend existing Google OAuth for login flow
- Account linking confirmation dialog
- Google OAuth error handling
- Loading states during OAuth process
- Brand-compliant Google sign-in button styling

**VALIDATION RULES**:
- Google OAuth login flow works end-to-end
- Account linking prompts correctly
- Error handling comprehensive
- Brand compliance maintained

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F5: Google OAuth integration extended"
2. Mark progress
3. Git commit and push

---

## Frontend Task F6: Session Management Components

### Execution Instructions
**CONTEXT**: You are creating session management UI components.

**YOUR TASK**: Create session management interface

**FILE TO CREATE**: `frontend/src/components/auth/SessionManager.tsx`

**REQUIREMENTS**:
- Active sessions list display
- Device information presentation
- Individual session logout buttons
- "Logout from all devices" functionality
- New device security alerts
- Session activity timestamps

**VALIDATION RULES**:
- Session list displays correctly
- Logout functionality works for individual and all sessions
- Device information shown clearly
- Security alerts display appropriately

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F6: Session management components created"
2. Mark progress
3. Git commit and push

---

## Frontend Task F7: Login Pages & Navigation

### Execution Instructions
**CONTEXT**: You are creating complete login pages and routing.

**YOUR TASK**: Create all login-related pages

**FILES TO CREATE**:
- `frontend/src/app/auth/login/page.tsx`
- `frontend/src/app/account/sessions/page.tsx`
- Additional pages as needed

**REQUIREMENTS**:
- Main login page with complete layout
- Session management page
- Account linking page for Google OAuth
- Security alert page for new device notifications
- Protected route configuration
- Post-login redirect handling

**VALIDATION RULES**:
- All pages render correctly
- Navigation works seamlessly
- Protected routes configured properly
- Redirects work after login

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Add "✅ Frontend F7: Login pages & navigation created"
2. Mark progress
3. Git commit and push

---

## Frontend Task F8: Frontend Integration & Error Handling

### Pre-Execution Checklist
```yaml
integration_validation:
  - backend_complete: "All B1-B7 tasks marked complete in CURRENT-STATE.md"
  - frontend_components_ready: "F1-F7 tasks completed"
  - auth_patterns_tested: "Token storage patterns validated"
```

### Execution Instructions
**CONTEXT**: Final integration of user-login frontend with backend.

**YOUR TASK**: Complete frontend integration with comprehensive error handling

**REQUIREMENTS**:
- Integration with backend login APIs
- End-to-end login flow testing
- Error boundary implementation
- Toast notification integration
- Loading state management
- Offline support and retry logic
- Cross-browser compatibility testing

**FINAL VALIDATION**:
- End-to-end user login flow working
- All error scenarios handled gracefully
- All loading states implemented
- Brand compliance verified across all components
- Dark mode working on all login screens
- Mobile responsive design functional
- Session management working across devices

**ON COMPLETION**:
1. Update `CURRENT-STATE.md`: Mark feature as "✅ COMPLETE"
2. Update `docs/features/project-progress.md`: Add completed user login feature
3. Final commit: `git commit -m "feat(user-login): complete implementation"`
4. Feature ready for use!

---

## 🎯 FINAL INTEGRATION PROMPT

### Complete User Login Feature Implementation

**CONTEXT**: You are implementing the complete User Login & Session Management feature for AirVikBook.

**MANDATORY PREPARATION**:
1. Read ALL documentation in `docs/features/user-login/`
2. Analyze existing authentication infrastructure from user registration
3. Confirm all integration points with existing codebase
4. Validate brand compliance requirements

**EXECUTION SEQUENCE**:
Execute tasks in order: B1 → B2 → B3 → B4 → B5 → B6 → B7 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8

**CRITICAL SUCCESS FACTORS**:
- ✅ Zero contract imports (local types only)
- ✅ Proper token storage patterns (sessionStorage/localStorage)
- ✅ Brand token compliance (no hardcoded styles)
- ✅ Type safety with guards (no direct .data access)
- ✅ React best practices (no function deps in useEffect)
- ✅ Security compliance (rate limiting, token validation)
- ✅ Multi-device session management
- ✅ Complete Google OAuth integration

**ON FEATURE COMPLETION**:
The user login feature will provide secure authentication with email/password and Google OAuth, comprehensive session management across devices, and complete integration with the existing authentication infrastructure.