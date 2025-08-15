# User Profiles Problems Log

## Purpose
This log helps AI learn from errors to prevent repeating them in future features and during User Profiles implementation.

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
Based on project analysis from completed features:

#### Contract Import Violations
**Problem**: Importing from shared/contracts/ instead of creating local types
**Prevention**: Always create local interfaces following contract patterns
**Detection**: Scan for 'import.*shared/contracts' in code
**User Profiles Application**: 
- Create all types in `frontend/src/types/userProfile.types.ts` locally
- Never import from `shared/contracts/api-response.contract.ts` or `shared/contracts/auth.contract.ts`
- Copy interface structures and adapt locally

#### Type Safety Issues  
**Problem**: Direct .data access on union types without type guards
**Prevention**: Always use isSuccessResponse() type guard before accessing .data
**Detection**: Scan for '\.data[^A-Za-z]' in TypeScript files
**User Profiles Application**:
```typescript
// ❌ WRONG: Direct access without type guard
const profileData = response.data.user;

// ✅ CORRECT: Type-safe access with guard
if (isSuccessResponse(response)) {
  const profileData = response.data.user; // Type-safe
}
```

#### React Pattern Violations
**Problem**: Function dependencies in useEffect causing infinite loops
**Prevention**: Use useRef for one-time flags, avoid function dependencies
**Detection**: Scan for 'useEffect.*function.*\]' patterns
**User Profiles Application**:
```typescript
// ❌ WRONG: Function dependency causing loops
useEffect(() => {
  const fetchProfile = async () => { /* ... */ };
  fetchProfile();
}, [fetchProfile]); // Function dependency

// ✅ CORRECT: useRef for flags, no function dependencies
const hasLoaded = useRef(false);
useEffect(() => {
  if (!hasLoaded.current) {
    hasLoaded.current = true;
    fetchProfile();
  }
}, []); // No dependencies
```

#### Brand Compliance Violations
**Problem**: Hardcoded colors, spacing, or typography instead of brand tokens
**Prevention**: Use only brand tokens (airvik-*, space-*, text-*)
**Detection**: Scan for hex colors, custom Tailwind classes, hardcoded spacing
**User Profiles Application**:
```css
/* ❌ WRONG: Hardcoded values */
.profile-card {
  background: #133EE3;
  padding: 24px;
  font-size: 18px;
  color: #020A18;
}

/* ✅ CORRECT: Brand tokens only */
.profile-card {
  background: var(--airvik-blue);
  padding: var(--space-6);
  font-family: var(--font-primary);
  color: var(--airvik-black);
}
```

#### File Upload Security Issues
**Problem**: Insufficient file validation and security measures
**Prevention**: Validate file type, size, dimensions, and sanitize filenames
**Detection**: Check for missing validation in file upload handlers
**User Profiles Application**:
```typescript
// ✅ REQUIRED: Comprehensive file validation
const validateProfilePicture = (file: File): ValidationResult => {
  // File size check (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File too large (max 5MB)' };
  }
  
  // File type check
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file format' };
  }
  
  return { valid: true };
};
```

#### Database Migration Issues
**Problem**: Breaking existing data when adding new fields
**Prevention**: Always make new fields nullable/optional with proper defaults
**Detection**: Check migration scripts for required fields on existing tables
**User Profiles Application**:
```sql
-- ✅ CORRECT: New fields are nullable for existing users
ALTER TABLE "users" ADD COLUMN "bio" TEXT;
ALTER TABLE "users" ADD COLUMN "profileVisibility" TEXT DEFAULT 'PUBLIC';
ALTER TABLE "users" ADD COLUMN "showEmail" BOOLEAN DEFAULT false;
```



#### Authentication Bypass Issues
**Problem**: Forgetting to protect routes with authentication middleware
**Prevention**: Always apply auth middleware to protected routes
**Detection**: Check route definitions for missing auth middleware
**User Profiles Application**:
```typescript
// ✅ REQUIRED: All profile routes must be protected
router.get('/profile', authMiddleware.verifyToken, profileController.getProfile);
router.put('/profile', authMiddleware.verifyToken, profileController.updateProfile);
router.post('/profile/picture', authMiddleware.verifyToken, profileController.uploadPicture);
```

#### Google OAuth Integration Issues
**Problem**: Not handling Google account disconnection edge cases
**Prevention**: Check for alternative authentication before allowing disconnection
**Detection**: Verify password existence when disconnecting Google
**User Profiles Application**:
```typescript
// ✅ REQUIRED: Safety check before Google disconnection
const canDisconnectGoogle = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, googleId: true }
  });
  
  // User must have password set to disconnect Google
  return !!(user?.password);
};
```

#### Image Processing Performance Issues
**Problem**: Not optimizing uploaded images causing storage and performance issues
**Prevention**: Always implement image optimization and resizing
**Detection**: Check for image processing in upload handlers
**User Profiles Application**:
```typescript
// ✅ REQUIRED: Image optimization before storage
const optimizeProfilePicture = async (buffer: Buffer): Promise<Buffer> => {
  return await sharp(buffer)
    .resize(400, 400, { 
      fit: 'cover',
      withoutEnlargement: true 
    })
    .jpeg({ quality: 85 })
    .toBuffer();
};
```

---

## User Profiles Specific Risks

### High-Risk Areas
1. **File Upload Security**: Profile picture uploads need comprehensive validation
2. **Google Account Integration**: Complex edge cases around connection/disconnection
3. **Privacy Settings**: Ensuring privacy controls work correctly across all data
4. **Database Schema Changes**: Adding new fields without breaking existing users
5. **Image Storage Management**: Cleanup of old images and storage optimization

### Testing Priorities
1. **File Upload Edge Cases**: Large files, invalid formats, malicious files
2. **Google OAuth Flows**: Connection, sync, disconnection with various account states
3. **Privacy Setting Enforcement**: Verify privacy controls affect data visibility
4. **Data Migration**: Test new fields work with existing user records
5. **API Performance**: Verify endpoints handle load without performance degradation

### Security Considerations
1. **File Upload Validation**: Size, format, dimension, and content validation
2. **Image Storage Security**: Secure file naming and access controls
3. **Privacy Data Protection**: Ensure privacy settings are enforced everywhere
4. **Google Token Validation**: Proper verification of Google OAuth tokens
5. **Profile Data Sanitization**: Clean and validate all profile input data

---

*Problems will be logged here as they occur during implementation.*
