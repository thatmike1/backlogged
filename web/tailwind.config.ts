import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          dark: "#5B21B6",
        },
        accent: {
          yellow: "#FBBF24",
          pink: "#F472B6",
          mint: "#34D399",
          coral: "#FB7185",
        },
        bg: {
          base: "#FAFAF9",
          elevated: "#FFFFFF",
          dark: "#1C1917",
          "dark-elevated": "#292524",
        },
        text: {
          primary: "#1C1917",
          secondary: "#57534E",
          muted: "#A8A29E",
        },
        border: {
          DEFAULT: "#000000",
          soft: "#E7E5E4",
        },
        status: {
          played: "#34D399",
          playing: "#60A5FA",
          backlog: "#FBBF24",
          dropped: "#FB7185",
          wishlist: "#A78BFA",
          skipped: "#A8A29E",
        },
      },
      fontFamily: {
        display: ["Fredoka", "sans-serif"],
        body: ["Nunito", "sans-serif"],
      },
      boxShadow: {
        "brutal-sm": "3px 3px 0 #000",
        "brutal-md": "5px 5px 0 #000",
        "brutal-lg": "8px 8px 0 #000",
        "brutal-hover": "6px 6px 0 #000",
        "brutal-active": "2px 2px 0 #000",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};

export default config;
