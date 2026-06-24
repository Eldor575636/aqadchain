/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0D6E63',
          50: '#E6F4F3',
          100: '#C0E4E0',
          200: '#88CAC4',
          300: '#4FAFA7',
          400: '#1E9188',
          500: '#0D6E63',
          600: '#0A574E',
          700: '#07403A',
          800: '#042A26',
          900: '#021512',
        },
        gold: {
          DEFAULT: '#C9A84C',
          100: '#F7EFD8',
          200: '#EDD9A3',
          300: '#DFC06E',
          400: '#C9A84C',
          500: '#A8872E',
          600: '#856A20',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
      },
    },
  },
  plugins: [],
};
