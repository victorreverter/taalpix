/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        tp: {
          bg: 'var(--tp-bg)',
          surface: 'var(--tp-surface)',
          surface2: 'var(--tp-surface2)',
          border: 'var(--tp-border)',
          text: 'var(--tp-text)',
          text2: 'var(--tp-text2)',
          text3: 'var(--tp-text3)',
          primary: 'var(--tp-primary)',
          primaryLight: 'var(--tp-primary-light)',
          success: 'var(--tp-success)',
          successLight: 'var(--tp-success-light)',
          warning: 'var(--tp-warning)',
          warningLight: 'var(--tp-warning-light)',
          error: 'var(--tp-error)',
          errorLight: 'var(--tp-error-light)',
          accent: 'var(--tp-accent)',
          accentLight: 'var(--tp-accent-light)',
          neutral: 'var(--tp-neutral)',
          neutralLight: 'var(--tp-neutral-light)',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
