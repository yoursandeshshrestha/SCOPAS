/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#1b1b1b",
        "bg-secondary": "#2a2a2a",
        primary: "#6366f1",
        "primary-dark": "#4f46e5",
      },
      fontFamily: {
        geist: ["Geist", "sans-serif"],
      },
      animation: {
        slideInFromRight: "slideInFromRight 0.3s ease-out",
      },
      keyframes: {
        slideInFromRight: {
          "0%": {
            transform: "translateX(8px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};
