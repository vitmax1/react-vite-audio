/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                testpink: "#ff00aa",
            },
        },
    },
    plugins: [require("tailwind-scrollbar")],
};
