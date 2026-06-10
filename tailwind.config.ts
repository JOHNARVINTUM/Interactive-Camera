import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        studio: "rgb(var(--studio) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)"
      },
      boxShadow: {
        panel: "0 28px 90px rgba(0, 0, 0, 0.38), 0 0 60px rgba(214, 178, 94, 0.07)",
        button: "0 12px 28px rgba(171, 32, 49, 0.34)"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"]
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(214, 178, 94, .36)" },
          "50%": { boxShadow: "0 0 0 12px rgba(214, 178, 94, 0)" }
        }
      },
      animation: {
        pop: "pop 260ms cubic-bezier(.2,.8,.2,1)",
        pulseRing: "pulseRing 1400ms ease-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
