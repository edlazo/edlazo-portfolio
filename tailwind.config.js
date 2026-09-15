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
    },
  },
  plugins: [],
};
