import { createTheme, rem } from '@mantine/core';
import { colors, shadows, typography } from './tokens';
export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      colors.brand[50],
      colors.brand[100],
      colors.brand[200],
      colors.brand[300],
      colors.brand[400],
      colors.brand[500],
      colors.brand[600],
      colors.brand[700],
      colors.brand[800],
      colors.brand[900],
    ],
  },

  fontFamily: typography.fontFamily,
  fontFamilyMonospace: 'JetBrains Mono, monospace',

  headings: {
    fontFamily: typography.fontFamily,
    fontWeight: '700',
    sizes: {
      h1: {
        fontSize: typography.scale['5xl'].size,
        lineHeight: String(typography.scale['5xl'].lineHeight),
        fontWeight: String(typography.scale['5xl'].weight),
      },
      h2: {
        fontSize: typography.scale['4xl'].size,
        lineHeight: String(typography.scale['4xl'].lineHeight),
        fontWeight: String(typography.scale['4xl'].weight),
      },
      h3: {
        fontSize: typography.scale['3xl'].size,
        lineHeight: String(typography.scale['3xl'].lineHeight),
        fontWeight: String(typography.scale['3xl'].weight),
      },
      h4: {
        fontSize: typography.scale['2xl'].size,
        lineHeight: String(typography.scale['2xl'].lineHeight),
        fontWeight: String(typography.scale['2xl'].weight),
      },
      h5: {
        fontSize: typography.scale.xl.size,
        lineHeight: String(typography.scale.xl.lineHeight),
        fontWeight: String(typography.scale.xl.weight),
      },
      h6: {
        fontSize: typography.scale.lg.size,
        lineHeight: String(typography.scale.lg.lineHeight),
        fontWeight: String(typography.scale.lg.weight),
      },
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
          border: '1px solid var(--app-border)',
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
            boxShadow: `0 0 0 3px ${colors.brand[500]}1a`,
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

// ✅ Default export – this is what tailwind-preset-mantine expects
export default theme;