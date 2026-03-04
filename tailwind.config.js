/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        felt: '#0d5c2e',
        'felt-light': '#117a3d',
        gold: '#d4af37',
        'gold-light': '#f4e4a6',
      },
    },
  },
  plugins: [],
};
