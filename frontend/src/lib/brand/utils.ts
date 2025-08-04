/**
 * AirVikBook Brand Utility Functions
 * 
 * Helper functions for applying brand guidelines consistently
 * throughout the application.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { colors, spacing, typography, shadows, radius, transitions } from './tokens'

/**
 * Merge class names with Tailwind CSS conflict resolution
 * This is the same as the existing cn utility but ensures brand consistency
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get color class name from brand tokens
 */
export function getColorClass(
  category: keyof typeof colors,
  shade: string,
  property: 'bg' | 'text' | 'border' = 'text'
): string {
  const colorValue = colors[category]?.[shade as keyof typeof colors[typeof category]]
  if (!colorValue) {
    console.warn(`Color not found: ${category}.${shade}`)
    return ''
  }
  
  return `${property}-[${colorValue}]`
}

/**
 * Get typography classes for consistent text styling
 */
export function getTypographyClass(variant: string): string {
  const typographyMap: Record<string, string> = {
    // Display
    hero: 'text-[72px] font-bold leading-tight tracking-tighter font-primary',
    display: 'text-[60px] font-bold leading-tight tracking-tighter font-primary',
    
    // Headings
    h1: 'text-[48px] font-bold leading-snug tracking-tight font-primary',
    h2: 'text-[36px] font-bold leading-snug tracking-tight font-primary',
    h3: 'text-[30px] font-semibold leading-normal font-primary',
    h4: 'text-[24px] font-semibold leading-normal font-primary',
    h5: 'text-[20px] font-semibold leading-relaxed font-primary',
    h6: 'text-[18px] font-semibold leading-relaxed font-primary',
    
    // Body
    'body-lg': 'text-[18px] font-normal leading-body font-secondary',
    body: 'text-[16px] font-normal leading-body font-secondary',
    'body-sm': 'text-[14px] font-normal leading-loose font-secondary',
    
    // UI Elements
    button: 'text-[14px] font-medium tracking-wide uppercase font-primary',
    caption: 'text-[12px] font-normal leading-relaxed font-secondary',
    label: 'text-[14px] font-medium leading-relaxed font-secondary',
  }
  
  return typographyMap[variant] || ''
}

/**
 * Get spacing value from tokens
 */
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size] || spacing.space4
}

/**
 * Get shadow class from tokens
 */
export function getShadowClass(variant: keyof typeof shadows): string {
  const shadowValue = shadows[variant]
  return `shadow-[${shadowValue}]`
}

/**
 * Get radius class from tokens
 */
export function getRadiusClass(variant: keyof typeof radius): string {
  const radiusValue = radius[variant]
  return `rounded-[${radiusValue}]`
}

/**
 * Get transition configuration
 */
export function getTransition(type: 'base' | 'fade' | 'slide' = 'base'): string {
  return transitions[type]
}

/**
 * Generate responsive classes
 */
export function responsive(
  mobile: string,
  tablet?: string,
  desktop?: string,
  wide?: string
): string {
  const classes = [mobile]
  
  if (tablet) classes.push(`md:${tablet}`)
  if (desktop) classes.push(`lg:${desktop}`)
  if (wide) classes.push(`xl:${wide}`)
  
  return classes.join(' ')
}

/**
 * Get status color configuration
 */
export function getStatusColors(status: 'available' | 'occupied' | 'maintenance' | 'unavailable') {
  const statusMap = {
    available: {
      bg: 'bg-status-available/10',
      text: 'text-status-available',
      border: 'border-status-available/20',
      icon: 'text-status-available',
    },
    occupied: {
      bg: 'bg-status-occupied/10',
      text: 'text-status-occupied',
      border: 'border-status-occupied/20',
      icon: 'text-status-occupied',
    },
    maintenance: {
      bg: 'bg-status-maintenance/10',
      text: 'text-status-maintenance',
      border: 'border-status-maintenance/20',
      icon: 'text-status-maintenance',
    },
    unavailable: {
      bg: 'bg-status-unavailable/10',
      text: 'text-status-unavailable',
      border: 'border-status-unavailable/20',
      icon: 'text-status-unavailable',
    },
  }
  
  return statusMap[status] || statusMap.unavailable
}

/**
 * Get feedback color configuration
 */
export function getFeedbackColors(type: 'success' | 'warning' | 'error' | 'info') {
  const feedbackMap = {
    success: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20',
      icon: 'text-success',
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/20',
      icon: 'text-warning',
    },
    error: {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error/20',
      icon: 'text-error',
    },
    info: {
      bg: 'bg-airvik-blue/10',
      text: 'text-airvik-blue',
      border: 'border-airvik-blue/20',
      icon: 'text-airvik-blue',
    },
  }
  
  return feedbackMap[type] || feedbackMap.info
}

/**
 * Apply dark mode classes consistently
 */
export function withDarkMode(lightClasses: string, darkClasses: string): string {
  return `${lightClasses} dark:${darkClasses}`
}

/**
 * Generate focus ring classes
 */
export function getFocusRing(color: 'primary' | 'blue' | 'cyan' | 'error' = 'primary'): string {
  const colorMap = {
    primary: 'focus:ring-airvik-purple/20 focus-visible:ring-airvik-purple',
    blue: 'focus:ring-airvik-blue/20 focus-visible:ring-airvik-blue',
    cyan: 'focus:ring-airvik-cyan/20 focus-visible:ring-airvik-cyan',
    error: 'focus:ring-error/20 focus-visible:ring-error',
  }
  
  return `focus:outline-none focus:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${colorMap[color]}`
}

/**
 * Generate hover effect classes
 */
export function getHoverEffect(type: 'lift' | 'scale' | 'glow' | 'none' = 'lift'): string {
  const effectMap = {
    lift: 'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm',
    scale: 'hover:scale-105 active:scale-95',
    glow: 'hover:shadow-glow-primary',
    none: '',
  }
  
  return effectMap[type]
}

/**
 * Build component classes with all states
 */
export interface ComponentClassOptions {
  base?: string
  hover?: string
  focus?: string
  active?: string
  disabled?: string
  dark?: {
    base?: string
    hover?: string
    focus?: string
    active?: string
  }
}

export function buildComponentClasses(options: ComponentClassOptions): string {
  const classes = [options.base || '']
  
  if (options.hover) classes.push(`hover:${options.hover}`)
  if (options.focus) classes.push(`focus:${options.focus}`)
  if (options.active) classes.push(`active:${options.active}`)
  if (options.disabled) classes.push(`disabled:${options.disabled}`)
  
  if (options.dark) {
    if (options.dark.base) classes.push(`dark:${options.dark.base}`)
    if (options.dark.hover) classes.push(`dark:hover:${options.dark.hover}`)
    if (options.dark.focus) classes.push(`dark:focus:${options.dark.focus}`)
    if (options.dark.active) classes.push(`dark:active:${options.dark.active}`)
  }
  
  return classes.filter(Boolean).join(' ')
}

/**
 * Validate brand compliance
 * Use this in development to ensure components follow brand guidelines
 */
export function validateBrandCompliance(className: string): boolean {
  // Check for hardcoded colors (hex values)
  const hasHardcodedColors = /#[0-9A-Fa-f]{3,6}/.test(className)
  
  // Check for non-brand color classes
  const nonBrandColors = /(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|gray)-\d{3}/
  const hasNonBrandColors = nonBrandColors.test(className) && 
    !className.includes('airvik') && 
    !className.includes('status') &&
    !className.includes('error') &&
    !className.includes('warning') &&
    !className.includes('success')
  
  if (hasHardcodedColors || hasNonBrandColors) {
    console.warn('Brand compliance warning: Non-brand colors detected in className:', className)
    return false
  }
  
  return true
}

// Export all utilities
export const brandUtils = {
  cn,
  getColorClass,
  getTypographyClass,
  getSpacing,
  getShadowClass,
  getRadiusClass,
  getTransition,
  responsive,
  getStatusColors,
  getFeedbackColors,
  withDarkMode,
  getFocusRing,
  getHoverEffect,
  buildComponentClasses,
  validateBrandCompliance,
}

export default brandUtils