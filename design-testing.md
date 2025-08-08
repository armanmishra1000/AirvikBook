# Design Testing Documentation

## Password Management & User Profiles Features

### Visual Design Issues & Mismatches

#### 1. Forgot Password Page - Email Input Field Shake Effect

**Issue Description:**
When navigating from the LoginForm to the forgot-password page and clicking on or focusing the Email Address input field, a shake effect is visible.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: Email input field (lines 195-205)

**Root Cause:**
The email input field uses `transition-all duration-normal` which applies transitions to all properties, potentially causing unwanted animations when the input gains focus. This differs from the LoginForm implementation which uses `transition-colors duration-normal` for more controlled transitions.

**Current Implementation (Forgot Password Page):**
```tsx
className={`w-full px-space-4 py-space-3 text-body font-sf-pro bg-airvik-white dark:bg-gray-700 border rounded-radius-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:border-transparent transition-all duration-normal ${
  errors.email 
    ? 'border-error focus:ring-error' 
    : 'border-gray-300 dark:border-gray-600'
}`}
```

**Expected Implementation (Matching LoginForm):**
```tsx
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
  ${errors.email 
    ? 'border-error bg-red-50 dark:bg-red-900/20 text-error' 
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
  }`}
```

**Impact:**
- Poor user experience with unexpected visual movement
- Inconsistent behavior between login form and forgot password form
- Potential accessibility issues for users sensitive to motion

**Priority:** Medium
**Status:** Open

#### 2. Forgot Password Page - Browser Default Error Handling

**Issue Description:**
When entering an invalid email format (e.g., "ex.sdfgsdfd") in the Email Address input field and clicking the "Send Reset Link" button, the browser's default error handling appears instead of the custom validation messages.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: Form element (line 189) and Email input field (line 195)

**Root Cause:**
The form element lacks the `noValidate` attribute, allowing the browser's built-in HTML5 validation to trigger when the email input has `type="email"`. This causes the browser to show its own validation message before the custom JavaScript validation can run.

**Current Implementation:**
```tsx
<form onSubmit={handleSubmit} className="space-y-space-6">
  <input
    type="email"
    id="email"
    name="email"
    // ... other attributes
  />
</form>
```

**Expected Implementation:**
```tsx
<form onSubmit={handleSubmit} className="space-y-space-6" noValidate>
  <input
    type="email"
    id="email"
    name="email"
    // ... other attributes
  />
</form>
```

**Impact:**
- Inconsistent user experience with browser-specific error messages
- Custom validation styling and messaging is bypassed
- Poor brand consistency as browser messages don't match the design system
- Potential confusion for users seeing different error messages

**Priority:** High
**Status:** Open

#### 3. Forgot Password Page - Unwanted Focus Ring on Back to Login Button

**Issue Description:**
When clicking on the "Back to Login" button, a focus ring appears around the button, which should not happen for secondary navigation actions.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: Back to Login button (lines 250-252)

**Root Cause:**
The button has focus ring styling applied (`focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2`) which creates a visible ring when the button gains focus. For secondary navigation actions, focus rings should be disabled to maintain a cleaner visual hierarchy.

**Current Implementation:**
```tsx
<button
  onClick={() => router.push('/auth/login')}
  className="text-body font-sf-pro text-airvik-blue hover:text-airvik-blue-mid transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2 rounded-radius-sm"
>
  Back to Login
</button>
```

**Expected Implementation:**
```tsx
<button
  onClick={() => router.push('/auth/login')}
  className="text-body font-sf-pro text-airvik-blue hover:text-airvik-blue-mid transition-colors duration-normal focus:outline-none rounded-radius-sm"
>
  Back to Login
</button>
```

**Impact:**
- Visual distraction from the primary action (Send Reset Link)
- Inconsistent focus behavior across secondary navigation elements
- Poor visual hierarchy as secondary actions appear to have equal importance to primary actions
- Potential confusion about which action is the main focus

**Priority:** Low
**Status:** Open

#### 4. Forgot Password Page - Browser Default Validation Popup

**Issue:** On the `Forgot Password` page, when the user enters an invalid email like `rudrasutariya003@gmail` or `rudra@@gmail.com` and clicks **Send Reset Link**, the browser shows its default error popup.

**Expected Behavior:** The app should not show the browser's default validation. It should instead show a custom error message below the input (e.g., "Please enter a valid email address") and apply the red error border as per design. Use the `AlertBanner` component with the `error` variant if needed.

#### 5. Forgot Password Page - Unwanted Focus Ring on Send Reset Link Button

**Issue Description:**
When filling in the email input and clicking the "Send Reset Link" button, a focus ring appears around the button when it gains focus, which should not happen.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: Send Reset Link button (lines 230-235)

**Root Cause:**
The button has focus ring styling applied (`focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2`) which creates a visible ring when the button gains focus. This creates an unwanted visual distraction during form submission.

**Current Implementation:**
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
>
  Send Reset Link
</button>
```

**Expected Implementation:**
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal focus:outline-none"
>
  Send Reset Link
</button>
```

**Impact:**
- Visual distraction during form submission process
- Inconsistent focus behavior across form elements
- Poor user experience with unexpected visual feedback
- Potential confusion about form state and submission progress

**Priority:** Medium
**Status:** Open

#### 6. Reset Password Page - PasswordInput Component Multiple Issues

**Issue Description:**
On the Reset Password page, the PasswordInput component has multiple visual issues:
1. Shake effect is visible on the New Password and Confirm New Password input fields
2. Show/Hide toggle button icon does not display properly
3. Unwanted focus ring appears on the toggle button
4. Icon color changes unexpectedly on focus

**Location:**
- File: `frontend/src/components/auth/PasswordInput.tsx`
- Component: PasswordInput (lines 190-250)

**Root Cause:**
1. **Shake Effect:** The input field uses `transition-all duration-normal` instead of `transition-colors duration-normal`
2. **Icon Display:** The SVG icons use `fill="none" stroke="currentColor"` which may not render properly in all browsers
3. **Focus Ring:** The toggle button has `focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2` applied
4. **Color Change:** The button has hover and focus color transitions that cause unexpected color changes

**Current Implementation:**
```tsx
// Input field with shake effect
className={`
  w-full px-space-4 py-space-3 
  text-body font-sf-pro 
  bg-airvik-white dark:bg-gray-100 
  border border-gray-300 dark:border-gray-600 
  rounded-radius-md 
  placeholder-gray-500 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:border-transparent
  disabled:bg-gray-100 dark:disabled:bg-gray-200 
  disabled:text-gray-500 dark:disabled:text-gray-400
  disabled:cursor-not-allowed
  transition-all duration-normal
  ${error 
    ? 'border-error focus:ring-error' 
    : isFocused 
      ? 'border-airvik-blue' 
      : 'border-gray-300 dark:border-gray-600'
  }
  ${showToggle ? 'pr-12' : ''}
`}

// Toggle button with focus ring and color issues
className={`
  absolute right-space-3 top-1/2 transform -translate-y-1/2
  p-space-2 rounded-radius-sm
  text-gray-500 dark:text-gray-400
  hover:text-airvik-blue dark:hover:text-airvik-blue
  focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-normal
`}
```

**Expected Implementation:**
```tsx
// Input field without shake effect
className={`
  w-full px-space-4 py-space-3 
  text-body font-sf-pro 
  bg-airvik-white dark:bg-gray-100 
  border border-gray-300 dark:border-gray-600 
  rounded-radius-md 
  placeholder-gray-500 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:border-transparent
  disabled:bg-gray-100 dark:disabled:bg-gray-200 
  disabled:text-gray-500 dark:disabled:text-gray-400
  disabled:cursor-not-allowed
  transition-colors duration-normal
  ${error 
    ? 'border-error focus:ring-error' 
    : isFocused 
      ? 'border-airvik-blue' 
      : 'border-gray-300 dark:border-gray-600'
  }
  ${showToggle ? 'pr-12' : ''}
`}

// Toggle button without focus ring and color issues
className={`
  absolute right-space-3 top-1/2 transform -translate-y-1/2
  p-space-2 rounded-radius-sm
  text-gray-500 dark:text-gray-400
  hover:text-gray-700 dark:hover:text-gray-200
  focus:outline-none
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-normal
`}
```

**Impact:**
- Poor user experience with unexpected visual movements and color changes
- Inconsistent behavior across password input components
- Potential accessibility issues for users sensitive to motion
- Visual distraction from the main form interaction
- Confusion about the toggle button's state and functionality

**Priority:** High
**Status:** Open

#### 7. Reset Password Page - Duplicate Password Strength Indicators and Unwanted Elements

**Issue Description:**
On the Reset Password page, when filling in the New Password and Confirm Password input fields, multiple issues occur:
1. Colored labels appear below the input fields that should not be shown because the PasswordInput component already uses the PasswordStrengthIndicator component
2. Under "Password Requirements:", the box that shows "Password Tips" should be removed
3. When clicking the "Reset Password" button, an unwanted focus ring appears

**Location:**
- File: `frontend/src/components/auth/PasswordInput.tsx` (lines 260-280)
- File: `frontend/src/components/auth/PasswordStrengthIndicator.tsx` (lines 150-184)
- File: `frontend/src/app/auth/reset-password/page.tsx` (lines 375-390)

**Root Cause:**
1. **Duplicate Strength Indicators:** The PasswordInput component has its own strength indicator (lines 260-280) that conflicts with the separate PasswordStrengthIndicator component used in the reset-password page
2. **Password Tips Box:** The PasswordStrengthIndicator component includes a "Password Tips" section (lines 150-184) that should be removed for cleaner UI
3. **Focus Ring:** The Reset Password button has `focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2` applied

**Current Implementation:**
```tsx
// PasswordInput component - duplicate strength indicator
{value && (
  <div className="absolute -bottom-space-6 left-0 right-0">
    <div className="flex items-center space-x-space-2">
      <div 
        className="w-2 h-2 rounded-radius-full"
        style={{ backgroundColor: strength.color }}
      />
      <span 
        className="text-caption font-sf-pro font-medium"
        style={{ color: strength.color }}
      >
        {strength.label}
      </span>
    </div>
  </div>
)}

// PasswordStrengthIndicator component - unwanted tips box
{password && strengthScore < PASSWORD_REQUIREMENTS.length && (
  <div className="mt-space-4 p-space-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-airvik-blue mt-space-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-space-3">
        <p className="text-body text-airvik-blue">
          <strong>Tip:</strong> Use a mix of uppercase and lowercase letters, numbers, and special characters for a stronger password.
        </p>
      </div>
    </div>
  </div>
)}

// Reset Password button with focus ring
className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
```

**Expected Implementation:**
```tsx
// PasswordInput component - remove duplicate strength indicator
// Remove the entire strength indicator section from PasswordInput component

// PasswordStrengthIndicator component - remove tips box
// Remove the entire "Password Tips" section from PasswordStrengthIndicator component

// Reset Password button without focus ring
className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal focus:outline-none"
```

**Impact:**
- Visual clutter with duplicate password strength information
- Confusion about which strength indicator is authoritative
- Unnecessary UI elements that distract from the main form
- Poor user experience with unwanted focus rings
- Inconsistent visual hierarchy and information architecture

**Priority:** High
**Status:** Open

#### 8. Reset Password Page - Unwanted Focus Rings on Expired Link Buttons

**Issue Description:**
When the reset password link expires, unwanted focus rings appear on both the "Request New Reset Link" and "Back to Login" buttons when they gain focus.

**Location:**
- File: `frontend/src/app/auth/reset-password/page.tsx`
- Component: Expired link state buttons (lines 260-270)

**Root Cause:**
Both buttons have focus ring styling applied:
- "Request New Reset Link" button has `focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2`
- "Back to Login" button has `focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`

**Current Implementation:**
```tsx
// Request New Reset Link button with focus ring
<button
  onClick={() => router.push('/auth/forgot-password')}
  className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
>
  Request New Reset Link
</button>

// Back to Login button with focus ring
<button
  onClick={() => router.push('/auth/login')}
  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
>
  Back to Login
</button>
```

**Expected Implementation:**
```tsx
// Request New Reset Link button without focus ring
<button
  onClick={() => router.push('/auth/forgot-password')}
  className="w-full bg-airvik-blue text-airvik-white py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-airvik-blue-mid transition-colors duration-normal focus:outline-none"
>
  Request New Reset Link
</button>

// Back to Login button without focus ring
<button
  onClick={() => router.push('/auth/login')}
  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-space-3 px-space-6 rounded-radius-md font-sf-pro font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-normal focus:outline-none"
>
  Back to Login
</button>
```

**Impact:**
- Visual distraction from the main error message
- Inconsistent focus behavior across error state buttons
- Poor user experience with unexpected visual feedback
- Potential confusion about button states and interactions

**Priority:** Medium
**Status:** Open

#### 9. Reset Password Page - Input Field Border Color Not Turning Red on Validation Errors

**Issue Description:**
When clicking the "Reset Password" button without filling in any fields, error messages appear below the input fields, but the border color of the input fields does not turn red as it should. The border only turns red when the field is focused or clicked.

**Location:**
- File: `frontend/src/components/auth/PasswordInput.tsx`
- Component: PasswordInput input field (lines 190-220)

**Root Cause:**
The conditional styling logic in the PasswordInput component has a CSS specificity issue. The base border classes `border border-gray-300 dark:border-gray-600` are applied first, and then the conditional `border-error` class is added, but the base classes have higher specificity and override the error border color.

**Current Implementation:**
```tsx
className={`
  w-full px-space-4 py-space-3 
  text-body font-sf-pro 
  bg-airvik-white dark:bg-gray-100 
  border border-gray-300 dark:border-gray-600 
  rounded-radius-md 
  placeholder-gray-500 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:border-transparent
  disabled:bg-gray-100 dark:disabled:bg-gray-200 
  disabled:text-gray-500 dark:disabled:text-gray-400
  disabled:cursor-not-allowed
  transition-all duration-normal
  ${error 
    ? 'border-error focus:ring-error' 
    : isFocused 
      ? 'border-airvik-blue' 
      : 'border-gray-300 dark:border-gray-600'
  }
  ${showToggle ? 'pr-12' : ''}
`}
```

**Expected Implementation:**
```tsx
className={`
  w-full px-space-4 py-space-3 
  text-body font-sf-pro 
  bg-airvik-white dark:bg-gray-100 
  rounded-radius-md 
  placeholder-gray-500 dark:placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:border-transparent
  disabled:bg-gray-100 dark:disabled:bg-gray-200 
  disabled:text-gray-500 dark:disabled:text-gray-400
  disabled:cursor-not-allowed
  transition-all duration-normal
  ${error 
    ? 'border border-error focus:ring-error' 
    : isFocused 
      ? 'border border-airvik-blue' 
      : 'border border-gray-300 dark:border-gray-600'
  }
  ${showToggle ? 'pr-12' : ''}
`}
```

**Impact:**
- Poor user experience as validation errors are not visually clear
- Inconsistent error state indication across form components
- Users may not immediately recognize which fields have errors
- Potential confusion about form validation status
- Reduced accessibility for users relying on visual cues

**Priority:** High
**Status:** Open

#### 10. Forgot Password Page - Misleading Success Message for Non-Registered Emails

**Issue Description:**
When a user who is already on the RegistrationForm page after LoginForm page clicks on "Forgot Password?", the forgot-password page opens and asks for the user's email address. After that, the user receives a reset password email in their inbox.

However, if someone who is not registered or not logged in directly visits the forgot-password page and enters an email address that doesn't exist in the system, the page still shows the success message "Check Your Email" with the text "If an account with this email exists, you will receive password reset instructions", even though no email was actually sent to that address.

This creates a misleading user experience where users think they've received a reset email when they haven't.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: ForgotPasswordPage (lines 100-150)
- File: `backend/src/services/auth/passwordReset.service.ts`
- Method: generateResetToken (lines 203-280)

**Root Cause:**
The backend `PasswordResetService.generateResetToken` method implements a security feature to prevent email enumeration attacks. When a user enters an email that doesn't exist in the database, the service returns a success response with the message "If an account with this email exists, you will receive password reset instructions" instead of revealing that the email doesn't exist.

However, the frontend treats this as a successful operation and shows the success state, which misleads users into thinking they've received a reset email when they haven't.

**Current Implementation:**
```tsx
// Frontend - Always shows success for any valid email format
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation logic ...
  
  try {
    const result = await PasswordManagementService.forgotPassword(formData.email.trim().toLowerCase());

    if (isSuccessResponse(result)) {
      setIsSubmitted(true); // Always shows success message
    } else {
      // Handle error cases
    }
  } catch (error) {
    // Handle network errors
  }
};

// Backend - Returns success even for non-existent emails
if (!user) {
  return {
    success: true,
    data: {
      emailSent: true, // Misleading - no email was actually sent
      message: 'If an account with this email exists, you will receive password reset instructions',
      canResetPassword: true
    }
  };
}
```

**Expected Implementation:**
The frontend should differentiate between successful email sending and the security response for non-existent emails. The backend should provide a more nuanced response that indicates whether an email was actually sent.

**Option 1: Backend Enhancement**
```tsx
// Backend - More nuanced response
if (!user) {
  return {
    success: true,
    data: {
      emailSent: false, // Indicate no email was sent
      message: 'If an account with this email exists, you will receive password reset instructions',
      canResetPassword: false,
      accountExists: false // New field to indicate account status
    }
  };
}
```

**Option 2: Frontend Enhancement**
```tsx
// Frontend - Handle different success scenarios
if (isSuccessResponse(result)) {
  if (result.data.emailSent) {
    setIsSubmitted(true); // Show success message
  } else {
    // Show informational message that doesn't mislead
    setInfoMessage('If an account with this email exists, you will receive password reset instructions');
    // Don't show the full success state
  }
} else {
  // Handle error cases
}
```

**Impact:**
- Misleading user experience where users expect emails that never arrive
- Potential confusion and frustration for non-registered users
- Users may repeatedly try the same non-existent email address
- Poor user experience that could lead to support requests
- Security feature implementation creates UX issues

**Priority:** High
**Status:** Open

#### 11. Profile Page - Loading State Incorrectly Centered

**Issue Description:**
When the user is redirected to the profile page initially, the message "Loading your profile..." and a loader are displayed. These two elements should not appear at the center of the page — they should appear at the top of the page.

**Location:**
- File: `frontend/src/app/profile/page.tsx`
- Component: ProfilePage loading state (lines 75-95)

**Root Cause:**
The loading state uses `flex items-center justify-center py-space-12` which centers the loading content both horizontally and vertically on the page. This creates a poor user experience as users expect loading indicators to appear at the top of the page, not in the center.

**Current Implementation:**
```tsx
if (authState.isLoading || isLoading) {
  return (
    <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
      <div className="container mx-auto px-space-4 py-space-8">
        <div className="flex items-center justify-center py-space-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 mx-auto mb-space-4 text-airvik-blue" viewBox="0 0 24 24">
              {/* Loading spinner SVG */}
            </svg>
            <p className="text-body text-airvik-black dark:text-airvik-white font-sf-pro">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Expected Implementation:**
```tsx
if (authState.isLoading || isLoading) {
  return (
    <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
      <div className="container mx-auto px-space-4 py-space-8">
        <div className="text-center py-space-4">
          <svg className="animate-spin h-8 w-8 mx-auto mb-space-4 text-airvik-blue" viewBox="0 0 24 24">
            {/* Loading spinner SVG */}
          </svg>
          <p className="text-body text-airvik-black dark:text-airvik-white font-sf-pro">
            Loading your profile...
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Alternative Implementation (Top-aligned with header):**
```tsx
if (authState.isLoading || isLoading) {
  return (
    <div className="min-h-screen bg-airvik-white dark:bg-airvik-midnight">
      <div className="container mx-auto px-space-4 py-space-8">
        {/* Header */}
        <div className="mb-space-8">
          <h1 className="text-h2 text-airvik-black dark:text-airvik-white font-bold">
            Profile Settings
          </h1>
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-2">
            Manage your profile information and preferences
          </p>
        </div>
        
        {/* Loading State */}
        <div className="text-center py-space-8">
          <svg className="animate-spin h-8 w-8 mx-auto mb-space-4 text-airvik-blue" viewBox="0 0 24 24">
            {/* Loading spinner SVG */}
          </svg>
          <p className="text-body text-airvik-black dark:text-airvik-white font-sf-pro">
            Loading your profile...
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Impact:**
- Poor user experience with loading state appearing in unexpected location
- Inconsistent with common UX patterns where loading indicators appear at the top
- Users may think the page is broken or not loading properly
- Creates visual confusion about the page layout and content flow
- Potential accessibility issues for users expecting loading content at the top

**Priority:** Medium
**Status:** Open

#### 12. Profile Edit Page - Duplicate Validation Error Messages

**Issue Description:**
On the profile page, when a user clicks on "Edit Profile", the profile/edit page opens. When the user enters an incorrect name in the Full Name input field (e.g., "rudraffg240"), the error message is already shown by the `ValidationMessage.tsx` component through the `FieldValidation` component.

However, the `ProfileForm.tsx` also shows a "Validation Summary" section that displays the same error messages again, creating duplicate error information for the same validation errors.

**Location:**
- File: `frontend/src/components/profile/ProfileForm.tsx`
- Component: ProfileForm (lines 296-302 and 325)
- File: `frontend/src/components/profile/ValidationMessage.tsx`
- Component: FieldValidation (lines 150-200)

**Root Cause:**
The ProfileForm component implements two different error display mechanisms:
1. **Validation Summary** - A summary box at the top showing all errors in a list format
2. **FieldValidation** - Individual error messages displayed below each specific field

Both mechanisms display the same validation errors from the same validation source, creating redundant error information.

**Current Implementation:**
```tsx
// Validation Summary at the top of the form
{submitAttemptedRef.current && Object.keys(validationErrors).length > 0 && (
  <ValidationSummary 
    errors={validationErrors as Record<string, string>}
    title="Please fix the following errors before saving:"
    maxErrorsToShow={3}
  />
)}

// Individual field validation below each field
<FieldValidation 
  fieldName="fullName"
  error={errors.fullName || validationErrors.fullName}
  isValidating={isValidating}
  className="mt-space-1"
/>
```

**Expected Implementation:**
Choose one of the following approaches to eliminate duplicate error messages:

**Option 1: Remove Validation Summary (Recommended)**
```tsx
// Remove the Validation Summary section entirely
// Keep only the FieldValidation components below each field

{/* Full Name */}
<div>
  <label htmlFor="fullName" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
    Full Name *
  </label>
  <input
    // ... input props
  />
  <FieldValidation 
    fieldName="fullName"
    error={errors.fullName || validationErrors.fullName}
    isValidating={isValidating}
    className="mt-space-1"
  />
</div>
```

**Option 2: Remove FieldValidation Components**
```tsx
// Keep only the Validation Summary
{submitAttemptedRef.current && Object.keys(validationErrors).length > 0 && (
  <ValidationSummary 
    errors={validationErrors as Record<string, string>}
    title="Please fix the following errors before saving:"
    maxErrorsToShow={3}
  />
)}

// Remove FieldValidation components from individual fields
<div>
  <label htmlFor="fullName" className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
    Full Name *
  </label>
  <input
    // ... input props
  />
  {/* Remove FieldValidation component */}
</div>
```

**Option 3: Conditional Display Based on Error Count**
```tsx
// Show Validation Summary only when there are multiple errors
{submitAttemptedRef.current && Object.keys(validationErrors).length > 1 && (
  <ValidationSummary 
    errors={validationErrors as Record<string, string>}
    title="Please fix the following errors before saving:"
    maxErrorsToShow={3}
  />
)}

// Show FieldValidation only when there's a single error or no summary
{Object.keys(validationErrors).length <= 1 && (
  <FieldValidation 
    fieldName="fullName"
    error={errors.fullName || validationErrors.fullName}
    isValidating={isValidating}
    className="mt-space-1"
  />
)}
```

**Impact:**
- Visual clutter with duplicate error messages
- Confusion for users seeing the same error twice
- Poor user experience with redundant information
- Inconsistent error display patterns
- Potential accessibility issues with duplicate error announcements
- Reduced form readability and usability

**Priority:** Medium
**Status:** Open

#### 13. Profile Edit Page - Incorrect Error Styling for Input Fields and Error Messages

**Issue Description:**
In the Profile Information section in profile/edit, if the input field is not filled as required, a border appears. However, when there is an error in the input field, the text color should not turn red, and the background color should also not change.

Also, the design of the error handling shown below the input field is not as expected — it should display only the error message in red text without any additional styling.

**Location:**
- File: `frontend/src/components/profile/ProfileForm.tsx`
- Component: ProfileForm input fields (lines 310-325)
- File: `frontend/src/components/profile/ValidationMessage.tsx`
- Component: ValidationMessage (lines 130-150)

**Root Cause:**
The current implementation applies excessive styling to both input fields and error messages:

1. **Input Field Styling**: When errors occur, input fields get red text color (`text-error`) and red background (`bg-red-50 dark:bg-red-900/20`)
2. **Error Message Styling**: The FieldValidation component uses ValidationMessage which has complex styling with background, border, padding, and icons

**Current Implementation:**
```tsx
// Input field with excessive error styling
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
  ${(errors.fullName || validationErrors.fullName)
    ? 'border-error bg-red-50 dark:bg-red-900/20 text-error' // ❌ Red text and background
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
  }`}

// Error message with complex styling
<FieldValidation 
  fieldName="fullName"
  error={errors.fullName || validationErrors.fullName}
  isValidating={isValidating}
  className="mt-space-1"
/>
```

**Expected Implementation:**
```tsx
// Input field with only border error styling
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue
  ${(errors.fullName || validationErrors.fullName)
    ? 'border-error' // ✅ Only red border, no text color change or focus ring
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
  }`}

// Simple error message with only red text
{errors.fullName || validationErrors.fullName ? (
  <p className="mt-space-1 text-caption text-error">
    {errors.fullName || validationErrors.fullName}
  </p>
) : null}
```

**Alternative Implementation (Using Custom FieldValidation):**
```tsx
// Create a simplified FieldValidation component for profile forms
export function SimpleFieldValidation({
  error,
  className = ''
}: {
  error?: string;
  className?: string;
}) {
  if (!error) return null;
  
  return (
    <p className={`text-caption text-error ${className}`}>
      {error}
    </p>
  );
}

// Usage in ProfileForm
<SimpleFieldValidation 
  error={errors.fullName || validationErrors.fullName}
  className="mt-space-1"
/>
```

**Detailed Changes Required:**

1. **Input Field Styling Changes:**
   - Remove `text-error` class from error state
   - Remove `bg-red-50 dark:bg-red-900/20` classes from error state
   - Keep only `border-error` for visual error indication

2. **Error Message Styling Changes:**
   - Replace `FieldValidation` component with simple error text
   - Remove background, border, padding, and icons from error messages
   - Use only `text-caption text-error` classes

3. **Consistent Error Display:**
   - Apply the same simple error styling across all form fields
   - Ensure error messages appear directly below input fields
   - Maintain consistent spacing and typography

**Impact:**
- Poor user experience with excessive visual noise from red text and backgrounds
- Inconsistent error styling that doesn't match design expectations
- Overly complex error messages that distract from the main form
- Reduced form readability and usability
- Potential accessibility issues with excessive color changes
- Non-compliance with design system guidelines

**Priority:** Medium
**Status:** Open

#### 14. Profile Edit Page - Continuous Validation Loading Indicator on Full Name Field

**Issue Description:**
On the Profile Information section in profile/edit, after filling the Full Name input field, when the user starts filling the Bio textarea, the "Validating..." message with a loading indicator continues to display under the Full Name input field without stopping.

This issue is coming from the `utils/profileValidation.ts` validation logic and how it's being used in the `useProfileValidation` hook.

**Location:**
- File: `frontend/src/utils/profileValidation.ts`
- Component: validateProfileData function (lines 320-380)
- File: `frontend/src/hooks/useProfileValidation.ts`
- Component: validateField function (lines 75-110)
- File: `frontend/src/components/profile/ProfileForm.tsx`
- Component: FieldValidation usage (line 325)

**Root Cause:**
The issue stems from the validation logic in the `useProfileValidation` hook. When validating a single field (like "bio"), the `validateField` function creates a partial data object and calls `validateProfileData`, but the validation functions are designed to work with complete data objects.

The problem occurs because:
1. The `validateField` function creates a partial object: `{ [fieldName]: value }`
2. The `validateProfileData` function validates all fields in the provided data
3. When validating "bio", it might incorrectly trigger validation for "fullName" because the partial object doesn't contain the fullName value
4. This causes the validation state to remain active for the fullName field even when the user is typing in the bio field

**Current Implementation:**
```tsx
// In useProfileValidation.ts - validateField function
const validateField = useCallback((fieldName: keyof ProfileUpdateRequest, value: any) => {
  // ... debounce logic ...
  
  debounceTimeoutRef.current = setTimeout(() => {
    // ❌ Problem: Creates partial data object
    const partialData = { [fieldName]: value } as Partial<ProfileUpdateRequest>;
    const fieldErrors = validateProfileData(partialData as ProfileUpdateRequest);
    
    setErrors((prevErrors: ProfileValidationErrors) => {
      const newErrors = { ...prevErrors };
      
      // ❌ Problem: This logic affects other fields
      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }
      
      return newErrors;
    });
  }, debounceMs);
}, [enableRealTimeValidation, debounceMs]);

// In profileValidation.ts - validateProfileData function
export function validateProfileData(data: ProfileUpdateRequest): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};

  // ❌ Problem: Always validates fullName even when validating other fields
  const fullNameValidation = validateFullName(data.fullName);
  if (!fullNameValidation.isValid) {
    errors.fullName = fullNameValidation.error;
  }
  
  // ... other field validations ...
}
```

**Expected Implementation:**
```tsx
// Option 1: Field-specific validation functions
const validateField = useCallback((fieldName: keyof ProfileUpdateRequest, value: any) => {
  if (!enableRealTimeValidation) return;

  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }

  debounceTimeoutRef.current = setTimeout(() => {
    if (validationInProgressRef.current) return;
    
    validationInProgressRef.current = true;
    setIsValidating(true);

    // ✅ Solution: Use field-specific validation
    let fieldError: string | undefined;
    
    switch (fieldName) {
      case 'fullName':
        const fullNameValidation = validateFullName(value);
        fieldError = fullNameValidation.isValid ? undefined : fullNameValidation.error;
        break;
      case 'bio':
        const bioValidation = validateBio(value);
        fieldError = bioValidation.isValid ? undefined : bioValidation.error;
        break;
      case 'mobileNumber':
        const mobileValidation = validateMobileNumber(value);
        fieldError = mobileValidation.isValid ? undefined : mobileValidation.error;
        break;
      // ... other field cases
      default:
        fieldError = undefined;
    }

    setErrors((prevErrors: ProfileValidationErrors) => {
      const newErrors = { ...prevErrors };
      
      if (fieldError) {
        newErrors[fieldName] = fieldError;
      } else {
        delete newErrors[fieldName];
      }
      
      return newErrors;
    });

    setIsValidating(false);
    validationInProgressRef.current = false;
  }, debounceMs);
}, [enableRealTimeValidation, debounceMs]);
```

**Alternative Implementation (Option 2):**
```tsx
// Create individual validation functions for each field
const validateField = useCallback((fieldName: keyof ProfileUpdateRequest, value: any) => {
  if (!enableRealTimeValidation) return;

  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }

  debounceTimeoutRef.current = setTimeout(() => {
    if (validationInProgressRef.current) return;
    
    validationInProgressRef.current = true;
    setIsValidating(true);

    // ✅ Solution: Use individual validation functions
    const validationFunctions = {
      fullName: validateFullName,
      bio: validateBio,
      mobileNumber: validateMobileNumber,
      dateOfBirth: validateDateOfBirth,
      gender: validateGender,
      nationality: validateNationality,
      occupation: validateOccupation,
      website: validateWebsite,
      location: validateLocation
    };

    const validationFn = validationFunctions[fieldName];
    if (validationFn) {
      const result = validationFn(value);
      const fieldError = result.isValid ? undefined : result.error;

      setErrors((prevErrors: ProfileValidationErrors) => {
        const newErrors = { ...prevErrors };
        
        if (fieldError) {
          newErrors[fieldName] = fieldError;
        } else {
          delete newErrors[fieldName];
        }
        
        return newErrors;
      });
    }

    setIsValidating(false);
    validationInProgressRef.current = false;
  }, debounceMs);
}, [enableRealTimeValidation, debounceMs]);
```

**Detailed Changes Required:**

1. **Fix validateField Function:**
   - Replace the partial data object approach with field-specific validation
   - Use individual validation functions for each field type
   - Ensure validation only affects the specific field being validated

2. **Update Validation Logic:**
   - Remove dependency on `validateProfileData` for single field validation
   - Create a mapping of field names to their respective validation functions
   - Ensure validation state is properly cleared for each field

3. **Improve Error State Management:**
   - Clear validation state when switching between fields
   - Ensure `isValidating` state is properly reset for each field
   - Prevent cross-field validation interference

**Impact:**
- Poor user experience with continuous loading indicators
- Confusion about which field is actually being validated
- Inconsistent validation behavior across form fields
- Potential performance issues with unnecessary validation calls
- Reduced form usability and accessibility
- Misleading visual feedback to users

**Priority:** High
**Status:** Open

#### 15. Profile Edit Page - Mobile Number Not Displaying in ProfileCard After Save

**Issue Description:**
On the profile/edit page, under Profile Information, when a mobile number is entered into the Mobile Number input field and the Save Changes button is clicked, the number does not appear in the Contact Information section of the ProfileCard component on the /profile page under Profile Settings.

**Location:**
- File: `frontend/src/components/profile/ProfileCard.tsx`
- Component: ProfileCard Contact Information section (lines 165-175)
- File: `frontend/src/components/profile/ProfileForm.tsx`
- Component: ProfileForm mobile number field (lines 330-350)

**Root Cause:**
The mobile number display in the ProfileCard is conditional on two factors:
1. `profile.privacy.showPhone` must be true
2. `profile.mobileNumber` must exist

The issue is that when a user saves a mobile number through the ProfileForm, the privacy setting `showPhone` might not be automatically enabled, causing the mobile number to be saved but not displayed.

**Current Implementation:**
```tsx
// In ProfileCard.tsx - Conditional display based on privacy settings
{profile.privacy.showPhone && profile.mobileNumber && (
  <div className="flex items-center space-x-space-2">
    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
    <span className="text-body text-gray-700 dark:text-gray-300">
      {profile.mobileNumber}
    </span>
  </div>
)}
```

**Expected Implementation:**
The mobile number should be displayed when it exists, regardless of privacy settings, or the privacy setting should be automatically updated when a mobile number is saved.

**Option 1: Display mobile number when it exists (Recommended)**
```tsx
// Remove privacy condition, only check if mobile number exists
{profile.mobileNumber && (
  <div className="flex items-center space-x-space-2">
    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
    <span className="text-body text-gray-700 dark:text-gray-300">
      {profile.mobileNumber}
    </span>
  </div>
)}
```

**Option 2: Auto-enable privacy setting when mobile number is saved**
```tsx
// In ProfileForm.tsx - Update privacy settings when mobile number is saved
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing validation logic ...
  
  const updateData: ProfileUpdateRequest = {
    // ... other fields ...
    mobileNumber: formData.mobileNumber.trim() || undefined,
  };

  // If mobile number is being added, also update privacy settings
  if (formData.mobileNumber.trim() && !initialData?.mobileNumber) {
    // Auto-enable showPhone privacy setting
    await UserProfileService.updatePrivacy({
      showPhone: true
    });
  }

  const response = await UserProfileService.updateProfile(updateData);
  // ... rest of submission logic ...
};
```

**Option 3: Show mobile number with privacy indicator**
```tsx
{profile.mobileNumber && (
  <div className="flex items-center space-x-space-2">
    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
    <span className="text-body text-gray-700 dark:text-gray-300">
      {profile.mobileNumber}
    </span>
    {!profile.privacy.showPhone && (
      <span className="text-caption text-gray-500 dark:text-gray-400">
        (Private)
      </span>
    )}
  </div>
)}
```

**Detailed Changes Required:**

1. **ProfileCard Component Changes:**
   - Remove the `profile.privacy.showPhone` condition from mobile number display
   - Or add a visual indicator when the number is private
   - Ensure mobile number displays when it exists

2. **ProfileForm Component Changes:**
   - Optionally auto-enable privacy setting when mobile number is saved
   - Provide user feedback about privacy implications
   - Update privacy settings alongside profile data

3. **User Experience Improvements:**
   - Add a note in the ProfileForm about privacy settings
   - Provide a link to privacy settings when mobile number is saved
   - Show a success message indicating the number was saved

**Impact:**
- Poor user experience when saved data doesn't appear
- Confusion about whether the mobile number was actually saved
- Inconsistent behavior between saving and displaying profile data
- Users may think the save operation failed
- Reduced trust in the application's data persistence
- Potential support requests about "lost" data

**Priority:** Medium
**Status:** Open

#### 16. Profile Edit Page - Profile Not Updating After Save Changes

**Issue Description:**
On the profile/edit page, under Profile Information, when a user updates any field and clicks the "Save Changes" button, no changes are reflected in the profile. 

For example: In the Location input field under profile/edit, when a user removes the previously entered location and chooses not to enter any new location, then clicks the "Save Changes" button, the profile does not get updated — the removed location was not cleared. It should have updated the profile and removed the location value.

**Location:**
- File: `frontend/src/app/profile/edit/page.tsx`
- Component: EditProfilePage handleSuccess function (line 67)
- File: `frontend/src/app/profile/page.tsx`
- Component: ProfilePage data loading and caching
- File: `frontend/src/components/profile/ProfileForm.tsx`
- Component: ProfileForm handleSubmit function (lines 201-250)

**Root Cause:**
The issue occurs due to a data synchronization problem between the edit page and the main profile page:

1. **Successful Update**: The ProfileForm successfully submits the data to the backend, and the backend correctly updates the database (setting empty fields to `null`)
2. **Redirect Issue**: After successful submission, the `handleSuccess` function redirects the user to `/profile` page
3. **Cached Data**: The profile page uses cached data and doesn't automatically refresh to show the updated information
4. **No Data Refresh**: There's no mechanism to invalidate or refresh the cached profile data after a successful update

**Current Implementation:**
```tsx
// In EditProfilePage - handleSuccess function
const handleSuccess = () => {
  router.push('/profile'); // ❌ Problem: Redirects without refreshing data
};

// In ProfilePage - uses cached data without refresh mechanism
const loadProfile = async () => {
  // ... loads profile data but doesn't refresh after updates
};
```

**Expected Implementation:**
The profile page should automatically refresh its data after a successful profile update, or the edit page should pass updated data to the profile page.

**Option 1: Refresh Profile Data After Redirect (Recommended)**
```tsx
// In EditProfilePage - handleSuccess function
const handleSuccess = () => {
  // Add a query parameter to indicate data should be refreshed
  router.push('/profile?refresh=true');
};

// In ProfilePage - check for refresh parameter
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const shouldRefresh = urlParams.get('refresh') === 'true';
  
  if (shouldRefresh) {
    // Force refresh of profile data
    loadProfile();
    // Clean up the URL
    router.replace('/profile');
  } else {
    loadProfile();
  }
}, []);
```

**Option 2: Use React Context for Profile Data Management**
```tsx
// Create a ProfileContext to manage profile data globally
const ProfileContext = createContext<{
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
}>({
  profile: null,
  refreshProfile: async () => {}
});

// In EditProfilePage - refresh profile data before redirect
const handleSuccess = async () => {
  // Refresh profile data in context
  await refreshProfile();
  router.push('/profile');
};
```

**Option 3: Use SWR or React Query for Automatic Cache Invalidation**
```tsx
// Use SWR for automatic cache management
const { data: profile, mutate } = useSWR('/api/user/profile', fetcher);

// In EditProfilePage - invalidate cache after update
const handleSuccess = async () => {
  // Invalidate and refetch profile data
  await mutate();
  router.push('/profile');
};
```

**Detailed Changes Required:**

1. **EditProfilePage Changes:**
   - Modify `handleSuccess` function to trigger data refresh
   - Add mechanism to pass refresh signal to profile page
   - Ensure profile data is updated before redirect

2. **ProfilePage Changes:**
   - Add logic to detect when data should be refreshed
   - Implement automatic data refresh mechanism
   - Handle URL parameters for refresh signals

3. **Data Synchronization:**
   - Implement proper cache invalidation
   - Ensure consistent data across pages
   - Add loading states during data refresh

**Impact:**
- Poor user experience when saved changes don't appear
- Confusion about whether the save operation was successful
- Users may think the application is broken or not working
- Inconsistent data display across different pages
- Reduced trust in the application's data persistence
- Potential support requests about "lost" updates
- Users may attempt to save the same data multiple times

**Priority:** High
**Status:** Open

#### 17. Profile Connections Page - Google OAuth Connection Not Working

**Issue Description:**
When users go to profile/connections under Connected Accounts and click on "Connect Google Account", it should allow them to log in using Google. If the user does not want to log in using email or password and directly clicks on Connect Google Account, they should be able to log in via their Gmail account using Google authentication.

Currently, the "Connect Google Account" button uses a mock implementation that doesn't actually implement Google OAuth authentication.

**Location:**
- File: `frontend/src/components/profile/ConnectedAccounts.tsx`
- Component: ConnectedAccounts handleConnectGoogle function (lines 67-95)
- File: `frontend/src/components/auth/GoogleOAuthButton.tsx`
- Component: GoogleOAuthButton (complete implementation)

**Root Cause:**
The `ConnectedAccounts` component has a mock implementation for Google OAuth that doesn't actually implement real Google authentication:

1. **Mock Implementation**: The `handleConnectGoogle` function uses a mock token instead of real Google OAuth
2. **Missing OAuth Flow**: No actual Google OAuth popup or authentication flow is implemented
3. **Existing Component**: There's already a proper `GoogleOAuthButton` component with real Google OAuth implementation that's not being used

**Current Implementation:**
```tsx
// In ConnectedAccounts.tsx - Mock implementation
const handleConnectGoogle = async () => {
  // This would typically open a Google OAuth popup
  // For now, we'll simulate the process
  setIsConnecting(true);
  
  try {
    // In a real implementation, this would:
    // 1. Open Google OAuth popup
    // 2. Get the authorization code
    // 3. Exchange code for token
    // 4. Call the connect API
    
    // ❌ Problem: Using mock token instead of real OAuth
    const mockGoogleToken = 'mock_google_token_' + Date.now();
    
    const response = await UserProfileService.connectGoogle(mockGoogleToken);
    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
};
```

**Expected Implementation:**
The "Connect Google Account" button should use the existing `GoogleOAuthButton` component or implement proper Google OAuth flow.

**Option 1: Use Existing GoogleOAuthButton Component (Recommended)**
```tsx
// In ConnectedAccounts.tsx - Replace button with GoogleOAuthButton
import GoogleOAuthButton from '../auth/GoogleOAuthButton';

// Replace the existing button with:
<GoogleOAuthButton
  onSuccess={async (user, tokens) => {
    try {
      const response = await UserProfileService.connectGoogle(tokens.accessToken);
      if (isSuccessResponse(response)) {
        showSuccess('Google account connected successfully');
        onSuccess?.();
        await loadProfileData();
      } else {
        const errorMessage = UserProfileService.getErrorMessage(response.code || 'GOOGLE_CONNECTION_FAILED');
        showError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (error) {
      showError('Failed to connect Google account. Please try again.');
      onError?.('Failed to connect Google account. Please try again.');
    }
  }}
  onError={(error) => {
    showError(error);
    onError?.(error);
  }}
  linkToEmail={profileData?.email} // For account linking
  className="px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-button
    transition-all duration-normal hover:bg-airvik-purple hover:shadow-lg hover:-translate-y-1 
    active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
/>
```

**Option 2: Implement Custom Google OAuth Flow**
```tsx
// In ConnectedAccounts.tsx - Implement real OAuth flow
const handleConnectGoogle = async () => {
  setIsConnecting(true);
  
  try {
    // Check if Google client ID is configured
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId === 'your-google-client-id') {
      throw new Error('Google OAuth is not configured');
    }

    // Initialize Google OAuth client
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response: any) => {
        try {
          const googleToken = response.credential;
          const authResponse = await UserProfileService.connectGoogle(googleToken);
          
          if (isSuccessResponse(authResponse)) {
            showSuccess('Google account connected successfully');
            onSuccess?.();
            await loadProfileData();
          } else {
            const errorMessage = UserProfileService.getErrorMessage(authResponse.code || 'GOOGLE_CONNECTION_FAILED');
            showError(errorMessage);
            onError?.(errorMessage);
          }
        } catch (error) {
          showError('Failed to connect Google account. Please try again.');
          onError?.('Failed to connect Google account. Please try again.');
        } finally {
          setIsConnecting(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Show Google sign-in prompt
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setIsConnecting(false);
        showError('Google sign-in prompt could not be displayed. Please try again.');
      }
    });
  } catch (error) {
    setIsConnecting(false);
    showError('Failed to initialize Google authentication. Please try again.');
    onError?.('Failed to initialize Google authentication. Please try again.');
  }
};
```

**Detailed Changes Required:**

1. **Replace Mock Implementation:**
   - Remove the mock Google token generation
   - Implement real Google OAuth flow
   - Use the existing `GoogleOAuthButton` component or implement custom OAuth

2. **Environment Configuration:**
   - Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is properly configured
   - Add Google OAuth script loading if not using existing component

3. **Error Handling:**
   - Handle OAuth initialization failures
   - Handle user cancellation of OAuth flow
   - Provide clear error messages for different failure scenarios

4. **User Experience:**
   - Show proper loading states during OAuth flow
   - Handle OAuth popup blocking scenarios
   - Provide fallback options if OAuth fails

**Impact:**
- Users cannot actually connect their Google accounts
- The feature appears to work but doesn't function properly
- Poor user experience with misleading functionality
- Users may think the application is broken
- Reduced trust in the application's capabilities
- Potential support requests about non-working features

**Priority:** High
**Status:** Open

#### 18. Forgot Password Page - Unwanted Focus Ring and Red Text Color on Error State

**Issue Description:**
When the user clicks on the Send Reset Link button on the forgot-password page without filling the Email Address input field, a red border is shown on the input field — which is correct. However, when an error exists, a ring appears on focus or click, which should not happen. Also, when there is an error, the text color turns red, which should not happen either.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: Email input field (lines 195-205)

**Root Cause:**
The email input field has focus ring styling (`focus:ring-2 focus:ring-airvik-blue`) that appears even when there's an error, and the error state includes red text color (`text-error`) which should not be applied to input text.

**Current Implementation:**
```tsx
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none
  ${errors.email 
    ? 'border-error' // ❌ Red text and focus ring
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
  }`}
```

**Expected Implementation:**
```tsx
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none
  ${errors.email 
    ? 'border-error' // ✅ Only red border, no text color change or focus ring
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500'
  }`}
```

**Impact:**
- Poor user experience with unwanted focus rings during error states
- Inconsistent visual feedback with red text color
- Confusion about input field state and validation
- Reduced accessibility and visual clarity
- Non-compliance with design system guidelines for error states

**Priority:** Medium
**Status:** Complete

#### 19. Forgot Password Page - Focus Ring Appears on Error State When Field is Focused

**Issue Description:**
When the Email Address input field already has an error (meaning a red border and an error message are shown below the field), if the field is clicked or focused while the error is present, the `focus:ring-airvik-blue` should not be shown on the input field.

**Location:**
- File: `frontend/src/app/auth/forgot-password/page.tsx`
- Component: Email input field (lines 195-205)

**Root Cause:**
The current implementation applies `focus:ring-2 focus:ring-airvik-blue` in the non-error state, but when the field is focused while in an error state, the focus ring still appears because the focus styles are not properly conditional.

**Current Implementation:**
```tsx
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none
  ${errors.email 
    ? 'border-error' 
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-airvik-blue'
  }`}
```

**Expected Implementation:**
```tsx
className={`w-full px-space-4 py-space-3 border rounded-radius-md font-sf-pro text-body
  transition-colors duration-normal focus:outline-none
  ${errors.email 
    ? 'border-error focus:ring-0' // ✅ Explicitly disable focus ring in error state
    : 'border-gray-300 dark:border-gray-600 bg-airvik-white dark:bg-gray-800 text-airvik-black dark:text-airvik-white hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-airvik-blue'
  }`}
```

**Impact:**
- Poor user experience with conflicting visual feedback (red border + blue focus ring)
- Confusion about field state and validation status
- Inconsistent focus behavior during error states
- Reduced visual clarity and accessibility
- Non-compliance with design system guidelines for error states

**Priority:** Medium
**Status:** Complete

#### 20. Profile Page - Loading State Not Centered on Screen

**Issue Description:**
On the /profile page, the loading state currently appears at the top of the page. However, it should be centered both vertically and horizontally on the screen, to provide a better user experience during loading.

**Location:**
- File: `frontend/src/app/profile/page.tsx`
- Component: Loading state section (lines 50-60)

**Root Cause:**
The current loading state implementation shows the header first, then the loading indicator below it, which positions the loading state at the top of the page instead of centering it on the entire screen.

**Current Implementation:**
```tsx
{isLoading && (
  <div className="mt-space-8">
    <div className="flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-airvik-blue border-t-transparent rounded-radius-full mr-space-3" />
      <span className="text-body font-sf-pro text-gray-600 dark:text-gray-400">
        Loading your profile...
      </span>
    </div>
  </div>
)}
```

**Expected Implementation:**
```tsx
{isLoading && (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-airvik-blue border-t-transparent rounded-radius-full mr-space-3" />
      <span className="text-body font-sf-pro text-gray-600 dark:text-gray-400">
        Loading your profile...
      </span>
    </div>
  </div>
)}
```

**Fix Required:**
- Add `min-h-[60vh]` to create vertical space for centering
- Keep `flex items-center justify-center` for proper centering
- Remove the `mt-space-8` class that pushes content to the top

**Priority:** Medium
**Status:** Complete

#### 21. Profile Edit Page - Loading State Not Centered on Screen

**Issue Description:**
When refreshing the /profile/edit page, the loading state currently appears at the top of the screen. However, it should appear centered on the screen—both vertically and horizontally.

**Location:**
- File: `frontend/src/app/profile/edit/page.tsx`
- Component: Loading state section

**Root Cause:**
The current loading state implementation shows the header first, then the loading indicator below it, which positions the loading state at the top of the page instead of centering it on the entire screen.

**Current Implementation:**
```tsx
{isLoading && (
  <div className="mt-space-8">
    <div className="flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-airvik-blue border-t-transparent rounded-radius-full mr-space-3" />
      <span className="text-body font-sf-pro text-gray-600 dark:text-gray-400">
        Loading your profile...
      </span>
    </div>
  </div>
)}
```

**Expected Implementation:**
```tsx
{isLoading && (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-airvik-blue border-t-transparent rounded-radius-full mr-space-3" />
      <span className="text-body font-sf-pro text-gray-600 dark:text-gray-400">
        Loading your profile...
      </span>
    </div>
  </div>
)}
```

**Fix Required:**
- Add `min-h-[60vh]` to create vertical space for centering
- Keep `flex items-center justify-center` for proper centering
- Remove the `mt-space-8` class that pushes content to the top

**Priority:** Medium
**Status:** Open