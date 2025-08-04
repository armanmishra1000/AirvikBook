# User Registration Problems Log

## Purpose
This log helps AI learn from errors to prevent repeating them in future features.

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

## Preventive Measures

### Known Error Patterns to Avoid
Based on project analysis and common pitfalls:

#### Contract Import Violations
**Problem**: Importing from shared/contracts/ instead of creating local types
**Prevention**: Always create local interfaces following contract patterns
**Detection**: Scan for 'import.*shared/contracts' in code
**Template Check**: `grep -r 'shared/contracts' frontend/src/` must return empty

#### Type Safety Issues  
**Problem**: Direct .data access on union types without type guards
**Prevention**: Always use isSuccessResponse() type guard before accessing .data
**Detection**: Scan for '\.data[^A-Za-z]' in TypeScript files
**Example**: 
```typescript
// ❌ Wrong
const userData = response.data;

// ✅ Correct
if (isSuccessResponse(response)) {
  const userData = response.data;
}
```

#### React Pattern Violations
**Problem**: Function dependencies in useEffect causing infinite loops
**Prevention**: Use useRef for one-time flags, avoid function dependencies
**Detection**: Scan for 'useEffect.*function.*\]' patterns
**Example**:
```typescript
// ❌ Wrong
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ Correct
const fetchDataRef = useRef(fetchData);
useEffect(() => {
  fetchDataRef.current();
}, []);
```

#### Brand Compliance Violations
**Problem**: Hardcoded colors, spacing, or typography instead of brand tokens
**Prevention**: Use only brand tokens (airvik-*, space-*, text-*)
**Detection**: Scan for hex colors, custom Tailwind classes, hardcoded spacing
**Example**:
```css
/* ❌ Wrong */
.my-button { background: #133EE3; padding: 16px; }

/* ✅ Correct */
.my-button { background: var(--airvik-blue); padding: var(--space-4); }
```

#### Password Security Issues
**Problem**: Storing plain text passwords or weak hashing
**Prevention**: Always use bcryptjs with minimum 10 salt rounds
**Detection**: Scan for password fields without hashing
**Example**:
```typescript
// ❌ Wrong
const user = { password: plainPassword };

// ✅ Correct
const hashedPassword = await bcrypt.hash(plainPassword, 12);
const user = { password: hashedPassword };
```

#### JWT Token Misuse
**Problem**: Wrong token storage location or insecure token handling
**Prevention**: Access token in sessionStorage, refresh token in localStorage
**Detection**: Scan for incorrect storage patterns
**Example**:
```typescript
// ❌ Wrong
localStorage.setItem('access_token', token);

// ✅ Correct
sessionStorage.setItem('airvik_access_token', accessToken);
localStorage.setItem('airvik_refresh_token', refreshToken);
```

#### Email Service Configuration Errors
**Problem**: Wrong SMTP settings or missing environment variables
**Prevention**: Use exact Brevo SMTP configuration from env.example
**Detection**: Test email sending in development
**Required Variables**:
- SMTP_HOST=smtp-relay.brevo.com
- SMTP_PORT=587
- SMTP_SECURE=false

#### Google OAuth Integration Issues
**Problem**: Incorrect OAuth flow or missing scopes
**Prevention**: Use NextAuth.js with exact Google provider configuration
**Detection**: Test OAuth flow end-to-end
**Required Scopes**: profile, email

#### Database Relationship Errors
**Problem**: Missing foreign key constraints or incorrect relationships
**Prevention**: Follow Prisma schema patterns with proper relations
**Detection**: Run Prisma validation and test queries
**Example**:
```prisma
// ✅ Correct relationship
model EmailVerificationToken {
  userId String
  user   User   @relation(fields: [userId], references: [id])
}
```

#### Form Validation Bypass
**Problem**: Client-side only validation without server-side validation
**Prevention**: Always implement both client and server validation
**Detection**: Test API endpoints directly without frontend
**Pattern**: Zod schemas on frontend, express-validator on backend

#### Rate Limiting Evasion
**Problem**: No rate limiting on sensitive endpoints like registration
**Prevention**: Apply rate limiting to all auth endpoints
**Detection**: Test with multiple rapid requests
**Implementation**: express-rate-limit middleware

---

*Problems will be logged here as they occur during implementation.*

## Troubleshooting Checklist

Before logging a problem, verify:
1. ✅ All environment variables are set correctly
2. ✅ Database connection is working
3. ✅ TypeScript compilation passes
4. ✅ No contract imports in frontend code
5. ✅ Brand tokens are used instead of hardcoded values
6. ✅ Proper error handling is implemented
7. ✅ Tests are written and passing
8. ✅ API endpoints follow the established pattern
9. ✅ Authentication patterns match existing implementation
10. ✅ Input validation is implemented on both frontend and backend

## Common Solutions

### Environment Issues
```bash
# Backend environment check
cd backend && npm run dev
# Should start without errors

# Frontend environment check  
cd frontend && npm run dev
# Should start without errors

# Database connection check
cd backend && npx prisma db push
# Should connect successfully
```

### Type Issues
```bash
# TypeScript check
npx tsc --noEmit
# Should pass without errors

# Contract import check
grep -r 'shared/contracts' frontend/src/
# Should return no results
```

### Email Testing
```bash
# Test email configuration
curl -X POST http://localhost:5000/api/v1/email/test
# Should return success response
```

### Database Issues
```bash
# Reset database if needed
cd backend && npx prisma migrate reset
cd backend && npx prisma db push
```