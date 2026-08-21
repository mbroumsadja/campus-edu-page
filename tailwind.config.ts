import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "navy-950": "#061B33",
        "navy-800": "#0A2647",
        "blue-700": "#144272",
        "blue-500": "#2E8FE0",
        "blue-300": "#7FC1F2",
        ink: "#0A2647",
        paper: "#F5F9FE",
        "paper-2": "#EAF2FB",
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
