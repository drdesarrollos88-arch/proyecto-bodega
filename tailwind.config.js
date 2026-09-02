/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', 'sans-serif'],
        calibri: ['Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'body-normal': ['10pt', { lineHeight: '1.4' }],
        'heading-title': ['12pt', { lineHeight: '1.3', fontWeight: '700' }],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        corporate: {
          dark: '#1e293b',
          light: '#f8fafc',
          border: '#cbd5e1',
          accent: '#0f766e',
        }
      }
    },
  },
  plugins: [],
}

