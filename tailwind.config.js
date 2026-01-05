/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'slate-750': '#283548',
        'slate-850': '#1a2333',
        'slate-950': '#0f1523',
      },
      boxShadow: {
        glow: '0 0 15px 2px rgba(255, 0, 0, 0.3)',
      },
      gridTemplateColumns: {
        '32': 'repeat(32, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '32': 'repeat(32, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};