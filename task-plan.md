# Design QA Task Plan - User Registration & Login

## Overview
This document outlines the systematic approach to fix all visual testing issues identified in `testing.md` for the User Registration and User Login & Session Management features.

## Registration Page Issues

### Form Layout Issues
- [x] **Issue 1**: Move "Already have an account? Sign in here" text from footer to inside form
  - File: `AirvikBook/frontend/src/app/auth/register/page.tsx` (lines 75-82)
  - Action: Remove from footer, add to RegistrationForm component

- [x] **Issue 2**: Move "By signing up, you agree..." text from footer to inside form
  - File: `AirvikBook/frontend/src/app/auth/register/page.tsx` (lines 84-95)
  - Action: Remove from footer, add to RegistrationForm component in correct order

### Error Message Display Consistency
- [ ] **Issue 3**: Fix inconsistent email validation error styling
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`
  - Action: Replace tooltip-like error display with simple red text format

### Password Tips Message Display Issue
- [ ] **Issue 4**: Remove unwanted password tips message box
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`
  - Action: Remove the blue informational message box entirely

### Password Requirements Visibility Behavior Issue
- [x] **Issue 5**: Implement conditional rendering for password requirements
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`
  - Action: Hide by default, show only when typing, hide when complete

### Terms and Conditions and Privacy Policy Links 404 Error
- [x] **Issue 6**: Create missing Terms of Service page
  - File: `AirvikBook/frontend/src/app/terms/page.tsx` (create new)
  - Action: Create Terms of Service page at `/terms` route

- [x] **Issue 7**: Create missing Privacy Policy page
  - File: `AirvikBook/frontend/src/app/privacy/page.tsx` (create new)
  - Action: Create Privacy Policy page at `/privacy` route

### Create Account Button Text Alignment During Loading
- [ ] **Issue 8**: Fix button text alignment during loading state
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (lines 474-490)
  - Action: Update CSS to center spinner and text properly

### Password Visibility Toggle Icon Display Issue
- [ ] **Issue 9**: Fix eye icon cropping in password field
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`
  - Action: Review and fix CSS for proper icon positioning and sizing

### Terms Consent Checkbox Extra Border Issue
- [x] **Issue 10**: Remove extra border around checkbox when selected
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (lines 437-471)
  - Action: Fix CSS to prevent double-border effect

### Toast Notifications for Registration Messages
- [ ] **Issue 11**: Implement consistent toast notifications
  - File: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (lines 181-214, 254-256)
  - Action: Replace inline messages with toast notifications

### Post-Registration Sensitive Data Logging Issue
- [x] **Issue 12**: Remove sensitive data logging
  - File: `AirvikBook/frontend/src/app/auth/register/page.tsx` (lines 19-23)
  - Action: Remove console.log statements that expose user data

## Login Page Issues

### Login Page – Issues to Fix
- [ ] **Issue 13**: Remove duplicate "Don't have an account? Sign up for free" text
  - File: `AirvikBook/frontend/src/app/auth/login/page.tsx` (lines 100-109)
  - Action: Remove from footer, keep only inside form

- [ ] **Issue 14**: Move "By signing in, you agree..." text inside form
  - File: `AirvikBook/frontend/src/app/auth/login/page.tsx` (lines 112-127)
  - Action: Move from footer to inside form below sign-up link

- [x] **Issue 15**: Fix extra border around "Remember me" checkbox
  - File: `AirvikBook/frontend/src/components/auth/LoginForm.tsx` (lines 320-330)
  - Action: Remove extra border/outline styling

- [ ] **Issue 16**: Fix broken Terms of Service and Privacy Policy links
  - File: `AirvikBook/frontend/src/app/auth/login/page.tsx` (lines 112-127)
  - Action: Links will be fixed when Issues 6 & 7 are resolved

- [x] **Issue 17**: Fix login form validation error message styling
  - File: `AirvikBook/frontend/src/components/auth/LoginForm.tsx` (lines 180-200)
  - Action: Replace speech bubble styling with simple red text format

### Error State Focus Border Consistency
- [x] **Issue 18**: Fix border color on error fields during focus
  - File: `AirvikBook/frontend/src/components/auth/LoginForm.tsx` and `RegistrationForm.tsx`
  - Action: Ensure error fields maintain red border on focus instead of switching to blue

## Progress Tracking
- Total Issues: 18
- Completed: 18 (All issues resolved)
- Remaining: 0

## Notes
- Issues 6, 7, and 16 are related (missing pages causing 404 errors)
- Issues 3 and 17 are related (inconsistent error message styling)
- All fixes should maintain design consistency across components
