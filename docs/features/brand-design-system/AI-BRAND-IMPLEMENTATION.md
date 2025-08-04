# AI Brand Implementation Guide

## 🤖 How AI Should Apply Brand Guidelines

### Overview
This document ensures AI maintains perfect brand consistency when implementing any feature. Every UI element must follow these guidelines without exception.

## 📋 Pre-Implementation Checklist

Before creating ANY UI component, AI must:

1. **Read Brand Guidelines**
   ```yaml
   mandatory_reads:
     - docs/features/brand-design-system/BRAND-GUIDELINES.md
     - docs/features/brand-design-system/AI-BRAND-IMPLEMENTATION.md
     - docs/features/brand-design-system/COMPONENT-LIBRARY.md
   ```

2. **Import Brand System**
   ```typescript
   // ALWAYS import at the top of every component
   import { brandTokens } from '@/lib/brand/tokens'
   import { brandComponents } from '@/lib/brand/components'
   import { brandUtils } from '@/lib/brand/utils'
   ```

## 🎨 Color Implementation Rules

### NEVER Use Hardcoded Colors
```typescript
// ❌ WRONG - Never do this
<div className="bg-blue-500 text-white">

// ✅ CORRECT - Always use brand tokens
<div className="bg-airvik-blue text-airvik-white">
```

### Color Mapping for Hotel Context
```typescript
// Room Status Colors
const roomStatusColors = {
  available: 'bg-status-available',      // Cyan
  occupied: 'bg-status-occupied',        // Blue
  maintenance: 'bg-status-maintenance',  // Violet
  unavailable: 'bg-status-unavailable'   // Error red
}

// Booking Status Colors
const bookingStatusColors = {
  confirmed: 'text-success',
  pending: 'text-warning',
  cancelled: 'text-error',
  completed: 'text-gray-600'
}
```

## 🔤 Typography Implementation

### Component-Specific Typography
```typescript
// Page Headers
<h1 className="text-h1 text-airvik-black dark:text-airvik-white">
  {title}
</h1>

// Section Headers
<h2 className="text-h2 text-airvik-black dark:text-airvik-white mb-space-6">
  {sectionTitle}
</h2>

// Body Content
<p className="text-body text-gray-700 dark:text-gray-300">
  {content}
</p>

// UI Labels
<label className="text-label text-gray-600 dark:text-gray-400">
  {labelText}
</label>
```

### Font Weight Rules
- **Headlines**: Always Bold (700)
- **Subheadings**: Semibold (600)
- **Body Text**: Regular (400)
- **UI Elements**: Medium (500)
- **Captions**: Regular (400)

## 🧩 Component Patterns

### 1. Button Implementation
```typescript
// Primary Button Template
export const PrimaryButton = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      // Base styles
      "px-space-6 py-space-3",
      "text-button uppercase",
      "rounded-radius-md",
      "transition-all duration-normal ease-out",
      
      // Colors
      "bg-airvik-blue text-airvik-white",
      "hover:bg-airvik-purple hover:shadow-md hover:-translate-y-0.5",
      "active:translate-y-0 active:shadow-sm",
      
      // States
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-airvik-blue focus-visible:ring-offset-2"
    )}
  >
    {loading ? (
      <div className="flex items-center gap-space-2">
        <Loader className="animate-spin" size={16} />
        <span>Loading...</span>
      </div>
    ) : children}
  </button>
)
```

### 2. Card Implementation
```typescript
// Hotel Room Card Template
export const RoomCard = ({ room }) => (
  <div className={cn(
    // Base card styles
    "bg-airvik-white dark:bg-airvik-midnight",
    "rounded-radius-lg p-space-6",
    "shadow-sm hover:shadow-md",
    "transition-all duration-normal",
    "hover:-translate-y-0.5",
    "border border-gray-200 dark:border-gray-800"
  )}>
    {/* Card Header */}
    <div className="flex justify-between items-start mb-space-4">
      <h3 className="text-h4 text-airvik-black dark:text-airvik-white">
        {room.name}
      </h3>
      <StatusBadge status={room.status} />
    </div>
    
    {/* Card Content */}
    <div className="space-y-space-3">
      <p className="text-body text-gray-600 dark:text-gray-400">
        {room.description}
      </p>
      
      {/* Amenities */}
      <div className="flex gap-space-2 flex-wrap">
        {room.amenities.map(amenity => (
          <AmenityChip key={amenity} name={amenity} />
        ))}
      </div>
    </div>
    
    {/* Card Actions */}
    <div className="flex gap-space-3 mt-space-6">
      <PrimaryButton>Book Now</PrimaryButton>
      <SecondaryButton>View Details</SecondaryButton>
    </div>
  </div>
)
```

### 3. Form Implementation
```typescript
// Form Field Template
export const FormField = ({ label, error, required, children }) => (
  <div className="space-y-space-2">
    <label className={cn(
      "text-label text-gray-700 dark:text-gray-300",
      "flex items-center gap-space-1"
    )}>
      {label}
      {required && <span className="text-error">*</span>}
    </label>
    
    {children}
    
    {error && (
      <p className="text-caption text-error flex items-center gap-space-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
)

// Input Field Template
export const Input = ({ type = "text", ...props }) => (
  <input
    type={type}
    className={cn(
      // Base styles
      "w-full px-space-4 py-space-3",
      "text-body",
      "rounded-radius-md",
      "transition-all duration-fast",
      
      // Border & Background
      "bg-airvik-white dark:bg-gray-900",
      "border-2 border-gray-300 dark:border-gray-700",
      
      // Focus states
      "focus:border-airvik-blue focus:outline-none",
      "focus:ring-2 focus:ring-airvik-blue/20",
      
      // Error state
      props.error && "border-error focus:border-error focus:ring-error/20",
      
      // Disabled state
      "disabled:bg-gray-100 disabled:cursor-not-allowed"
    )}
    {...props}
  />
)
```

### 4. Toast Notification Template
```typescript
// Toast Component
export const Toast = ({ type, title, message, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }
  
  const colors = {
    success: 'border-success',
    error: 'border-error',
    warning: 'border-warning',
    info: 'border-airvik-blue'
  }
  
  const Icon = icons[type]
  
  return (
    <div className={cn(
      // Base styles
      "min-w-[300px] max-w-[500px]",
      "bg-airvik-white dark:bg-gray-900",
      "rounded-radius-lg p-space-4",
      "shadow-xl",
      "border-l-4",
      colors[type],
      
      // Animation
      "animate-slide-in-right"
    )}>
      <div className="flex items-start gap-space-3">
        <Icon className={cn("mt-0.5", `text-${type}`)} size={20} />
        
        <div className="flex-1">
          <h4 className="text-label text-airvik-black dark:text-airvik-white">
            {title}
          </h4>
          {message && (
            <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-space-1">
              {message}
            </p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
```

## 📱 Responsive Design Rules

### Mobile-First Implementation
```typescript
// Component with responsive design
export const ResponsiveGrid = ({ children }) => (
  <div className={cn(
    // Mobile: Single column
    "grid grid-cols-1 gap-space-4",
    
    // Tablet: 2 columns
    "md:grid-cols-2 md:gap-space-6",
    
    // Desktop: 3 columns
    "lg:grid-cols-3 lg:gap-space-8",
    
    // Wide: 4 columns
    "xl:grid-cols-4"
  )}>
    {children}
  </div>
)

// Responsive Typography
<h1 className={cn(
  // Mobile
  "text-3xl",
  // Tablet
  "md:text-4xl",
  // Desktop
  "lg:text-5xl",
  // Always bold
  "font-bold"
)}>
  {title}
</h1>
```

## 🌙 Dark Mode Implementation

### Every Component Must Support Dark Mode
```typescript
// Color Implementation Pattern
<div className={cn(
  // Light mode
  "bg-airvik-white text-airvik-black",
  // Dark mode
  "dark:bg-airvik-midnight dark:text-airvik-white",
  // Borders
  "border border-gray-200 dark:border-gray-800"
)}>
```

### Dark Mode Color Mappings
```typescript
const darkModeMap = {
  // Backgrounds
  'bg-airvik-white': 'dark:bg-airvik-midnight',
  'bg-gray-50': 'dark:bg-gray-900',
  'bg-gray-100': 'dark:bg-gray-800',
  
  // Text
  'text-airvik-black': 'dark:text-airvik-white',
  'text-gray-700': 'dark:text-gray-300',
  'text-gray-600': 'dark:text-gray-400',
  
  // Borders
  'border-gray-200': 'dark:border-gray-800',
  'border-gray-300': 'dark:border-gray-700'
}
```

## ✨ Animation & Interaction Rules

### Standard Animations
```typescript
// Hover Lift Effect
className="hover:-translate-y-0.5 transition-transform duration-normal"

// Focus Ring
className="focus-visible:ring-2 focus-visible:ring-airvik-blue focus-visible:ring-offset-2"

// Loading Spinner
className="animate-spin"

// Fade In
className="animate-fade-in"

// Slide In
className="animate-slide-in-right"
```

### Micro-interactions
```typescript
// Button Press Effect
<button className={cn(
  "transition-all duration-fast",
  "hover:scale-105 active:scale-95"
)}>

// Card Hover Effect
<div className={cn(
  "transition-all duration-normal",
  "hover:shadow-lg hover:-translate-y-1"
)}>

// Icon Hover Rotation
<Icon className={cn(
  "transition-transform duration-normal",
  "group-hover:rotate-12"
)} />
```

## 🎯 Implementation Workflow

### Step 1: Component Planning
```yaml
before_creating_component:
  - identify_component_type: "button|card|form|modal|etc"
  - check_existing_patterns: "docs/features/brand-design-system/COMPONENT-LIBRARY.md"
  - gather_requirements:
      - interactive_states: ["default", "hover", "active", "focus", "disabled"]
      - color_variants: ["primary", "secondary", "ghost", "danger"]
      - size_variants: ["sm", "md", "lg"]
      - dark_mode_support: true
```

### Step 2: Token Application
```typescript
// Import all necessary tokens
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions
} from '@/lib/brand/tokens'

// Apply tokens consistently
const componentStyles = {
  padding: `${spacing.space4} ${spacing.space6}`,
  borderRadius: radius.md,
  boxShadow: shadows.sm,
  transition: transitions.base
}
```

### Step 3: Validation Checklist
```yaml
component_validation:
  design_tokens:
    - [ ] No hardcoded colors
    - [ ] No hardcoded spacing
    - [ ] No hardcoded typography
  
  states:
    - [ ] Default state defined
    - [ ] Hover state implemented
    - [ ] Focus state visible
    - [ ] Active state feedback
    - [ ] Disabled state styled
  
  responsiveness:
    - [ ] Mobile layout works
    - [ ] Tablet layout optimized
    - [ ] Desktop layout perfect
  
  dark_mode:
    - [ ] All colors have dark variants
    - [ ] Contrast ratios maintained
    - [ ] Shadows adjusted for dark
  
  accessibility:
    - [ ] Keyboard navigable
    - [ ] Screen reader friendly
    - [ ] Focus indicators visible
    - [ ] Color contrast passing
```

## 📊 Quality Metrics

### Brand Consistency Score
Every component must achieve 100% on:
1. **Token Usage**: No hardcoded values
2. **State Coverage**: All interactive states defined
3. **Responsive Design**: Works on all breakpoints
4. **Dark Mode**: Complete dark theme support
5. **Accessibility**: WCAG 2.1 AA compliance

### Common Mistakes to Avoid
```typescript
// ❌ WRONG: Hardcoded values
<div style={{ padding: '16px', borderRadius: '8px' }}>

// ✅ CORRECT: Using tokens
<div className="p-space-4 rounded-radius-md">

// ❌ WRONG: Inconsistent shadows
<div className="shadow-lg hover:shadow-sm">

// ✅ CORRECT: Logical shadow progression
<div className="shadow-sm hover:shadow-md">

// ❌ WRONG: Missing dark mode
<div className="bg-white text-black">

// ✅ CORRECT: Dark mode included
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

## 🚀 Advanced Patterns

### Compound Components
```typescript
// Hotel Booking Card - Compound Component
export const BookingCard = {
  Root: ({ children, ...props }) => (
    <div className="booking-card-root" {...props}>
      {children}
    </div>
  ),
  
  Header: ({ children }) => (
    <div className="booking-card-header">
      {children}
    </div>
  ),
  
  Body: ({ children }) => (
    <div className="booking-card-body">
      {children}
    </div>
  ),
  
  Actions: ({ children }) => (
    <div className="booking-card-actions">
      {children}
    </div>
  )
}

// Usage
<BookingCard.Root>
  <BookingCard.Header>
    <h3>Deluxe Suite</h3>
  </BookingCard.Header>
  <BookingCard.Body>
    <p>2 Guests • 3 Nights</p>
  </BookingCard.Body>
  <BookingCard.Actions>
    <PrimaryButton>Confirm Booking</PrimaryButton>
  </BookingCard.Actions>
</BookingCard.Root>
```

### Dynamic Theming
```typescript
// Theme-aware component
export const ThemedSection = ({ variant = 'light', children }) => {
  const themes = {
    light: 'bg-airvik-white text-airvik-black',
    dark: 'bg-airvik-midnight text-airvik-white',
    gradient: 'bg-gradient-mid text-airvik-white',
    pattern: 'bg-pattern bg-airvik-white text-airvik-black'
  }
  
  return (
    <section className={cn(
      "py-space-16 px-space-6",
      themes[variant],
      "transition-colors duration-normal"
    )}>
      {children}
    </section>
  )
}
```

## 📝 Documentation Requirements

Every component must include:
```typescript
/**
 * PrimaryButton Component
 * 
 * @description Primary action button following AirVikBook brand guidelines
 * @example
 * <PrimaryButton onClick={handleClick} loading={isLoading}>
 *   Book Now
 * </PrimaryButton>
 * 
 * @props
 * - children: React.ReactNode - Button content
 * - onClick: () => void - Click handler
 * - disabled?: boolean - Disabled state
 * - loading?: boolean - Loading state
 * - size?: 'sm' | 'md' | 'lg' - Button size variant
 * 
 * @brandGuidelines
 * - Uses airvik-blue as primary color
 * - Hover state transitions to airvik-purple
 * - Includes focus ring for accessibility
 * - Supports loading state with spinner
 */
```