/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#f8f4ed",
          100: "#f5f0e8",
          200: "#ede7d9",
          300: "#e4dccb",
          400: "#d8ceb8",
        },
        ink: {
          900: "#1c1a16",
          800: "#2e2b24",
          700: "#433e35",
          600: "#5e5849",
          500: "#8a8070",
          400: "#b0a690",
        },
        amber: {
          500: "#c8861a",
          400: "#e8a832",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        lora: ["Lora", "Georgia", "serif"],
        mono: ["DM Mono", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 3px rgba(28,26,22,0.08), 0 4px 16px rgba(28,26,22,0.06)",
        lifted: "0 2px 8px rgba(28,26,22,0.10), 0 12px 40px rgba(28,26,22,0.12)",
      },
    },
  },
  plugins: [],
};
