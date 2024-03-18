/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {colors: {
      'text-primary': '#FFFFFF',
      'primary-gray': '#282828',
      'secondary-gray': '#1F1F21',
      'hover-gray': '#323232',
      'button-gray': '#3F3F3F',
      'blue': '#4681F4',
      'hover-light-gray': '#353535'
    },},
  },
  plugins: [
    function ({addUtilities}) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(70 129 244) white"
    },
    ".scrollbar-webkit": {
      "&::-webkit-scrollbar": {
        width: "5px",
      },
      "&::-webkit-scrollbar-track": {
        background: "rgb(66,66,66,255)",
        borderRadius: "100vw",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgb(123,123,123)",
        borderRadius: "100vw",
      },
    },
  }
  addUtilities(newUtilities, ["responsive", "hover"])
}
  ],
}