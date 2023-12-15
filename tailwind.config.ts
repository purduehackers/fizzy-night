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
                sans: ["Space Mono", "sans-serif"],
            },
            colors: {
                "ph-yellow": "#fbcb3b",
            },
        },
    },
    plugins: [],
    safelist: [ // we need these otherwise tailwind doesn't give us the colours on the description
        {
            pattern: /bg-(.+)-950/,   
        },
        {
            pattern: /text-(.+)-400/,   
        },
        {
            pattern: /border-(.+)-400/,   
        },
    ]
};
export default config;
