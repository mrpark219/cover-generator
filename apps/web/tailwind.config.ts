import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f2eee6",
        ink: "#121212",
        accent: "#d97757",
        slate: "#2f3442"
      },
      boxShadow: {
        card: "0 30px 80px rgba(16, 24, 40, 0.14)"
      },
      borderRadius: {
        card: "28px"
      }
    }
  },
  plugins: []
};

export default config;

