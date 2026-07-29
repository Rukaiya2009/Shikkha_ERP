/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── New palette (navy → ocean → teal, white canvas, red alert) ──
        ink: '#0A1128',            // headings / near-black navy
        brand: {
          DEFAULT: '#034078',      // primary
          deep: '#001F54',         // deepest navy (sidebar, gradients)
          sky: '#BFDBF7',          // soft highlight (avatars, active nav)
        },
        teal: '#1282A2',
        ocean: '#3E92CC',
        softblue: '#BFDBF7',
        lavender: '#E1E5F2',
        alert: '#D8315B',          // danger / alerts
        success: '#1B8A5A',
        warning: '#E0A800',
        slatesoft: '#51607A',      // secondary text
        line: '#E6ECF4',
        linestrong: '#D6E0EC',
        surfaceinset: '#F5F8FC',
        surfacefield: '#FAFCFE',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,17,40,0.04), 0 4px 16px rgba(10,17,40,0.05)',
        'card-hover': '0 12px 34px rgba(3,64,120,0.14)',
        modal: '0 24px 70px rgba(10,17,40,0.28)',
        glow: '0 0 0 4px rgba(62,146,204,0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #001F54 0%, #034078 55%, #1282A2 100%)',
        'sky-fade': 'linear-gradient(180deg, #F5F8FC 0%, #FFFFFF 100%)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'draw': { '0%': { strokeDashoffset: '1000' }, '100%': { strokeDashoffset: '0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        draw: 'draw 1.4s ease-out forwards',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
