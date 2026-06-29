import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  // ----- Primary color (used by buttons, links, etc.) -----
  primaryColor: 'blue', // You can change to 'indigo', 'teal', etc.

  // ----- Font settings -----
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',

  // ----- Headings (optional) -----
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },

  // ----- Border radius (roundness) -----
  defaultRadius: 'md', // 'sm' | 'md' | 'lg' | number

  // ----- Spacing scale (used for margins/paddings) -----
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  // ----- Customise components (optional) -----
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },
  },

  // ----- Dark mode overrides (if you want custom dark colors) -----
  // You can also set colors for light/dark separately here.
  // See: https://mantine.dev/theming/colors/#color-scheme-values
});