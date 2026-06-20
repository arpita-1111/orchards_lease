/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── OrchardLease design system (warm, earthy, editorial) ──
        ink: '#23301d', // primary text
        sub: '#5f6b58', // secondary text
        faint: '#8a9381', // muted / labels
        forest: {
          DEFAULT: '#2f5d3a',
          dark: '#244a2e',
          light: '#3f6b34',
        },
        terra: '#b85c38', // terracotta accent (price, save)
        gold: '#c98a2b', // rating star / featured
        sand: '#e6e0d0', // borders
        cream: '#fffdf7', // card surface
        paper: '#f6f3ea', // page background
        chip: '#efeadd', // chips / dividers
        avail: '#e4efe0', // available pill bg
        // green scale kept for shared components
        brand: {
          50: '#e4efe0',
          100: '#cfe3c2',
          200: '#9ccb8a',
          300: '#6fae5e',
          400: '#4d8a40',
          500: '#3f6b34',
          600: '#2f5d3a',
          700: '#244a2e',
          800: '#1d3c24',
          900: '#16301d',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        serif: ['Spectral', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 14px 32px rgba(35,48,29,.13)',
        soft: '0 12px 30px rgba(35,48,29,.07)',
        pop: '0 30px 70px rgba(20,30,15,.4)',
      },
      keyframes: {
        fadeup: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        toastin: {
          from: { opacity: '0', transform: 'translate(-50%,14px)' },
          to: { opacity: '1', transform: 'translate(-50%,0)' },
        },
        sk: {
          '0%': { backgroundPosition: '-340px 0' },
          '100%': { backgroundPosition: '340px 0' },
        },
      },
      animation: {
        fadeup: 'fadeup .3s ease both',
        toastin: 'toastin .25s ease both',
      },
    },
  },
  plugins: [],
};
