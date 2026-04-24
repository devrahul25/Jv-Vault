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
        highlight: "0 0 20px rgba(249, 115, 22, 0.15)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "glow": "glow 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        glow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
