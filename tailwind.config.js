import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#070a12',
        bgCard: '#0e1526',
        bgCardHover: '#141e36',
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
