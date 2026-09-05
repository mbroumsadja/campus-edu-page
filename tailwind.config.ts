import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "navy-950": "#061B33",
        "navy-800": "#0A2647",
        "blue-700": "#0b5ed7",
        "blue-500": "#0d6efd",
        "blue-300": "#7fc1f2",
        ink: "#0A2647",
        paper: "#F5F9FE",
        "paper-2": "#EAF2FB",
      },
      // expose brand alias for consistency with admin theme
      brand: {
        DEFAULT: "#0d6efd",
        accent: "#6610f2",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
