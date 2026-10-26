import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60-30-10 Rule:
        // 60% Dominant: Ice White / Layered Slate canvas
        // 30% Secondary: Corporate Royal Blue / Deep Indigo
        // 10% Accent: Electric Cyan / Teal (#06b6d4 / #0ea5e9) + Luminous Amber
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4", // 10% Electric Cyan Accent
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        navy: {
          800: "#0f172a",
          900: "#0b0f19",
          950: "#06090e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-12deg)" },
          "40%": { transform: "rotate(10deg)" },
          "60%": { transform: "rotate(-8deg)" },
          "80%": { transform: "rotate(4deg)" },
        },
        bellRing: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "10%, 30%": { transform: "rotate(-18deg) scale(1.08)" },
          "20%, 40%": { transform: "rotate(18deg) scale(1.08)" },
          "50%": { transform: "rotate(-10deg)" },
          "60%": { transform: "rotate(10deg)" },
          "70%": { transform: "rotate(-4deg)" },
          "80%": { transform: "rotate(4deg)" },
          "90%": { transform: "rotate(0deg)" },
        },
        badgePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "fade-in-up": "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        wiggle: "wiggle 1.2s ease-in-out infinite",
        "bell-ring": "bellRing 2.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite",
        "badge-pulse": "badgePulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
