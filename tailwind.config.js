/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          0: '#0c0c0c',
          1: '#161616',
          2: '#1f1f1f',
          3: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
}
