import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        // Notion-dark inspired palette
        ink: {
          50: "#f7f7f5",
          100: "#ececea",
          200: "#d9d9d6",
          300: "#9c9a94",
          400: "#6b6a63",
          500: "#3f3e3a",
          600: "#2b2a27",
          700: "#201f1d",
          800: "#181816",
          900: "#121210",
          950: "#0b0b0a",
        },
        accent: {
          50: "#fff7ed",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
