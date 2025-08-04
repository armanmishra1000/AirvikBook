/**
 * AirVikBook Brand Design Tokens
 * 
 * This file contains all design tokens from the brand guidelines.
 * These should be used throughout the application for consistency.
 * 
 * @see docs/features/brand-design-system/BRAND-GUIDELINES.md
 */

export const colors = {
  // Primary Brand Colors
  airvik: {
    black: '#020A18',
    midnight: '#10103C',
    purple: '#4322AA',
    blue: '#133EE3',
    cyan: '#68D8FC',
    violet: '#B688FF',
    white: '#F8F9FE',
  },
  
  // Secondary Colors
  secondary: {
    blueMid: '#006CFF',
    blueLight: '#D1D8FA',
    cyanLight: '#B2ECFF',
    purpleLight: '#C58FFF',
    pinkLight: '#DECFFF',
  },
  
  // Semantic Colors
  status: {
    available: '#68D8FC',
    occupied: '#133EE3',
    maintenance: '#B688FF',
    unavailable: '#B12A2A',
  },
  
  // Feedback Colors
  feedback: {
    success: '#4E7638',
    warning: '#CB7B2B',
    error: '#B12A2A',
    info: '#D1D8FA',
  },
  
  // Gray Scale
  gray: {
    100: '#121624',
    200: '#333747',
    300: '#484F5E',
    400: '#484F5E',
    500: '#888FA3',
    600: '#B0B8CF',
    700: '#D6D6E1',
    800: '#E6E8F7',
    900: '#EFEFFA',
    950: '#F4F4FC',
  },
} as const

export const gradients = {
  dark1: 'linear-gradient(135deg, #020A18 0%, #4322AA 100%)',
  dark2: 'linear-gradient(135deg, #10103C 0%, #133EE3 100%)',
  mid: 'linear-gradient(135deg, #4322AA 0%, #68D8FC 100%)',
  light1: 'linear-gradient(135deg, #B688FF 0%, #F8F9FE 100%)',
  light2: 'linear-gradient(135deg, #D1D8FA 0%, #B2ECFF 100%)',
  light3: 'linear-gradient(135deg, #133EE3 0%, #68D8FC 100%)',
} as const

export const typography = {
  fontFamily: {
    primary: "'Agrandir', 'SF Pro Display', -apple-system, sans-serif",
    secondary: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
  },
  
  fontSize: {
    hero: '72px',
    display: '60px',
    h1: '48px',
    h2: '36px',
    h3: '30px',
    h4: '24px',
    h5: '20px',
    h6: '18px',
    bodyLg: '18px',
    body: '16px',
    bodySm: '14px',
    button: '14px',
    caption: '12px',
    label: '14px',
  },
  
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.3,
    relaxed: 1.4,
    loose: 1.5,
    body: 1.6,
  },
  
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.02em',
  },
} as const

export const spacing = {
  space0: '0',
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space8: '32px',
  space10: '40px',
  space12: '48px',
  space16: '64px',
  space20: '80px',
  space24: '96px',
} as const

export const radius = {
  none: '0',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const

export const shadows = {
  xs: '0 1px 2px 0 rgba(2, 10, 24, 0.05)',
  sm: '0 1px 3px 0 rgba(2, 10, 24, 0.1), 0 1px 2px 0 rgba(2, 10, 24, 0.06)',
  md: '0 4px 6px -1px rgba(2, 10, 24, 0.1), 0 2px 4px -1px rgba(2, 10, 24, 0.06)',
  lg: '0 10px 15px -3px rgba(2, 10, 24, 0.1), 0 4px 6px -2px rgba(2, 10, 24, 0.05)',
  xl: '0 20px 25px -5px rgba(2, 10, 24, 0.1), 0 10px 10px -5px rgba(2, 10, 24, 0.04)',
  '2xl': '0 25px 50px -12px rgba(2, 10, 24, 0.25)',
  
  // Glow Effects
  glowPrimary: '0 0 20px rgba(67, 34, 170, 0.4)',
  glowBlue: '0 0 20px rgba(19, 62, 227, 0.4)',
  glowCyan: '0 0 20px rgba(104, 216, 252, 0.4)',
} as const

export const transitions = {
  // Timing Functions
  easing: {
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Standard Transitions
  base: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  fade: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slide: 'transform 250ms cubic-bezier(0, 0, 0.2, 1)',
} as const

export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Type exports for TypeScript
export type Color = typeof colors
export type Gradient = typeof gradients
export type Typography = typeof typography
export type Spacing = typeof spacing
export type Radius = typeof radius
export type Shadow = typeof shadows
export type Transition = typeof transitions
export type Breakpoint = typeof breakpoints

// Default export for convenience
export const brandTokens = {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  breakpoints,
} as const

export default brandTokens