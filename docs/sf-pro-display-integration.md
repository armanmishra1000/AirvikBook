# SF Pro Display Font Integration

## Overview
SF Pro Display has been integrated as the primary font for the AirVikBook Hotel Management System. This document outlines the implementation, usage, and best practices for typography throughout the application.

## Font Files
All SF Pro Display font files are located in `/public/fonts/sf-pro-display/`:

- `SFPRODISPLAYREGULAR.OTF` - Regular (400)
- `SFPRODISPLAYMEDIUM.OTF` - Medium (500)  
- `SFPRODISPLAYBOLD.OTF` - Bold (700)
- `SFPRODISPLAYLIGHTITALIC.OTF` - Light Italic (300)
- `SFPRODISPLAYTHINITALIC.OTF` - Thin Italic (100)
- `SFPRODISPLAYULTRALIGHTITALIC.OTF` - Ultra Light Italic (200)
- `SFPRODISPLAYSEMIBOLDITALIC.OTF` - Semibold Italic (600)
- `SFPRODISPLAYHEAVYITALIC.OTF` - Heavy Italic (800)
- `SFPRODISPLAYBLACKITALIC.OTF` - Black Italic (900)

## Implementation

### 1. Font Face Declarations
Font faces are declared in `src/app/globals.css` with proper font-display: swap for performance.

### 2. Tailwind Configuration
Updated `tailwind.config.js` to include SF Pro Display in the font stack:
```javascript
fontFamily: {
  sans: [
    'SF Pro Display',
    '-apple-system',
    'BlinkMacSystemFont', 
    'system-ui',
    'sans-serif'
  ],
  'sf-pro': [
    'SF Pro Display',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui', 
    'sans-serif'
  ]
}
```

### 3. Global Styles
Applied SF Pro Display globally with font feature settings for optimal rendering:
```css
body {
  @apply bg-background text-foreground font-sf-pro;
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1, 'pnum' 1, 'tnum' 0, 'onum' 1, 'lnum' 0, 'dlig' 0;
}
```

## Usage

### Typography Utilities
Use the font utilities from `/src/lib/fonts.ts`:

```typescript
import { getTypographyClass, getFontClass } from "@/lib/fonts"

// Typography presets
<h1 className={getTypographyClass('hero')}>Hero Text</h1>
<h2 className={getTypographyClass('h1')}>Heading 1</h2>
<p className={getTypographyClass('body')}>Body text</p>

// Custom font classes
<span className={getFontClass('bold', 'lg')}>Bold Large Text</span>
```

### Available Typography Presets
- `hero` - 60px, bold, for hero sections
- `display` - 48px, bold, for display text
- `h1` - 36px, bold, for main headings
- `h2` - 30px, bold, for section headings
- `h3` - 24px, semibold, for subsection headings
- `h4` - 20px, semibold, for minor headings
- `h5` - 18px, semibold, for small headings
- `h6` - 16px, semibold, for smallest headings
- `body` - 16px, normal, for body text
- `bodyLarge` - 18px, normal, for large body text
- `bodySmall` - 14px, normal, for small body text
- `button` - 14px, medium, for buttons
- `buttonLarge` - 16px, medium, for large buttons
- `label` - 14px, medium, for form labels
- `caption` - 12px, normal, for captions
- `subtitle` - 18px, normal, muted, for subtitles

### Font Weights Available
- `thin` (100)
- `extralight` (200)
- `light` (300)
- `normal` (400) - Default
- `medium` (500)
- `semibold` (600)
- `bold` (700)
- `extrabold` (800)
- `black` (900)

### Direct Tailwind Classes
You can also use Tailwind classes directly:
```html
<h1 class="font-sf-pro text-4xl font-bold">Heading</h1>
<p class="font-sf-pro text-base font-normal">Body text</p>
```

## Best Practices

### 1. Consistent Typography
- Always use the typography presets when possible
- Use the font utility functions for custom combinations
- Maintain consistent hierarchy with proper heading levels

### 2. Performance
- Font files are optimized with `font-display: swap`
- Next.js font optimization is enabled
- Use font feature settings for enhanced rendering

### 3. Accessibility
- Maintain proper contrast ratios
- Use semantic HTML elements
- Ensure text is readable at all sizes

### 4. Responsive Design
- Typography scales appropriately on mobile
- Use responsive text sizes when needed
- Test readability across devices

## File Structure
```
frontend/
├── public/fonts/sf-pro-display/     # Font files
├── src/
│   ├── app/
│   │   ├── globals.css              # Font face declarations
│   │   └── layout.tsx               # Root layout with font class
│   └── lib/
│       └── fonts.ts                 # Font utilities
├── tailwind.config.js               # Font configuration
└── next.config.js                   # Font optimization
```

## Testing
The font integration can be tested by:
1. Running the development server
2. Visiting the demo page at `/`
3. Checking the typography showcase section
4. Verifying font loading in browser DevTools

## Troubleshooting

### Font Not Loading
1. Check font files are in `/public/fonts/sf-pro-display/`
2. Verify font face declarations in `globals.css`
3. Ensure Tailwind config includes SF Pro Display
4. Clear browser cache and restart dev server

### Performance Issues
1. Verify `font-display: swap` is set
2. Check Next.js font optimization is enabled
3. Monitor network tab for font loading
4. Consider font subsetting if needed

## Future Enhancements
- Font subsetting for better performance
- Variable font implementation if available
- Additional font weights as needed
- Custom font loading strategies