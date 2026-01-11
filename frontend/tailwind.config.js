/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ff6a00",
                "electric-orange": "#FF6B00",
                "background-light": "#f8f7f5",
                "background-dark": "#23170f",
            },
            fontFamily: {
                "display": ["Space Grotesk", "Noto Sans TC", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
