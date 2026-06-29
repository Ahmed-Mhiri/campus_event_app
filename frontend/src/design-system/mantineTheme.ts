import { createTheme, rem } from '@mantine/core';
import { colors, shadows, radius, typography } from './tokens';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      colors.primary[50],
      colors.primary[100],
      colors.primary[200],
      colors.primary[300],
      colors.primary[400],
      colors.primary[500],
      colors.primary[600],
      colors.primary[700],
      colors.primary[800],
      colors.primary[900],
    ],
  },
  
  fontFamily: typography.fontFamily,
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  
  headings: {
    fontFamily: typography.fontFamilyDisplay,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(48), lineHeight: '1.1', fontWeight: '800' },
      h2: { fontSize: rem(36), lineHeight: '1.2', fontWeight: '700' },
      h3: { fontSize: rem(28), lineHeight: '1.25', fontWeight: '600' },
      h4: { fontSize: rem(22), lineHeight: '1.3', fontWeight: '600' },
      h5: { fontSize: rem(18), lineHeight: '1.4', fontWeight: '600' },
      h6: { fontSize: rem(16), lineHeight: '1.5', fontWeight: '600' },
    },
  },
  
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
    '2xl': rem(48),
    '3xl': rem(64),
  },
  
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
    lg: rem(16),
    xl: rem(24),
  },
  
  shadows: {
    xs: shadows.sm,
    sm: shadows.md,
    md: shadows.lg,
    lg: shadows.xl,
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
  },
  
  defaultRadius: 'md',
  defaultGradient: { from: 'brand.5', to: 'brand.7', deg: 135 },
  
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': { transform: 'scale(0.97)' },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'lg',
      },
      styles: {
        root: {
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid var(--mantine-color-gray-2)',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'border-color 150ms, box-shadow 150ms',
          '&:focus': {
            boxShadow: '0 0 0 3px rgba(124, 106, 230, 0.1)',
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
        size: 'sm',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'none',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
        padding: 'xl',
      },
    },
    Menu: {
      defaultProps: {
        radius: 'md',
        shadow: 'md',
      },
    },
  },
  
  other: {
    headerHeight: rem(64),
    headerHeightMobile: rem(56),
    maxContentWidth: rem(1280),
    contentPadding: { base: rem(16), sm: rem(24), md: rem(32) },
  },
});