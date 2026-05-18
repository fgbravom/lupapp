import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand ───────────────────────────────────────────────────────────
        brand: {
          DEFAULT: "#E63030",
          dark:    "#C72020",
          light:   "#FF5C5C",
        },
        // ─── Notas (escala 1–7) ──────────────────────────────────────────────
        nota: {
          7: "#00B86B",
          6: "#00B86B",
          5: "#8BC34A",
          4: "#FF9500",
          3: "#FF5722",
          2: "#E63030",
          1: "#E63030",
        },
        // ─── Semántica nutricional ───────────────────────────────────────────
        ok:          "#00B86B",
        advertencia: "#FF9500",
        alerta:      "#E63030",
        // ─── Superficie ──────────────────────────────────────────────────────
        fondo:    "#FAFAF8",
        carta:    "#FFFFFF",
        borde:    "#E5E5E3",
        texto:    "#111827",
        muted:    "#6B7280",
        // ─── Dark ────────────────────────────────────────────────────────────
        "dark-fondo":  "#0D0D0B",
        "dark-carta":  "#1A1A18",
        "dark-borde":  "#2A2A28",
        "dark-texto":  "#F9FAFB",
        "dark-muted":  "#9CA3AF",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm:   ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card:  "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        nota:  "0 0 0 4px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
