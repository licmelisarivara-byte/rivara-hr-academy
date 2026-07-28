import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F7F4EE",
        panel: "#FFFFFF",
        panelAlt: "#FBF3EF",
        magenta: "#E8006F",
        magentaSoft: "#F0459A",
        magentaDeep: "#B10058",
        parchment: "#F4F1EA",
        bone: "#2A2620",
        sage: "#2ECC71",
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
