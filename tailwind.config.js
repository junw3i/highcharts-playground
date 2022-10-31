/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tangaroa: '#192348',
        darky: {
          100: '#2A405B',
          200: '#0e111a',
          300: '#141B2B',
        },
        greeny: '#36df90',
        greyish: {
          100: '#CFD3DE',
          200: '#a0a7bd',
        },
      },
      fontFamily: {
        roboto: ['Roboto Mono', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
