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
        alabaster: '#FAF9F6',
        obsidian: '#09090B',
        zincElevated: '#121215',
        primaryDark: '#18181B',
        primaryMuted: '#71717A',
        borderLight: '#E7E5E4',
        borderDark: '#27272A',
        emeraldAccent: '#059669',
        amberAccent: '#D97706',
        roseAccent: '#E11D48',
        indigoAccent: '#4F46E5',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
