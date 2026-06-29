// ===== COLORS =====
export const colors = {
  // Primary brand — energetic purple-indigo (campus vibe)
  primary: {
    50: '#f0f1ff',
    100: '#e0e2fe',
    200: '#c7cafc',
    300: '#a5a8f7',
    400: '#8b8af0',
    500: '#7c6ae6',  // main
    600: '#6d4fd0',
    700: '#5c40b2',
    800: '#4c3592',
    900: '#3f2e78',
  },
  // Semantic
  success: { light: '#dcfce7', main: '#22c55e', dark: '#15803d' },
  warning: { light: '#fef9c3', main: '#eab308', dark: '#a16207' },
  error:   { light: '#fee2e2', main: '#ef4444', dark: '#b91c1c' },
  info:    { light: '#dbeafe', main: '#3b82f6', dark: '#1d4ed8' },
  // Surfaces
  background: { light: '#fafafa', dark: '#0f0f13' },
  surface:    { light: '#ffffff', dark: '#1a1a1f' },
  elevated:   { light: '#ffffff', dark: '#24242a' },
  // Text
  text: {
    primary:   { light: '#111827', dark: '#f9fafb' },
    secondary: { light: '#6b7280', dark: '#9ca3af' },
    muted:     { light: '#9ca3af', dark: '#6b7280' },
  },
  // Borders
  border: { light: '#e5e7eb', dark: '#374151' },
  borderLight: { light: '#f3f4f6', dark: '#1f2937' },
};

// ===== SPACING =====
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// ===== TYPOGRAPHY =====
export const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyDisplay: '"Inter", sans-serif',
  scale: {
    xs:   { size: '0.75rem',  lineHeight: 1.5,  letterSpacing: '0.01em', weight: 400 },
    sm:   { size: '0.875rem', lineHeight: 1.5,  letterSpacing: '0',      weight: 400 },
    base: { size: '1rem',     lineHeight: 1.6,  letterSpacing: '-0.01em', weight: 400 },
    lg:   { size: '1.125rem', lineHeight: 1.5,  letterSpacing: '-0.01em', weight: 500 },
    xl:   { size: '1.25rem',  lineHeight: 1.4,  letterSpacing: '-0.02em', weight: 600 },
    '2xl':{ size: '1.5rem',   lineHeight: 1.3,  letterSpacing: '-0.02em', weight: 600 },
    '3xl':{ size: '1.875rem', lineHeight: 1.2,  letterSpacing: '-0.03em', weight: 700 },
    '4xl':{ size: '2.25rem',   lineHeight: 1.1,  letterSpacing: '-0.03em', weight: 700 },
    '5xl':{ size: '3rem',      lineHeight: 1,    letterSpacing: '-0.04em', weight: 800 },
  },
};

// ===== SHADOWS (Elevation) =====
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.03)',
  glow: '0 0 20px rgba(124, 106, 230, 0.15)',
};

// ===== BREAKPOINTS =====
export const breakpoints = {
  xs: '30em',   // 480px
  sm: '40em',   // 640px
  md: '48em',   // 768px
  lg: '64em',   // 1024px
  xl: '80em',   // 1280px
  '2xl': '96em', // 1536px
};

// ===== TRANSITIONS =====
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ===== BORDER RADIUS =====
export const radius = {
  none: '0',
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};