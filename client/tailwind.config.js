/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f9ff',
          100: '#e6f3ff',
          200: '#bfdeff',
          300: '#99c9ff',
          400: '#4d9eff',
          500: '#0073ff',
          600: '#0068e6',
          700: '#0056bf',
          800: '#004599',
          900: '#00387d',
        },
        secondary: {
          50: '#fff9f2',
          100: '#fff3e6',
          200: '#ffdcbf',
          300: '#ffc699',
          400: '#ff9a4d',
          500: '#ff6e00',
          600: '#e66300',
          700: '#bf5300',
          800: '#994200',
          900: '#7d3600',
        },
        tofupink: {
          50: '#fff2f9',
          100: '#ffe6f3',
          200: '#ffbfde',
          300: '#ff99c9',
          400: '#ff4d9e',
          500: '#ff0073',
          600: '#e60068',
          700: '#bf0056',
          800: '#990045',
          900: '#7d0038',
        },
        tofupurple: {
          50: '#f9f2ff',
          100: '#f3e6ff',
          200: '#debfff',
          300: '#c999ff',
          400: '#9e4dff',
          500: '#7300ff',
          600: '#6800e6',
          700: '#5600bf',
          800: '#450099',
          900: '#38007d',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
        display: ['var(--font-baloo)', 'cursive'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 10px rgba(0, 0, 0, 0.05)',
        'medium': '0 6px 15px rgba(0, 0, 0, 0.1)',
        'hard': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
} 