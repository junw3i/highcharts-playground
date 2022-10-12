/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tangaroa: '#192348',
        darky: {
          100: '#2A405B',
          200: '#222222',
          300: '#121212',
        },
      },
    },
  },
  plugins: [],
}
