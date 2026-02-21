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
        notion: {
          bg: "#ffffff",
          card: "#f7f7f5",
          sidebar: "#1f1f1f",
          text: "#1a1a1a",
          muted: "#6b6b6b",
          border: "#e8e8e4",
          hover: "#f0f0ee",
          danger: "#eb5757",
          success: "#0f7b55",
          "success-bg": "#f0faf5",
          "danger-bg": "#fff5f5",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      maxWidth: {
        content: "720px",
        landing: "680px",
        pricing: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
