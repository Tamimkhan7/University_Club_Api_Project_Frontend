/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        ink: {
          50: '#f4f5f7',
          100: '#e7e9ee',
          200: '#cdd1dc',
          300: '#a3aabb',
          400: '#727b95',
          500: '#535c78',
          600: '#3f4661',
          700: '#2f3448',
          800: '#1d212f',
          850: '#161923',
          900: '#101219',
          950: '#0a0b10',
        },
        border: '#e5e7eb',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(239,68,68,0.15), 0 20px 60px -15px rgba(239,68,68,0.35)',
        'glow-lg': '0 0 0 1px rgba(239,68,68,0.15), 0 30px 80px -20px rgba(239,68,68,0.45)',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
        'dot-grid-dark': 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};