// /** @type {import('tailwindcss').Config} */
// module.exports = {
//     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//     theme: {
//         extend: {},
//     },
//     plugins: [require("tailwind-scrollbar")],
// };
// tailwind.config.js (ESM)
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Скрыть скроллбар */
        ".scrollbar-none": {
          "-ms-overflow-style": "none", // IE/Edge
          "scrollbar-width": "none",    // Firefox
        },
        ".scrollbar-none::-webkit-scrollbar": {
          display: "none",              // Chrome/Safari
        },

        /* Тонкий скроллбар */
        ".scrollbar-thin": {
          "scrollbar-width": "thin",    // Firefox
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb": {
          background: "#888",
          "border-radius": "8px",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      });
    }),
  ],
};