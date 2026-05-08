/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      screens: {
        xs: "475px",
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
        club: {
          primary: '#ef4444',
          secondary: '#dc2626',
          dark: '#7f1d1d',
          accent: '#991b1b',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        fadeIn: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        slideDown: "slideDown 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        glow: "glow 2s ease-in-out infinite",
        spin: "spin 1s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-15px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(15px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        glow: {
          "0%, 100%": { textShadow: "0 0 5px rgba(239,68,68,0.5), 0 0 10px rgba(239,68,68,0.3)" },
          "50%": { textShadow: "0 0 15px rgba(239,68,68,0.8), 0 0 25px rgba(239,68,68,0.5)" },
        },
      },
    },
  },
  plugins: [],
};