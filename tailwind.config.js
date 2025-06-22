/** @type {import('tailwindcss').Config} */
export default {
	content: ["./resources/**/*.blade.php", "./resources/**/*.{js,jsx}"],
	darkMode: 'class', // Use class-based dark mode
	theme: {
	  extend: {},
	},
	theme: {
		extend: {
			fontFamily: {
				raleway: ["Raleway", "sans-serif"], // Add custom font
			},
			animation: {
				["infinite-slider"]: "infiniteSlider 20s linear infinite",
			},
			keyframes: {
				infiniteSlider: {
					"0%": { transform: "translateX(0)" },
					"100%": {
						transform: "translateX(calc(-250px * 5))",
					},
				},
			},
			plugins: [],
		},
	},
};
