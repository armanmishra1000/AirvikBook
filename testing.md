# Visual Testing Documentation

## Overview
This document contains visual testing documentation for the Hotel Management System features.

## Testing Tasks

### 1. User Registration
**Status**: Done  
**Feature**: Guest account creation with email, password, full name, mobile number, Google/Gmail social registration, email verification, password strength validation, terms and conditions acceptance, welcome email automation, automatic profile picture from Google account.

### 2. User Login & Session Management  
**Status**: Done  
**Feature**: Email/password authentication, Google/Gmail OAuth login, JWT token generation and validation, remember me functionality, session timeout handling, multi-device session management, account merging for social + email accounts.

---

## Registration Page Testing

### Form Layout Issues

**File Location**: `AirvikBook/frontend/src/app/auth/register/page.tsx` (lines 75-95)

**Issue 1**: "Already have an account? Sign in here" Text Placement
- **Current State**: This text is currently placed outside the form, below the Create Account button in the footer section.
- **Expected State**: This text should be placed inside the form, below the "Create Account" button.
- **Action Required**: Remove this text from the footer section (lines 75-82) and ensure it's properly placed inside the RegistrationForm component.

**Issue 2**: "By signing up, you agree to our Terms of Service and Privacy Policy" Text Placement  
- **Current State**: This text is currently placed outside the form, at the bottom of the page in the footer section (lines 84-95).
- **Expected State**: This text should be placed inside the form, below the "Create Account" button and after the "Already have an account? Sign in here" line.
- **Action Required**: Remove this text from the footer section (lines 84-95) and ensure it's properly placed inside the RegistrationForm component in the correct order.

**Note**: Both text elements are currently in the page.tsx file's footer section but should be moved into the RegistrationForm component for proper form structure and user experience.

### Error Message Display Consistency

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`

**Issue Description**: Inconsistent Error Message Display for Form Fields

- **Current State**: When an invalid email address is entered (e.g., a single digit '5'), the validation error message "Please include an '@' in the email address. '5' is missing an '@'." is displayed within a distinct tooltip-like box. This box features an orange exclamation mark icon and appears directly below the email input field.

- **Expected State**: This display format for the email error message is inconsistent with other validation errors on the form, such as "Full name is required" and "Password is required," which appear as simple red text directly below their respective input fields. All form validation error messages should adhere to a consistent visual style, ideally matching the inline red text format observed for other required fields. The tooltip-like display for the email error should be updated to align with this consistent styling.

- **Correct Implementation Reference**: Error messages for form fields (e.g., "Email is required", "Full name is required", "Password is required") should:
  1. Appear as red text directly below the corresponding input field.
  2. Be accompanied by a red border around the input field itself.
  3. Maintain a uniform visual language across all validation errors.

### Password Tips Message Display Issue

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`

**Issue Description**: Unwanted Password Tips Message Display

- **Current State**: When a user types in the "Password" field, a blue informational message box appears below the password requirements section. This message box contains a white 'i' icon within a blue circle, followed by the text "Tip: Use a mix of uppercase and lowercase letters, numbers, and special characters for a stronger password." This tip message appears dynamically when the user interacts with the password field.

- **Expected State**: This password tips message should not be displayed on the registration page. The message is unnecessary and creates visual clutter since the password requirements are already clearly listed above it with green checkmarks indicating which criteria have been met.

- **Action Required**: Remove the password tips message box entirely from the registration form. The password strength indicator and password requirements list should remain, but the additional tip message should be eliminated to maintain a cleaner, less cluttered user interface.

### Password Requirements Visibility Behavior Issue

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`

**Issue Description**: Password Requirements Section Display Timing

- **Current State**: The "Password Requirements:" section is currently visible by default on the registration form, appearing immediately below the password field even when the user has not started typing in the password field. This section lists five requirements (at least 8 characters long, contains uppercase letter, contains lowercase letter, contains number, contains special character) with gray circular bullet points indicating they are not yet met.

- **Expected State**: The "Password Requirements:" section should only appear when the user starts typing in the password field. It should remain hidden by default when the form loads. Once the user begins entering text in the password field, the requirements section should become visible to guide the user. After the password input is complete and all requirements are met, the entire "Password Requirements:" section should disappear to reduce visual clutter.

- **Action Required**: Implement conditional rendering logic for the password requirements section. The section should be hidden by default, shown only when the password field has focus or contains text, and hidden again when the password meets all requirements or the field loses focus without valid input.

### Terms and Conditions and Privacy Policy Links 404 Error

**File Location**: `AirvikBook/frontend/src/app/auth/register/page.tsx` (lines 84-95) and `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx`

**Issue Description**: Broken Links to Legal Pages

- **Current State**: On the registration page, there are two clickable links: "Terms of Service" and "Privacy Policy". When users click on the "Terms of Service" link, it attempts to navigate to "/terms" but displays a "404 Page Not Found" error. Similarly, when users click on the "Privacy Policy" link, it attempts to navigate to "/privacy" but also displays a "404 Page Not Found" error. These links are present in both the page footer and potentially within the registration form component.

- **Expected State**: When users click on the "Terms of Service" link, it should successfully navigate to a properly functioning Terms of Service page that displays the hotel's terms and conditions in a readable format. When users click on the "Privacy Policy" link, it should successfully navigate to a properly functioning Privacy Policy page that displays the hotel's privacy policy information. Both pages should be accessible and contain the appropriate legal content.

- **Action Required**: Create the missing Terms of Service page at the "/terms" route and the missing Privacy Policy page at the "/privacy" route. These pages should contain the actual legal content for the hotel management system. Alternatively, if these pages exist but are at different routes, update the href attributes in the registration components to point to the correct URLs.

### Create Account Button Text Alignment During Loading

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (around lines 474-490)

**Issue Description**: Button Text Alignment Shift During Loading State

- **Current State**: When all form fields are filled correctly and the user clicks the "Create Account" button, the button enters a loading state. During this loading state, the button displays a circular loading spinner on the left side and the text "CREATING ACCOUNT..." to the right of the spinner. However, the text appears to be left-aligned within the button rather than properly centered, creating a visual imbalance and poor user experience.

- **Expected State**: When the button is in the loading state, the combination of the loading spinner and the "CREATING ACCOUNT..." text should remain centered within the button. The spinner and text should be positioned together as a centered unit, maintaining visual balance and providing a professional appearance during the account creation process.

- **Action Required**: Update the button's CSS styling to ensure that when the loading state is active, the flex container properly centers both the spinner and text as a combined unit. The button should use flexbox properties like `justify-center` and `items-center` to maintain proper centering regardless of the content being displayed.

### Password Visibility Toggle Icon Display Issue

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (password field section)

**Issue Description**: Eye Icon Appears Cut Off When Toggling Password Visibility

- **Current State**: In the password input field, there is an eye icon positioned on the right side that allows users to toggle password visibility. When users click this eye icon to hide the password (show masked characters), the icon appears to be cut off or not fully visible. The icon appears cropped or partially hidden, making it difficult for users to clearly see the current state of the password visibility toggle.

- **Expected State**: The eye icon should display fully and clearly at all times when toggling between password visibility states. When the password is visible, the icon should show the "eye-off" or "hide" state completely. When the password is hidden, the icon should show the "eye" or "show" state completely. The icon should be properly positioned within the input field's right padding area without any clipping or cropping issues.

  - **Action Required**: Review the CSS styling for the password input field and the eye icon positioning. Ensure the icon has sufficient space within the input field's padding area and that it is not being clipped by overflow properties or insufficient container dimensions. The icon should be properly sized and positioned to remain fully visible in both toggle states.

### Terms Consent Checkbox Extra Border Issue

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (around lines 437-471)

**Issue Description**: Extra Border/Outline Appears Around Checkbox When Selected

- **Current State**: When the user selects the "I agree to the Terms and Conditions and Privacy Policy" checkbox, an additional outer border or outline becomes visible around the checkbox control, in addition to its normal border. The extra outline appears upon selection and persists while the checkbox has focus, creating a double-border effect that is visually inconsistent with the rest of the UI.

  - **Expected State**: Selecting the checkbox should not render any extra outer border or outline. Only the standard checkbox styling should be visible in both checked and focused states, maintaining a clean, single-border appearance consistent with the design system.

### Toast Notifications for Registration Messages

**File Location**: `AirvikBook/frontend/src/components/auth/RegistrationForm.tsx` (submission and error handling around lines 181-214; inline general error rendering around lines 254-256) and `AirvikBook/frontend/src/app/auth/register/page.tsx` (success handling in `handleRegistrationSuccess`).

**Issue Description**: Inconsistent Use of Toast Notifications for User Messages

- **Current State**: Feedback messages during registration are not consistently displayed as toast notifications. For example, general errors are rendered inline within the form (e.g., setting `errors.general` and rendering it below the divider), while success feedback is shown as an in-card success state. Warning or other informational messages may also appear inline. This inconsistency leads to mixed UX patterns where some messages interrupt the layout while others use different presentation styles.

- **Expected State**: All user-facing feedback messages related to registration — including error, success, and warning messages — should be displayed as toast notifications. Messages should not be rendered inline within the form or as embedded banners/cards. Using a unified toast system ensures consistent visibility, non-blocking interaction, and alignment with the design system for transient feedback.

*Additional testing content will be added as provided.*


### Post-Registration Sensitive Data Logging Issue

**File Location**: `AirvikBook/frontend/src/app/auth/register/page.tsx` (function `handleRegistrationSuccess`, lines 19-23)

**Issue Description**: User Email Logged After Successful Registration

- **Current State**: After the form is submitted and registration succeeds, the success handler logs the returned `user` object and `tokens` using a console logging statement. This results in the registered user’s email address being written to browser developer tools logs.

- **Expected State**: No sensitive user information — including email addresses, authentication tokens, or any personally identifiable information — should be logged to the console or any application logs in any environment (development, staging, or production). Logging should be limited to non-sensitive operational messages.

*Additional testing content will be added as provided.*



 
## Login Page Testing

### Login Page – Issues to Fix

1. Duplicate "Don't have an account? Sign up for free" text outside the form

**Location**: `AirvikBook/frontend/src/app/auth/login/page.tsx` (footer links section, lines 100-109) and inside the form at `AirvikBook/frontend/src/components/auth/LoginForm.tsx` (lines 366-376)

**Issue**: The text "Don't have an account? Sign up for free" is displayed twice — once inside the form (below the "Sign In" button) and once outside the form in the page footer section. This duplication is unnecessary and creates visual clutter.

**Expected Behavior**: Display this text only once, inside the form, directly below the "Sign In" button. Remove the duplicate instance that appears outside the form in the page footer.

2. "By signing in, you agree..." positioned incorrectly

**Location**: `AirvikBook/frontend/src/app/auth/login/page.tsx` (footer links section, lines 112-127)

**Issue**: The message "By signing in, you agree to our Terms of Service and Privacy Policy" is currently displayed outside the form in the page footer. It should be logically grouped with the sign-in process inside the form.

**Expected Behavior**: Move this message inside the form, placing it directly below the "Don't have an account? Sign up for free" text and below the "Sign In" button, so it remains contextually tied to the authentication action.

3. Extra border appearing around "Remember me" checkbox

**Location**: `AirvikBook/frontend/src/components/auth/LoginForm.tsx` (around lines 320-330)

**Issue**: When the "Remember me" checkbox is checked or unchecked, an extra border appears outside the checkbox element. This border is unnecessary and visually breaks the design consistency.

**Expected Behavior**: The checkbox should not display any additional border when toggled. The design should remain consistent in both checked and unchecked states, without extra outlines or borders around it.

4. Broken links for "Terms of Service" and "Privacy Policy"

**Location**: `AirvikBook/frontend/src/app/auth/login/page.tsx` (footer links section, lines 112-127)

**Issue**: In the text "By signing in, you agree to our Terms of Service", clicking on "Terms of Service" currently opens a 404 Page Not Found error. In the same line, clicking on "Privacy Policy" also results in a 404 Page Not Found error. This indicates that the routes for these links are either missing or incorrectly configured.

**Expected Behavior**: Clicking "Terms of Service" should navigate to the Terms of Service page. Clicking "Privacy Policy" should navigate to the Privacy Policy page. Both links must be connected to their respective valid routes so that the correct content is displayed.

5. Login Form Validation Error Message Styling Inconsistency

**Location**: `AirvikBook/frontend/src/components/auth/LoginForm.tsx` (validation error rendering around lines 180-200)

**Issue**: When the login form is submitted without filling required fields, validation error messages are displayed in an inconsistent style. Currently, error messages appear in orange speech bubble-like boxes with rounded corners, featuring a circular orange icon containing a white exclamation mark, followed by the error text. This styling is inconsistent with the registration form's error message format and creates visual inconsistency across the authentication system.

**Expected Behavior**: Login form validation error messages should match the registration form's error message styling. Error messages should appear as simple red text directly below the corresponding input field, accompanied by a red border around the input field itself. The error messages should not use speech bubble containers, icons, or colored backgrounds, but should maintain the clean, inline red text format consistent with the registration form validation errors.