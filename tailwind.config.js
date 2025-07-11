/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "#F59E0B",   // amber-500
        secondary: "#D97706", // amber-600
        black: "#000",
        white: "#ffffff",
      },
    },
  },
  plugins: [],
};
