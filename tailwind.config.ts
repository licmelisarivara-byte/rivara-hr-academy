import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F7F4EE",
        panel: "#FFFFFF",
        panelAlt: "#FBF3EF",
        magenta: "#C21E6D",
        magentaSoft: "#D4407F",
        magentaDeep: "#9A1656",
        parchment: "#F4F1EA",
        bone: "#2A2620",
        sage: "#7A9E6E",
      },
      fontFamily: {
        display: ["Georgia", "ui-serif", "serif"],
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Courier New'", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "score-grid":
          "linear-gradient(rgba(232,0,111,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,111,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
