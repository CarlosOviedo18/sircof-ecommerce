/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coffee': '#d4a574',
        'dark-coffee': '#6f4e37',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        niveau: ['Niveau Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
