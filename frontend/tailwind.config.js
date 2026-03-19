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
        sand: '#F5F0E8',
        cream: '#FAF7F2',
        terracotta: '#C84B31',
        saffron: '#E8892B',
        deepblue: '#1B3A5C',
        charcoal: '#2C2C2C',
      }
    },
  },
  plugins: [],
}
