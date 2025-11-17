/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#1E40AF',
          light: '#60A5FA',
        },
        game: {
          road: '#374151',
          parking: '#FCD34D',
          target: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
        },
        surface: {
          DEFAULT: '#1F2937',
          light: '#374151',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        ui: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      screens: {
        'xs': '320px',
      }
    },
  },
  plugins: [],
}