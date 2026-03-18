/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:          '#0a1628',
          amber:         '#f0a500',
          'amber-light': '#fef3c7',
          'navy-mid':    '#1b3a6b',
          'navy-light':  '#e8edf5',
        },
      },
      fontFamily: {
        heading: ["var(--font-syne)",    'system-ui', 'sans-serif'],
        body:    ["var(--font-dm-sans)", 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
