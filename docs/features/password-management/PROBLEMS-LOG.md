# Password Management Problems Log

## Purpose
This log helps AI learn from errors to prevent repeating them in future password management tasks and other features.

## Entry Format
### Problem #[number] - [Date] - [Task]
**Problem**: [Detailed description]
**Error Message**: [Exact error text]
**Root Cause**: [Why it happened]
**Test Failed**: [Which test failed]

**Solution Applied**:
[Step-by-step fix]

**Test Result**: ✅ PASSED / ❌ FAILED
**Prevention**: [How to avoid in future]
**Code Changes**: [Files modified]

---

## Recent Problems Resolved

### Problem #1 - 2024-12-15 - F4 Password Management Pages
**Problem**: Reset password page showing 404 error when accessed via email link
**Error Message**: `404: page could not be found` for `/auth/reset-password?token=...`
**Root Cause**: URL format mismatch between backend and frontend
- Backend generates: `/auth/reset-password?token=...` (query parameter)
- Frontend expects: `/auth/reset-password/[token]` (path parameter)

**Solution Applied**:
1. Created new page: `frontend/src/app/auth/reset-password/page.tsx` (query parameter version)
2. Used `useSearchParams()` to get token from URL
3. Removed conflicting `[token]` directory
4. Updated email service to use correct URL format

**Test Result**: ✅ PASSED
**Prevention**: Always verify URL format consistency between backend email generation and frontend routing
**Code Changes**: 
- Created: `frontend/src/app/auth/reset-password/page.tsx`
- Removed: `frontend/src/app/auth/reset-password/[token]/page.tsx`
- Updated: Email service URL generation

### Problem #2 - 2024-12-15 - F3 Password Strength Components
**Problem**: Password strength showing "Very Weak" despite meeting all requirements
**Error Message**: Visual discrepancy between strength bar ("Strong") and text label ("Very Weak")
**Root Cause**: Type assertion issue in `PASSWORD_STRENGTH_LABELS` lookup causing fallback to "Very Weak"

**Solution Applied**:
1. Fixed type assertion in `PasswordInput.tsx`: `PASSWORD_STRENGTH_LABELS[Math.min(score, 4) as keyof typeof PASSWORD_STRENGTH_LABELS]`
2. Updated `PasswordStrengthIndicator.tsx` to use consistent calculation logic
3. Ensured both components use same score capping logic

**Test Result**: ✅ PASSED
**Prevention**: Always use consistent type assertions and verify label mapping works correctly
**Code Changes**:
- Updated: `frontend/src/components/auth/PasswordInput.tsx`
- Updated: `frontend/src/components/auth/PasswordStrengthIndicator.tsx`

### Problem #3 - 2024-12-15 - F6 State Management Integration
**Problem**: TypeScript errors when extending AuthContext with new password management methods
**Error Message**: `Object literal may only specify known properties, and 'changePassword' does not exist in type 'AuthContextValue'`
**Root Cause**: Missing type definitions for new password management methods in AuthContextValue interface

**Solution Applied**:
1. Added imports for password management types in `userLogin.types.ts`
2. Extended `AuthContextValue` interface with new methods
3. Updated AuthContext implementation with proper error handling

**Test Result**: ✅ PASSED
**Prevention**: Always update type definitions when extending existing interfaces
**Code Changes**:
- Updated: `frontend/src/types/userLogin.types.ts`
- Updated: `frontend/src/context/AuthContext.tsx`

### Problem #4 - 2024-12-15 - Build Cache Issues
**Problem**: Next.js build cache conflicts causing module loading errors
**Error Message**: `Cannot find module './649.js'` and routing conflicts
**Root Cause**: Cached build files out of sync with current code after routing changes

**Solution Applied**:
1. Cleared Next.js cache: `rm -rf .next`
2. Removed duplicate routing files
3. Rebuilt project successfully

**Test Result**: ✅ PASSED
**Prevention**: Clear build cache when making routing changes or encountering module loading issues
**Code Changes**: 
- Removed: Duplicate routing files
- Cleared: Build cache

### Problem #5 - 2024-12-15 - Component Duplication
**Problem**: Created unnecessary `PasswordStrengthMeter.tsx` when `PasswordStrengthIndicator.tsx` already existed
**Error Message**: User feedback about component duplication
**Root Cause**: Not checking existing components before creating new ones

**Solution Applied**:
1. Deleted unnecessary `PasswordStrengthMeter.tsx`
2. Updated types to remove associated interfaces
3. Updated documentation to reflect reuse of existing component

**Test Result**: ✅ PASSED
**Prevention**: Always check existing components before creating new ones
**Code Changes**:
- Deleted: `frontend/src/components/auth/PasswordStrengthMeter.tsx`
- Updated: `frontend/src/types/passwordManagement.types.ts`

---

## Preventive Measures

### Known Error Patterns to Avoid
Based on project analysis and previous features:

#### Contract Import Violations
**Problem**: Importing from shared/contracts/ instead of creating local types
**Detection**: Scan for `import.*shared/contracts` in frontend code
**Prevention**: Always create local interfaces following API contract patterns
**Example Fix**:
```typescript
// ❌ WRONG: Contract import
import { ApiResponse } from '../../../shared/contracts/api-response.contract';

// ✅ CORRECT: Local interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
```

#### Type Safety Issues
**Problem**: Direct .data access on union types without type guards
**Detection**: Scan for `\.data[^A-Za-z]` in TypeScript files
**Prevention**: Always use type guards before accessing response properties
**Example Fix**:
```typescript
// ❌ WRONG: Direct access
const result = await passwordService.resetPassword(data);
console.log(result.data); // Type error if result is error response

// ✅ CORRECT: Type guard usage
const result = await passwordService.resetPassword(data);
if (isSuccessResponse(result)) {
  console.log(result.data); // Type-safe access
} else {
  console.error(result.error); // Handle error properly
}
```

#### React Pattern Violations
**Problem**: Function dependencies in useEffect causing infinite loops
**Detection**: Scan for `useEffect.*function.*\]` patterns
**Prevention**: Use useRef for one-time flags, avoid function dependencies in dependency arrays
**Example Fix**:
```typescript
// ❌ WRONG: Function in dependency array
useEffect(() => {
  const handlePasswordReset = () => { /* logic */ };
  handlePasswordReset();
}, [handlePasswordReset]); // Infinite loop

// ✅ CORRECT: Use useRef or move function inside effect
const hasResetAttempted = useRef(false);
useEffect(() => {
  if (!hasResetAttempted.current) {
    const handlePasswordReset = () => { /* logic */ };
    handlePasswordReset();
    hasResetAttempted.current = true;
  }
}, []); // Empty dependency array
```

#### Brand Compliance Violations
**Problem**: Hardcoded colors, spacing, or typography instead of brand tokens
**Detection**: Scan for hex colors (`#[0-9a-fA-F]{6}`), custom Tailwind classes, hardcoded spacing
**Prevention**: Use only brand tokens (airvik-*, space-*, text-*)
**Example Fix**:
```typescript
// ❌ WRONG: Hardcoded styles
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Reset Password
</button>

// ✅ CORRECT: Brand tokens
<button className="bg-airvik-blue text-airvik-white px-space-4 py-space-2 rounded-radius-md">
  Reset Password
</button>
```

#### Password Security Violations
**Problem**: Weak password validation or insecure token generation
**Detection**: Check password requirements and token generation methods
**Prevention**: Follow security best practices for password management
**Example Fix**:
```typescript
// ❌ WRONG: Weak password validation
const isValidPassword = (password: string) => password.length >= 6;

// ✅ CORRECT: Strong password validation
const isValidPassword = (password: string) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[^A-Za-z0-9]/.test(password);
};
```

#### Database Model Issues
**Problem**: Missing indexes, incorrect relationships, or migration errors
**Detection**: Prisma generate failures or slow query performance
**Prevention**: Proper model design with indexes and relationships
**Example Fix**:
```prisma
// ❌ WRONG: No indexes for lookups
model PasswordResetToken {
  id     String @id @default(cuid())
  token  String @unique
  userId String
  // Missing index on userId for user lookups
}

// ✅ CORRECT: Proper indexes
model PasswordResetToken {
  id     String @id @default(cuid())
  token  String @unique
  userId String
  
  @@index([userId]) // Add index for user lookups
  @@index([token, expiresAt]) // Composite index for token validation
}
```

#### Email Service Integration Issues
**Problem**: Email sending failures or template rendering problems
**Detection**: Email delivery failures or HTML rendering issues
**Prevention**: Test email templates and handle delivery errors
**Example Fix**:
```typescript
// ❌ WRONG: No error handling for email failures
await emailService.sendPasswordResetEmail(email, userName, token);

// ✅ CORRECT: Proper error handling
try {
  const result = await emailService.sendPasswordResetEmail(email, userName, token);
  if (!result.success) {
    console.error('Email sending failed:', result.error);
    // Implement fallback or retry logic
  }
} catch (error) {
  console.error('Email service error:', error);
  // Handle service unavailability
}
```

#### Session Management Issues
**Problem**: Sessions not properly invalidated or token refresh failures
**Detection**: User remains logged in after password change or token refresh errors
**Prevention**: Properly coordinate session management with password operations
**Example Fix**:
```typescript
// ❌ WRONG: Password change without session invalidation
const changePassword = async (newPassword: string) => {
  await updateUserPassword(userId, newPassword);
  return { success: true };
};

// ✅ CORRECT: Coordinate with session management
const changePassword = async (newPassword: string, invalidateOtherSessions: boolean) => {
  await updateUserPassword(userId, newPassword);
  
  if (invalidateOtherSessions) {
    await sessionService.invalidateAllSessionsExceptCurrent(userId, currentSessionId);
  }
  
  // Update current session's last activity
  await sessionService.updateLastActivity(currentSessionId);
  
  return { success: true };
};
```

#### Rate Limiting Configuration Issues
**Problem**: Rate limiting too restrictive or not applied consistently
**Detection**: Users unable to complete legitimate operations or abuse not prevented
**Prevention**: Apply consistent rate limiting patterns from existing auth features
**Example Fix**:
```typescript
// ❌ WRONG: Inconsistent rate limiting
router.post('/forgot-password', forgotPasswordController); // No rate limiting

// ✅ CORRECT: Consistent rate limiting
router.post('/forgot-password', 
  rateLimiter({ 
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 1, // 1 request per window per IP
    message: 'Too many password reset requests'
  }),
  forgotPasswordController
);
```

#### Frontend State Management Issues
**Problem**: State not properly updated after password operations
**Detection**: UI showing stale data or incorrect user state
**Prevention**: Properly update auth context and component state
**Example Fix**:
```typescript
// ❌ WRONG: Not updating auth context after password change
const handlePasswordChange = async (newPassword: string) => {
  await passwordService.changePassword(newPassword);
  // Missing state update
};

// ✅ CORRECT: Update auth context
const handlePasswordChange = async (newPassword: string) => {
  const result = await passwordService.changePassword(newPassword);
  if (isSuccessResponse(result)) {
    // Update user state with new password timestamp
    updateUser({
      ...currentUser,
      passwordLastChanged: result.data.user.passwordLastChanged
    });
  }
};
```

#### URL Routing Conflicts
**Problem**: Duplicate routes or URL format mismatches between backend and frontend
**Detection**: 404 errors or routing conflicts in Next.js
**Prevention**: Always verify URL format consistency and avoid duplicate route definitions
**Example Fix**:
```typescript
// ❌ WRONG: Duplicate route handling
// /auth/reset-password/page.tsx (query params)
// /auth/reset-password/[token]/page.tsx (path params)

// ✅ CORRECT: Single route with consistent format
// /auth/reset-password/page.tsx (handles query params)
// Backend generates: /auth/reset-password?token=...
```

#### Component Duplication Issues
**Problem**: Creating new components when existing ones already provide the same functionality
**Detection**: User feedback about unnecessary components or duplicate functionality
**Prevention**: Always check existing components before creating new ones
**Example Fix**:
```typescript
// ❌ WRONG: Creating duplicate component
// PasswordStrengthMeter.tsx (new)
// PasswordStrengthIndicator.tsx (existing)

// ✅ CORRECT: Reuse existing component
// Use PasswordStrengthIndicator.tsx for all password strength display
```

### Specific Password Management Risks

#### Password History Implementation
**Risk**: Password history not properly stored or checked
**Prevention**: Store password hashes securely and check against history
**Test**: Verify user cannot reuse last 5 passwords

#### Token Expiration Handling
**Risk**: Expired tokens not properly handled or cleaned up
**Prevention**: Implement token validation and cleanup jobs
**Test**: Verify expired tokens are rejected and cleaned up

#### Account Type Detection
**Risk**: Incorrect handling of Google-only vs mixed accounts
**Prevention**: Proper account type detection based on password and Google ID fields
**Test**: Verify all account types handle password operations correctly

#### Email Template Security
**Risk**: Email templates vulnerable to injection or reveal sensitive data
**Prevention**: Properly escape all user data in email templates
**Test**: Verify email templates render safely with various inputs

#### Multi-Device Session Coordination
**Risk**: Sessions not properly invalidated across devices
**Prevention**: Coordinate session invalidation with password changes
**Test**: Verify password changes affect sessions correctly across devices

#### Password Strength Display Issues
**Risk**: Inconsistent password strength calculation between components
**Prevention**: Use consistent calculation logic and type assertions
**Test**: Verify all components show same strength for same password

---

## Implementation Checklist for Each Task

### Backend Task Checklist
- [ ] Follow existing service patterns and error handling
- [ ] Apply proper rate limiting to all password endpoints
- [ ] Use bcrypt with 12+ rounds for password hashing
- [ ] Generate cryptographically secure tokens for resets
- [ ] Implement proper database indexes for performance
- [ ] Handle all edge cases (expired tokens, account types, etc.)
- [ ] Add comprehensive logging for security monitoring
- [ ] Test with different account types (email, Google, mixed)

### Frontend Task Checklist
- [ ] Create local types (NO shared/contracts imports)
- [ ] Use type guards for all API response handling
- [ ] Follow brand design system with proper tokens
- [ ] Implement proper loading and error states
- [ ] Ensure mobile responsiveness and accessibility
- [ ] Handle offline scenarios gracefully
- [ ] Update auth context state properly
- [ ] Test with all user flows and edge cases
- [ ] Check existing components before creating new ones
- [ ] Verify URL format consistency between backend and frontend

### Integration Task Checklist
- [ ] Verify email service integration works correctly
- [ ] Test session management coordination
- [ ] Validate rate limiting across all endpoints
- [ ] Ensure proper error handling end-to-end
- [ ] Test with different network conditions
- [ ] Verify security measures work as expected
- [ ] Test account type transitions (Google-only to mixed)
- [ ] Validate cleanup jobs for expired tokens
- [ ] Clear build cache when making routing changes
- [ ] Test password strength display consistency

---

*Problems will be logged here as they occur during implementation.*
