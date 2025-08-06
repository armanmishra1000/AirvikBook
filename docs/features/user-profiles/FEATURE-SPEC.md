# User Profiles Specification

## User Stories
### Primary User Story
As a registered user, I want to manage my profile information and connected accounts so that I can maintain accurate personal details, control my privacy settings, and optimize my experience across the platform.

### Supporting Stories
- As a user, I want to edit my personal information (name, bio, contact details) so that other users can learn about me appropriately
- As a user, I want to upload a custom profile picture so that I can represent myself visually
- As a Google-connected user, I want to sync my profile picture from Google so that my profile stays current automatically
- As a user, I want to control my privacy settings so that I can decide what information is visible to others
- As a user, I want to manage my connected accounts (Google) so that I can control how my data is synchronized
- As a user, I want to view my connected accounts status so that I understand which services are linked to my account
- As a user, I want to disconnect social accounts safely so that I can manage my digital footprint while maintaining account access

## Functional Requirements
### Core Functionality
1. **Profile Information Management**
   - Edit full name, bio, contact details, occupation, location
   - Validate all inputs with clear error messages
   - Save changes with immediate feedback and confirmation
   - Display last updated timestamp for transparency

2. **Profile Picture Management**
   - Upload custom profile pictures (5MB max, common image formats)
   - Sync profile picture from connected Google account
   - Switch between uploaded and Google-synced pictures
   - Remove profile pictures (revert to default)
   - Image optimization and proper sizing

3. **Social Account Connection Management**
   - Connect Google account to existing profile
   - View connected account status and details
   - Sync profile data from Google (name, email, picture)
   - Disconnect Google account with proper safeguards
   - Manage Google profile data sync preferences

4. **Privacy & Visibility Controls**
   - Set profile visibility (Public, Private, Friends)
   - Control email and phone number visibility
   - Manage automatic Google sync preferences
   - Configure social login privacy settings

### Business Rules
1. **Profile Updates**
   - Users can update their information at any time
   - Email address cannot be changed through profile (security)
   - All profile fields are optional except full name
   - Changes are immediately saved without requiring confirmation

2. **Google Account Integration**
   - One Google account per user profile
   - Google account cannot be connected to multiple user profiles
   - Users cannot disconnect Google account if no password is set
   - Auto-sync respects user's allowGoogleSync preference

3. **Profile Picture Rules**
   - Maximum file size: 5MB
   - Supported formats: JPG, JPEG, PNG, WebP
   - Minimum dimensions: 100x100 pixels
   - Maximum dimensions: 2000x2000 pixels
   - Previous uploaded pictures are cleaned up automatically

4. **Privacy Settings**
   - Default profile visibility: Public
   - Default email/phone visibility: Hidden
   - Default Google sync: Enabled
   - Privacy changes apply immediately

### Validation Rules
- **Full Name**: Required, 2-100 characters, letters and spaces only
- **Mobile Number**: Optional, valid international format (+1234567890)
- **Bio**: Optional, maximum 500 characters
- **Website**: Optional, valid URL format (https://)
- **Email**: Read-only (managed through authentication)
- **Date of Birth**: Optional, valid date, must be in the past
- **Location**: Optional, 2-100 characters

## Database Schema Requirements
### User Model Extensions
```javascript
// Extended User Schema (adding to existing fields)
{
  // Existing fields maintained
  id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // nullable for Google-only users
  fullName: { type: String, required: true },
  mobileNumber: { type: String },
  role: { type: Enum, default: 'GUEST' },
  profilePicture: { type: String },
  googleId: { type: String, unique: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLoginAt: { type: DateTime },
  createdAt: { type: DateTime, default: Date.now },
  updatedAt: { type: DateTime, default: Date.now },
  isActive: { type: Boolean, default: true },

  // New profile fields
  bio: { type: String, maxLength: 500 },
  dateOfBirth: { type: DateTime },
  gender: { type: String },
  nationality: { type: String },
  occupation: { type: String },
  website: { type: String },
  location: { type: String },
  
  // Profile picture management
  profilePictureSource: { 
    type: Enum, 
    values: ['UPLOAD', 'GOOGLE', 'DEFAULT'],
    default: 'DEFAULT'
  },
  
  // Privacy settings
  profileVisibility: { 
    type: Enum, 
    values: ['PUBLIC', 'PRIVATE', 'FRIENDS'],
    default: 'PUBLIC'
  },
  showEmail: { type: Boolean, default: false },
  showPhone: { type: Boolean, default: false },
  allowGoogleSync: { type: Boolean, default: true },
  
  // Existing relations
  sessions: [{ type: ObjectId, ref: 'Session' }],
  passwordResetTokens: [{ type: ObjectId, ref: 'PasswordResetToken' }],
  emailVerificationTokens: [{ type: ObjectId, ref: 'EmailVerificationToken' }]
}
```

### Relationships
- User has many Sessions (existing)
- User has many PasswordResetTokens (existing)
- User has many EmailVerificationTokens (existing)

## UI/UX Requirements
### Pages Required
1. **Main Profile Page** - `/profile`
   - Overview of current profile information
   - Quick edit toggles for sections
   - Profile picture display with edit options
   - Connected accounts status
   - Navigation to detailed settings

2. **Profile Edit Page** - `/profile/edit`
   - Comprehensive form for all profile fields
   - Real-time validation and feedback
   - Save/cancel actions with confirmation
   - Preview of changes before saving

3. **Profile Picture Management** - `/profile/picture`
   - Upload interface with drag-and-drop
   - Google sync options
   - Picture preview and cropping
   - Picture source selection

4. **Privacy Settings Page** - `/profile/privacy`
   - Privacy controls with clear explanations
   - Connected accounts management
   - Data sync preferences
   - Security recommendations

5. **Account Connections Page** - `/profile/connections`
   - View all connected accounts
   - Connect/disconnect account options
   - Connection history and status
   - Data sync status and controls

### Brand Compliance
- **Colors**: 
  - Primary actions (Save): var(--airvik-blue)
  - Secondary actions (Edit/Cancel): var(--airvik-purple)
  - Connected account indicators: var(--airvik-cyan)
  - Success confirmations: var(--success)
  - Warning states: var(--warning)
  - Error states: var(--error)

- **Typography**: 
  - Page titles: .text-h3 (Profile Settings)
  - Section headers: .text-h5 (Personal Information, Connected Accounts)
  - Form labels: .text-label
  - Body content: .text-body
  - Help text: .text-caption

- **Spacing**: 
  - Page padding: var(--space-6)
  - Section gaps: var(--space-8)
  - Form element spacing: var(--space-4)
  - Input padding: var(--space-3)
  - Button spacing: var(--space-2)

- **Components**: 
  - Cards for profile sections with .card base class
  - Primary buttons (.btn-primary) for save actions
  - Secondary buttons (.btn-secondary) for edit toggles
  - Input fields (.input) with validation states
  - Toggle switches for privacy settings
  - File upload areas with drag-and-drop styling

- **Dark Mode**: 
  - All components support data-theme="dark"
  - Profile pictures have proper dark mode borders
  - Upload areas use dark theme backgrounds
  - Form inputs maintain proper contrast
  - Connected account indicators adapt to dark theme

- **Interactive States**: 
  - Hover effects on all clickable elements
  - Focus states for accessibility compliance
  - Loading states during save/upload operations
  - Disabled states for unavailable actions
  - Success animations for confirmations

### Responsive Design
- **Mobile-first approach** with breakpoints at 640px, 768px, 1024px
- **Touch-friendly interface** with 44px minimum touch targets
- **Mobile profile picture upload** with camera/gallery options
- **Collapsible sections** on mobile for better navigation
- **Optimized forms** with single-column layout on mobile
- **Bottom action bars** for primary actions on mobile

### Accessibility Requirements
- **ARIA labels** for all form controls and interactive elements
- **Keyboard navigation** support for all functionality
- **Screen reader compatibility** with semantic HTML structure
- **High contrast mode** support for visually impaired users
- **Focus indicators** that meet WCAG 2.1 AA standards
- **Alternative text** for profile pictures and icons

### Performance Considerations
- **Lazy loading** for profile pictures and non-critical sections
- **Image optimization** with automatic resizing and compression
- **Progressive enhancement** for file upload functionality
- **Caching strategy** for profile data to reduce API calls
- **Optimistic UI updates** for immediate feedback on changes

### Error Handling & Feedback
- **Real-time validation** with clear, actionable error messages
- **Network error recovery** with retry mechanisms
- **File upload progress** indicators and error handling
- **Success confirmations** with subtle animations
- **Undo functionality** for accidental changes where appropriate
