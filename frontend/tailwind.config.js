// frontend/tailwind.config.js
import { mantinePreset } from 'tailwind-preset-mantine';

export default {
  presets: [mantinePreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-mantine-color-scheme="dark"]'],
};