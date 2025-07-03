import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        spin: "spin 1s linear infinite", // Default Tailwind spin
        pulse: "pulse 1.5s infinite", // Default Tailwind pulse
        wave: "wave 1.5s ease-in-out infinite",
        fade: "fade 2s ease-in-out infinite",
        float: "float 2s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "rotate(-10deg)" },
          "50%": { transform: "rotate(10deg)" },
        },
        fade: {
          "0%, 100%": { opacity: "0" }, // Perbaikan: Gunakan string
          "50%": { opacity: "1" }, // Perbaikan: Gunakan string
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;