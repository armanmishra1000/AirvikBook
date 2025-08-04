# Integration Points for User Registration

## Dependencies on Existing Features
Based on project-progress.md analysis:
- [x] **Database**: User model exists in Prisma schema with all required fields
- [x] **Email System**: Brevo SMTP configuration exists in backend/.env.example
- [x] **API Structure**: Response format and `/api/v1` prefix established
- [x] **Frontend Setup**: Next.js 14, TypeScript, Tailwind CSS configured
- [ ] **JWT Middleware**: Token generation and validation to be created

## Shared Code to Reuse
From existing codebase:
- **Backend utilities**: 
  - `backend/src/utils/response.utils.ts` - standardized API responses
  - Email service foundation exists in routes
  - Prisma client initialization in server.ts
- **Frontend services**: 
  - API service patterns to follow existing response format
  - Path aliases configured (@/components, @/services, etc.)
- **UI components**: 
  - Basic Tailwind CSS setup
  - Form patterns to be established following brand guidelines
- **Middleware**: 
  - CORS and Helmet already configured
  - Rate limiting patterns exist

## Token Storage Patterns (CRITICAL)
Based on existing implementation:
- **Access token location**: `sessionStorage.getItem('airvik_access_token')`
- **Refresh token location**: `localStorage.getItem('airvik_refresh_token')`
- **User data storage**: `localStorage.getItem('airvik_user')`
- **API headers format**: 
  ```javascript
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
  ```

## Brand System Integration
Based on BRAND-GUIDELINES.md:
- **Color tokens to use**: 
  - `--airvik-blue` for primary actions
  - `--airvik-purple` for secondary actions
  - `--airvik-white` for form backgrounds
  - `--error` for validation errors
  - `--success` for success states
- **Spacing tokens**: `--space-4` for form padding, `--space-6` for component gaps
- **Typography classes**: 
  - `.text-h1` for page titles
  - `.text-h4` for section headings
  - `.text-body` for form labels and content
  - `.text-button` for button text
- **Component patterns**: 
  - `.btn-primary` for main actions
  - `.card` for form containers
  - `.input` with focus states
  - `.toast` for notifications

## Email Integration Requirements
- **Service**: Brevo SMTP (smtp-relay.brevo.com:587)
- **Templates needed**:
  - Welcome email with user name
  - Email verification with secure token
  - Password reset (future feature preparation)
- **Configuration**: Environment variables already structured in env.example.txt

## Google OAuth Integration
- **Provider**: NextAuth.js with Google OAuth 2.0
- **Scopes**: Profile, email, picture
- **Data mapping**: 
  - googleId for account linking
  - profilePicture from Google account
  - Auto-verify email for Google accounts

## Potential Conflicts
- **Route conflicts**: 
  - `/auth/*` routes reserved for authentication
  - `/api/v1/auth/*` for backend endpoints
- **Database conflicts**: 
  - User model already exists - reuse existing structure
  - Ensure email uniqueness constraints
- **Component naming**: 
  - Use `UserRegistration*` prefix for components
  - Avoid generic names like `Form`, `Button`

## Security Considerations
- **Password hashing**: bcryptjs (already in package.json)
- **Email verification**: Secure token generation with expiry
- **Rate limiting**: Apply to registration endpoints
- **Input validation**: Email format, password strength, phone number format
- **CSRF protection**: Ensure NextAuth CSRF tokens are used