/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-dark": "#0F172A",
        "brand-gold": "#FFBA08",
        "brand-blue": "#3F88C5",
        "brand-green": "#136F63",
        "brand-red": "#D00000",
        "brand-bg": "#F8F9FA",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}