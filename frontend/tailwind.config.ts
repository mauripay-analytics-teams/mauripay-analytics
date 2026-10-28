import type { Config } from "tailwindcss";

/**
 * MauriPay Analytics — design tokens.
 *
 * Five hues only:
 *   - a neutral off-white ground + white surfaces + hairline borders
 *   - `anchor`  : deep institutional green (Mauritanian financial identity)
 *   - `accent`  : muted Mauritanian gold — secondary chart series / marks only
 *   - `alert`   : one signal red, reserved exclusively for detected anomalies / fraud
 *
 * If `alert` shows up anywhere that is not a detected anomaly, it is a bug.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./tests/**/*.{ts,tsx}"],
  theme: {
    extend: {
      


colors: {
  canvas: "rgb(var(--canvas-rgb) / <alpha-value>)",
  surface: "rgb(var(--surface-rgb) / <alpha-value>)",
  hairline: "rgb(var(--hairline-rgb) / <alpha-value>)",

  ink: {
    DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
    muted: "rgb(var(--ink-muted-rgb) / <alpha-value>)",
    faint: "rgb(var(--ink-faint-rgb) / <alpha-value>)",
  },

  anchor: {
    DEFAULT: "rgb(var(--anchor-rgb) / <alpha-value>)",
    strong: "rgb(var(--anchor-strong-rgb) / <alpha-value>)",
    weak: "rgb(var(--anchor-weak-rgb) / <alpha-value>)",
  },

  accent: {
    DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
    ink: "rgb(var(--accent-ink-rgb) / <alpha-value>)",
  },

  alert: {
    DEFAULT: "rgb(var(--alert-rgb) / <alpha-value>)",
    weak: "rgb(var(--alert-weak-rgb) / <alpha-value>)",
  },
},



      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Segoe UI"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 33, 29, 0.04), 0 1px 3px rgba(20, 33, 29, 0.06)",
        "card-hover": "0 2px 6px rgba(20, 33, 29, 0.06), 0 8px 20px -6px rgba(20, 33, 29, 0.10)",
        pop: "0 16px 40px -16px rgba(20, 33, 29, 0.22)",
      },
    },
  },
  plugins: [],
} satisfies Config;
