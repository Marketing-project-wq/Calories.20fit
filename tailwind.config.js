/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "20fit": {
          red: "#C41101",
          black: "#16170F",
          "pink-accent": "#FCEBED",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
