import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Phosphor terminal palette */
        phosphor: "oklch(0.78 0.21 145)",
        "phosphor-dim": "oklch(0.55 0.16 145)",
        "amber-flare": "oklch(0.78 0.16 70)",
        void: "oklch(0.14 0.005 270)",
        panel: "oklch(0.19 0.006 270)",

        /* Semantic tokens */
        background: "oklch(0.14 0.005 270)",
        foreground: "oklch(0.88 0.005 270)",
        card: "oklch(0.19 0.006 270)",
        "card-foreground": "oklch(0.92 0.005 270)",
        border: "oklch(0.27 0.006 270)",
        input: "oklch(0.24 0.006 270)",
        muted: "oklch(0.22 0.005 270)",
        "muted-foreground": "oklch(0.62 0.01 270)",
        secondary: "oklch(0.24 0.006 270)",
        destructive: "oklch(0.65 0.22 25)",
        primary: "oklch(0.78 0.21 145)",
        "primary-foreground": "oklch(0.14 0.005 270)",
      },
      fontFamily: {
        display: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        phosphor: "0 0 24px color-mix(in oklab, oklch(0.78 0.21 145) 25%, transparent)",
        "phosphor-soft": "0 0 80px color-mix(in oklab, oklch(0.78 0.21 145) 12%, transparent)",
        "phosphor-lg": "0 0 48px color-mix(in oklab, oklch(0.78 0.21 145) 30%, transparent)",
      },
      animation: {
        blink: "blink 1.1s steps(1) infinite",
        marquee: "marquee 30s linear infinite",
        flicker: "flicker 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
      },
      keyframes: {
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "0.96" },
          "94%": { opacity: "0.88" },
          "96%": { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 4px color-mix(in oklab, oklch(0.78 0.21 145) 40%, transparent)" },
          "50%": { boxShadow: "0 0 16px color-mix(in oklab, oklch(0.78 0.21 145) 60%, transparent), 0 0 32px color-mix(in oklab, oklch(0.78 0.21 145) 20%, transparent)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
