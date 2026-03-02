import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-pt-sans)", "sans-serif"],
            },
            colors: {
                primary: "#1a1a1a",
                secondary: "#f5f5f5",
                accent: "#ffcc00", // Representative cab yellow accent
            },
        },
    },
    plugins: [],
};
export default config;
