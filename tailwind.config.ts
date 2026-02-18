import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-instrument)', 'serif'],
                heading: ['var(--font-heading)', 'sans-serif'],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                pulse: { // Standard pulse keyframe
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: ".5" },
                }
            },
        },
    },
    plugins: [],
};
export default config;
