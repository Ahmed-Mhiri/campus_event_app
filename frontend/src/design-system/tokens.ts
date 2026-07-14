export const tokens = {
  colors: {
    // Brand: ONE purple, used ONLY for primary actions
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6', // Main brand
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    // Semantic: never use brand purple for status
    success: { light: '#dcfce7', main: '#22c55e', dark: '#15803d' },
    warning: { light: '#fef9c3', main: '#eab308', dark: '#a16207' },
    error: { light: '#fee2e2', main: '#ef4444', dark: '#b91c1c' },
    info: { light: '#dbeafe', main: '#3b82f6', dark: '#1d4ed8' },
    // Surfaces
    background: { light: '#f8fafc', dark: '#0f172a' },
    surface: { light: '#ffffff', dark: '#1e293b' },
    elevated: { light: '#ffffff', dark: '#334155' },
    // Text
    text: {
      primary: { light: '#0f172a', dark: '#f8fafc' },
      secondary: { light: '#64748b', dark: '#94a3b8' },
      muted: { light: '#94a3b8', dark: '#64748b' },
    },
    border: { light: '#e2e8f0', dark: '#334155' },
    borderLight: { light: '#f1f5f9', dark: '#1e293b' },
  },

  spacing: {
    page: { xs: 16, sm: 24, md: 32, lg: 48, xl: 64 },
    section: { xs: 32, sm: 48, md: 64, lg: 96 },
    component: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 },
  },

  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    scale: {
      xs: { size: '0.75rem', lineHeight: 1.5, letterSpacing: '0.01em', weight: 400 },
      sm: { size: '0.875rem', lineHeight: 1.5, letterSpacing: '0', weight: 400 },
      base: { size: '1rem', lineHeight: 1.6, letterSpacing: '-0.005em', weight: 400 },
      lg: { size: '1.125rem', lineHeight: 1.5, letterSpacing: '-0.01em', weight: 500 },
      xl: { size: '1.25rem', lineHeight: 1.4, letterSpacing: '-0.015em', weight: 600 },
      '2xl': { size: '1.5rem', lineHeight: 1.3, letterSpacing: '-0.02em', weight: 600 },
      '3xl': { size: '1.875rem', lineHeight: 1.2, letterSpacing: '-0.02em', weight: 700 },
      '4xl': { size: '2.25rem', lineHeight: 1.1, letterSpacing: '-0.025em', weight: 700 },
      '5xl': { size: '3rem', lineHeight: 1, letterSpacing: '-0.03em', weight: 800 },
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.02)',
    glow: '0 0 20px rgba(139, 92, 246, 0.12)',
  },

  radius: {
    none: '0',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },

  breakpoints: {
    xs: '30em', // 480px
    sm: '40em', // 640px
    md: '48em', // 768px
    lg: '64em', // 1024px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
  },
} as const;

// Export for convenience
export const colors = tokens.colors;
export const spacing = tokens.spacing;
export const typography = tokens.typography;
export const shadows = tokens.shadows;
export const radius = tokens.radius;
export const breakpoints = tokens.breakpoints;