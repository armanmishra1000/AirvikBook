# Tailwind Configuration Update for Brand System

## Overview
This document provides the exact Tailwind configuration updates needed to integrate the AirVikBook brand design system.

## Required Updates to `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... existing config
  
  theme: {
    extend: {
      // Brand Colors
      colors: {
        // Primary Brand Colors
        'airvik-black': '#020A18',
        'airvik-midnight': '#10103C', 
        'airvik-purple': '#4322AA',
        'airvik-blue': '#133EE3',
        'airvik-cyan': '#68D8FC',
        'airvik-violet': '#B688FF',
        'airvik-white': '#F8F9FE',
        
        // Secondary Colors
        'blue-mid': '#006CFF',
        'blue-light': '#D1D8FA',
        'cyan-light': '#B2ECFF',
        'purple-light': '#C58FFF',
        'pink-light': '#DECFFF',
        
        // Status Colors
        'status-available': '#68D8FC',
        'status-occupied': '#133EE3',
        'status-maintenance': '#B688FF',
        'status-unavailable': '#B12A2A',
        
        // Feedback Colors
        'success': '#4E7638',
        'warning': '#CB7B2B',
        'error': '#B12A2A',
        'info': '#D1D8FA',
      },
      
      // Brand Gradients
      backgroundImage: {
        'gradient-dark-1': 'linear-gradient(135deg, #020A18 0%, #4322AA 100%)',
        'gradient-dark-2': 'linear-gradient(135deg, #10103C 0%, #133EE3 100%)',
        'gradient-mid': 'linear-gradient(135deg, #4322AA 0%, #68D8FC 100%)',
        'gradient-light-1': 'linear-gradient(135deg, #B688FF 0%, #F8F9FE 100%)',
        'gradient-light-2': 'linear-gradient(135deg, #D1D8FA 0%, #B2ECFF 100%)',
        'gradient-light-3': 'linear-gradient(135deg, #133EE3 0%, #68D8FC 100%)',
        
        // Pattern overlay
        'pattern': `radial-gradient(circle at 20% 80%, #133EE3 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, #4322AA 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, #68D8FC 0%, transparent 50%)`,
      },
      
      // Typography
      fontFamily: {
        'primary': ['Agrandir', 'SF Pro Display', '-apple-system', 'sans-serif'],
        'secondary': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
      },
      
      // Font sizes matching brand
      fontSize: {
        'hero': '72px',
        'display': '60px',
      },
      
      // Spacing system
      spacing: {
        'space-0': '0',
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-8': '32px',
        'space-10': '40px',
        'space-12': '48px',
        'space-16': '64px',
        'space-20': '80px',
        'space-24': '96px',
      },
      
      // Border radius
      borderRadius: {
        'radius-none': '0',
        'radius-xs': '4px',
        'radius-sm': '6px',
        'radius-md': '8px',
        'radius-lg': '12px',
        'radius-xl': '16px',
        'radius-2xl': '24px',
        'radius-full': '9999px',
      },
      
      // Box shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(2, 10, 24, 0.05)',
        'sm': '0 1px 3px 0 rgba(2, 10, 24, 0.1), 0 1px 2px 0 rgba(2, 10, 24, 0.06)',
        'md': '0 4px 6px -1px rgba(2, 10, 24, 0.1), 0 2px 4px -1px rgba(2, 10, 24, 0.06)',
        'lg': '0 10px 15px -3px rgba(2, 10, 24, 0.1), 0 4px 6px -2px rgba(2, 10, 24, 0.05)',
        'xl': '0 20px 25px -5px rgba(2, 10, 24, 0.1), 0 10px 10px -5px rgba(2, 10, 24, 0.04)',
        '2xl': '0 25px 50px -12px rgba(2, 10, 24, 0.25)',
        
        // Glow effects
        'glow-primary': '0 0 20px rgba(67, 34, 170, 0.4)',
        'glow-blue': '0 0 20px rgba(19, 62, 227, 0.4)',
        'glow-cyan': '0 0 20px rgba(104, 216, 252, 0.4)',
      },
      
      // Animation timing
      transitionDuration: {
        'instant': '0ms',
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
        'slower': '500ms',
      },
      
      // Animation easing
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 250ms ease-out',
        'slide-in-right': 'slideInRight 250ms ease-out',
        'slide-in-left': 'slideInLeft 250ms ease-out',
        'slide-in-up': 'slideInUp 250ms ease-out',
        'modal-in': 'modalIn 250ms ease-out',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  
  // ... rest of config
}
```

## Required Updates to `globals.css`

Add these CSS custom properties to support dynamic theming:

```css
@layer base {
  :root {
    /* Primary Brand Colors */
    --airvik-black: 2 10 24;
    --airvik-midnight: 16 16 60;
    --airvik-purple: 67 34 170;
    --airvik-blue: 19 62 227;
    --airvik-cyan: 104 216 252;
    --airvik-violet: 182 136 255;
    --airvik-white: 248 249 254;
    
    /* Status Colors */
    --status-available: 104 216 252;
    --status-occupied: 19 62 227;
    --status-maintenance: 182 136 255;
    --status-unavailable: 177 42 42;
    
    /* Feedback Colors */
    --success: 78 118 56;
    --warning: 203 123 43;
    --error: 177 42 42;
    --info: 209 216 250;
    
    /* Shadow colors */
    --shadow-color: 2 10 24;
  }
  
  .dark {
    /* Inverted colors for dark mode */
    --airvik-white: 2 10 24;
    --airvik-black: 248 249 254;
    
    /* Adjusted colors for dark mode */
    --airvik-purple: 104 71 204;
    --airvik-blue: 45 94 232;
    --airvik-cyan: 123 220 252;
    
    /* Shadow adjustments */
    --shadow-color: 248 249 254;
  }
}
```

## Font Import Updates

Add to the top of `globals.css`:

```css
/* Agrandir Font Import */
@font-face {
  font-family: 'Agrandir';
  src: url('/fonts/agrandir/AgrandirNarrow-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Agrandir';
  src: url('/fonts/agrandir/AgrandirNarrow-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Agrandir';
  src: url('/fonts/agrandir/AgrandirNarrow-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Inter Font Import (Google Fonts) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

## PostCSS Configuration

Ensure your `postcss.config.js` includes:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## VSCode IntelliSense

Add to `.vscode/settings.json` for better autocomplete:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Implementation Checklist

1. [ ] Update `tailwind.config.js` with brand tokens
2. [ ] Add CSS custom properties to `globals.css`
3. [ ] Import brand fonts
4. [ ] Update PostCSS configuration
5. [ ] Configure VSCode for IntelliSense
6. [ ] Run `npm run dev` to verify changes
7. [ ] Test dark mode toggle
8. [ ] Verify all brand colors are accessible

## Testing Brand Integration

Create a test page to verify all brand elements:

```tsx
// src/app/brand-test/page.tsx
import { brandTokens } from '@/lib/brand/tokens'

export default function BrandTest() {
  return (
    <div className="p-space-8">
      {/* Color swatches */}
      <div className="grid grid-cols-4 gap-space-4">
        <div className="bg-airvik-blue p-space-4 text-airvik-white">
          Airvik Blue
        </div>
        {/* Add more color tests */}
      </div>
      
      {/* Typography tests */}
      <h1 className="text-hero font-primary">Hero Text</h1>
      <h2 className="text-display font-primary">Display Text</h2>
      
      {/* Shadow tests */}
      <div className="shadow-sm p-space-4">Shadow SM</div>
      <div className="shadow-glow-primary p-space-4">Glow Effect</div>
    </div>
  )
}
```