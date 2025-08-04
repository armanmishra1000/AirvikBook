/**
 * Font utilities for SF Pro Display
 * Provides consistent font styling throughout the application
 */

import { cn } from "@/lib/utils"

// Font weight constants for SF Pro Display
export const fontWeights = {
  thin: 'font-thin',       // 100
  extralight: 'font-extralight', // 200  
  light: 'font-light',     // 300
  normal: 'font-normal',   // 400
  medium: 'font-medium',   // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold',       // 700
  extrabold: 'font-extrabold', // 800
  black: 'font-black',     // 900
} as const

// Font size constants for consistent typography
export const fontSizes = {
  xs: 'text-xs',      // 12px
  sm: 'text-sm',      // 14px
  base: 'text-base',  // 16px
  lg: 'text-lg',      // 18px
  xl: 'text-xl',      // 20px
  '2xl': 'text-2xl',  // 24px
  '3xl': 'text-3xl',  // 30px
  '4xl': 'text-4xl',  // 36px
  '5xl': 'text-5xl',  // 48px
  '6xl': 'text-6xl',  // 60px
} as const

// Typography presets for common use cases
export const typography = {
  // Headings
  h1: 'font-sf-pro text-4xl font-bold tracking-tight',
  h2: 'font-sf-pro text-3xl font-bold tracking-tight',
  h3: 'font-sf-pro text-2xl font-semibold tracking-tight',
  h4: 'font-sf-pro text-xl font-semibold tracking-tight',
  h5: 'font-sf-pro text-lg font-semibold tracking-tight',
  h6: 'font-sf-pro text-base font-semibold tracking-tight',
  
  // Body text
  body: 'font-sf-pro text-base font-normal',
  bodyLarge: 'font-sf-pro text-lg font-normal',
  bodySmall: 'font-sf-pro text-sm font-normal',
  
  // UI elements
  button: 'font-sf-pro text-sm font-medium',
  buttonLarge: 'font-sf-pro text-base font-medium',
  label: 'font-sf-pro text-sm font-medium',
  caption: 'font-sf-pro text-xs font-normal',
  
  // Special cases
  display: 'font-sf-pro text-5xl font-bold tracking-tight',
  hero: 'font-sf-pro text-6xl font-bold tracking-tight',
  subtitle: 'font-sf-pro text-lg font-normal text-muted-foreground',
} as const

/**
 * Get font class for specific weight and size
 */
export function getFontClass(
  weight?: keyof typeof fontWeights,
  size?: keyof typeof fontSizes,
  additionalClasses?: string
) {
  return cn(
    'font-sf-pro',
    weight && fontWeights[weight],
    size && fontSizes[size],
    additionalClasses
  )
}

/**
 * Get typography preset class
 */
export function getTypographyClass(
  preset: keyof typeof typography,
  additionalClasses?: string
) {
  return cn(typography[preset], additionalClasses)
}

/**
 * SF Pro Display font feature settings for optimal rendering
 */
export const fontFeatureSettings = {
  default: "'kern' 1, 'liga' 1, 'calt' 1",
  numeric: "'kern' 1, 'liga' 1, 'calt' 1, 'pnum' 1, 'tnum' 0",
  tabular: "'kern' 1, 'liga' 1, 'calt' 1, 'tnum' 1, 'pnum' 0",
} as const

/**
 * Apply font feature settings to an element
 */
export function applyFontFeatures(element: HTMLElement, features: keyof typeof fontFeatureSettings = 'default') {
  element.style.fontFeatureSettings = fontFeatureSettings[features]
}