import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#14161f', soft: '#4b5163', mute: '#7b8194' },
        brand: { DEFAULT: '#3b2f8f', soft: '#ece9fb', deep: '#271f63' },
        gold: '#b8902f',
      },
      fontFamily: { sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(20,22,31,.06), 0 4px 16px rgba(20,22,31,.05)' },
    },
  },
  plugins: [],
};
export default config;
