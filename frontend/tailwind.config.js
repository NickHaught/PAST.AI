/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white': '#FAF9F6',
        'off-white': '#d9d9d9',
        'gray': '#282828',
        'secondary-gray': '#1F1F21',
        'light-gray': '#323232',
        'lighter-gray': '#393939',
        'lightest-gray': '#474747',
        'dark-gray': '#3F3F3F',
        'blue': '#4681F4',
        'hover-light-gray': '#353535',
        'dark-dark-gray': '#1a1a1a',
        'validgreen': '#159947',
        'light-green': '#49B265',
      },
      maxHeight: {
        'screen-75': '75vh',
        'screen-85': '85vh',
        'screen-custom': '100vh', // Adjust 150px as needed
      },
    },
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
