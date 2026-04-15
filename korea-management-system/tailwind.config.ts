import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF', // Blue for Korea theme
        secondary: '#DC2626', // Red for Korea theme
        accent: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
export default config
