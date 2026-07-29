/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand identity (unchanged) — deep blue chrome + sky accent
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        brand: { DEFAULT: '#1E3A8A', deep: '#152C6B', sky: '#81D5FF' },
        // Shared "ink" text + surfaces, taken from the polished user-management
        // components so every dashboard matches them exactly.
        ink: '#142334',
        slatesoft: '#4A5A6B',
        line: '#E5EDF5',
        linestrong: '#DCE7F0',
        surfaceinset: '#F8FBFE',
        surfacefield: '#FAFCFE',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(20,35,52,0.06), 0 1px 2px rgba(20,35,52,0.04)',
        'card-hover': '0 10px 30px rgba(20,35,52,0.10)',
        modal: '0 20px 60px rgba(10,20,32,0.25)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
