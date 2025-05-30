/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'olx-blue': '#002f34',
        'olx-green': '#23e5db',
        'olx-yellow': '#ffce32',
        'olx-light-blue': '#c8f8f6',
        'olx-light-grey': '#f2f4f5',
        'olx-dark-grey': '#7f9799'
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'nav': '0 1px 4px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-light': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
    fontFamily: {
      'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
    },
  },
  plugins: [],
};