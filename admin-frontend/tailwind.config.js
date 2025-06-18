/** @type {import('tailwindcss').Config} */
export default {
  // AJOUTER CETTE LIGNE
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'), 
  ],
}