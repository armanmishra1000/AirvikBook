# 🎨 AirVikBook Brand Design System

## Quick Start for AI Implementation

### 🚨 CRITICAL: Read These Files First
1. **[BRAND-GUIDELINES.md](./BRAND-GUIDELINES.md)** - Core brand values, colors, typography
2. **[AI-BRAND-IMPLEMENTATION.md](./AI-BRAND-IMPLEMENTATION.md)** - How AI should apply brand
3. **[COMPONENT-LIBRARY.md](./COMPONENT-LIBRARY.md)** - Pre-built components to copy

### 📋 Implementation Checklist

Before creating ANY UI component:
- [ ] Import brand tokens: `import { brandTokens } from '@/lib/brand/tokens'`
- [ ] Import brand utils: `import { brandUtils } from '@/lib/brand/utils'`
- [ ] Check COMPONENT-LIBRARY.md for existing patterns
- [ ] Use ONLY brand colors (no hex values or Tailwind defaults)
- [ ] Use ONLY brand spacing (space-1 through space-24)
- [ ] Include ALL interactive states (hover, focus, active, disabled)
- [ ] Support dark mode for every element
- [ ] Test responsive design on all breakpoints

### 🎨 Brand Colors Quick Reference

```typescript
// Primary Actions
'bg-airvik-blue'      // #133EE3 - Primary buttons, links
'bg-airvik-purple'    // #4322AA - Hover states, special CTAs

// Status Indicators  
'bg-status-available'    // #68D8FC - Cyan
'bg-status-occupied'     // #133EE3 - Blue
'bg-status-maintenance'  // #B688FF - Violet
'bg-status-unavailable'  // #B12A2A - Red

// Feedback
'text-success'  // #4E7638 - Green
'text-warning'  // #CB7B2B - Orange
'text-error'    // #B12A2A - Red
'text-info'     // #D1D8FA - Light Blue
```

### 🔤 Typography Quick Reference

```typescript
// Headers (font-primary/SF Pro Display)
'text-h1'  // 48px bold
'text-h2'  // 36px bold  
'text-h3'  // 30px semibold
'text-h4'  // 24px semibold

// Body (font-secondary/Inter)
'text-body'     // 16px regular
'text-body-lg'  // 18px regular
'text-body-sm'  // 14px regular

// UI Elements
'text-button'  // 14px medium uppercase
'text-label'   // 14px medium
'text-caption' // 12px regular
```

### 📏 Spacing Quick Reference

```typescript
'space-1'  // 4px
'space-2'  // 8px
'space-3'  // 12px
'space-4'  // 16px - Default padding
'space-6'  // 24px - Section spacing
'space-8'  // 32px - Large gaps
```

### 🚫 Common Mistakes to Avoid

```typescript
// ❌ NEVER DO THIS
<div className="bg-blue-500 p-4 text-2xl">
<div style={{ padding: '16px', backgroundColor: '#1890ce' }}>
<h1 className="font-bold text-[32px]">

// ✅ ALWAYS DO THIS  
<div className="bg-airvik-blue p-space-4 text-h2">
<div className="p-space-4 bg-airvik-blue">
<h1 className="text-h1">
```

### 🌙 Dark Mode Pattern

```typescript
// Every color needs a dark variant
<div className="bg-airvik-white dark:bg-airvik-midnight">
<p className="text-airvik-black dark:text-airvik-white">
<div className="border-gray-200 dark:border-gray-800">
```

### ✨ Standard Component Pattern

```typescript
export const Component = () => {
  return (
    <div className={cn(
      // Layout
      "p-space-4 rounded-radius-md",
      
      // Colors (with dark mode)
      "bg-airvik-white dark:bg-gray-900",
      "text-airvik-black dark:text-airvik-white",
      
      // Border
      "border border-gray-200 dark:border-gray-800",
      
      // Interactive states
      "transition-all duration-normal",
      "hover:shadow-md hover:-translate-y-0.5",
      "active:translate-y-0 active:shadow-sm",
      
      // Focus state
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-airvik-blue focus-visible:ring-offset-2"
    )}>
      {/* Content */}
    </div>
  )
}
```

### 🔄 Animation Classes

```typescript
// Transitions
'transition-all duration-normal'    // 250ms standard
'transition-all duration-fast'      // 150ms quick
'transition-all duration-slow'      // 350ms deliberate

// Hover Effects
'hover:-translate-y-0.5'  // Lift effect
'hover:scale-105'         // Scale effect
'hover:shadow-glow-primary' // Glow effect

// Animations
'animate-fade-in'        // Opacity fade
'animate-slide-in-right' // Slide from right
'animate-spin'          // Loading spinner
```

### 📱 Responsive Classes

```typescript
// Mobile First Approach
'text-base md:text-lg lg:text-xl'     // Progressive text
'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // Responsive grid
'p-space-4 md:p-space-6 lg:p-space-8'  // Progressive spacing
```

### 🧪 Testing Your Implementation

1. **Visual Test**: Does it match the Bolt aesthetic?
2. **Token Test**: No hardcoded values anywhere?
3. **State Test**: All interactive states working?
4. **Dark Mode Test**: Perfect in both themes?
5. **Responsive Test**: Works on all screen sizes?
6. **Accessibility Test**: Keyboard navigable?

### 📚 Additional Resources

- **[TAILWIND-CONFIG-UPDATE.md](./TAILWIND-CONFIG-UPDATE.md)** - Tailwind configuration
- **[PROMPT-TEMPLATE-UPDATES.md](./PROMPT-TEMPLATE-UPDATES.md)** - Update AI prompts
- **Brand Token Files**:
  - `/frontend/src/lib/brand/tokens.ts` - Design tokens
  - `/frontend/src/lib/brand/utils.ts` - Helper functions

### 🎯 Goal

Every pixel in AirVikBook should feel cohesive, professional, and thoughtfully designed. By following this brand system, we ensure a world-class user experience that rivals the best hotel management systems in the industry.

---

**Remember**: When in doubt, check the COMPONENT-LIBRARY.md for examples!