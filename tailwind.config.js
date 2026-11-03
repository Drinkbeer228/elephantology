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
        brand: {
          blue: '#0593C6',   // небесно-голубой — основной акцент
          pink: '#D83996',   // фуксия — вторичный акцент
          bg: '#FCFFFF',     // чисто-белый фон светлой темы
        },
        kingdom: {
          bg: '#121318',
          card: '#1b1d24',
          surface: '#242733',
          border: '#34384a',
          gold: '#ffd166',
          accent: '#4cc9f0',
          emerald: '#06d6a0',
          rose: '#f72585',
          muted: '#8e96ac',
        }
      }
    }
  },
  plugins: [],
}
