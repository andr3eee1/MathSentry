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
        canvas: '#F7F4EE',
        ivory: '#FCFBF8',
        stone: '#EFECE4',
        ink: '#161615',
        graphite: '#6B665E',
        rule: '#DED9CE',
        'rule-light': '#E8E3D9',
        primary: {
          DEFAULT: '#1E3A5F',
          foreground: '#FCFBF8',
          soft: '#EDF1F5',
        },
        flaw: {
          DEFAULT: '#B91C1C',
          soft: '#FDF2F2',
        },
        success: {
          DEFAULT: '#166534',
          soft: '#EBF5EE',
        },
        warning: {
          DEFAULT: '#B45309',
          soft: '#FDF8ED',
        },
      },
    },
  },
  plugins: [],
};
