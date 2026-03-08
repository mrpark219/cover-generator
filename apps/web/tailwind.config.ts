import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f5f7",
        ink: "#121212",
        accent: "#027fff",
        slate: "#2f3442"
      },
      boxShadow: {
        card: "0 20px 60px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        card: "28px"
      }
    }
  },
  plugins: []
};

export default config;
