/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        table: {
          light: '#1a472a',
          dark: '#0e2a1a',
        },
        cup: {
          start: '#b87333',
          end: '#8b5a2b',
        },
        gold: '#ffd700',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
