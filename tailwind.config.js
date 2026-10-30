/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design System Palette (Linear / Stripe / Vercel Aesthetic)
        bg: {
          light: '#FAF9F6',
          dark: '#0B0B0C',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111113',
          'raised-light': '#F3F3F5',
          'raised-dark': '#161618',
        },
        hairline: {
          light: 'rgba(0,0,0,0.08)',
          dark: 'rgba(255,255,255,0.08)',
        },
        txt: {
          light: '#111113',
          dark: '#EDEDEF',
          'muted-light': '#6E6E77',
          'muted-dark': '#8B8B93',
        },
        // Single Refined Accent
        accent: {
          DEFAULT: '#6E79F5',
          hover: '#5D68E2',
          subtle: 'rgba(110, 121, 245, 0.12)',
        },
        // Semantic Status (6px dots / quiet text only)
        status: {
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
        xl: '12px',
        '2xl': '12px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
