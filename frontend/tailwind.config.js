/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF6B00',
          light:   '#FF9A3C',
        },
        dark: {
          0: '#0d0d1a',
          1: '#13132a',
          2: '#1a1a2e',
        },
        danger:  '#ff4444',
        success: '#39d353',
        info:    '#58a6ff',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono:     ['Share Tech Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
