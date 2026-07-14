// frontend/postcss.config.js
export default {
  plugins: {
    'postcss-preset-mantine': {},
    '@tailwindcss/postcss': {},                    // ← This was missing
    'tailwind-preset-mantine/postcss': {
      input: './src/design-system/mantineTheme.ts',
    },
  },
};