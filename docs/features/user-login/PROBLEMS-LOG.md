# User Login & Session Management Problems Log

## Purpose
This log helps AI learn from errors to prevent repeating them in future features and during the login implementation.

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
Based on project analysis and user registration implementation:

#### Contract Import Violations (CRITICAL)
**Problem**: Importing from shared/contracts/ instead of creating local types
**Prevention**: ALWAYS create local interfaces following contract patterns in login types
**Detection**: Scan for 'import.*shared/contracts' in code before committing
**Example Fix**:
```typescript
// ❌ WRONG - Will cause build failures
import { ApiResponse } from '../../../shared/contracts/api-response.contract';

// ✅ CORRECT - Local interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
```

#### Type Safety Issues with API Responses
**Problem**: Direct .data access on union types without type guards
**Prevention**: ALWAYS use isSuccessResponse() type guard before accessing .data
**Detection**: Scan for '\.data[^A-Za-z]' in TypeScript files
**Example Fix**:
```typescript
// ❌ WRONG - Type error on union types
const result = response.data.user; // Error if response is error type

// ✅ CORRECT - Type-safe with guard
if (isSuccessResponse(response)) {
  const result = response.data.user; // ✅ Type-safe
}
```

#### React Pattern Violations (SESSION MANAGEMENT CRITICAL)
**Problem**: Function dependencies in useEffect causing infinite loops
**Prevention**: Use useRef for one-time flags, avoid function dependencies in login hooks
**Detection**: Scan for 'useEffect.*function.*\]' patterns in components
**Example Fix**:
```typescript
// ❌ WRONG - Infinite loops with function deps
useEffect(() => {
  refreshTokens();
}, [refreshTokens]); // Function dependency causes loops

// ✅ CORRECT - Use useRef for one-time operations
const hasRefreshed = useRef(false);
useEffect(() => {
  if (!hasRefreshed.current) {
    refreshTokens();
    hasRefreshed.current = true;
  }
}, []); // Empty dependency array
```

#### Token Storage Pattern Violations (AUTHENTICATION CRITICAL)
**Problem**: Incorrect token storage locations breaking auth flow
**Prevention**: ALWAYS use sessionStorage for access, localStorage for refresh
**Detection**: Scan for incorrect storage patterns in login service
**Example Fix**:
```typescript
// ❌ WRONG - Incorrect storage locations
localStorage.setItem('airvik_access_token', accessToken); // Should be sessionStorage
sessionStorage.setItem('airvik_refresh_token', refreshToken); // Should be localStorage

// ✅ CORRECT - Proper storage patterns
sessionStorage.setItem('airvik_access_token', accessToken); // Short-term
localStorage.setItem('airvik_refresh_token', refreshToken); // Long-term
```

#### Brand Compliance Violations (UI CONSISTENCY CRITICAL)
**Problem**: Hardcoded colors, spacing, or typography instead of brand tokens
**Prevention**: Use ONLY brand tokens (airvik-*, space-*, text-*) in login components
**Detection**: Scan for hex colors, custom Tailwind classes, hardcoded spacing
**Example Fix**:
```typescript
// ❌ WRONG - Hardcoded styles
<button className="bg-blue-600 text-white px-4 py-2 text-lg">
  Login
</button>

// ✅ CORRECT - Brand tokens only
<button className="bg-airvik-blue text-airvik-white px-space-4 py-space-2 text-button">
  Login
</button>
```

#### Session Management Vulnerabilities
**Problem**: Insecure session handling with multiple devices
**Prevention**: Always validate session ownership and device fingerprints
**Detection**: Review session validation logic in backend services
**Example Fix**:
```typescript
// ❌ WRONG - No device validation
const session = await getSessionById(sessionId);
await invalidateSession(sessionId);

// ✅ CORRECT - Validate ownership and device
const session = await getSessionByIdAndUser(sessionId, userId);
if (session && session.deviceId === requestDeviceId) {
  await invalidateSession(sessionId);
}
```

#### Google OAuth Token Validation Errors
**Problem**: Accepting invalid or expired Google tokens
**Prevention**: Always validate Google tokens with Google's verification API
**Detection**: Check Google token validation in OAuth service
**Example Fix**:
```typescript
// ❌ WRONG - No server-side validation
const user = jwt.decode(googleToken); // Client can fake this

// ✅ CORRECT - Server-side Google validation
const googleUser = await verifyGoogleToken(googleToken);
if (!googleUser || !googleUser.email_verified) {
  throw new Error('Invalid Google token');
}
```

#### Rate Limiting Bypass Vulnerabilities
**Problem**: Rate limiting can be bypassed with multiple IP addresses
**Prevention**: Implement both IP-based and user-based rate limiting
**Detection**: Test rate limiting with multiple request sources
**Example Fix**:
```typescript
// ❌ WRONG - Only IP-based limiting
const attempts = await getLoginAttemptsByIP(clientIP);

// ✅ CORRECT - Multi-layer security monitoring  
const ipAttempts = await getLoginAttemptsByIP(clientIP);
const emailAttempts = await getLoginAttemptsByEmail(email);
if (ipAttempts > 10 || emailAttempts > 5) {
  // Log suspicious activity for monitoring
  await logSuspiciousActivity(clientIP, email);
}
```

#### Password Comparison Timing Attacks
**Problem**: Using non-constant time password comparison
**Prevention**: Always use bcrypt.compare() for password validation
**Detection**: Check password validation in auth service
**Example Fix**:
```typescript
// ❌ WRONG - Timing attack vulnerable
const isValid = (hashedPassword === providedHash);

// ✅ CORRECT - Constant-time comparison
const isValid = await bcrypt.compare(providedPassword, storedHash);
```

#### Token Refresh Race Conditions
**Problem**: Multiple simultaneous requests trying to refresh tokens
**Prevention**: Implement token refresh with proper locking/queuing
**Detection**: Test concurrent API calls during token expiry
**Example Fix**:
```typescript
// ❌ WRONG - Race condition with multiple refreshes
const newToken = await refreshAccessToken();

// ✅ CORRECT - Queue multiple refresh attempts
if (refreshPromise) {
  return refreshPromise; // Return existing refresh
}
refreshPromise = performTokenRefresh();
return refreshPromise;
```

---

## Login-Specific Error Patterns

### Authentication Flow Errors
- **Invalid Credentials Handling**: Always return generic "Invalid email or password" message
- **Account Lockout Logic**: Implement progressive backoff (5 attempts → 15 min lockout)
- **Session Cleanup**: Clean expired sessions on login to prevent accumulation

### Google OAuth Integration Errors
- **Token Expiry**: Handle Google token expiration gracefully with clear error messages
- **Account Linking**: Validate email matching before linking Google accounts
- **Profile Sync**: Handle missing Google profile data (name, picture) gracefully

### Multi-Device Session Errors
- **Device Fingerprinting**: Handle cases where device fingerprints change
- **Session Conflicts**: Manage session limits (max 10 active sessions per user)
- **Cross-Device Logout**: Ensure logout from one device doesn't affect others

### Frontend Login Errors  
- **Form Validation**: Validate inputs before API calls to reduce server load
- **Loading States**: Show loading during authentication to prevent double submissions
- **Error Recovery**: Provide clear recovery actions for authentication failures

### Security Alert Errors
- **Email Failures**: Handle email service failures gracefully during new device alerts
- **False Positives**: Reduce false new device alerts with improved fingerprinting
- **Privacy Compliance**: Ensure device tracking complies with privacy regulations

---

*Problems will be logged here as they occur during implementation.*

## Error Prevention Checklist

### Before Starting Each Task
- [ ] Review API contract for exact interface requirements
- [ ] Confirm brand token usage (no hardcoded styles)
- [ ] Verify token storage patterns (sessionStorage/localStorage)
- [ ] Check type guard usage for API responses
- [ ] Review React patterns (no function dependencies in useEffect)

### Before Committing Code
- [ ] Scan for contract imports: `grep -r 'shared/contracts' src/`
- [ ] Scan for hardcoded colors: `grep -r '#[0-9a-fA-F]\{6\}' src/`
- [ ] Scan for direct .data access: `grep -r '\.data[^A-Za-z]' src/`
- [ ] Run TypeScript compilation: `npx tsc --noEmit`
- [ ] Run ESLint: `npm run lint`
- [ ] Test authentication flow end-to-end

### Security Review Checklist
- [ ] Security monitoring implemented and tested
- [ ] Password comparison uses bcrypt.compare()
- [ ] Google tokens validated server-side
- [ ] Session ownership validated on all operations
- [ ] Device fingerprinting includes multiple factors
- [ ] Security alerts sent for new device logins
- [ ] Token refresh handles race conditions properly