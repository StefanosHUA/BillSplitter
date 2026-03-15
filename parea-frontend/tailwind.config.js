/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parea: {
          light: '#f3f4f6', // Clean app background
          primary: '#4f46e5', // Brand purple/blue
          secondary: '#10b981', // Brand green
          dark: '#111827', // Crisp text color
        }
      }
    },
  },
  plugins: [],
}