/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paddy field greens, turmeric, indigo (eri/muga weaving), terracotta
        paddy: {
          50: "#f3f7ed",
          100: "#e4edd6",
          200: "#c9dcae",
          300: "#a8c67f",
          400: "#86ad58",
          500: "#67923d",
          600: "#4f752f",
          700: "#3e5d27",
          800: "#334a22",
          900: "#2b3e1f",
        },
        turmeric: {
          50: "#fdf6e3",
          100: "#faeab8",
          200: "#f5d989",
          300: "#eec25a",
          400: "#e6a936",
          500: "#d9881f",
          600: "#b76918",
          700: "#924f18",
          800: "#783f19",
          900: "#653518",
        },
        indigo_eri: {
          50: "#eef1fb",
          100: "#d4dcf3",
          200: "#a9b9e8",
          300: "#7a93d8",
          400: "#5571c4",
          500: "#3d54a8",
          600: "#30428a",
          700: "#293771",
          800: "#232e5c",
          900: "#1b2347",
        },
        terracotta: {
          50: "#fbf0ec",
          100: "#f4d9cd",
          200: "#e7b19c",
          300: "#d88665",
          400: "#c5623e",
          500: "#aa4a29",
          600: "#8a3b21",
          700: "#6e301c",
          800: "#58271a",
          900: "#481f16",
        },
        parchment: "#f6f1e7",
        ink: "#20231c",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Hanken Grotesk'", "'Noto Sans Bengali'", "'Noto Sans Meetei Mayek'", "sans-serif"],
      },
      maxWidth: {
        measure: "68ch",
      },
    },
  },
  plugins: [],
};
