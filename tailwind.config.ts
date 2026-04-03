import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          ring: "rgba(255, 255, 255, 0.12)",
        },
      },
      boxShadow: {
        panel: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
