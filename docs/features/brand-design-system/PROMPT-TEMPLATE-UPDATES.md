# Brand System Integration for AI Prompts

## Overview
This document shows how to update your existing prompt templates to ensure AI maintains perfect brand consistency.

## Updates to `Universal-features-prompt-template.md`

### Add to Step 0.5: Integration Analysis

```markdown
## Brand System Check:
- [ ] Read brand guidelines: docs/features/brand-design-system/BRAND-GUIDELINES.md
- [ ] Import brand tokens: @/lib/brand/tokens
- [ ] Use component library: docs/features/brand-design-system/COMPONENT-LIBRARY.md
- [ ] No hardcoded colors, spacing, or typography
```

### Add to Step 1: Create AI Memory System

In `CURRENT-STATE.md`, add:

```markdown
## Brand Compliance:
<!-- AI updates this after each task -->
- Design tokens used: ✅/❌
- Component library patterns: ✅/❌
- Dark mode support: ✅/❌
- Responsive design: ✅/❌
- Accessibility standards: ✅/❌
```

### Update Step 3: Create Feature Documentation

In `spec.md`, add new section:

```markdown
## Brand & UI Requirements:
- Color Scheme: [Which brand colors for this feature]
- Typography: [Which text styles needed]
- Component Patterns: [Which pre-built components to use]
- Animations: [Standard transitions to apply]
- Dark Mode: [Specific dark mode considerations]
```

## Updates to `automated-tasks-prompt-template.md`

### Add to PHASE 1: SETUP & ANALYSIS

```yaml
brand_system_check:
  mandatory_reads:
    - docs/features/brand-design-system/BRAND-GUIDELINES.md
    - docs/features/brand-design-system/COMPONENT-LIBRARY.md
    - docs/features/brand-design-system/AI-BRAND-IMPLEMENTATION.md
  
  verify_imports:
    - "@/lib/brand/tokens"
    - "@/lib/brand/utils"
    - "@/lib/brand/components"
  
  validation_rules:
    - no_hardcoded_colors: "Use only brand tokens"
    - no_custom_spacing: "Use only spacing tokens" 
    - no_custom_typography: "Use typography classes"
    - all_states_included: "hover, focus, active, disabled"
    - dark_mode_required: "Every color needs dark variant"
```

### Add to Frontend Tasks (F3: UI Component)

```typescript
// BRAND COMPLIANCE CHECKLIST FOR EVERY COMPONENT:
const brandChecklist = {
  imports: [
    "import { cn } from '@/lib/utils'",
    "import { brandTokens } from '@/lib/brand/tokens'",
    "import { brandUtils } from '@/lib/brand/utils'"
  ],
  
  colorUsage: {
    // ❌ NEVER: className="bg-blue-500"
    // ✅ ALWAYS: className="bg-airvik-blue"
  },
  
  spacingUsage: {
    // ❌ NEVER: className="p-4"
    // ✅ ALWAYS: className="p-space-4"
  },
  
  typographyUsage: {
    // ❌ NEVER: className="text-2xl font-bold"
    // ✅ ALWAYS: className="text-h2"
  },
  
  requiredStates: {
    hover: "hover:bg-airvik-purple",
    focus: "focus-visible:ring-2 focus-visible:ring-airvik-blue",
    active: "active:scale-95",
    disabled: "disabled:opacity-50 disabled:cursor-not-allowed"
  },
  
  darkMode: {
    // Every light color MUST have dark variant
    light: "bg-airvik-white text-airvik-black",
    dark: "dark:bg-airvik-midnight dark:text-airvik-white"
  }
}
```

### Add to ERROR_PATTERNS

```typescript
// Brand-specific error patterns
"Hardcoded color detected": {
  fix: "Replace with brand token from colors object",
  example: "Change '#1890ce' to 'colors.airvik.blue'",
  validate: "No hex values in className"
},

"Non-brand Tailwind color": {
  fix: "Use brand color instead of Tailwind default",
  example: "Change 'bg-blue-500' to 'bg-airvik-blue'",
  validate: "Only brand color classes used"
},

"Missing dark mode variant": {
  fix: "Add dark mode class for every color",
  example: "Add 'dark:bg-airvik-midnight' after 'bg-airvik-white'",
  validate: "All colors have dark variants"
},

"Custom spacing value": {
  fix: "Use spacing token instead",
  example: "Change 'p-[18px]' to 'p-space-5'",
  validate: "Only spacing tokens used"
}
```

### Add Brand Validation Phase

```yaml
brand_validation_phase:
  after_each_component:
    - check_imports: "Verify brand system imports"
    - scan_hardcoded_values: "No hex colors or pixel values"
    - verify_token_usage: "All values from brand tokens"
    - test_dark_mode: "Toggle dark mode and verify"
    - check_responsive: "Test all breakpoints"
    - validate_states: "Hover, focus, active, disabled"
  
  auto_fix_common_issues:
    - replace_hex_colors: "Map to nearest brand color"
    - convert_spacing: "Map pixels to spacing tokens"
    - add_dark_variants: "Auto-add dark mode classes"
    - include_transitions: "Add standard transitions"
```

## Component Creation Template Update

Add this to every component creation task:

```typescript
/**
 * BRAND SYSTEM REQUIREMENTS
 * 
 * 1. Import brand system:
 *    import { brandTokens } from '@/lib/brand/tokens'
 *    import { brandUtils } from '@/lib/brand/utils'
 * 
 * 2. Use ONLY brand colors:
 *    - Primary: airvik-blue, airvik-purple
 *    - Status: status-available, status-occupied
 *    - Feedback: success, warning, error
 * 
 * 3. Use ONLY brand spacing:
 *    - space-1 through space-24
 *    - No custom padding/margin values
 * 
 * 4. Use ONLY brand typography:
 *    - Headers: text-h1 through text-h6
 *    - Body: text-body, text-body-lg, text-body-sm
 *    - UI: text-button, text-label, text-caption
 * 
 * 5. Include ALL states:
 *    - Default
 *    - Hover (with transform/shadow)
 *    - Focus (with ring)
 *    - Active (with feedback)
 *    - Disabled (with opacity)
 * 
 * 6. Support dark mode:
 *    - Every bg-* needs dark:bg-*
 *    - Every text-* needs dark:text-*
 *    - Every border-* needs dark:border-*
 * 
 * 7. Follow component patterns:
 *    - Check COMPONENT-LIBRARY.md for examples
 *    - Reuse existing patterns
 *    - Maintain consistency
 */
```

## Testing Protocol Update

Add brand testing to every component:

```yaml
brand_testing_protocol:
  visual_tests:
    - [ ] Colors match brand palette
    - [ ] Typography follows hierarchy
    - [ ] Spacing uses grid system
    - [ ] Shadows match elevation system
    - [ ] Borders use brand radius
  
  interaction_tests:
    - [ ] Hover states visible and smooth
    - [ ] Focus rings appear correctly
    - [ ] Active states provide feedback
    - [ ] Disabled states clearly indicated
    - [ ] Transitions use brand timing
  
  mode_tests:
    - [ ] Light mode looks correct
    - [ ] Dark mode fully supported
    - [ ] No color contrast issues
    - [ ] Gradients work in both modes
  
  responsive_tests:
    - [ ] Mobile layout (< 640px)
    - [ ] Tablet layout (768px)
    - [ ] Desktop layout (1024px)
    - [ ] Wide layout (1280px+)
  
  accessibility_tests:
    - [ ] Keyboard navigation works
    - [ ] Screen reader compatible
    - [ ] Color contrast passes WCAG
    - [ ] Focus indicators visible
```

## Documentation Update Requirements

Every feature documentation must include:

```markdown
## UI/UX Specifications

### Visual Design
- Primary Colors: [List brand colors used]
- Component Patterns: [List from COMPONENT-LIBRARY.md]
- Animation Types: [lift, scale, fade, slide]
- Shadow Elevation: [sm, md, lg based on hierarchy]

### Interaction Design
- Hover Effects: [Describe hover behaviors]
- Click Feedback: [Active state responses]
- Loading States: [Spinner or skeleton]
- Error States: [How errors display]

### Responsive Behavior
- Mobile: [How it adapts < 640px]
- Tablet: [Changes at 768px]
- Desktop: [Full experience 1024px+]

### Dark Mode Adaptations
- Background Changes: [Light to dark mappings]
- Text Adjustments: [Contrast maintenance]
- Border Modifications: [Visibility in dark]
- Shadow Adjustments: [Glow effects if needed]
```

## Git Commit Message Update

Include brand compliance in commits:

```bash
# Format: feat(feature): description [brand-compliant]

git commit -m "feat(user-profile): add profile card component [brand-compliant]"
git commit -m "fix(booking): update colors to brand tokens [brand-fix]"
git commit -m "style(rooms): implement dark mode support [brand-enhancement]"
```

## AI Self-Check Questions

Before marking any UI task complete, AI must verify:

1. **Token Usage**: Am I using ONLY brand tokens for colors, spacing, typography?
2. **Component Patterns**: Did I check COMPONENT-LIBRARY.md for existing patterns?
3. **State Coverage**: Have I included hover, focus, active, and disabled states?
4. **Dark Mode**: Does every element work perfectly in dark mode?
5. **Responsiveness**: Have I tested on mobile, tablet, and desktop?
6. **Animations**: Are transitions smooth and using brand timing?
7. **Accessibility**: Can this be used with keyboard only?
8. **Consistency**: Does this match other components in the system?

## Final Validation Checklist

```yaml
pre_commit_brand_validation:
  automated_checks:
    - no_hex_colors: "grep -r '#[0-9a-fA-F]{6}' --include='*.tsx' --include='*.ts'"
    - no_pixel_values: "grep -r '[0-9]+px' --include='*.tsx' --include='*.ts'"
    - brand_imports: "grep -r '@/lib/brand' --include='*.tsx' --include='*.ts'"
    - dark_mode_classes: "grep -r 'dark:' --include='*.tsx' --include='*.ts'"
  
  manual_verification:
    - [ ] Screenshot in light mode
    - [ ] Screenshot in dark mode
    - [ ] Screenshot on mobile
    - [ ] Video of interactions
    - [ ] Accessibility audit passed
```

## Implementation Priority

1. **Phase 1**: Update all button components
2. **Phase 2**: Update all card components  
3. **Phase 3**: Update all form elements
4. **Phase 4**: Update all data displays
5. **Phase 5**: Update all navigation elements
6. **Phase 6**: Update all feedback components

Each phase should be completed with full brand compliance before moving to the next.