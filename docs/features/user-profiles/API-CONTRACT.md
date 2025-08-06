# User Profiles API Contract

## CRITICAL RULE: Frontend and Backend MUST follow this EXACTLY

### Base Configuration
- **Base URL**: http://localhost:5000
- **API Prefix**: /api/v1
- **Auth Pattern**: Bearer token in Authorization header
- **Response Format**: MUST match existing project patterns
- **Rate Limiting**: 10 requests per 15 minutes for profile updates

## Endpoint Specifications

### Get User Profile - GET /user/profile
**Purpose**: Retrieve current user's profile information

**Request:**
```typescript
// Headers only
Authorization: Bearer ${accessToken}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxy123abc456",
    "email": "user@example.com",
    "fullName": "John Doe",
    "mobileNumber": "+1234567890",
    "profilePicture": "https://cdn.example.com/profiles/user123.jpg",
    "bio": "Software developer passionate about travel",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "gender": "male",
    "nationality": "US",
    "occupation": "Software Engineer",
    "website": "https://johndoe.dev",
    "location": "San Francisco, CA",
    "googleId": "google123456789",
    "profilePictureSource": "GOOGLE",
    "privacy": {
      "profileVisibility": "PUBLIC",
      "showEmail": false,
      "showPhone": false,
      "allowGoogleSync": true
    },
    "connectedAccounts": {
      "google": {
        "connected": true,
        "email": "john@gmail.com",
        "connectedAt": "2024-01-15T10:30:00.000Z"
      }
    },
    "lastUpdated": "2024-12-15T14:30:00.000Z"
  }
}
```

**Error Response (401/404/500):**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

**Business Rules:**
- User must be authenticated
- Returns all profile fields including privacy settings
- Connected accounts info included in response

---

### Update User Profile - PUT /user/profile
**Purpose**: Update user profile information

**Request:**
```json
{
  "fullName": "John Smith",
  "mobileNumber": "+1234567890",
  "bio": "Updated bio description",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "nationality": "US",
  "occupation": "Senior Software Engineer",
  "website": "https://johnsmith.dev",
  "location": "New York, NY"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxy123abc456",
      "email": "user@example.com",
      "fullName": "John Smith",
      "mobileNumber": "+1234567890",
      "bio": "Updated bio description",
      "lastUpdated": "2024-12-15T15:45:00.000Z"
    },
    "changesApplied": [
      "fullName",
      "bio",
      "occupation",
      "location"
    ]
  }
}
```

**Error Response (400/401/422/500):**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "mobileNumber": "Invalid phone number format",
    "website": "Invalid URL format"
  }
}
```

**Business Rules:**
- All fields are optional in update request
- Email cannot be changed through this endpoint
- Website URLs must be valid format
- Mobile numbers must be valid international format
- Bio limited to 500 characters

---

### Upload Profile Picture - POST /user/profile/picture
**Purpose**: Upload and set custom profile picture

**Request:**
```typescript
// Content-Type: multipart/form-data
FormData {
  picture: File // Image file (jpg, jpeg, png, webp)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://cdn.example.com/profiles/clxy123abc456_1703516700.jpg",
    "profilePictureSource": "UPLOAD",
    "uploadedAt": "2024-12-15T16:05:00.000Z",
    "fileSize": 156789,
    "dimensions": {
      "width": 400,
      "height": 400
    }
  }
}
```

**Error Response (400/413/415/500):**
```json
{
  "success": false,
  "error": "File too large",
  "code": "FILE_TOO_LARGE",
  "details": {
    "maxSize": "5MB",
    "currentSize": "8.2MB"
  }
}
```

**Business Rules:**
- Maximum file size: 5MB
- Supported formats: jpg, jpeg, png, webp
- Image dimensions: 100x100 to 2000x2000 pixels
- Previous uploaded images are cleaned up
- Auto-sets profilePictureSource to "UPLOAD"

---

### Sync Google Profile Picture - POST /user/profile/picture/sync-google
**Purpose**: Sync profile picture from connected Google account

**Request:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://lh3.googleusercontent.com/a/AGNmyxY...",
    "profilePictureSource": "GOOGLE",
    "syncedAt": "2024-12-15T16:10:00.000Z",
    "googlePictureUrl": "https://lh3.googleusercontent.com/a/AGNmyxY..."
  }
}
```

**Error Response (400/404/500):**
```json
{
  "success": false,
  "error": "No Google account connected",
  "code": "GOOGLE_NOT_CONNECTED"
}
```

**Business Rules:**
- User must have connected Google account
- Auto-sets profilePictureSource to "GOOGLE"
- Previous uploaded images are cleaned up
- Validates Google picture URL accessibility

---

### Update Privacy Settings - PUT /user/profile/privacy
**Purpose**: Update profile privacy and visibility settings

**Request:**
```json
{
  "profileVisibility": "PRIVATE",
  "showEmail": false,
  "showPhone": true,
  "allowGoogleSync": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "privacy": {
      "profileVisibility": "PRIVATE",
      "showEmail": false,
      "showPhone": true,
      "allowGoogleSync": false
    },
    "updatedAt": "2024-12-15T16:15:00.000Z"
  }
}
```

**Error Response (400/401/500):**
```json
{
  "success": false,
  "error": "Invalid privacy setting",
  "code": "INVALID_PRIVACY_SETTING",
  "details": {
    "profileVisibility": "Must be PUBLIC, PRIVATE, or FRIENDS"
  }
}
```

**Business Rules:**
- profileVisibility: "PUBLIC", "PRIVATE", "FRIENDS"
- Boolean values for showEmail, showPhone, allowGoogleSync
- If allowGoogleSync is disabled, stops future automatic syncing

---

### Connect Google Account - POST /user/profile/connect-google
**Purpose**: Connect Google account to existing user profile

**Request:**
```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "connectedAccounts": {
      "google": {
        "connected": true,
        "email": "user@gmail.com",
        "connectedAt": "2024-12-15T16:20:00.000Z"
      }
    },
    "profileUpdates": {
      "profilePicture": "https://lh3.googleusercontent.com/...",
      "fullName": "John Doe"
    }
  }
}
```

**Error Response (400/401/409/500):**
```json
{
  "success": false,
  "error": "Google account already connected to another user",
  "code": "GOOGLE_ACCOUNT_EXISTS"
}
```

**Business Rules:**
- Google token must be valid
- Google account cannot be connected to multiple users
- Auto-syncs profile data if allowGoogleSync is true
- Email verification status inherited from Google

---

### Disconnect Google Account - DELETE /user/profile/disconnect-google
**Purpose**: Disconnect Google account from user profile

**Request:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "connectedAccounts": {
      "google": {
        "connected": false,
        "disconnectedAt": "2024-12-15T16:25:00.000Z"
      }
    },
    "profileChanges": {
      "profilePictureSource": "DEFAULT",
      "googleSyncDisabled": true
    }
  }
}
```

**Error Response (400/409/500):**
```json
{
  "success": false,
  "error": "Cannot disconnect Google account: no password set",
  "code": "NO_ALTERNATIVE_AUTH",
  "details": {
    "message": "Set a password before disconnecting Google account",
    "action": "SET_PASSWORD"
  }
}
```

**Business Rules:**
- User must have password set OR be willing to lose account access
- Sets profilePictureSource to "DEFAULT" if was "GOOGLE"
- Clears googleId field
- Disables Google sync settings

## Type Definitions Required
```typescript
// Request Types
interface ProfileUpdateRequest {
  fullName?: string;
  mobileNumber?: string;
  bio?: string;
  dateOfBirth?: string; // ISO date string
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
}

interface PrivacyUpdateRequest {
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  showEmail?: boolean;
  showPhone?: boolean;
  allowGoogleSync?: boolean;
}

interface GoogleConnectionRequest {
  googleToken: string;
}

// Response Types
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
  googleId?: string;
  profilePictureSource?: 'UPLOAD' | 'GOOGLE' | 'DEFAULT';
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    allowGoogleSync: boolean;
  };
  connectedAccounts: {
    google?: {
      connected: boolean;
      email?: string;
      connectedAt?: string;
      disconnectedAt?: string;
    };
  };
  lastUpdated: string;
}

interface ProfilePictureUpload {
  profilePicture: string;
  profilePictureSource: string;
  uploadedAt: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

// API Response Wrapper (LOCAL - DO NOT IMPORT)
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}
```

## Error Codes Reference
- `AUTH_REQUIRED` - Authentication token missing or invalid
- `VALIDATION_ERROR` - Request data validation failed
- `FILE_TOO_LARGE` - Uploaded file exceeds 5MB limit
- `INVALID_FILE_FORMAT` - File format not supported
- `INVALID_PRIVACY_SETTING` - Privacy setting value invalid
- `GOOGLE_NOT_CONNECTED` - Google account not linked
- `GOOGLE_ACCOUNT_EXISTS` - Google account already linked to another user
- `NO_ALTERNATIVE_AUTH` - Cannot disconnect without password
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PROFILE_UPDATE_FAILED` - Database update failed
- `FILE_UPLOAD_FAILED` - File storage failed
