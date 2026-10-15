/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        math: ['Newsreader', 'Crimson Pro', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: '#F8FAFC',
        'slate-deep': '#1A2234',
        'slate-card': '#232D42',
        primary: {
          DEFAULT: '#5B52F2',
          foreground: '#FFFFFF',
          soft: '#EEF2FF',
        },
        flaw: {
          DEFAULT: '#EF4444',
          soft: '#FEF2F2',
        },
        success: {
          DEFAULT: '#16A34A',
          soft: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: '#FFFBEB',
        },
        'border-soft': '#E2E8F0',
      },
      boxShadow: {
        'indigo': '0 18px 40px -12px rgba(91, 82, 242, 0.35)',
        'indigo-lg': '0 24px 60px -12px rgba(91, 82, 242, 0.45)',
      },
      keyframes: {
        scanline: {
          '0%, 100%': { top: '0%' },
          '50%': { top: 'calc(100% - 4rem)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.6)' },
          '70%': { boxShadow: '0 0 0 12px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scanline: 'scanline 4s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.6s ease-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
