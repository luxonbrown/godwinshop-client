/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--c-base) / <alpha-value>)',
        'base-2': 'rgb(var(--c-base-2) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        divider: 'rgb(var(--c-divider) / <alpha-value>)',
        accent: '#F5C400',
        'accent-hover': '#FFDB2E',
        'accent-dark': '#C9A200'
      },
      textColor: {
        white: 'rgb(var(--c-fg) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 24px rgba(245, 196, 0, 0.18)',
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.2)'
      },
      maxWidth: {
        page: '1280px'
      }
    }
  },
  plugins: []
};