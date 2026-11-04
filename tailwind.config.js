export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./docs/**/*.html",
    "./assets/**/*.js",
    "./*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        pixel: ['Silkscreen', 'monospace'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        kingdom: {
          bg: '#0B0F17',
          card: '#111827',
          surface: '#1E293B',
          border: 'rgba(255, 255, 255, 0.1)',
          gold: '#F59E0B',
          accent: '#38BDF8',
          emerald: '#34D399',
          rose: '#FB7185',
          muted: '#94A3B8',
        }
      }
    }
  },
  plugins: [],
}
