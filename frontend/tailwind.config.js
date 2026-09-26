/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Neural Data Intelligence — Light AI Observatory" palette.
        // Semantic mapping (kept consistent everywhere): violet = AI/LLM,
        // cyan = RAG/retrieval, blue = embeddings/vectorization,
        // pink = agent, emerald = healthy, amber = warning, rose = critical.
        // The sidebar + 3D instrument panels intentionally stay dark, as an
        // inset "observatory" against the light canvas - the contrast is
        // what makes the 3D visuals and glows pop.
        sidebar: {
          DEFAULT: "#0A1020",
          hover: "#141D36",
          active: "#1B2542",
        },
        canvas: "#F3F4F9",
        card: "#FFFFFF",
        border: "rgba(100, 116, 139, 0.16)",
        ink: {
          900: "#0F172A",   // headings / primary text
          700: "#334155",   // body text
          500: "#64748B",   // secondary / muted text
        },
        primary: {
          50: "#EDE9FE",
          400: "#A78BFA",
          500: "#8B5CF6",   // Electric Violet - AI / LLM
          600: "#7C3AED",
          700: "#6D28D9",
          purple: "#A855F7",
        },
        teal: {
          400: "#22D3EE",   // Cyan - RAG / retrieval
          500: "#06B6D4",
          600: "#0E7490",
        },
        blue: {
          400: "#60A5FA",
          500: "#3B82F6",   // embeddings / vectorization
          600: "#1D4ED8",
        },
        pink: {
          400: "#E879F9",
          500: "#D946EF",   // agent
          600: "#A21CAF",
        },
        emerald: {
          400: "#4ADE80",
          500: "#34D399",   // healthy / success
          600: "#0D9488",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#B45309",
        },
        alert: "#E11D48",   // rose - critical (deepened for AA contrast on light backgrounds)

        // Dark 3D instrument-panel scale - used for the sidebar and for the
        // canvases behind the 3D visuals so they read as glowing inset
        // panels against the light UI, rather than washing out on white.
        panel: {
          950: "#050816",
          900: "#0A1020",
          800: "#0E172A",
          700: "#1E2740",
        },
        paper: "#F8FAFC",
      },
      fontFamily: {
        display: ["'Times New Roman'", "Times", "serif"],
        body: ["'Times New Roman'", "Times", "serif"],
        mono: ["'Courier New'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.08)",
        glow: "0 0 30px rgba(139, 92, 246, 0.18)",
        "glow-lg": "0 0 50px rgba(139, 92, 246, 0.30)",
        "lift": "0 24px 48px -18px rgba(15, 23, 42, 0.22), 0 0 40px -10px rgba(139, 92, 246, 0.20)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        drift: "drift 14s ease-in-out infinite",
        "drift-slow": "drift 22s ease-in-out infinite reverse",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};
