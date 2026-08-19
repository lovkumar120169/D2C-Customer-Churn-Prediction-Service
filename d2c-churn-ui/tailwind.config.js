/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E1116",
          soft: "#12151C",
        },
        surface: {
          DEFAULT: "#171B22",
          raised: "#1D222C",
          border: "#2A2F3A",
        },
        signal: {
          DEFAULT: "#7C6CFF",
          soft: "rgba(124,108,255,0.14)",
          dim: "#5D4FCC",
        },
        vital: {
          low: "#34D399",
          mid: "#FBBF24",
          high: "#F87171",
        },
        ink2: {
          primary: "#EAEDF2",
          muted: "#8A93A6",
          faint: "#565E6E",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -20px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(124,108,255,0.4), 0 0 24px rgba(124,108,255,0.25)",
      },
    },
  },
  plugins: [],
};
