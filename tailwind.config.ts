import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        'hw-red': '#E8001C',
        'hw-orange': '#FF6B00',
        'hw-dark': '#0F0F0F',
        'hw-card': '#1A1A1A',
        'hw-border': '#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
