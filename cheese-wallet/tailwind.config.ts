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
        gold: "#C9A84C",
        "gold-light": "#E8C96A",
        "cheese-black": "#080808",
        charcoal: "#111111",
        "charcoal-2": "#181818",
        "charcoal-3": "#222222",
        cream: "#F5EED8",
        "cheese-green": "#3CB87A",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        syne: ["var(--font-syne)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
