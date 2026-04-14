import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdfdfc",
          100: "#fbfbf9",
          200: "#f5f5f2",
          300: "#ededea",
          400: "#e4e4e0",
          500: "#f8f8f6",
          600: "#52524d",
          700: "#3f3f3b",
          800: "#2f2f2c",
          900: "#21211f",
          950: "#121211",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
