import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f8ff",
          100: "#dceeff",
          200: "#b6dcff",
          300: "#8bc6ff",
          400: "#5eaaff",
          500: "#3a8cff",
          600: "#226fe6",
          700: "#1757b8",
          800: "#144a96",
          900: "#133f7a"
        }
      },
      boxShadow: {
        card: "0 8px 20px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;


