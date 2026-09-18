import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, '404.html'),
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#0a0a0a',
        bgCard: '#111110',
        bgCardHover: '#171714',

        // The palette is remapped at the theme level so every component keeps
        // its existing class names and only the rendered colors change.
        // slate  -> warm near-black greys (surfaces, borders, text)
        // amber  -> cyan (primary accent)
        // cyan   -> sand (secondary accent)
        slate: {
          50: '#f7f6f3',
          100: '#e9e7e2',
          200: '#d6d3cc',
          300: '#b5b2aa',
          400: '#8d8b85',
          500: '#6b6963',
          600: '#4a4844',
          700: '#33322f',
          800: '#222220',
          900: '#111110',
          950: '#0a0a0a',
        },
        amber: {
          100: '#d4f7fd',
          200: '#aaf0fa',
          300: '#8ae9f7',
          400: '#2ad9ef',
          500: '#06b6d4',
          600: '#0e8fa6',
          700: '#0d6f80',
        },
        cyan: {
          100: '#f2e9d8',
          200: '#e6d7bd',
          300: '#dfcbaa',
          400: '#cbb287',
          500: '#b3936a',
          600: '#8e7350',
          700: '#6d573c',
        },
      },

      // Flat, technical geometry: the mockup has square panels and chips.
      // `rounded-full` is left untouched so avatars and dots stay circular.
      borderRadius: {
        sm: '0.0625rem',
        DEFAULT: '0.125rem',
        md: '0.125rem',
        lg: '0.125rem',
        xl: '0.25rem',
        '2xl': '0.25rem',
        '3xl': '0.375rem',
      },
      // Entrance animations for overlays. They only animate opacity/transform
      // and are collapsed by the prefers-reduced-motion rules in index.css.
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'dialog-in': {
          from: { opacity: '0', transform: 'translateY(0.5rem) scale(0.95)' },
          to: { opacity: '1', transform: 'none' },
        },
        'dropdown-in': {
          from: { opacity: '0', transform: 'translateY(-0.25rem) scale(0.95)' },
          to: { opacity: '1', transform: 'none' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-1rem)' },
          to: { opacity: '1', transform: 'none' },
        },
        'drawer-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'none' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'dialog-in': 'dialog-in 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        'dropdown-in': 'dropdown-in 180ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slide-down 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'drawer-in': 'drawer-in 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
