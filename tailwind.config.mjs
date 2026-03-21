/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#CE1234", // Intense Red
        "background": "#000000", // Deep Black
        "surface": "#F3F0E0", // Vintage Cream
        "on-surface": "#000000",
        "on-background": "#FFFFFF",
        "secondary": "#CE1234",
        "border": "rgba(0, 0, 0, 0.1)",
        "accent": "#E11D48",
      },
      fontFamily: {
        "headline": ["Space Grotesk"],
        "body": ["Manrope"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px",
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite",
        "typing": "typing 3.5s steps(40, end), blink-caret .75s step-end infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 1 },
        },
        typing: {
          "from": { width: "0" },
          "to": { width: "100%" },
        },
        "blink-caret": {
          "from, to": { borderColor: "transparent" },
          "50%": { borderColor: "#a855f7" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
