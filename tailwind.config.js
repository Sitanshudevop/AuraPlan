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
        // Design System Palette Tokens
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
        },
        'surface-raised': 'var(--color-surface-raised)',
        hairline: 'var(--color-hairline)',
        muted: 'var(--color-text-muted)',
        foreground: 'var(--color-text)',
        background: 'var(--color-bg)',
        bg: {
          DEFAULT: 'var(--color-bg)',
          light: '#FAF9F6',
          dark: '#0B0B0C',
        },
        txt: {
          DEFAULT: 'var(--color-text)',
          light: '#111113',
          dark: '#EDEDEF',
          'muted-light': '#6E6E77',
          'muted-dark': '#8B8B93',
        },
        // Single Refined Accent (WCAG AA 4.91:1 compliant)
        accent: {
          DEFAULT: '#5560E6',
          hover: '#4752D8',
          text: '#434FDE',
          subtle: 'rgba(85, 96, 230, 0.12)',
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
