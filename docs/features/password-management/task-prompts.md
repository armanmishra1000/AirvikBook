# Task Prompts for Password Management

## HOW TO USE
1. Copy each prompt exactly as written
2. Replace [feature-name] with "password-management"
3. Paste to AI and let it execute
4. AI will automatically update all state files

## CRITICAL RULE REMINDERS FOR AI

### 🚨 ZERO VIOLATIONS ALLOWED
1. **NEVER import from shared/contracts/** - Create local types only
2. **ALWAYS use type guards** for union type property access
3. **NEVER use function dependencies in useEffect** - Use useRef instead
4. **ONLY use brand tokens** - No hardcoded colors, spacing, typography
5. **CREATE ALL user flow pages** - Not just main feature page
6. **FOLLOW existing patterns** exactly from project analysis

---

## Backend Task B1: Data Model Extensions

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/password-management/FEATURE-ANALYSIS.md"
  - "docs/features/password-management/FEATURE-SPEC.md"
  - "docs/features/password-management/API-CONTRACT.md"
  - "docs/features/password-management/CURRENT-STATE.md"
  - "docs/features/project-progress.md"
  - "backend/prisma/schema.prisma"

validation_rules:
  - follow_existing_patterns: true
  - add_proper_indexes: true
  - maintain_relationships: true
```

### Execution Instructions
**CONTEXT**: You are implementing Password Management backend data model extensions.

**MANDATORY FIRST ACTIONS**:
1. Read ALL documentation files listed above
2. Analyze existing Prisma schema and User model
3. Confirm password field exists and is nullable
4. Verify integration requirements from INTEGRATION-POINTS.md

**YOUR TASK**: Extend Prisma schema with password reset and history models

**FILES TO CREATE/MODIFY**:
- `backend/prisma/schema.prisma` (extend existing)
- `backend/src/models/passwordResetToken.model.ts` (new)
- `backend/src/models/passwordHistory.model.ts` (new)

**REQUIREMENTS**:
```prisma
// Add to schema.prisma
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
  @@index([token, expiresAt])
  @@index([userId])
  @@map("password_reset_tokens")
}

model PasswordHistory {
  id           String   @id @default(cuid())
  userId       String
  passwordHash String
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@map("password_history")
}

// Add to User model
model User {
  // ... existing fields ...
  passwordResetTokens PasswordResetToken[]
  passwordHistory     PasswordHistory[]
}
```

**VALIDATION RULES**:
- Prisma generate: `npx prisma generate`
- Create migration: `npx prisma migrate dev --name add_password_management`
- TypeScript compilation: `npx tsc --noEmit`
- Test model relationships in Prisma Studio

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B1: Data model extensions created"
2. Git commit: `git add . && git commit -m "feat(password-management): add database models for password reset and history"`
3. Git push: `git push origin feature/password-management`

**ON ERROR**:
1. Log exact error to `PROBLEMS-LOG.md`
2. Check existing schema patterns
3. Verify relationship syntax
4. Retry up to 3 times

---

## Backend Task B2: Password Reset Service Layer

### Pre-Execution Checklist
```yaml
mandatory_reads:
  - "docs/features/password-management/API-CONTRACT.md"
  - "docs/features/password-management/INTEGRATION-POINTS.md"
  - "backend/src/services/jwt.service.ts"
  - "backend/src/services/email.service.ts"

validation_rules:
  - use_existing_jwt_service: true
  - follow_service_response_pattern: true
  - implement_rate_limiting: true
```

### Execution Instructions
**CONTEXT**: You are implementing Password Management password reset service.

**MANDATORY FIRST ACTIONS**:
1. Read existing JWT and email service patterns
2. Review API contract for exact response formats
3. Check rate limiting patterns from existing auth services

**YOUR TASK**: Create password reset service with token management

**FILE TO CREATE**: `backend/src/services/auth/passwordReset.service.ts`

**REQUIREMENTS**:
- `generateResetToken(email: string)` - Create secure reset tokens
- `validateResetToken(token: string)` - Verify token validity
- `resetPassword(token: string, newPassword: string)` - Complete reset
- `cleanupExpiredTokens()` - Remove expired tokens
- Integration with existing JWT service
- Rate limiting (1 request per 5 minutes per email)
- Password history checking (last 5 passwords)

**EXAMPLE STRUCTURE**:
```typescript
import { PrismaClient } from '@prisma/client';
import { JwtService } from '../jwt.service';
import { EmailService } from '../email.service';
import { ServiceResponse } from '../../types/service.types';

export class PasswordResetService {
  private prisma: PrismaClient;
  private jwtService: JwtService;
  
  // Implement methods following API contract exactly
}
```

**VALIDATION RULES**:
- TypeScript compilation: `npx tsc --noEmit`
- Service response format consistency
- Integration with existing services
- Proper error handling for all cases

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B2: Password reset service created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement password reset service"`

---

## Backend Task B3: Password Management Service Layer

### Execution Instructions
**CONTEXT**: You are implementing Password Management service for authenticated operations.

**YOUR TASK**: Create password management service for authenticated users

**FILE TO CREATE**: `backend/src/services/auth/passwordManagement.service.ts`

**REQUIREMENTS**:
- `changePassword(userId, currentPassword, newPassword)` - Change password
- `setPasswordForGoogleUser(userId, newPassword)` - Set password for Google users
- `removePassword(userId, currentPassword)` - Remove password (become Google-only)
- `getPasswordStatus(userId)` - Get authentication methods
- `validateCurrentPassword(userId, password)` - Verify current password
- Session invalidation integration
- Account type detection (email/Google/mixed)

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B3: Password management service created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement password management service"`

---

## Backend Task B4: Password Management Controllers

### Execution Instructions
**CONTEXT**: You are implementing Password Management HTTP controllers.

**YOUR TASK**: Create controllers for all password management endpoints

**FILES TO CREATE**:
- `backend/src/controllers/auth/passwordReset.controller.ts`
- `backend/src/controllers/auth/passwordManagement.controller.ts`

**REQUIREMENTS**:
- Follow API contract exactly from API-CONTRACT.md
- Apply rate limiting middleware
- Input validation with express-validator
- Proper HTTP status codes and error handling
- Integration with services from B2 and B3

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B4: Controllers created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement password management controllers"`

---

## Backend Task B5: API Routes Configuration

### Execution Instructions
**CONTEXT**: You are configuring API routes for password management.

**YOUR TASK**: Set up all password management routes with middleware

**FILES TO CREATE/MODIFY**:
- `backend/src/routes/passwordManagement.routes.ts` (new)
- `backend/src/routes/auth.routes.ts` (extend)

**REQUIREMENTS**:
- Configure all endpoints from API contract
- Apply authentication middleware where required
- Apply rate limiting to sensitive endpoints
- Input validation middleware
- Proper route organization

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B5: Routes configured"
2. Git commit: `git add . && git commit -m "feat(password-management): configure API routes"`

---

## Backend Task B6: Email Integration and Security

### Execution Instructions
**CONTEXT**: You are enhancing email integration for password management.

**YOUR TASK**: Enhance email service with password management features

**FILES TO MODIFY**:
- `backend/src/services/email.service.ts` (extend)
- `backend/src/controllers/email.controller.ts` (extend)

**REQUIREMENTS**:
- Enhanced password reset email templates
- Password change notification emails
- Mixed authentication notification emails
- Security alert emails
- Email rate limiting and tracking

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B6: Email integration enhanced"
2. Git commit: `git add . && git commit -m "feat(password-management): enhance email integration"`

---

## Backend Task B7: Testing and Integration

### Execution Instructions
**CONTEXT**: You are implementing comprehensive testing for password management.

**YOUR TASK**: Create complete test suites for all password functionality

**FILES TO CREATE**:
- `backend/src/tests/passwordReset.test.ts`
- `backend/src/tests/passwordManagement.test.ts`
- `backend/src/tests/passwordSecurity.test.ts`

**REQUIREMENTS**:
- Unit tests for all service methods
- Integration tests for API endpoints
- Security tests for token handling
- Rate limiting tests
- Password history tests
- Email integration tests
- Edge case and error handling tests

**VALIDATION**:
- All tests pass: `npm run test:backend`
- Coverage report generated
- Security vulnerabilities checked

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Backend B7: Testing complete"
2. Git commit: `git add . && git commit -m "feat(password-management): implement comprehensive testing"`

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
**CONTEXT**: You are creating TypeScript types for Password Management frontend.

**CRITICAL RULE**: NEVER import from shared/contracts/. Create LOCAL interfaces.

**MANDATORY FIRST ACTIONS**:
1. Read API-CONTRACT.md for type structure
2. Scan codebase for any existing contract imports
3. If found, STOP and fix before proceeding

**YOUR TASK**: Create local TypeScript interfaces matching API contract

**FILE TO CREATE**: `frontend/src/types/passwordManagement.types.ts`

**REQUIREMENTS**:
```typescript
// ✅ CORRECT: Local interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  emailSent: boolean;
  message: string;
  canResetPassword: boolean;
  accountType?: 'EMAIL_ONLY' | 'GOOGLE_ONLY' | 'MIXED';
}

// MANDATORY: Add type guards
const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response && response.success === true;
};

// ❌ FORBIDDEN: Contract imports
// import { ApiResponse } from '../../../shared/contracts/api-response.contract';
```

**VALIDATION RULES**:
- Contract import scan: `grep -r 'shared/contracts' frontend/src/types/passwordManagement.types.ts`
- Must return empty (no matches)
- TypeScript compilation: `npx tsc --noEmit`

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F1: Local types created (no contract imports)"
2. Git commit: `git add . && git commit -m "feat(password-management): create local TypeScript types"`

---

## Frontend Task F2: Password Management API Service

### Execution Instructions
**CONTEXT**: You are creating the frontend API service for password management.

**YOUR TASK**: Create API client following existing service patterns

**FILE TO CREATE**: `frontend/src/services/passwordManagement.service.ts`

**REQUIREMENTS**:
- Follow existing `userLogin.service.ts` patterns
- All API methods from API contract
- Auto token refresh integration
- Type guards for response handling
- Proper error handling

**EXAMPLE STRUCTURE**:
```typescript
// Follow existing patterns from userLogin.service.ts
export class PasswordManagementService {
  private async apiCall<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    // Implementation following existing patterns
  }
  
  async forgotPassword(email: string): Promise<ApiResponse<ForgotPasswordResponse>> {
    // Implementation
  }
  
  // Other methods...
}
```

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F2: API service created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement API service"`

---

## Frontend Task F3: Password Components

### Execution Instructions
**CONTEXT**: You are creating password UI components following brand guidelines.

**YOUR TASK**: Create/enhance password input and validation components

**FILES TO CREATE/MODIFY**:
- `frontend/src/components/auth/PasswordInput.tsx` (new)
- `frontend/src/components/auth/PasswordStrengthMeter.tsx` (enhance existing)
- `frontend/src/components/auth/PasswordRequirements.tsx` (new)

**REQUIREMENTS**:
- Follow brand design system exactly
- Use airvik-* color tokens only
- Dark mode support
- Accessibility compliance
- Mobile optimization

**BRAND TOKEN USAGE**:
```typescript
// Use these exact tokens
<button className="bg-airvik-blue hover:bg-airvik-purple text-airvik-white">
<div className="space-y-space-4 p-space-6">
<h1 className="text-h1">Reset Password</h1>
```

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F3: Password components created"
2. Git commit: `git add . && git commit -m "feat(password-management): create password UI components"`

---

## Frontend Task F4: Password Management Pages

### Execution Instructions
**CONTEXT**: You are creating all password management pages and user flows.

**YOUR TASK**: Create complete page components for all password flows

**FILES TO CREATE**:
- `frontend/src/app/auth/forgot-password/page.tsx`
- `frontend/src/app/auth/reset-password/page.tsx`
- `frontend/src/app/account/security/page.tsx`

**REQUIREMENTS**:
- All user flows from FEATURE-SPEC.md
- Brand-compliant design
- Mobile-first responsive
- Loading and error states
- Google account type handling

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F4: Pages created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement password management pages"`

---

## Frontend Task F5: Account Security Dashboard

### Execution Instructions
**CONTEXT**: You are creating the account security management interface.

**YOUR TASK**: Create security dashboard components

**FILES TO CREATE**:
- `frontend/src/components/account/SecurityDashboard.tsx`
- `frontend/src/components/account/AuthenticationMethods.tsx`
- `frontend/src/components/account/PasswordStatus.tsx`

**REQUIREMENTS**:
- Display authentication methods
- Password management controls
- Account type indicators
- Security recommendations
- Session management integration

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F5: Security dashboard created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement security dashboard"`

---

## Frontend Task F6: State Management Integration

### Execution Instructions
**CONTEXT**: You are integrating password management with existing auth system.

**YOUR TASK**: Extend auth context and integrate with existing forms

**FILES TO MODIFY**:
- `frontend/src/context/AuthContext.tsx` (extend)
- `frontend/src/components/auth/LoginForm.tsx` (extend)

**REQUIREMENTS**:
- Extend auth context with password status
- Add forgot password link to login
- State updates after password changes
- Session coordination

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F6: State management integrated"
2. Git commit: `git add . && git commit -m "feat(password-management): integrate with auth state"`

---

## Frontend Task F7: Advanced Security Features

### Execution Instructions
**CONTEXT**: You are implementing advanced security UI features.

**YOUR TASK**: Create security enhancement components

**FILES TO CREATE**:
- `frontend/src/components/security/SecurityAlerts.tsx`
- `frontend/src/components/security/AccountTypeIndicator.tsx`
- `frontend/src/components/security/PasswordPolicyGuide.tsx`

**REQUIREMENTS**:
- Security alert notifications
- Account type visual indicators
- Password policy guidance
- Security recommendations
- Token expiration warnings

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F7: Security features created"
2. Git commit: `git add . && git commit -m "feat(password-management): implement security features"`

---

## Frontend Task F8: Error Handling and UX

### Execution Instructions
**CONTEXT**: You are implementing comprehensive error handling and UX improvements.

**YOUR TASK**: Create error handling and UX enhancement components

**FILES TO CREATE**:
- `frontend/src/components/errors/PasswordErrorBoundary.tsx`
- `frontend/src/hooks/usePasswordReset.tsx`
- `frontend/src/hooks/usePasswordChange.tsx`

**REQUIREMENTS**:
- Error boundary for password components
- Custom hooks for password operations
- Toast notifications
- Loading state management
- Offline handling

**ON SUCCESS**:
1. Update `CURRENT-STATE.md`: Mark "✅ Frontend F8: Error handling complete"
2. Git commit: `git add . && git commit -m "feat(password-management): implement error handling and UX"`

---

## Integration Task: Complete Feature Integration

### Pre-Execution Checklist
```yaml
integration_validation:
  - backend_complete: "All B1-B7 tasks marked complete in CURRENT-STATE.md"
  - frontend_complete: "All F1-F8 tasks completed"
  - testing_complete: "All tests passing"
```

### Execution Instructions
**CONTEXT**: Final integration of Password Management feature.

**CRITICAL PATTERNS TO FOLLOW**:
```typescript
// Token usage (EXACT pattern)
const accessToken = sessionStorage.getItem('airvik_access_token');
const refreshToken = localStorage.getItem('airvik_refresh_token');

// API calls (EXACT pattern)
const response = await fetch(`http://localhost:5000/api/v1/auth/forgot-password`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// Type-safe response handling (MANDATORY)
if (isSuccessResponse(response)) {
  console.log(response.data); // ✅ Type-safe
} else {
  console.error(response.error); // ✅ Type-safe
}
```

**FINAL VALIDATION**:
- End-to-end password reset flow
- All account type scenarios
- Error handling comprehensive
- Brand compliance verified
- Dark mode working
- Mobile responsive
- Security measures active

**ON COMPLETION**:
1. Update `CURRENT-STATE.md`: Mark feature as "✅ COMPLETE"
2. Update `docs/features/project-progress.md`: Add Password Management as completed
3. Final commit: `git commit -m "feat(password-management): complete implementation"`
4. Feature ready for production!
