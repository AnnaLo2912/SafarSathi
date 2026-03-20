/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        garamond: ['EB Garamond', 'serif'],
      },
      colors: {
        cream: '#F5EFE6',
        coral: '#D96C54',
        rain: '#A8B2AE',
        peach: '#E8B7A6',
        latte: '#C89B7B',
        eucalyptus: '#8A9A8A',
        sand: '#F5F0E8',
        terracotta: '#C84B31',
        saffron: '#E8B7A6',
        deepblue: '#1B3A5C',
        charcoal: '#2C2C2C',
      }
    },
  },
  plugins: [],
}
