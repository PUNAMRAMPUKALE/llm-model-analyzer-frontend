import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        card: "#11141b",
        ink: "#c6d0f5",
        mute: "#98a2b3",
        accent: { DEFAULT: "#5b8cff", 2: "#a06bff", 3: "#43e6a5" },
        stroke: "#1b2230"
      },
      borderRadius: { xl: "14px", "2xl": "20px" },
      boxShadow: {
        card: "0 10px 30px rgba(2,6,23,0.35)",
        glow: "0 0 40px rgba(91,140,255,0.35)"
      }
    }
  },
  plugins: []
};
export default config;
