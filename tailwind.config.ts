import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#18261f", cream: "#f7f4ed", saffron: "#e57d38", moss: "#315e4c" },
      boxShadow: { card: "0 18px 50px rgba(24, 38, 31, .08)" },
    },
  },
  plugins: [],
};

export default config;
