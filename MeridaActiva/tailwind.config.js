/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "merida-gold": "#ffc107",
        "merida-dark": "#0f172a", 
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 20px 50px -12px rgba(0, 0, 0, 0.05)',
        'premium': '0 30px 60px -12px rgba(15, 23, 42, 0.08)',
      },
  
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'subtle-zoom': 'slow-zoom 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}