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
        // ─── shadcn (CSS vars) ────────────────────────────────────────────────
        background:  "var(--background)",
        foreground:  "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
        },
        border: "var(--border)",
        input:  "var(--input)",
        ring:   "var(--ring)",
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
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        dm:   ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card:     "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        nota:     "0 0 0 4px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
