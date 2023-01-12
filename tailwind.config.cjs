/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			ibm_plex_sans: ["IBM Plex Sans", "sans-serif"]
		},
		extend: {
			colors: {
				"dark": "#161616"
			}
		},
	},
	plugins: [],
}
