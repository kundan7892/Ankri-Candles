/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./shop.html",
        "./pdp.html",
        "./builder.html",
        "./src/**/*.{vue,js,ts,jsx,tsx,html}",
    ],
    darkMode: 'class', // Using class strategy for dark mode
    theme: {
        extend: {
            colors: {
                // Light Mode Base (from original config)
                "on-surface": "#1f1b18",
                "surface-container-low": "#fcf1ec",
                "outline-variant": "#d5c3b8",
                "secondary": "#4a6458",
                "surface-container-high": "#f1e6e1",
                "surface-container": "#f6ece7",
                "on-secondary": "#ffffff",
                "primary": "#6f4627",
                "outline": "#83746b",
                "on-primary": "#ffffff",
                "background": "#fff8f5",
                "on-surface-variant": "#51443c",
                "surface": "#fff8f5",
            },
            fontFamily: {
                "body-md": ["Inter", "sans-serif"],
                "headline-sm": ["Playfair Display", "serif"],
                "display-lg-mobile": ["Playfair Display", "serif"],
                "label-caps": ["Inter", "sans-serif"],
                "headline-md": ["Playfair Display", "serif"],
                "body-lg": ["Inter", "sans-serif"],
                "display-lg": ["Playfair Display", "serif"],
                "body-sm": ["Inter", "sans-serif"]
            },
            spacing: {
                "gutter": "16px", // Updated for mobile (was 24)
            }
        },
    },
    plugins: [],
}
