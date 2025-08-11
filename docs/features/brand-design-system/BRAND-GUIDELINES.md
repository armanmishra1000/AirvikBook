# AirVikBook Brand Design System

## 🎨 Brand Identity

### Core Brand Principles
1. **Efficiently Elegant** - Every interface element serves a purpose while maintaining visual sophistication
2. **Professionally Approachable** - Balance corporate reliability with warm hospitality
3. **Intuitively Seamless** - Natural user flows that feel effortless

### Visual Language
- **Bold & Confident**: Strong typography and decisive color choices
- **Clean & Minimal**: Remove visual clutter, focus on content
- **Dynamic & Modern**: Subtle animations and transitions

## 🎨 Color System

### Primary Colors
```css
:root {
  /* Core Brand Colors */
  --airvik-black: #020A18;          /* Primary text and strong elements */
  --airvik-midnight: #10103C;       /* Dark backgrounds */
  --airvik-purple: #4322AA;         /* Primary brand color */
  --airvik-blue: #133EE3;           /* Interactive elements */
  --airvik-cyan: #68D8FC;           /* Highlights and accents */
  --airvik-violet: #B688FF;         /* Secondary accents */
  --airvik-white: #F8F9FE;          /* Light backgrounds */
}
```

### Secondary Colors
```css
:root {
  /* Supporting Colors */
  --airvik-blue-mid: #006CFF;       /* Secondary buttons */
  --airvik-blue-light: #D1D8FA;     /* Light backgrounds */
  --airvik-cyan-light:rgb(21, 23, 24);     /* Info states */
  --airvik-purple-light: #C58FFF;   /* Hover states */
  --airvik-pink-light: #DECFFF;     /* Subtle backgrounds */
}
```

### Semantic Colors
```css
:root {
  /* Status Colors */
  --status-available: var(--airvik-cyan);
  --status-occupied: var(--airvik-blue);
  --status-maintenance: var(--airvik-violet);
  --status-unavailable: #B12A2A;
  
  /* Feedback Colors */
  --success: #4E7638;
  --warning: #CB7B2B;
  --error: #B12A2A;
  --info: var(--airvik-blue-light);
}
```

### Gradients
```css
:root {
  /* Brand Gradients */
  --gradient-dark-1: linear-gradient(135deg, #020A18 0%, #4322AA 100%);
  --gradient-dark-2: linear-gradient(135deg, #10103C 0%, #133EE3 100%);
  --gradient-mid: linear-gradient(135deg, #4322AA 0%, #68D8FC 100%);
  --gradient-light-1: linear-gradient(135deg, #B688FF 0%, #F8F9FE 100%);
  --gradient-light-2: linear-gradient(135deg, #D1D8FA 0%, #B2ECFF 100%);
  --gradient-light-3: linear-gradient(135deg, #133EE3 0%, #68D8FC 100%);
}
```

### Neutral Colors
```css
:root {
  /* Gray Scale */
  --gray-100: #121624;
  --gray-200: #333747;
  --gray-300: #484F5E;
  --gray-400: #484F5E;
  --gray-500: #888FA3;
  --gray-600: #B0B8CF;
  --gray-700: #D6D6E1;
  --gray-800: #E6E8F7;
  --gray-900: #EFEFFA;
  --gray-950: #F4F4FC;
}
```

## 🔤 Typography System

### Font Families
```css
:root {
  /* Primary Font - Headers & UI */
  --font-primary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  
  /* Secondary Font - Body & Content */
  --font-secondary: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
}
```

### Type Scale
```css
/* Hero & Display */
.text-hero { 
  font-family: var(--font-primary);
  font-size: 72px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-display {
  font-family: var(--font-primary);
  font-size: 60px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Headings */
.text-h1 {
  font-family: var(--font-primary);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.text-h2 {
  font-family: var(--font-primary);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.text-h3 {
  font-family: var(--font-primary);
  font-size: 30px;
  font-weight: 600;
  line-height: 1.3;
}

.text-h4 {
  font-family: var(--font-primary);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.text-h5 {
  font-family: var(--font-primary);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.text-h6 {
  font-family: var(--font-primary);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

/* Body Text */
.text-body-lg {
  font-family: var(--font-secondary);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
}

.text-body {
  font-family: var(--font-secondary);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {
  font-family: var(--font-secondary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

/* UI Elements */
.text-button {
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.text-caption {
  font-family: var(--font-secondary);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}

.text-label {
  font-family: var(--font-secondary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}
```

## 🎯 Design Tokens

### Spacing System
```css
:root {
  /* Base unit: 8px */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

### Border Radius
```css
:root {
  --radius-none: 0;
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

### Shadows
```css
:root {
  /* Elevation System */
  --shadow-xs: 0 1px 2px 0 rgba(2, 10, 24, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(2, 10, 24, 0.1), 0 1px 2px 0 rgba(2, 10, 24, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(2, 10, 24, 0.1), 0 2px 4px -1px rgba(2, 10, 24, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(2, 10, 24, 0.1), 0 4px 6px -2px rgba(2, 10, 24, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(2, 10, 24, 0.1), 0 10px 10px -5px rgba(2, 10, 24, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(2, 10, 24, 0.25);
  
  /* Glow Effects */
  --glow-primary: 0 0 20px rgba(67, 34, 170, 0.4);
  --glow-blue: 0 0 20px rgba(19, 62, 227, 0.4);
  --glow-cyan: 0 0 20px rgba(104, 216, 252, 0.4);
}
```

### Animation & Transitions
```css
:root {
  /* Timing Functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  /* Standard Transitions */
  --transition-base: all var(--duration-normal) var(--ease-in-out);
  --transition-fade: opacity var(--duration-normal) var(--ease-in-out);
  --transition-slide: transform var(--duration-normal) var(--ease-out);
}
```

## 🧩 Component Patterns

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--airvik-blue);
  color: var(--airvik-white);
  font-family: var(--font-primary);
  font-weight: 500;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--airvik-purple);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--airvik-blue);
  border: 2px solid var(--airvik-blue);
  /* ... similar structure */
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--airvik-black);
  /* ... similar structure */
}
```

### Cards
```css
.card {
  background: var(--airvik-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Dark variant */
.card-dark {
  background: var(--airvik-midnight);
  color: var(--airvik-white);
}
```

### Form Elements
```css
.input {
  background: var(--airvik-white);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-secondary);
  transition: var(--transition-base);
}

.input:focus {
  border-color: var(--airvik-blue);
  box-shadow: 0 0 0 3px rgba(19, 62, 227, 0.1);
  outline: none;
}

.input-error {
  border-color: var(--error);
}
```

### Toast Notifications
```css
.toast {
  background: var(--airvik-white);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 300px;
  animation: slideIn var(--duration-normal) var(--ease-out);
}

.toast-success {
  border-left: 4px solid var(--success);
}

.toast-error {
  border-left: 4px solid var(--error);
}

.toast-info {
  border-left: 4px solid var(--airvik-blue);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Modal/Dialog
```css
.modal-backdrop {
  background: rgba(2, 10, 24, 0.8);
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--airvik-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 500px;
  animation: modalIn var(--duration-normal) var(--ease-out);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

## 🎨 Visual Effects

### Gradients & Overlays
```css
/* Text Gradients */
.text-gradient {
  background: var(--gradient-mid);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Background Patterns */
.bg-pattern {
  background-image: 
    radial-gradient(circle at 20% 80%, var(--airvik-blue) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, var(--airvik-purple) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, var(--airvik-cyan) 0%, transparent 50%);
  opacity: 0.05;
}
```

### Interactive States
```css
/* Hover Effects */
.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Focus States */
.interactive:focus-visible {
  outline: 2px solid var(--airvik-blue);
  outline-offset: 2px;
}

/* Active States */
.interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

## 📱 Responsive Design

### Breakpoints
```css
:root {
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Mobile-First Typography
```css
/* Base (Mobile) */
.responsive-heading {
  font-size: 32px;
}

/* Tablet */
@media (min-width: 768px) {
  .responsive-heading {
    font-size: 48px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .responsive-heading {
    font-size: 60px;
  }
}
```

## 🌙 Dark Mode

### Dark Theme Variables
```css
[data-theme="dark"] {
  /* Inverted Colors */
  --airvik-white: #020A18;
  --airvik-black: #F8F9FE;
  
  /* Adjusted Colors */
  --airvik-purple: #6847CC;
  --airvik-blue: #2D5EE8;
  --airvik-cyan: #7BDCFC;
  
  /* Dark Backgrounds */
  --bg-primary: #020A18;
  --bg-secondary: #10103C;
  --bg-elevated: #1A1A3E;
  
  /* Dark Mode Shadows */
  --shadow-sm: 0 1px 3px 0 rgba(248, 249, 254, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(248, 249, 254, 0.1);
}
```

## 🎯 Implementation Guidelines

### 1. Component Creation
- Every component must use design tokens
- No hardcoded colors or sizes
- Always include hover, focus, and active states
- Consider dark mode from the start

### 2. Consistency Rules
- Use semantic color names
- Follow the 8px grid system
- Maintain consistent border radius
- Apply shadows based on elevation

### 3. Animation Principles
- Keep animations under 350ms
- Use ease-out for entering elements
- Use ease-in for exiting elements
- Prefer transform and opacity for performance

### 4. Accessibility
- Minimum contrast ratio: 4.5:1 for normal text
- Focus indicators must be visible
- Interactive elements minimum 44x44px
- Support keyboard navigation

## 📋 Quality Checklist

Before any component is approved:
- [ ] Uses design tokens exclusively
- [ ] Includes all interactive states
- [ ] Works in light and dark modes
- [ ] Meets accessibility standards
- [ ] Follows animation guidelines
- [ ] Responsive across breakpoints
- [ ] Consistent with brand voice
- [ ] Documented with examples